from fastapi import FastAPI
from app.routes.audio import router as audio_router
from app.auth.routes import router as auth_router

app = FastAPI(title="Audio Transcription API", version="1.0.0")

app.include_router(auth_router)
app.include_router(audio_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
