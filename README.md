# EduGen

## Phase 1: Backend Skeleton Initialized

## Phase 1.2: MongoDB Integration
MongoDB database integration added with environment variable configuration. The application connects to MongoDB on startup using the MONGODB_URI environment variable.

## Phase 2.1: Video to Text Pipeline
Video transcription functionality using FFmpeg and Whisper. The system accepts video file uploads, extracts audio using FFmpeg at 16kHz mono WAV format, transcribes the audio using Whisper base model, and stores transcripts in MongoDB. The pipeline handles video to text conversion through the /video/transcribe endpoint.

## Phase 2.2: Text Processing and Summarization
Text processing functionality for cleaning transcripts and generating summaries. The system cleans transcribed text by removing extra whitespace and normalizing spacing, generates concise summaries using HuggingFace transformers, and extracts key points from the content. All outputs are stored in MongoDB and returned via the API.

## Phase 2.3.1: Flashcard Generation
Flashcard generation feature that creates educational flashcards from video content summaries and key points. The system automatically generates question-answer pairs to facilitate learning and retention. Flashcards are stored in MongoDB and included in the API response.

## Phase 2.3.2: Quiz Generation
Quiz generation feature that creates multiple-choice questions for assessment purposes. The system generates MCQ-based quizzes from video content summaries and key points with four options per question and one correct answer. Quizzes are stored in MongoDB and included in the API response.

## Phase 2.3.3: PowerPoint Generation
PowerPoint presentation generation feature that creates downloadable presentations from video content. The system generates structured slides with title, summary, and key points using python-pptx. The presentation file is saved locally and the file path is returned for download access.

## Phase 2.4: Context-Based Chatbot
RAG-based chatbot functionality that answers questions using video content context. The system uses HuggingFace transformers to generate answers grounded in the video transcript, summary, and key points. Questions and answers are stored in MongoDB and included in the API response when a user question is provided.

## Tech Stack
- FastAPI
- Uvicorn
- MongoDB
- PyMongo
- FFmpeg
- Whisper
- HuggingFace Transformers
