from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.audio_extractor import extract_audio
from app.services.transcription import transcribe_audio
from app.services.summary import generate_summary
import os
from pathlib import Path

router = APIRouter()

@router.post("/audio/transcribe")
async def transcribe_audio_file(file: UploadFile = File(...)):
    """Upload audio file and get transcription."""
    try:
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        # Save uploaded file
        file_path = temp_dir / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # Check if it's a video file and extract audio if needed
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv']
        audio_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac']
        
        file_ext = file_path.suffix.lower()
        
        if file_ext in video_extensions:
            # Extract audio from video
            audio_path = extract_audio(str(file_path))
            # Remove original video file
            os.remove(file_path)
        elif file_ext in audio_extensions:
            # Use audio file directly
            audio_path = str(file_path)
        else:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload audio or video file.")
        
        # Transcribe audio
        transcript_text = transcribe_audio(audio_path)
        
        # Clean up
        os.remove(audio_path)
        
        return {
            "transcript": transcript_text,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio/transcribe-and-summarize")
async def transcribe_and_summarize(file: UploadFile = File(...)):
    """Upload audio/video file, transcribe it, and generate summary using LLM."""
    try:
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        # Save uploaded file
        file_path = temp_dir / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # Check if it's a video file and extract audio if needed
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv']
        audio_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac']
        
        file_ext = file_path.suffix.lower()
        
        if file_ext in video_extensions:
            # Extract audio from video
            audio_path = extract_audio(str(file_path))
            # Remove original video file
            os.remove(file_path)
        elif file_ext in audio_extensions:
            # Use audio file directly
            audio_path = str(file_path)
        else:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload audio or video file.")
        
        # Transcribe audio
        transcript_text = transcribe_audio(audio_path)
        
        # Generate summary using LLM
        summary = generate_summary(transcript_text)
        
        # Clean up
        os.remove(audio_path)
        
        return {
            "transcript": transcript_text,
            "summary": summary,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
