"""
quiz.py — Quiz generation service.

Supports pre-stored chunks (MongoDB content['chunks']) and raw normalized_text fallback.
"""

import json
import os

from app.services.chunker import get_chunks_for_feature
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def clean_json_response(text: str) -> str:
    """Extract JSON object from markdown code blocks."""
    text = text.strip()

    if text.startswith('```'):
        first_newline = text.find('\n')
        text = text[first_newline + 1:] if first_newline != -1 else text[3:]

    text = text.removesuffix('```')

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
    text_input: str | None = None,
    max_questions: int = 10,
    difficulty_level: str = "Medium",
    quiz_mode: str = "Practice",
    stored_chunks: list[str] | None = None,
    normalized_text: str | None = None,
) -> dict:
    """
    Generate MCQ quiz questions from stored_chunks or raw text.

    Args:
        text_input: Positional fallback parameter.
        max_questions: Total questions requested.
        difficulty_level: Easy | Medium | Hard
        quiz_mode: Practice | Exam
        stored_chunks: Pre-computed chunks list from MongoDB.
        normalized_text: Raw text fallback.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")

    client = Groq(api_key=api_key)

    content_raw = text_input or normalized_text or ""
    if stored_chunks and isinstance(stored_chunks, list) and len(stored_chunks) > 0:
        chunks = stored_chunks
    elif content_raw:
        chunks = get_chunks_for_feature(content_raw, "quiz")
    else:
        return {"quiz": [], "error": "No content available"}

    chunks_to_use = min(len(chunks), 4)
    questions_per_chunk = max(2, max_questions // chunks_to_use)

    all_questions: list[dict] = []

    for i in range(chunks_to_use):
        if len(all_questions) >= max_questions:
            break

        needed = max_questions - len(all_questions)
        num = min(questions_per_chunk, needed)

        prompt = f"""Create EXACTLY {num} MCQs. Difficulty: {difficulty_level}.

{chunks[i]}

Add a brief, clear explanation for each correct answer. Return ONLY JSON:
{{"quiz": [{{"id": 1, "question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "correct_answer": "A", "explanation": "..."}}]}}"""

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You output only raw JSON. No preamble, no explanation, no markdown."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=600,
            )
            raw = response.choices[0].message.content
            if raw and raw.strip():
                cleaned = clean_json_response(raw)
                chunk_data = json.loads(cleaned)
                questions = chunk_data.get("quiz", [])
                all_questions.extend(questions[:num])
        except Exception as exc:
            print(f"[QUIZ] Chunk {i} error: {exc}")
            continue

    all_questions = all_questions[:max_questions]
    for idx, q in enumerate(all_questions, 1):
        q["id"] = idx

    return {"quiz": all_questions}
