import os
import tempfile
from uuid import uuid4

STORAGE_ROOT = os.getenv("STORAGE_ROOT", "/app/storage")
UPLOADS_DIR = os.path.join(STORAGE_ROOT, "uploads")
EXPORTS_DIR = os.path.join(STORAGE_ROOT, "exports")

# Cache for fallback directories
_fallback_uploads_dir = None
_fallback_exports_dir = None


def _get_uploads_dir():
    """Get uploads directory, with fallback to temp if needed."""
    global _fallback_uploads_dir
    if _fallback_uploads_dir:
        return _fallback_uploads_dir
    
    try:
        os.makedirs(UPLOADS_DIR, exist_ok=True)
        # Test if we can write
        test_file = os.path.join(UPLOADS_DIR, ".test_write")
        try:
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)
        except (PermissionError, OSError):
            raise
        return UPLOADS_DIR
    except (PermissionError, OSError):
        # Fallback to temp directory
        _fallback_uploads_dir = os.path.join(tempfile.gettempdir(), "cosmiv_uploads")
        os.makedirs(_fallback_uploads_dir, exist_ok=True)
        return _fallback_uploads_dir


def _get_exports_dir():
    """Get exports directory, with fallback to temp if needed."""
    global _fallback_exports_dir
    if _fallback_exports_dir:
        return _fallback_exports_dir
    
    try:
        os.makedirs(EXPORTS_DIR, exist_ok=True)
        # Test if we can write
        test_file = os.path.join(EXPORTS_DIR, ".test_write")
        try:
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)
        except (PermissionError, OSError):
            raise
        return EXPORTS_DIR
    except (PermissionError, OSError):
        # Fallback to temp directory
        _fallback_exports_dir = os.path.join(tempfile.gettempdir(), "cosmiv_exports")
        os.makedirs(_fallback_exports_dir, exist_ok=True)
        return _fallback_exports_dir


# Try to create directories at import time, but don't fail if we can't
try:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(EXPORTS_DIR, exist_ok=True)
except (PermissionError, OSError):
    # In test environments, directories may not be writable at import time
    # They'll be created on-demand with fallback to temp directory
    pass


def new_job_id() -> str:
    return uuid4().hex


def job_upload_dir(job_id: str) -> str:
    """Get or create upload directory for a job."""
    base_dir = _get_uploads_dir()
    path = os.path.join(base_dir, job_id)
    os.makedirs(path, exist_ok=True)
    return path


def job_export_dir(job_id: str) -> str:
    """Get or create export directory for a job."""
    base_dir = _get_exports_dir()
    path = os.path.join(base_dir, job_id)
    os.makedirs(path, exist_ok=True)
    return path
