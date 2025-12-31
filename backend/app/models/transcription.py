from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.database.connection import get_database

class TranscriptionCreate(BaseModel):
    user_id: str
    filename: str
    file_type: str
    transcript: str

class TranscriptionResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    transcript: str
    created_at: datetime

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }

def create_transcription(transcription_data: TranscriptionCreate) -> str:
    db = get_database()
    transcriptions_collection = db.transcriptions
    
    transcription_doc = {
        "user_id": transcription_data.user_id,
        "filename": transcription_data.filename,
        "file_type": transcription_data.file_type,
        "transcript": transcription_data.transcript,
        "created_at": datetime.utcnow()
    }
    
    result = transcriptions_collection.insert_one(transcription_doc)
    return str(result.inserted_id)

def get_transcription_by_id(transcription_id: str) -> Optional[dict]:
    db = get_database()
    transcriptions_collection = db.transcriptions
    
    try:
        transcription = transcriptions_collection.find_one({"_id": ObjectId(transcription_id)})
        return transcription
    except:
        return None

def get_user_transcriptions(user_id: str) -> list:
    db = get_database()
    transcriptions_collection = db.transcriptions
    
    transcriptions = list(transcriptions_collection.find({"user_id": user_id}).sort("created_at", -1))
    return transcriptions

def delete_transcription(transcription_id: str, user_id: str) -> bool:
    db = get_database()
    transcriptions_collection = db.transcriptions
    
    try:
        result = transcriptions_collection.delete_one({
            "_id": ObjectId(transcription_id),
            "user_id": user_id
        })
        return result.deleted_count > 0
    except:
        return False
