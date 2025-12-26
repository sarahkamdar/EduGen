from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.audio_extractor import extract_audio
from app.services.transcription import transcribe_audio
from app.database.mongodb import get_database
import os
from pathlib import Path
from datetime import datetime

router = APIRouter()

@router.post("/video/transcribe")
async def transcribe_video(file: UploadFile = File(...)):
    """Upload video file and get transcription."""
    try:
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        video_path = temp_dir / file.filename
        with open(video_path, "wb") as f:
            f.write(await file.read())
        
        audio_path = extract_audio(str(video_path))
        transcript_text = transcribe_audio(audio_path)
        
        db = get_database()
        if db is not None:
            transcripts_collection = db["transcripts"]
            transcripts_collection.insert_one({
                "filename": file.filename,
                "transcript": transcript_text,
                "created_at": datetime.utcnow()
            })
        
        os.remove(video_path)
        os.remove(audio_path)
        
        return {"transcript": transcript_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
