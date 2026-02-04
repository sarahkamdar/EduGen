from groq import Groq
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

def chunk_text(text: str, max_chars: int = 1000) -> list:
    """Split text into smaller chunks by sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""
    
    for sentence in sentences:
        if len(current) + len(sentence) > max_chars and current:
            chunks.append(current.strip())
            current = sentence
        else:
            current += " " + sentence if current else sentence
    
    if current:
        chunks.append(current.strip())
    return chunks

def get_quiz_prompt(normalized_text: str, num_questions: int, difficulty_level: str, quiz_mode: str) -> str:
    """Generate the quiz prompt for a chunk."""
    # Always generate explanations regardless of mode
    
    return f"""Create EXACTLY {num_questions} MCQs. Difficulty: {difficulty_level}.

{normalized_text}

Add a brief, clear explanation for each correct answer. Return ONLY JSON:
{{"quiz": [{{"id": 1, "question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "correct_answer": "A", "explanation": "..."}}]}}"""

def clean_json_response(text: str) -> str:
    """Extract JSON from markdown code blocks."""
    text = text.strip()
    
    if text.startswith('```'):
        first_newline = text.find('\n')
        if first_newline != -1:
            text = text[first_newline + 1:]
        else:
            text = text[3:]
    
    if text.endswith('```'):
        text = text[:-3]
    
    text = text.strip()
    
    if '{' in text and '}' in text:
        start = text.find('{')
        brace_count = 0
        end = -1
        for i in range(start, len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        
        if end != -1:
            text = text[start:end]
    
    return text

def generate_quiz(
    normalized_text: str,
    max_questions: int = 10,
    difficulty_level: str = "Medium",
    quiz_mode: str = "Practice"
) -> dict:
    """Generate EXACTLY the requested number of quiz questions."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    
    client = Groq(api_key=api_key)
    
    # For 5 or fewer questions, use single chunk
    if max_questions <= 5 or len(normalized_text) <= 1500:
        prompt = get_quiz_prompt(normalized_text[:1500], max_questions, difficulty_level, quiz_mode)
        
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=600
            )
            
            cleaned = clean_json_response(response.choices[0].message.content)
            quiz_data = json.loads(cleaned)
            questions = quiz_data.get('quiz', [])
            
            # Ensure exact count
            questions = questions[:max_questions]
            for i, q in enumerate(questions, 1):
                q['id'] = i
            
            return {"quiz": questions}
        except Exception as e:
            return {"quiz": [], "error": str(e)}
    
    # For more questions, split across chunks
    chunks = chunk_text(normalized_text, max_chars=1200)
    questions_per_chunk = max(2, max_questions // min(len(chunks), 3))
    chunks_to_use = min(len(chunks), 3)
    
    all_questions = []
    
    for i in range(chunks_to_use):
        if len(all_questions) >= max_questions:
            break
            
        needed = max_questions - len(all_questions)
        num = min(questions_per_chunk, needed)
        
        prompt = get_quiz_prompt(chunks[i], num, difficulty_level, quiz_mode)
        
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=600
            )
            
            result_text = response.choices[0].message.content
            
            if result_text and result_text.strip():
                cleaned_text = clean_json_response(result_text)
                
                try:
                    chunk_quiz = json.loads(cleaned_text)
                    questions = chunk_quiz.get('quiz', [])
                    all_questions.extend(questions[:num])
                        
                except json.JSONDecodeError:
                    continue
                    
        except Exception as e:
            print(f"Chunk {i} error: {e}")
            continue
    
    # Ensure exact count and renumber
    all_questions = all_questions[:max_questions]
    for i, q in enumerate(all_questions, 1):
        q['id'] = i
    
    return {"quiz": all_questions}


