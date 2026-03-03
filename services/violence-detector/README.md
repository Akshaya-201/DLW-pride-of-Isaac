# Violence Detector Service

This service runs `modelnew.h5` and `vgg16_model.h5` and exposes:

- `POST /predict` (frame analysis)
- `GET /health`

## 1) Install

```bash
cd services/violence-detector
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2) Configure model paths

PowerShell example:

```powershell
$env:MODELNEW_PATH="C:\Users\Mohan\Downloads\modelnew.h5"
$env:VGG16_MODEL_PATH="C:\Users\Mohan\Downloads\vgg16_model.h5"
$env:VIOLENCE_THRESHOLD="0.70"
```

## 3) Run API

```bash
uvicorn app:app --host 127.0.0.1 --port 8001
```

Your Next.js app should set:

```env
VIOLENCE_DETECTOR_URL=http://127.0.0.1:8001/predict
```

## Notes

- The Next app captures camera frames, calls `/api/violence-detect`, and forwards to this service.
- When violence is detected, Next assembles a rolling 15-second video + short audio clip and posts it to `/api/emergency-dispatch`.
- To actually store/share media files, set `EVIDENCE_RELAY_URL` to your storage/notification backend.
