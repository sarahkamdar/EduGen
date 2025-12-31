import os
import re
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.services.audio_extractor import extract_audio
from app.services.transcription import transcribe_audio

async def normalize_video(file: UploadFile) -> str:
    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)
    
    file_path = temp_dir / file.filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    audio_path = extract_audio(str(file_path))
    os.remove(file_path)
    
    transcript = transcribe_audio(audio_path)
    os.remove(audio_path)
    
    return transcript

async def normalize_youtube(youtube_url: str) -> str:
    try:
        import yt_dlp
        
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        audio_file = temp_dir / "youtube_audio.mp3"
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': str(audio_file.with_suffix('')),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
        
        transcript = transcribe_audio(str(audio_file))
        os.remove(audio_file)
        
        return transcript
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"YouTube download failed: {str(e)}")

async def normalize_pdf(file: UploadFile) -> str:
    try:
        import PyPDF2
        
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        file_path = temp_dir / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        text = ""
        with open(file_path, "rb") as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        
        os.remove(file_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from PDF")
        
        return clean_text(text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF processing failed: {str(e)}")

def normalize_text(text: str) -> str:
    return clean_text(text)

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

async def process_content(
    file: Optional[UploadFile] = None,
    youtube_url: Optional[str] = None,
    text: Optional[str] = None
) -> tuple[str, str]:
    input_count = sum([file is not None, youtube_url is not None, text is not None])
    
    if input_count == 0:
        raise HTTPException(status_code=400, detail="No input provided")
    
    if input_count > 1:
        raise HTTPException(status_code=400, detail="Only one input type allowed")
    
    if file:
        file_ext = Path(file.filename).suffix.lower()
        
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv']
        pdf_extensions = ['.pdf']
        
        if file_ext in video_extensions:
            normalized_text = await normalize_video(file)
            input_type = "video"
        elif file_ext in pdf_extensions:
            normalized_text = await normalize_pdf(file)
            input_type = "pdf"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    
    elif youtube_url:
        normalized_text = await normalize_youtube(youtube_url)
        input_type = "youtube"
    
    elif text:
        normalized_text = normalize_text(text)
        input_type = "text"
    
    return input_type, normalized_text
