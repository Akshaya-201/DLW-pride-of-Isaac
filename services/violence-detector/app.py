import io
import os
from typing import Tuple

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from PIL import Image
from tensorflow.keras.models import load_model

app = FastAPI(title="Violence Detector Service")

MODELNEW_PATH = os.getenv("MODELNEW_PATH", r"C:\Users\Mohan\Downloads\modelnew.h5")
VGG16_MODEL_PATH = os.getenv("VGG16_MODEL_PATH", r"C:\Users\Mohan\Downloads\vgg16_model.h5")
THRESHOLD = float(os.getenv("VIOLENCE_THRESHOLD", "0.70"))
INPUT_SIZE = int(os.getenv("MODEL_INPUT_SIZE", "224"))
model_new = load_model(MODELNEW_PATH)
model_vgg = load_model(VGG16_MODEL_PATH)


class PredictRequest(BaseModel):
    frameDataUrl: str


def decode_data_url(data_url: str) -> bytes:
    if "," not in data_url:
        raise ValueError("Invalid data URL format.")
    _, b64_data = data_url.split(",", 1)
    import base64

    return base64.b64decode(b64_data)


def preprocess(image_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((INPUT_SIZE, INPUT_SIZE))
    array = np.asarray(image).astype("float32") / 255.0
    return np.expand_dims(array, axis=0)


def extract_violence_probability(raw_prediction: np.ndarray) -> float:
    flat = np.asarray(raw_prediction).astype("float32").reshape(-1)
    if flat.size == 1:
        return float(flat[0])
    if flat.size >= 2:
        return float(flat[1])
    return 0.0


def predict_probabilities(batch: np.ndarray) -> Tuple[float, float, float]:
    pred_new = model_new.predict(batch, verbose=0)
    pred_vgg = model_vgg.predict(batch, verbose=0)
    p_new = extract_violence_probability(pred_new)
    p_vgg = extract_violence_probability(pred_vgg)
    confidence = float((p_new + p_vgg) / 2.0)
    return p_new, p_vgg, confidence


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelnew_path": MODELNEW_PATH,
        "vgg16_model_path": VGG16_MODEL_PATH,
        "threshold": THRESHOLD,
    }


@app.post("/predict")
def predict(request: PredictRequest):
    image_bytes = decode_data_url(request.frameDataUrl)
    batch = preprocess(image_bytes)
    p_new, p_vgg, confidence = predict_probabilities(batch)
    violence_detected = confidence >= THRESHOLD

    return {
        "violenceDetected": bool(violence_detected),
        "confidence": confidence,
        "threshold": THRESHOLD,
        "provider": "tensorflow-dual-model",
        "scores": {
            "modelnew": p_new,
            "vgg16": p_vgg,
        },
    }
