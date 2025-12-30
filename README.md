# Audio Transcription API

A simple FastAPI-based audio transcription service using OpenAI Whisper.

## Features
- Audio transcription from multiple formats (MP3, WAV, M4A, FLAC, OGG, AAC)
- Video to audio extraction and transcription (MP4, AVI, MOV, MKV, FLV, WMV)
- Powered by OpenAI Whisper for accurate speech-to-text conversion

## Prerequisites
- Python 3.8+
- FFmpeg (for video to audio conversion)

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install FFmpeg:
   - Windows: Download from https://ffmpeg.org/ and add to PATH
   - macOS: `brew install ffmpeg`
   - Linux: `sudo apt-get install ffmpeg`

## Usage

1. Start the server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Access the API at `http://localhost:8000`
3. View API documentation at `http://localhost:8000/docs`

## API Endpoint

### POST /audio/transcribe
Upload an audio or video file for transcription.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (audio/video file)

**Response:**
```json
{
  "transcript": "Transcribed text from the audio...",
  "filename": "example.mp3"
}
```

## Tech Stack
- FastAPI
- Uvicorn
- OpenAI Whisper
- FFmpeg
- PyTorch

