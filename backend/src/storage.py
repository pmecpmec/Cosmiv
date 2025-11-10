import os
from uuid import uuid4

STORAGE_ROOT = os.getenv("STORAGE_ROOT", "/app/storage")
UPLOADS_DIR = os.path.join(STORAGE_ROOT, "uploads")
EXPORTS_DIR = os.path.join(STORAGE_ROOT, "exports")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)


def new_job_id() -> str:
    return uuid4().hex


def job_upload_dir(job_id: str) -> str:
    path = os.path.join(UPLOADS_DIR, job_id)
    os.makedirs(path, exist_ok=True)
    return path


def job_export_dir(job_id: str) -> str:
    path = os.path.join(EXPORTS_DIR, job_id)
    os.makedirs(path, exist_ok=True)
    return path
