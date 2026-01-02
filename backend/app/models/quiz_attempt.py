from pydantic import BaseModel
from typing import List
from datetime import datetime
from bson import ObjectId
from app.database.connection import get_database

class QuizResponse(BaseModel):
    question_id: int
    selected_option: str

class QuizEvaluationRequest(BaseModel):
    quiz_id: str
    user_id: str
    mode: str
    responses: List[QuizResponse]

class QuizAttemptCreate(BaseModel):
    user_id: str
    quiz_id: str
    content_id: str
    responses: list
    score: int
    percentage: float
    mode: str

def create_quiz_attempt(attempt_data: QuizAttemptCreate) -> str:
    db = get_database()
    quiz_attempts = db.quiz_attempts
    
    attempt_doc = {
        "user_id": attempt_data.user_id,
        "quiz_id": attempt_data.quiz_id,
        "content_id": attempt_data.content_id,
        "responses": attempt_data.responses,
        "score": attempt_data.score,
        "percentage": attempt_data.percentage,
        "mode": attempt_data.mode,
        "attempted_at": datetime.utcnow()
    }
    
    result = quiz_attempts.insert_one(attempt_doc)
    return str(result.inserted_id)

def get_user_quiz_attempts(user_id: str, content_id: str = None) -> list:
    db = get_database()
    quiz_attempts = db.quiz_attempts
    
    query = {"user_id": user_id}
    if content_id:
        query["content_id"] = content_id
    
    attempts = list(quiz_attempts.find(query).sort("attempted_at", -1))
    return attempts
