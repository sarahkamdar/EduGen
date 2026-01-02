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
        from pypdf import PdfReader
        
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        file_path = temp_dir / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        text = ""
        try:
            pdf_reader = PdfReader(file_path)
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in PDF. It may be scanned or image-based.")
        
        return clean_text(text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF processing failed: {str(e)}")

async def normalize_word(file: UploadFile) -> str:
    try:
        from docx import Document
        
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        file_path = temp_dir / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        text = ""
        try:
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"
            
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            text += cell.text + " "
                    text += "\n"
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in Word document.")
        
        return clean_text(text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Word document processing failed: {str(e)}")

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
        word_extensions = ['.docx', '.doc']
        
        if file_ext in video_extensions:
            normalized_text = await normalize_video(file)
            input_type = "video"
        elif file_ext in pdf_extensions:
            normalized_text = await normalize_pdf(file)
            input_type = "pdf"
        elif file_ext in word_extensions:
            normalized_text = await normalize_word(file)
            input_type = "word"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    
    elif youtube_url:
        normalized_text = await normalize_youtube(youtube_url)
        input_type = "youtube"
    
    elif text:
        normalized_text = normalize_text(text)
        input_type = "text"
    
    return input_type, normalized_text
