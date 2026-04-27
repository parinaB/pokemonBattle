# Pokemon Battle Royale

Premium animated Pokemon battle simulator with React + FastAPI and ML-based winner prediction.

## Features
- Premium dark UI with Framer Motion transitions and battle animations
- Modes: `1v1` and `6v6`
- 6v6 flow with `Next Battle` step-by-step progression
- Tie support: if both teams win equal rounds, final result is `Tie`
- Dynamic background color based on active Pokemon
- Local custom image upload to override Pokemon art
- Backend inference via trained artifacts (`pokemon_model.keras`, `scaler.pkl`, `label_encoder.pkl`, `features.pkl`)

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: FastAPI
- ML: Keras model + sklearn scaler + label encoder

## Project Structure
```text
frontend/
  src/
    components/
    pages/
    data/
    context/
    styles/
backend/
  app.py
  utils.py
  requirements.txt

pokemon_model.keras
scaler.pkl
label_encoder.pkl
features.pkl
```

## Prerequisites
- Node.js 18+
- Python 3.10+

## Setup

### 1) Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 2) Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
Backend runs on `http://127.0.0.1:8000`.

## Model Artifacts (required at repo root)
- `pokemon_model.keras`
- `scaler.pkl`
- `label_encoder.pkl`
- `features.pkl`

`features.pkl` is used to enforce the exact feature order used during model training.

## API
### `GET /health`
Health check endpoint.

### `POST /predict`
Request body:
```json
{
  "pokemon1": {
    "name": "Charizard",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "speed": 100 }
  },
  "pokemon2": {
    "name": "Blastoise",
    "stats": { "hp": 79, "attack": 83, "defense": 100, "speed": 78 }
  }
}
```

Response (example):
```json
{
  "winner": "P1",
  "confidence": 0.74,
  "p1_probability": 0.74,
  "p2_probability": 0.26,
  "decoded_label": "0",
  "winner_index": 0,
  "raw_prediction": [0.26]
}
```

## Notes
- Winner decisions are model-driven (`P1`/`P2`).
- If label encoder classes cannot map to `P1/P2`, backend raises an error instead of guessing.
- In `6v6` final page, only winning team/player is shown (no Pokemon photo).

## Troubleshooting
- Backend not connected: ensure FastAPI server is running on port `8000`.
- Model load errors: verify all `.pkl` and `.keras` files exist at repository root.
- Frontend API issues: restart both frontend and backend servers.
