"""
chunker.py — Single source of truth for all text chunking and retrieval in EduGen.

Design (final — do not revert):
  - ONE canonical chunk size (400 chars + 50 char overlap) stored in MongoDB at upload time.
  - All features use the SAME stored chunks. Chunk size never varies per feature.
  - top_k (how many chunks each feature reads) is a CODE concern, not a storage concern.
  - Changing how many chunks quiz reads = one line change here, zero DB migrations.

What the previous design did wrong:
  - Used FEATURE_CHUNK_SIZES: different chunk sizes per feature.
  - Called chunk_text() on normalized_text at runtime for every request.
  - This means a 3000-char summary chunk is a completely different object than
    a 400-char chatbot chunk of the same text — you cannot share them.
"""

import re

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ─── CANONICAL STORAGE PARAMETERS ────────────────────────────────────────────
# Stored once per content document. Never changed without a deliberate decision.
CHUNK_SIZE = 400     # characters per chunk
CHUNK_OVERLAP = 50   # overlap between adjacent chunks

# ─── RUNTIME RETRIEVAL PARAMETERS ────────────────────────────────────────────
# How many chunks each feature reads from the pre-stored list.
# Lives in code, not in the database. Change here with zero DB impact.
TOP_K_CONFIG: dict[str, int] = {
    "chatbot":    3,
    "quiz":       6,
    "flashcards": 4,
    "summary":    8,
    "ppt":        10,
}

# Semantic hint queries for TF-IDF retrieval. chatbot uses the real user question.
RETRIEVAL_QUERIES: dict[str, str | None] = {
    "chatbot":    None,
    "quiz":       "key concepts definitions facts formulas important topics explained",
    "flashcards": "definition meaning terminology explained is called refers to means",
    "summary":    "main idea key point important concept overview introduction conclusion",
    "ppt":        "main topic section overview key points introduction conclusion chapter",
}


# ─── CHUNKING — called ONCE at upload, result stored in MongoDB ───────────────

def compute_chunks(text: str) -> list[str]:
    """
    Split text into canonical overlapping chunks.
    Called once at upload. Stored in content['chunks'] in MongoDB.
    Never called again for the same content.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks: list[str] = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) > CHUNK_SIZE and current:
            chunks.append(current.strip())
            current = current[-CHUNK_OVERLAP:].lstrip() + " " + sentence
        else:
            current += (" " + sentence) if current else sentence

    if current.strip():
        chunks.append(current.strip())

    return chunks if chunks else [text[:CHUNK_SIZE]]


def get_chunk_metadata(chunks: list[str], original_text: str) -> dict:
    """Metadata stored alongside chunks for debugging and monitoring."""
    return {
        "count":       len(chunks),
        "chunk_size":  CHUNK_SIZE,
        "overlap":     CHUNK_OVERLAP,
        "total_chars": len(original_text),
    }


# ─── RETRIEVAL — called at runtime for every feature request ─────────────────

def retrieve_top_k(chunks: list[str], query: str, top_k: int) -> list[str]:
    """
    Retrieve the top_k most relevant pre-stored chunks using TF-IDF cosine similarity.

    Args:
        chunks: Pre-stored canonical chunks loaded from MongoDB content document.
        query:  Search query — user's question (chatbot) or a semantic hint (other features).
        top_k:  Number of chunks to return.
    """
    if not chunks:
        return []

    if not query or len(chunks) <= top_k:
        return chunks[:top_k]

    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
        )
        tfidf_matrix = vectorizer.fit_transform([query] + chunks)
    except ValueError:
        return chunks[:top_k]

    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    top_indices  = np.argsort(similarities)[-top_k:][::-1]
    results      = [chunks[i] for i in top_indices if similarities[i] > 0.01]
    return results if results else chunks[:top_k]


# ─── UNIFIED ENTRY POINT ─────────────────────────────────────────────────────

def get_chunks_for_feature(
    stored_chunks: list[str],
    feature: str,
    user_query: str | None = None,
) -> list[str]:
    """
    Single entry point for all features to get relevant chunks.

    Args:
        stored_chunks: The `chunks` list from the MongoDB content document.
                       NOTE: This is a List[str], NOT a raw text string.
        feature:       One of: chatbot | quiz | flashcards | summary | ppt
        user_query:    Only for chatbot — the user's actual question.
    """
    top_k = TOP_K_CONFIG.get(feature, 5)
    query = user_query if feature == "chatbot" else RETRIEVAL_QUERIES.get(feature, "")
    return retrieve_top_k(stored_chunks, query, top_k)


# ─── LEGACY HELPER — kept only for content_metadata.py ──────────────────────

def build_rag_context(normalized_text: str, question: str, max_context_chars: int = 1500) -> str:
    """
    Legacy helper used by the old chatbot.py signature.
    Chunks text on the fly (old behaviour). Retained so old route callsites don't break.
    Will be removed once the route is updated to pass stored_chunks instead.
    """
    chunks = compute_chunks(normalized_text)
    relevant = retrieve_top_k(chunks, question, top_k=3)
    result = "\n\n".join(relevant)
    return result[:max_context_chars]
