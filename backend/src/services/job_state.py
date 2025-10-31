from datetime import datetime
from typing import Optional

from sqlmodel import select

from db import get_session
from models import Job


def update_job_state(
    job_id: str,
    *,
    status: Optional[str] = None,
    stage: Optional[str] = None,
    progress: Optional[int] = None,
    error: Optional[str] = None,
    mark_started: bool = False,
    mark_finished: bool = False,
) -> None:
    """Update persisted job metadata with defensive checks."""
    now = datetime.utcnow()
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            return

        if status:
            job.status = status
        if stage is not None:
            job.stage = stage
        if progress is not None:
            job.progress = max(0, min(int(progress), 100))
        if error is not None:
            job.error = error
            job.last_error_at = now
        if mark_started and job.started_at is None:
            job.started_at = now
        if mark_finished:
            job.finished_at = now
        job.updated_at = now

        session.add(job)
        session.commit()


def get_job_progress(job_id: str) -> Optional[dict]:
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            return None
        return {
            "stage": job.stage,
            "progress": job.progress,
            "status": job.status,
        }
