from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.audio_extractor import extract_audio
from app.services.transcription import transcribe_audio
from app.services.text_processing import clean_text, summarize_text, extract_key_points
from app.services.flashcards import generate_flashcards
from app.services.quiz import generate_quiz
from app.services.ppt_generator import generate_ppt
from app.services.chatbot import generate_chat_response
from app.database.mongodb import get_database
import os
from pathlib import Path
from datetime import datetime

router = APIRouter()

@router.post("/video/transcribe")
async def transcribe_video(file: UploadFile = File(...), user_question: str = Form(None)):
    """Upload video file and get transcription."""
    try:
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        video_path = temp_dir / file.filename
        with open(video_path, "wb") as f:
            f.write(await file.read())
        
        audio_path = extract_audio(str(video_path))
        transcript_text = transcribe_audio(audio_path)
        
        cleaned_text = clean_text(transcript_text)
        summary = summarize_text(cleaned_text)
        key_points = extract_key_points(cleaned_text)
        flashcards = generate_flashcards(summary, key_points)
        quiz = generate_quiz(summary, key_points)
        ppt_path = generate_ppt(summary, key_points)
        
        chat_response = None
        if user_question:
            chat_response = generate_chat_response(user_question, cleaned_text, summary, key_points)
        
        db = get_database()
        if db is not None:
            transcripts_collection = db["transcripts"]
            transcripts_collection.insert_one({
                "filename": file.filename,
                "transcript": cleaned_text,
                "summary": summary,
                "key_points": key_points,
                "created_at": datetime.utcnow()
            })
            
            flashcards_collection = db["flashcards"]
            flashcards_collection.insert_one({
                "filename": file.filename,
                "flashcards": flashcards,
                "created_at": datetime.utcnow()
            })
            
            quizzes_collection = db["quizzes"]
            quizzes_collection.insert_one({
                "filename": file.filename,
                "quiz": quiz,
                "created_at": datetime.utcnow()
            })
            
            if chat_response:
                chats_collection = db["chats"]
                chats_collection.insert_one({
                    "question": user_question,
                    "answer": chat_response,
                    "created_at": datetime.utcnow()
                })
        
        os.remove(video_path)
        os.remove(audio_path)
        
        response = {
            "transcript": cleaned_text,
            "summary": summary,
            "key_points": key_points,
            "flashcards": flashcards,
            "quiz": quiz,
            "ppt_path": ppt_path
        }
        
        if chat_response:
            response["chat_response"] = chat_response
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
