"""
worker/processor.py — Core processing logic called by the SQS worker.

This module is completely independent of the FastAPI HTTP layer.
It receives a job spec (job_id + input source), runs the full processing
pipeline, and updates the job document in MongoDB throughout.

The worker polls SQS → receives a message → calls process_job() → deletes message.
"""

import logging
import os

from app.models.content import ContentCreate, create_content
from app.models.job import (
    STATUS_COMPLETE,
    STATUS_FAILED,
    STATUS_PROCESSING,
    update_job_status,
)
from app.services.content_metadata import build_content_chunk_data

logger = logging.getLogger(__name__)


async def process_job(
    job_id: str,
    user_id: str,
    input_type: str,
    title: str,
    # Exactly one of these will be non-None:
    s3_bucket: str | None = None,
    s3_key: str | None = None,       # file uploaded to S3
    youtube_url: str | None = None,  # YouTube link
    text_content: str | None = None, # raw text (short content)
    original_filename: str | None = None,
) -> str:
    """
    Process a content job and save the result to MongoDB.
    Called by the SQS worker for each message it receives.

    Returns the content_id of the newly created content document.
    """
    try:
        update_job_status(job_id, STATUS_PROCESSING, 5, "Starting processing...")

        # ── File: download from S3 to temp, then process ─────────────────────
        if s3_key and s3_bucket:
            from pathlib import Path

            from app.utils.s3 import delete_file_from_s3, download_file_from_s3

            temp_dir = Path("temp")
            temp_dir.mkdir(exist_ok=True)
            local_path = str(temp_dir / f"{job_id}_{original_filename or 'upload'}")

            update_job_status(job_id, STATUS_PROCESSING, 15, "Downloading file from S3...")
            download_file_from_s3(s3_bucket, s3_key, local_path)

            if input_type == "video":
                update_job_status(job_id, STATUS_PROCESSING, 30, "Extracting audio from video...")
                from app.services.audio_extractor import (
                    MAX_WHISPER_BYTES,
                    extract_audio,
                    extract_audio_chunked,
                )
                audio_path = extract_audio(local_path)

                update_job_status(job_id, STATUS_PROCESSING, 55, "Transcribing audio with Groq Whisper...")
                from app.services.transcription import transcribe_audio

                if os.path.getsize(audio_path) > MAX_WHISPER_BYTES:
                    # Long video: split into chunks and transcribe each
                    chunk_paths = extract_audio_chunked(local_path)
                    transcripts = []
                    for chunk_path in chunk_paths:
                        t = transcribe_audio(chunk_path)
                        transcripts.append(t)
                        try:
                            os.remove(chunk_path)
                        except OSError:
                            pass
                    normalized_text = " ".join(transcripts)
                else:
                    normalized_text = transcribe_audio(audio_path)

                try:
                    os.remove(audio_path)
                except OSError:
                    pass

            elif input_type == "pdf":
                update_job_status(job_id, STATUS_PROCESSING, 40, "Extracting text from PDF...")
                from pypdf import PdfReader
                reader = PdfReader(local_path)
                pages_text = []
                for page in reader.pages:
                    t = page.extract_text()
                    if t:
                        pages_text.append(t)
                normalized_text = "\n".join(pages_text)
                if not normalized_text.strip():
                    raise ValueError("No readable text found in PDF. It may be scanned or image-based.")

            elif input_type == "word":
                update_job_status(job_id, STATUS_PROCESSING, 40, "Extracting text from document...")
                from docx import Document
                doc = Document(local_path)
                normalized_text = "\n".join(p.text for p in doc.paragraphs if p.text)

            else:
                raise ValueError(f"Unsupported file input_type: {input_type}")

            # Cleanup local temp file
            try:
                os.remove(local_path)
            except OSError:
                pass

            # Delete S3 temp object (we don't need it anymore)
            delete_file_from_s3(s3_bucket, s3_key)
            logger.info(f"[JOB {job_id}] Deleted S3 temp object {s3_key}")

        # ── YouTube: transcript API → fallback to yt-dlp + Whisper ──────────
        elif youtube_url:
            update_job_status(job_id, STATUS_PROCESSING, 20, "Fetching YouTube transcript...")
            from app.services.content_processor import normalize_youtube

            # normalize_youtube is async and uses progress callbacks; we call it
            # here directly. Worker is already in an async context.
            normalized_text = await normalize_youtube(youtube_url)

        # ── Plain text ────────────────────────────────────────────────────────
        elif text_content:
            update_job_status(job_id, STATUS_PROCESSING, 40, "Processing text content...")
            normalized_text = text_content.strip()
            if not normalized_text:
                raise ValueError("Text content is empty.")

        else:
            raise ValueError("No valid input source provided to worker.")

        # ── Compute chunks + save to MongoDB ──────────────────────────────────
        update_job_status(job_id, STATUS_PROCESSING, 85, "Computing content chunks...")
        chunks, chunk_metadata = build_content_chunk_data(normalized_text)

        update_job_status(job_id, STATUS_PROCESSING, 92, "Saving content to database...")
        content_data = ContentCreate(
            user_id=user_id,
            input_type=input_type,
            normalized_text=normalized_text,
            title=title,
            chunks=chunks,
            chunk_metadata=chunk_metadata,
        )
        content_id = create_content(content_data)

        update_job_status(
            job_id, STATUS_COMPLETE, 100,
            "Content processed successfully.",
            content_id=content_id,
        )
        logger.info(f"[JOB {job_id}] Complete. content_id={content_id}")
        return content_id

    except Exception as exc:
        logger.error(f"[JOB {job_id}] Failed: {exc}", exc_info=True)
        update_job_status(
            job_id, STATUS_FAILED, 0,
            f"Processing failed: {exc!s}",
            error_message=str(exc),
        )
        raise
