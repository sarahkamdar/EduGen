from openrouter import OpenRouter
import os
import json
from dotenv import load_dotenv

load_dotenv()

QUIZ_PROMPT = """Generate auto-gradable MCQ quiz from educational content.

INPUT:
Content: {normalized_text}
Max Questions: {max_questions}
Difficulty: {difficulty_level}
Mode: {quiz_mode}

RULES:
- Total questions must not exceed {max_questions}
- Each question tests different concept
- No repeated ideas or facts
- Assess understanding not memorization
- Use only source content information
- Clear academic language

DIFFICULTY:
Easy: Direct definitions and facts
Medium: Conceptual reasoning and comparisons
Hard: Multi-step reasoning and subtle distinctions

STRUCTURE:
- Exactly 4 options per question
- Exactly 1 correct answer matching an option
- Plausible distractors
- No "All/None of the above"
- No repeated option text

MODE:
Practice: Include correct answer and brief explanation
Test: Include correct answer with empty explanation string

OUTPUT FORMAT (JSON only):
{{
  "quiz": [
    {{
      "id": 1,
      "question": "string",
      "options": {{"A": "string", "B": "string", "C": "string", "D": "string"}},
      "correct_answer": "A",
      "explanation": "string or empty"
    }}
  ]
}}

FORBIDDEN:
- Multiple correct answers
- Answer not in options
- Repeated concepts
- Ambiguous wording
- External knowledge
- Any text outside JSON"""

def generate_quiz(
    normalized_text: str,
    max_questions: int = 10,
    difficulty_level: str = "Medium",
    quiz_mode: str = "Practice"
) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    prompt = QUIZ_PROMPT.format(
        normalized_text=normalized_text,
        max_questions=max_questions,
        difficulty_level=difficulty_level,
        quiz_mode=quiz_mode
    )
    
    with OpenRouter(api_key=api_key) as client:
        response = client.chat.send(
            model="deepseek/deepseek-r1-0528:free",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        result_text = response.choices[0].message.content
        
        try:
            quiz_data = json.loads(result_text)
            return quiz_data
        except json.JSONDecodeError:
            return {"quiz": [], "raw_response": result_text}
