"""
content_metadata.py — Shared helpers for building content titles and chunk data.

These functions are used by BOTH the upload route AND the worker processor
to ensure identical behavior whether processing is synchronous or async.

IMPORTANT: This module must NOT import from app.routes.* to avoid circular imports.
The _get_youtube_title helper is defined here directly.
"""


import requests
from app.services.chunker import compute_chunks, get_chunk_metadata


def _get_youtube_title(youtube_url: str) -> str:
    """Fetch the real YouTube video title via oEmbed API (no auth required)."""
    try:
        resp = requests.get(
            "https://www.youtube.com/oembed",
            params={"url": youtube_url, "format": "json"},
            timeout=5,
        )
        if resp.status_code == 200:
            return resp.json().get("title", "YouTube Video")
    except Exception:
        pass
    return "YouTube Video"


def build_content_title(
    file_name: str | None = None,
    youtube_url: str | None = None,
    text: str | None = None,
    input_type: str = "content",
) -> str:
    """
    Generate a human-readable title for a content document.
    Priority: file name > YouTube title > text preview > generic fallback.
    """
    if file_name:
        return file_name.rsplit(".", 1)[0][:100]
    if youtube_url:
        return _get_youtube_title(youtube_url)
    if text:
        return text[:50].strip() + ("..." if len(text) > 50 else "")
    return f"{input_type.capitalize()} Content"


def build_content_chunk_data(normalized_text: str) -> tuple[list[str], dict]:
    """
    Compute canonical chunks and metadata for a piece of normalized text.
    Called once at upload/processing time. Result stored in MongoDB.

    Returns:
        (chunks, chunk_metadata) — both stored in the content document.
    """
    chunks = compute_chunks(normalized_text)
    metadata = get_chunk_metadata(chunks, normalized_text)
    return chunks, metadata
