# EDUGEN - AI-Powered Educational Content Platform

A unified FastAPI backend for AI-powered educational content generation with JWT authentication, powered by OpenAI Whisper and OpenRouter LLM.

## Features
- JWT-based user authentication
- Unified content ingestion pipeline supporting:
  - Video files (MP4, AVI, MOV, MKV, FLV, WMV)
  - YouTube URLs
  - PDF documents
  - Word documents (DOCX, DOC)
  - Plain text/topics
- AI-powered content generation:
  - Smart summaries (short, detailed, exam, revision)
  - Flashcards generation
  - Quiz generation with multiple difficulty levels
  - Presentation outline generation
  - Context-aware chatbot
- User-specific content history
- MongoDB Atlas for data storage
- Zero code duplication architecture

## Prerequisites
- Python 3.8+
- FFmpeg (for video to audio conversion)
- OpenRouter API key
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
uvicorn app.main:app --reload
```

   **Note for Windows users:** If Device Guard blocks uvicorn.exe, use:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

2. Access the API at `http://localhost:8000`
3. View API documentation at `http://localhost:8000/docs`
4. Check service health at `http://localhost:8000/health`

## Unified Content Pipeline

All content flows through a single ingestion route:

1. **Upload** → Accepts ONE of: video file, YouTube URL, PDF, or text
2. **Normalize** → Converts all inputs to clean text
3. **Store** → Saves normalized content with unique ID
4. **Generate** → Use content ID for any AI feature

### Input Types

**Exactly one input per request:**
- `file`: Video (MP4, AVI, MOV, MKV, FLV, WMV), PDF, or Word document (DOCX, DOC)
- `youtube_url`: YouTube video URL
- `text`: Plain text or topic

Backend validates single input source.

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

### Content Ingestion

#### POST /content/upload
Single entry point for all content types. Accepts one input: video file, YouTube URL, PDF, or text.

**Authentication Required:** Yes

**Request (Video/PDF):**
```bash
curl -X POST "http://localhost:8000/content/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@lecture.mp4"
```

**Request (YouTube):**
```bash
curl -X POST "http://localhost:8000/content/upload" \
  -H "Authorization: Bearer <token>" \
  -F "youtube_url=https://youtube.com/watch?v=..."
```

**Request (Text):**
```bash
curl -X POST "http://localhost:8000/content/upload" \
  -H "Authorization: Bearer <token>" \
  -F "text=Explain quantum physics"
```

**Response:**
```json
{
  "content_id": "unique_id",
  "normalized_text": "Clean extracted text..."
}
```

**Errors:**
- 400: No input provided or multiple inputs
- 400: Unsupported file format

### AI Content Generation

All AI routes require `content_id` from upload.

#### POST /content/summary
Generate summary from normalized content.

**Authentication Required:** Yes

**Request:**
```bash
curl -X POST "http://localhost:8000/content/summary" \
  -H "Authorization: Bearer <token>" \
  -F "content_id=unique_id" \
  -F "summary_type=detailed"
```

**Summary Types:**
- `short`: 3-5 sentences
- `detailed`: Comprehensive summary
- `exam`: Focused on exam topics
- `revision`: Quick revision optimized

**Response:**
```json
{
  "content_id": "unique_id",
  "summary": "AI-generated summary...",
  "summary_type": "detailed",
  "output_id": "output_id"
}
```

#### POST /content/flashcards
Generate flashcards with one concept per card.

**Authentication Required:** Yes

**Request:**
```bash
curl -X POST "http://localhost:8000/content/flashcards" \
  -H "Authorization: Bearer <token>" \
  -F "content_id=unique_id" \
  -F "flashcard_type=standard"
```

**Response:**
```json
{
  "content_id": "unique_id",
  "flashcards": [
    {"question": "...", "answer": "..."}
  ],
  "output_id": "output_id"
}
```

#### POST /content/quiz
Generate quiz with exactly 4 options per question and explanations.

**Authentication Required:** Yes

**Request:**
```bash
curl -X POST "http://localhost:8000/content/quiz" \
  -H "Authorization: Bearer <token>" \
  -F "content_id=unique_id" \
  -F "number_of_questions=10" \
  -F "difficulty=medium" \
  -F "mode=practice"
```

