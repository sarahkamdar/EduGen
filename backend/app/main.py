from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.content import router as content_router
from app.auth.routes import router as auth_router
from app.database.connection import get_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm up the database connection
    get_database()
    yield


app = FastAPI(
    title="EduGen API",
    version="1.0.0",
    description="AI-Powered Educational Content Platform with JWT Authentication",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(content_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
