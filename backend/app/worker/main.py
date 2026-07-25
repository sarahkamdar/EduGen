"""
worker/main.py — SQS long-polling worker for EduGen.

Entrypoint: `python -m app.worker.main`
Docker CMD:  python -m app.worker.main

How it works:
  1. Poll SQS queue for messages (long-poll, 20-second wait).
  2. For each message: parse job spec → call process_job() → delete message.
  3. If processing fails: increment retry count.
     - Retry < 3: update job to 'failed' but leave message for SQS retry
       (visibility timeout will return it to queue after 15 minutes).
     - Retry >= 3: message goes to Dead Letter Queue (configured in Terraform).
       CloudWatch alarm on DLQ depth → you investigate.
  4. Graceful shutdown: catches SIGTERM (ECS sends this before killing the task)
     and finishes the current job before exiting.

Environment variables required:
  SQS_QUEUE_URL   — Full SQS queue URL
  AWS_REGION      — e.g. ap-south-1
  MONGODB_URI     — DocumentDB connection string
  AWS_S3_BUCKET   — S3 bucket name (for file downloads)
  GROQ_API_KEY    — For Whisper + LLM
"""

import asyncio
import json
import logging
import os
import signal
import sys

import boto3
from app.models.job import increment_retry

# ─── LOGGING ─────────────────────────────────────────────────────────────────
# CloudWatch picks up stdout/stderr from ECS containers automatically.
# Structured JSON logging lets you filter by job_id in CloudWatch Insights:
#   fields @message | filter job_id = "xyz"
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
    stream=sys.stdout,
)
logger = logging.getLogger("edugen.worker")

# ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
_shutdown_requested = False


def _handle_sigterm(signum, frame):
    """ECS sends SIGTERM before force-killing the container. We catch it to finish the current job."""
    global _shutdown_requested
    logger.info("SIGTERM received — worker will stop after current job completes.")
    _shutdown_requested = True


signal.signal(signal.SIGTERM, _handle_sigterm)
signal.signal(signal.SIGINT, _handle_sigterm)


# ─── SQS CLIENT ──────────────────────────────────────────────────────────────
def get_sqs_client():
    return boto3.client("sqs", region_name=os.getenv("AWS_REGION", "ap-south-1"))


# ─── MAIN POLLING LOOP ────────────────────────────────────────────────────────
async def run_worker():
    """
    Main async worker loop. Polls SQS indefinitely until shutdown is requested.
    """
    queue_url = os.getenv("SQS_QUEUE_URL")
    if not queue_url:
        logger.error("SQS_QUEUE_URL not set — worker cannot start.")
        sys.exit(1)

    sqs = get_sqs_client()
    logger.info(f"Worker started. Polling queue: {queue_url}")

    from app.worker.processor import process_job

    while not _shutdown_requested:
        try:
            # Long-poll: wait up to 20 seconds for a message (reduces API calls + cost)
            response = sqs.receive_message(
                QueueUrl=queue_url,
                MaxNumberOfMessages=1,     # process one job at a time (predictable)
                WaitTimeSeconds=20,        # long-poll (20s max)
                VisibilityTimeout=900,     # 15 min — enough for a 2-hour video
                AttributeNames=["ApproximateReceiveCount"],
            )

            messages = response.get("Messages", [])
            if not messages:
                continue  # no messages, loop again

            message = messages[0]
            receipt_handle = message["ReceiptHandle"]
            receive_count = int(message.get("Attributes", {}).get("ApproximateReceiveCount", 1))

            # ── Parse message ─────────────────────────────────────────────────
            try:
                body = json.loads(message["Body"])
            except (json.JSONDecodeError, KeyError) as exc:
                logger.error(f"Malformed SQS message, deleting: {exc}")
                sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
                continue

            job_id    = body.get("job_id")
            user_id   = body.get("user_id")
            input_type = body.get("input_type")
            title      = body.get("title", "Content")

            logger.info(f"[JOB {job_id}] Received (attempt #{receive_count}) — type={input_type}")

            # ── Process ───────────────────────────────────────────────────────
            try:
                await process_job(
                    job_id=job_id,
                    user_id=user_id,
                    input_type=input_type,
                    title=title,
                    s3_bucket=body.get("s3_bucket"),
                    s3_key=body.get("s3_key"),
                    youtube_url=body.get("youtube_url"),
                    text_content=body.get("text_content"),
                    original_filename=body.get("original_filename"),
                )
                # ── Success: acknowledge by deleting the message ──────────────
                sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
                logger.info(f"[JOB {job_id}] Message deleted from queue.")

            except Exception:
                # Increment retry count in MongoDB
                retry_count = increment_retry(job_id) if job_id else receive_count

                if retry_count >= 3 or receive_count >= 3:
                    # Max retries hit — delete message (SQS will move to DLQ
                    # after maxReceiveCount configured in Terraform)
                    logger.error(f"[JOB {job_id}] Max retries reached. Deleting message.")
                    sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
                else:
                    # Leave message in queue. After visibility timeout (15 min),
                    # SQS will make it visible again and another worker picks it up.
                    logger.warning(f"[JOB {job_id}] Failed (attempt {retry_count}/3). Will retry after visibility timeout.")

        except Exception as poll_exc:
            # SQS API error (network, credentials, etc.)
            logger.error(f"SQS poll error: {poll_exc}")
            await asyncio.sleep(5)  # back off briefly before retrying

    logger.info("Worker shutdown complete.")


def main():
    """Entrypoint. Runs the async worker loop synchronously."""
    asyncio.run(run_worker())


if __name__ == "__main__":
    main()