**Parameters:**
- `difficulty`: easy, medium, hard
- `mode`: practice (shows answer and explanation immediately), test (shows results after submission)

**Response:**
```json
{
  "content_id": "unique_id",
  "quiz": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "B",
      "explanation": "Brief explanation of the correct answer"
    }
  ],
  "output_id": "output_id"
}
```

**Note:** 
- In **practice mode**, explanations are shown immediately with each question
- In **test mode**, explanations are shown after test submission along with correct/incorrect status

#### POST /content/presentation
Generate presentation outline with max 4 bullets per slide.

**Authentication Required:** Yes

**Request:**
```bash
curl -X POST "http://localhost:8000/content/presentation" \
  -H "Authorization: Bearer <token>" \
  -F "content_id=unique_id" \
  -F "max_slides=10" \
  -F "theme=professional"
```

**Response:**
```json
{
  "content_id": "unique_id",
  "presentation": [
    {
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "output_id": "output_id"
}
```

#### POST /content/chat
Context-aware chatbot using content.

**Authentication Required:** Yes

**Request:**
```bash
curl -X POST "http://localhost:8000/content/chat" \
  -H "Authorization: Bearer <token>" \
  -F "content_id=unique_id" \
  -F "user_question=What is the main concept?"
```

**Response:**
```json
{
  "content_id": "unique_id",
  "question": "What is the main concept?",
  "answer": "Based on the content...",
  "output_id": "output_id"
}
```

#### GET /content/history
Get all uploaded content.

**Authentication Required:** Yes

**Response:**
```json
{
  "history": [
    {
      "content_id": "unique_id",
      "input_type": "video",
      "created_at": "2025-12-31T10:00:00",
      "preview": "First 200 chars..."
    }
  ]
}
```

#### GET /content/{content_id}/outputs
Get all AI-generated outputs for specific content.

**Authentication Required:** Yes

**Response:**
```json
{
  "content_id": "unique_id",
  "outputs": [
    {
      "output_id": "output_id",
      "feature": "summary",
      "options": {"summary_type": "detailed"},
      "created_at": "2025-12-31T10:05:00"
    }
  ]
}
```

### Health Check

### GET /health
Check if the service is running.

**Response:**
```json
{
  "status": "ok"
}
```

## Tech Stack
- FastAPI
- OpenAI Whisper (transcription)
- OpenRouter API (DeepSeek R1 for all AI generation)
- FFmpeg (video processing)
- yt-dlp (YouTube downloads)
- pypdf (PDF extraction)
- python-docx (Word document extraction)
- MongoDB Atlas (data storage)
- JWT (python-jose)
- bcrypt (password hashing)

## Database Schema

### content collection
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "input_type": "video | youtube | pdf | word | text",
  "normalized_text": "string",
  "created_at": "datetime"
}
```

### generated_outputs collection
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "content_id": "string",
  "feature": "summary | quiz | flashcards | presentation | chat",
  "options": "object",
  "output": "object",
  "created_at": "datetime"
}
```

## Authentication Flow

1. **User Registration**: Users sign up with name, email, and password. Passwords are hashed using bcrypt before storage.

2. **User Login**: Users authenticate with email and password. Upon successful login, a JWT access token is issued.

3. **Protected Routes**: All content processing endpoints require authentication using the JWT token.

4. **Token Usage**: Include the JWT token in the Authorization header:
   ```
   Authorization: Bearer <your_access_token>
   ```

## Architecture

**Unified Pipeline:**
1. Single ingestion route (`/content/upload`)
2. Normalization service converts all inputs to text
3. Content stored with unique ID
4. All AI features use stored content (no re-processing)

**Key Principles:**
- Zero code duplication
- Single source of truth for content
- Reusable services for all operations
- Model-agnostic backend (all AI via OpenRouter)
- Clean separation: routes orchestrate, services implement
- User ownership validation on all resources

**Content Flow:**
```
Input (video/YouTube/PDF/text)
  ↓
Normalize to clean text
  ↓
Store in MongoDB
  ↓
Generate AI features (summary/quiz/flashcards/PPT/chat)
  ↓
Store outputs with references
```

## Security Features
- Passwords hashed with bcrypt
- JWT-based stateless authentication
- Token expiration (default 30 minutes)
- Case-insensitive email validation
- User ownership validation for all resources
- Single input validation per request
