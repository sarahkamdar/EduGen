import json
from typing import Dict, List

def evaluate_quiz(quiz_content: dict, user_responses: List[Dict], mode: str, user_id: str, quiz_id: str) -> dict:
    questions = quiz_content.get("questions", [])
    total_questions = len(questions)
    correct_count = 0
    results = []
    
    response_map = {resp["question_id"]: resp["selected_option"] for resp in user_responses}
    
    for question in questions:
        qid = question["id"]
        correct_answer = question["correct_answer"]
        selected = response_map.get(qid, "")
        
        is_correct = selected == correct_answer
        if is_correct:
            correct_count += 1
        
        result_item = {
            "question_id": qid,
            "is_correct": is_correct,
            "selected_option": selected if selected else "Not answered",
            "correct_answer": correct_answer
        }
        
        if mode == "practice":
            result_item["explanation"] = question.get("explanation", "")
        else:
            result_item["explanation"] = ""
        
        results.append(result_item)
    
    percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    completion_message = generate_completion_message(percentage, mode)
    
    return {
        "quiz_id": quiz_id,
        "user_id": user_id,
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "score": correct_count,
        "percentage": round(percentage, 2),
        "results": results,
        "completion_message": completion_message
    }

def generate_completion_message(percentage: float, mode: str) -> str:
    if percentage >= 90:
        return "Excellent work! You have mastered this topic."
    elif percentage >= 75:
        return "Great job! You have a strong understanding of the topic."
    elif percentage >= 60:
        return "Good effort! Review a few concepts to strengthen your understanding."
    elif percentage >= 40:
        return "Keep practicing — progress matters more than perfection."
    else:
        return "Don't give up! Review the material and try again to improve."
