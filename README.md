# EduGen

## Phase 1: Backend Skeleton Initialized

## Phase 1.2: MongoDB Integration
MongoDB database integration added with environment variable configuration. The application connects to MongoDB on startup using the MONGODB_URI environment variable.

## Phase 2.1: Video to Text Pipeline
Video transcription functionality using FFmpeg and Whisper. The system accepts video file uploads, extracts audio using FFmpeg at 16kHz mono WAV format, transcribes the audio using Whisper base model, and stores transcripts in MongoDB. The pipeline handles video to text conversion through the /video/transcribe endpoint.

## Tech Stack
- FastAPI
- Uvicorn
- MongoDB
- PyMongo
- FFmpeg
- Whisper
