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
      self.index_to_side = self._build_index_side_map()

    def _normalize_side_label(self, label: object) -> str | None:
      label_str = str(label).strip().lower()
      if label_str in {"0", "0.0", "p1", "player1", "player_1", "left"}:
          return "P1"
      if label_str in {"1", "1.0", "p2", "player2", "player_2", "right"}:
          return "P2"
      return None

    def _build_index_side_map(self) -> dict[int, str]:
      classes = getattr(self.encoder, "classes_", None)
      if classes is None or len(classes) < 2:
          raise ValueError("label_encoder classes are invalid. Expected at least 2 classes.")

      mapped = {idx: self._normalize_side_label(label) for idx, label in enumerate(classes)}
      if mapped.get(0) is None or mapped.get(1) is None:
          raise ValueError(
              f"Unable to map label_encoder classes to P1/P2: {list(classes)}. "
              "Use labels 0/1 or P1/P2 in training targets."
          )
      return {0: mapped[0], 1: mapped[1]}

    def _type_id(self, pokemon: dict) -> float:
      ptype = pokemon.get("type", [])
      primary = ptype[0] if isinstance(ptype, list) and ptype else ptype
      return float(TYPE_TO_ID.get(str(primary).strip().lower(), 0))

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

    def _normalize_label(self, label: object, winner_idx: int) -> str:
      mapped = self._normalize_side_label(label)
      if mapped:
          return mapped
      mapped_from_index = self.index_to_side.get(winner_idx)
      if mapped_from_index:
          return mapped_from_index
      raise ValueError(f"Unable to normalize predicted label: {label}")

    def predict(self, pokemon1: dict, pokemon2: dict) -> dict:
      feature_map = self._feature_map(pokemon1, pokemon2)
      features = np.array([[float(feature_map.get(name, 0.0)) for name in self.feature_order]], dtype=float)
      aligned = self._align_features(features)
      scaled = self.scaler.transform(aligned)
      prediction = np.asarray(self.model.predict(scaled, verbose=0))

      # Handle both binary sigmoid output (shape like [1,1]) and multiclass softmax.
      p1_prob = 0.5
      p2_prob = 0.5
      if prediction.ndim == 2 and prediction.shape[1] == 1:
          score = float(prediction[0][0])
          side_for_one = self.index_to_side.get(1, "P2")
          if side_for_one == "P1":
              p1_prob = score
              p2_prob = 1.0 - score
          else:
              p2_prob = score
              p1_prob = 1.0 - score
          winner_idx = int(score >= 0.5)
      elif prediction.ndim == 1:
          if prediction.size == 1:
              score = float(prediction[0])
              side_for_one = self.index_to_side.get(1, "P2")
              if side_for_one == "P1":
                  p1_prob = score
                  p2_prob = 1.0 - score
              else:
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

      try:
        label = self.encoder.inverse_transform([winner_idx])[0]
      except Exception:
        label = winner_idx

      normalized = self._normalize_label(
          label,
          winner_idx,
      )
      confidence = p1_prob if normalized == "P1" else p2_prob
      return {
          "winner": normalized,
          "confidence": round(float(confidence), 4),
          "p1_probability": round(float(p1_prob), 4),
          "p2_probability": round(float(p2_prob), 4),
          "decoded_label": str(label),
          "winner_index": int(winner_idx),
          "raw_prediction": np.asarray(prediction).reshape(-1).tolist(),
      }
