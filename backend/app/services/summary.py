"""
summary.py — Summary generation service.

Supports both pre-stored chunks (MongoDB content['chunks']) and raw normalized_text fallback.
"""

import os

from app.services.chunker import get_chunks_for_feature
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def generate_summary(
    text: str | None = None,
    prompt_suffix: str = "Provide a comprehensive and detailed summary.",
    stored_chunks: list[str] | None = None,
    normalized_text: str | None = None,
) -> str:
    """
    Generate summary using Groq API (fast and free).

    Args:
        text: Positional fallback for raw text content.
        prompt_suffix: Summary style instruction.
        stored_chunks: Pre-computed chunks list from MongoDB content document.
        normalized_text: Raw text string fallback.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")

    client = Groq(api_key=api_key)

    # Resolve input source
    content_text = text or normalized_text or ""
    if stored_chunks and isinstance(stored_chunks, list) and len(stored_chunks) > 0:
        chunks = stored_chunks
    elif content_text:
        chunks = get_chunks_for_feature(content_text, "summary")
    else:
        raise ValueError("No content provided for summary generation.")

    # Determine instructions based on type
    suffix_lower = prompt_suffix.lower()
    if "brief" in suffix_lower or "short" in suffix_lower:
        instruction = "Output only the summary text with no preamble or meta-commentary. Write 3-5 concise sentences covering the key points."
    elif "detailed" in suffix_lower:
        instruction = "Output only the summary text with no preamble or meta-commentary. Cover all key points in clear paragraphs."
    elif "exam" in suffix_lower:
        instruction = "Output only the summary text with no preamble or meta-commentary. Focus on exam-relevant concepts, definitions, and formulas."
    elif "revision" in suffix_lower:
        instruction = "Output only the summary text with no preamble or meta-commentary. Use bullet points listing the key facts."
    else:
        instruction = "Output only the summary text with no preamble or meta-commentary. Cover the key points clearly."

    system_msg = (
        "You are a concise educational summarizer. "
        "Never start your response with phrases like 'Here is', 'Here are', 'This is a summary', "
        "or any other preamble. Output only the summary content directly."
    )

    # Summarize top chunks
    chunk_summaries: list[str] = []
    for chunk in chunks[:4]:  # process up to 4 relevant chunks
        prompt = f"{instruction}\n\nContent:\n{chunk}"
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=350,
            )
            res_text = response.choices[0].message.content
            if res_text and res_text.strip():
                chunk_summaries.append(res_text.strip())
        except Exception as exc:
            print(f"[SUMMARY] Chunk error: {exc}")
            continue

    if chunk_summaries:
        return "\n\n".join(chunk_summaries)

    # Direct fallback if chunk loop yields nothing
    fallback_text = content_text[:3000] if content_text else " ".join(chunks[:3])
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": f"{instruction}\n\nContent:\n{fallback_text}"},
        ],
        temperature=0.3,
        max_tokens=400,
    )
    return response.choices[0].message.content.strip()
