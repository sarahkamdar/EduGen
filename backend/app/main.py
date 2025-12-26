from fastapi import FastAPI
from app.database.mongodb import get_database
from app.routes.video import router as video_router

app = FastAPI()

app.include_router(video_router)

@app.on_event("startup")
def startup_event():
    try:
        db = get_database()
        if db is not None:
            print("MongoDB connection successful")
        else:
            print("MongoDB connection failed: MONGODB_URI not set")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

@app.get("/health")
def health_check():
    return {"status": "ok"}
