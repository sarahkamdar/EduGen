from fastapi import FastAPI
from app.routes.audio import router as audio_router

app = FastAPI(title="Audio Transcription API", version="1.0.0")

app.include_router(audio_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
