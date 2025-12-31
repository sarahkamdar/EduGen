import os
import hashlib
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.services.audio_extractor import extract_audio

SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv']
SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac']

def validate_file_format(filename: str) -> str:
    file_ext = Path(filename).suffix.lower()
    
    if file_ext in SUPPORTED_VIDEO_EXTENSIONS:
        return "video"
    elif file_ext in SUPPORTED_AUDIO_EXTENSIONS:
        return "audio"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

def generate_file_hash(file_content: bytes) -> str:
    return hashlib.sha256(file_content).hexdigest()

async def save_uploaded_file(file: UploadFile) -> tuple[Path, bytes]:
    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)
    
    file_content = await file.read()
    file_path = temp_dir / file.filename
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    return file_path, file_content

def process_file_to_audio(file_path: Path, file_type: str) -> str:
    if file_type == "video":
        audio_path = extract_audio(str(file_path))
        os.remove(file_path)
        return audio_path
    else:
        return str(file_path)

def cleanup_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)
