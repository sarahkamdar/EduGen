"""
flashcards.py — Flashcards generation service.

Supports pre-stored chunks (MongoDB content['chunks']) and raw normalized_text fallback.
"""

import os
import json
from typing import List, Optional
from groq import Groq
from dotenv import load_dotenv

from app.services.chunker import get_chunks_for_feature

load_dotenv()

FLASHCARD_PROMPT = """Create EXACTLY {num_cards} flashcards. Type: {flashcard_type}

{content}

Return ONLY JSON:
{{"flashcards": [{{"front": "...", "back": "..."}}]}}"""


def clean_json_response(text: str) -> str:
    """Extract JSON object from markdown code blocks."""
    text = text.strip()

    if text.startswith('```'):
        first_newline = text.find('\n')
        text = text[first_newline + 1:] if first_newline != -1 else text[3:]

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


def generate_flashcards(
    text_input: Optional[str] = None,
    flashcard_type: str = "Concept → Definition",
    num_cards: int = 10,
    stored_chunks: Optional[List[str]] = None,
    normalized_text: Optional[str] = None,
) -> dict:
    """
    Generate flashcards from stored_chunks or raw text.

    Args:
        text_input: Positional fallback parameter.
        flashcard_type: E.g., "Concept → Definition", "Question → Answer".
        num_cards: Total flashcards requested.
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
        chunks = get_chunks_for_feature(content_raw, "flashcards")
    else:
        return {"flashcards": [], "error": "No content available"}

    chunks_to_use = min(len(chunks), 4)
    cards_per_chunk = max(2, num_cards // chunks_to_use)

    all_flashcards: List[dict] = []

    for i in range(chunks_to_use):
        if len(all_flashcards) >= num_cards:
            break

        needed = num_cards - len(all_flashcards)
        num = min(cards_per_chunk, needed)

        prompt = FLASHCARD_PROMPT.format(
            num_cards=num,
            flashcard_type=flashcard_type,
            content=chunks[i],
        )

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You output only raw JSON. No preamble, no explanation, no markdown."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=400,
            )
            raw = response.choices[0].message.content
            if raw and raw.strip():
                cleaned = clean_json_response(raw)
                data = json.loads(cleaned)
                cards = data.get("flashcards", [])
                all_flashcards.extend(cards[:num])
        except Exception as exc:
            print(f"[FLASHCARDS] Chunk {i} error: {exc}")
            continue

    return {"flashcards": all_flashcards[:num_cards]}
