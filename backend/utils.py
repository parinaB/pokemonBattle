from __future__ import annotations

from pathlib import Path
import numpy as np
import joblib
from tensorflow import keras


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "pokemon_model.keras"
SCALER_PATH = BASE_DIR / "scaler.pkl"
ENCODER_PATH = BASE_DIR / "label_encoder.pkl"
FEATURES_PATH = BASE_DIR / "features.pkl"

TYPE_TO_ID = {
    "normal": 1,
    "fire": 2,
    "water": 3,
    "electric": 4,
    "grass": 5,
    "ice": 6,
    "fighting": 7,
    "poison": 8,
    "ground": 9,
    "flying": 10,
    "psychic": 11,
    "bug": 12,
    "rock": 13,
    "ghost": 14,
    "dragon": 15,
    "dark": 16,
    "steel": 17,
    "fairy": 18,
}


class Predictor:
    def __init__(self) -> None:
      if not MODEL_PATH.exists():
          raise FileNotFoundError("Model file not found. Expected pokemon_model.keras at workspace root.")
      self.model = keras.models.load_model(MODEL_PATH)
      self.scaler = joblib.load(SCALER_PATH)
      self.encoder = joblib.load(ENCODER_PATH)
      if not FEATURES_PATH.exists():
          raise FileNotFoundError("features.pkl not found. Expected features.pkl at workspace root.")
      self.feature_order = joblib.load(FEATURES_PATH)
      self.classes = [str(c) for c in getattr(self.encoder, "classes_", [])]

    def _type_label(self, pokemon: dict) -> str:
      ptype = pokemon.get("type", [])
      primary = ptype[0] if isinstance(ptype, list) and ptype else ptype
      return str(primary).strip()

    def _type_id(self, pokemon: dict) -> float:
      # Prefer model-trained label encoder mapping for types; fallback to static map.
      label = self._type_label(pokemon)
      try:
          encoded = self.encoder.transform([label])[0]
          return float(encoded)
      except Exception:
          return float(TYPE_TO_ID.get(label.lower(), 0))

    def _feature_map(self, pokemon1: dict, pokemon2: dict) -> dict[str, float]:
      s1 = pokemon1["stats"]
      s2 = pokemon2["stats"]
      return {
          "Type_1": self._type_id(pokemon1),
          "Hp_1": float(s1["hp"]),
          "Attack_1": float(s1["attack"]),
          "Defense_1": float(s1["defense"]),
          "Speed_1": float(s1["speed"]),
          "Type_2": self._type_id(pokemon2),
          "Hp_2": float(s2["hp"]),
          "Attack_2": float(s2["attack"]),
          "Defense_2": float(s2["defense"]),
          "Speed_2": float(s2["speed"]),
      }

    def _align_features(self, features: np.ndarray) -> np.ndarray:
      expected = getattr(self.scaler, "n_features_in_", features.shape[1])
      current = features.shape[1]
      if current == expected:
          return features
      if current < expected:
          pad = np.zeros((features.shape[0], expected - current), dtype=features.dtype)
          return np.concatenate([features, pad], axis=1)
      return features[:, :expected]

    def predict(self, pokemon1: dict, pokemon2: dict) -> dict:
      feature_map = self._feature_map(pokemon1, pokemon2)
      features = np.array([[float(feature_map.get(name, 0.0)) for name in self.feature_order]], dtype=float)
      aligned = self._align_features(features)
      scaled = self.scaler.transform(aligned)
      prediction = np.asarray(self.model.predict(scaled, verbose=0))

      # Model output is treated as side prediction (P1/P2), not type prediction.
      if prediction.ndim == 2 and prediction.shape[1] == 1:
          score = float(prediction[0][0])
          p2_prob = score
          p1_prob = 1.0 - score
          winner_idx = int(score >= 0.5)
      elif prediction.ndim == 1:
          if prediction.size == 1:
              score = float(prediction[0])
              p2_prob = score
              p1_prob = 1.0 - score
              winner_idx = int(score >= 0.5)
          else:
              winner_idx = int(np.argmax(prediction))
              p1_prob = float(prediction[0]) if prediction.size > 0 else 0.5
              p2_prob = float(prediction[1]) if prediction.size > 1 else 1.0 - p1_prob
      else:
          winner_idx = int(np.argmax(prediction, axis=1)[0])
          row = prediction[0]
          p1_prob = float(row[0]) if row.shape[0] > 0 else 0.5
          p2_prob = float(row[1]) if row.shape[0] > 1 else 1.0 - p1_prob
      normalized = "P1" if winner_idx == 0 else "P2"
      confidence = p1_prob if normalized == "P1" else p2_prob
      return {
          "winner": normalized,
          "confidence": round(float(confidence), 4),
          "p1_probability": round(float(p1_prob), 4),
          "p2_probability": round(float(p2_prob), 4),
          "decoded_label": str(winner_idx),
          "winner_index": int(winner_idx),
          "raw_prediction": np.asarray(prediction).reshape(-1).tolist(),
      }
