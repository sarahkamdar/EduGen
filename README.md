# EDUGEN - Audio Transcription & Summarization API

A FastAPI-based audio/video transcription and summarization service powered by OpenAI Whisper and OpenRouter LLM.

## Features
- Audio transcription from multiple formats (MP3, WAV, M4A, FLAC, OGG, AAC)
- Video to audio extraction and transcription (MP4, AVI, MOV, MKV, FLV, WMV)
- AI-powered text summarization using OpenRouter LLM (DeepSeek R1)
- Powered by OpenAI Whisper for accurate speech-to-text conversion
- Health check endpoint for service monitoring

## Prerequisites
- Python 3.8+
- FFmpeg (for video to audio conversion)
- OpenRouter API key (for summarization feature)

## Installation

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Install FFmpeg:
   - Windows: Download from https://ffmpeg.org/ and add to PATH

3. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add your OpenRouter API key: `OPENROUTER_API_KEY=your_key_here`

## Usage

1. Start the server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Access the API at `http://localhost:8000`
3. View API documentation at `http://localhost:8000/docs`
4. Check service health at `http://localhost:8000/health`

## API Endpoints

### GET /health
Check if the service is running.

**Response:**
```json
{
  "status": "ok"
}
```

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

### POST /audio/transcribe-and-summarize
Upload an audio or video file for transcription and AI-powered summarization.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (audio/video file)

**Response:**
```json
{
  "transcript": "Full transcribed text from the audio...",
  "summary": "AI-generated concise summary of the transcript...",
  "filename": "example.mp3"
}
```

## Tech Stack
- FastAPI
- Uvicorn
- OpenAI Whisper (base model)
- OpenRouter API (DeepSeek R1)
- FFmpeg
- PyTorch
- Python-dotenv

