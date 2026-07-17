import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Transcription via Groq's Whisper API (cloud, free tier, no GPU required)
# Falls back to local faster-whisper only if GROQ_API_KEY is not set.
# ---------------------------------------------------------------------------

def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio using Groq Whisper API (preferred) or local faster-whisper."""

    api_key = os.getenv("GROQ_API_KEY")

    if api_key:
        return _transcribe_with_groq(audio_path, api_key)
    else:
        return _transcribe_local(audio_path)


def _transcribe_with_groq(audio_path: str, api_key: str) -> str:
    """Use Groq's hosted Whisper large-v3-turbo — fast, free-tier, no GPU needed."""
    from groq import Groq

    client = Groq(api_key=api_key)

    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3-turbo",   # Groq free tier: fast + accurate
            file=audio_file,
            response_format="text",
        )

    # Groq returns the text directly when response_format="text"
    return transcription if isinstance(transcription, str) else transcription.text


def _transcribe_local(audio_path: str) -> str:
    """Fallback: local faster-whisper (requires a beefy machine / GPU)."""
    from faster_whisper import WhisperModel

    global _local_model
    if _local_model is None:
        _local_model = WhisperModel("base", device="cpu", compute_type="int8")

    segments, _ = _local_model.transcribe(audio_path, beam_size=1)
    return " ".join(segment.text for segment in segments)


_local_model = None
