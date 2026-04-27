from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os

from utils import Predictor


app = FastAPI(title="Pokemon Battle Predictor")

cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
cors_origins = (
    ["*"]
    if cors_origins_raw.strip() == "*"
    else [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PokemonStats(BaseModel):
    hp: float
    attack: float
    defense: float
    speed: float


class PokemonPayload(BaseModel):
    name: str
    stats: PokemonStats


class PredictionRequest(BaseModel):
    pokemon1: PokemonPayload
    pokemon2: PokemonPayload


predictor = Predictor()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict")
def predict(request: PredictionRequest) -> dict:
    try:
        return predictor.predict(request.pokemon1.model_dump(), request.pokemon2.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
