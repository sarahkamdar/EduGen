"""
chatbot.py — RAG-based chatbot service.

Supports pre-stored chunks (MongoDB content['chunks']) and raw normalized_text fallback.
"""

import os
from typing import List, Optional
from groq import Groq
from dotenv import load_dotenv

from app.services.chunker import get_chunks_for_feature, retrieve_top_k

load_dotenv()


def chat_with_content(
    text_input: Optional[str] = None,
    question: str = "",
    chat_history: Optional[List[dict]] = None,
    stored_chunks: Optional[List[str]] = None,
    normalized_text: Optional[str] = None,
) -> str:
    """
    Answer user questions using RAG over stored_chunks or raw text.

    Args:
        text_input: Positional fallback parameter.
        question: User's question.
        chat_history: Previous conversation turns.
        stored_chunks: Pre-computed chunks list from MongoDB.
        normalized_text: Raw text fallback.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")

    content_raw = text_input or normalized_text or ""
    if stored_chunks and isinstance(stored_chunks, list) and len(stored_chunks) > 0:
        chunks = stored_chunks
    elif content_raw:
        chunks = get_chunks_for_feature(content_raw, "chatbot")
    else:
        return "No content available to answer your question."

    # Retrieve 3 most relevant chunks for user's question
    relevant_chunks = retrieve_top_k(chunks, question, top_k=3)
    context = "\n\n".join(relevant_chunks)

    system_message = f"""You are a helpful assistant. Answer the user's question using ONLY the following context.
If the context doesn't contain enough information, say so honestly.

=== RELEVANT CONTEXT ===
{context}
========================

Be concise, accurate, and cite specific details from the context when possible."""

    messages = [{"role": "system", "content": system_message}]

    if chat_history:
        messages.extend(chat_history[-4:])

    messages.append({"role": "user", "content": question})

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=400,
        )
        result_text = response.choices[0].message.content
        return result_text.strip() if result_text else "Sorry, I couldn't generate a response. Please try again."

    except Exception as e:
        print(f"[CHATBOT] Error: {e}")
        return f"Error: {str(e)}"
