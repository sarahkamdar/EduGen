from datetime import datetime, timedelta

from app.database.connection import get_database
from bson import ObjectId
from pydantic import BaseModel

STATUS_PENDING = "pending"
STATUS_PROCESSING = "processing"
STATUS_COMPLETE = "complete"
STATUS_FAILED = "failed"


class JobCreate(BaseModel):
    user_id: str
    input_type: str
    status: str = STATUS_PENDING
    progress: int = 0
    progress_message: str = "Queued for processing..."
    title: str | None = None
    content_id: str | None = None
    error_message: str | None = None
    retry_count: int = 0


def create_job(job_data: JobCreate) -> str:
    db = get_database()
    jobs = db.jobs

    job_doc = {
        "user_id": job_data.user_id,
        "input_type": job_data.input_type,
        "status": job_data.status,
        "progress": job_data.progress,
        "progress_message": job_data.progress_message,
        "title": job_data.title,
        "content_id": job_data.content_id,
        "error_message": job_data.error_message,
        "retry_count": job_data.retry_count,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=7),
    }

    result = jobs.insert_one(job_doc)
    return str(result.inserted_id)


def get_job_by_id(job_id: str) -> dict | None:
    db = get_database()
    jobs = db.jobs

    try:
        return jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        return None


def update_job(job_id: str, updates: dict) -> bool:
    db = get_database()
    jobs = db.jobs

    updates = {**updates, "updated_at": datetime.utcnow()}
    result = jobs.update_one({"_id": ObjectId(job_id)}, {"$set": updates})
    return result.modified_count > 0


def update_job_status(
    job_id: str,
    status: str,
    progress: int,
    progress_message: str,
    content_id: str | None = None,
    error_message: str | None = None,
) -> bool:
    updates = {
        "status": status,
        "progress": progress,
        "progress_message": progress_message,
    }

    if content_id is not None:
        updates["content_id"] = content_id
    if error_message is not None:
        updates["error_message"] = error_message

    return update_job(job_id, updates)


def increment_retry(job_id: str) -> int:
    db = get_database()
    jobs = db.jobs

    try:
        jobs.update_one(
            {"_id": ObjectId(job_id)},
            {
                "$inc": {"retry_count": 1},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )
        job = jobs.find_one({"_id": ObjectId(job_id)})
        return int(job.get("retry_count", 0)) if job else 0
    except Exception:
        return 0
