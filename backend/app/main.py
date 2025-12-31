from fastapi import FastAPI
from fastapi.security import HTTPBearer
from app.routes.audio import router as audio_router
from app.routes.content import router as content_router
from app.auth.routes import router as auth_router

app = FastAPI(
    title="EduGen API",
    version="1.0.0",
    description="AI-Powered Educational Content Platform with JWT Authentication"
)

security = HTTPBearer()

app.include_router(auth_router)
app.include_router(content_router)
app.include_router(audio_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
