# EDUGEN - Audio Transcription & Summarization API

A FastAPI-based audio/video transcription and summarization service with JWT authentication, powered by OpenAI Whisper and OpenRouter LLM.

## Features
- JWT-based user authentication
- User signup and login with secure password hashing
- Audio transcription from multiple formats (MP3, WAV, M4A, FLAC, OGG, AAC)
- Video to audio extraction and transcription (MP4, AVI, MOV, MKV, FLV, WMV)
- AI-powered text summarization using OpenRouter LLM (DeepSeek R1)
- Powered by OpenAI Whisper for accurate speech-to-text conversion
- MongoDB Atlas for user data storage
- Health check endpoint for service monitoring

## Prerequisites
- Python 3.8+
- FFmpeg (for video to audio conversion)
- OpenRouter API key (for summarization feature)
- MongoDB Atlas account and connection URI

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
   - Add the following variables:
     ```
     OPENROUTER_API_KEY=your_openrouter_key_here
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET_KEY=your_secret_key_here
     ACCESS_TOKEN_EXPIRE_MINUTES=30
     ```

## Usage

1. Start the server:
```bash
cd backend
# venv\Scripts\activate
uvicorn app.main:app --reload
```

2. Access the API at `http://localhost:8000`
3. View API documentation at `http://localhost:8000/docs`
4. Check service health at `http://localhost:8000/health`

## API Endpoints

### Authentication Endpoints

#### POST /auth/signup
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully"
}
```

**Errors:**
- 400: Email already registered

#### POST /auth/login
Authenticate and receive JWT access token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- 401: Invalid credentials

### Audio Processing Endpoints

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
- MongoDB Atlas
- JWT (python-jose)
- bcrypt

## Authentication Flow

1. **User Registration**: Users sign up with name, email, and password. Passwords are hashed using bcrypt before storage.

2. **User Login**: Users authenticate with email and password. Upon successful login, a JWT access token is issued.

3. **Protected Routes**: Future endpoints (transcription, summarization, history, chatbot) will require authentication using the JWT token.

4. **Token Usage**: Include the JWT token in the Authorization header for protected endpoints:
   ```
   Authorization: Bearer <your_access_token>
   ```

## Security Features
- Passwords hashed with bcrypt
- JWT-based stateless authentication
- Token expiration (configurable, default 30 minutes)
- Case-insensitive email validation
- Secure credential verification

## Future Integration
The authentication system is designed to support:
- User-specific transcription history
- AI conversation memory per user
- Personalized summarization settings
- Side-panel history tracking

These features will be implemented in subsequent phases.
