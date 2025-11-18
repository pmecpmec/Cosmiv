from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask
from media_processing import process_zip_highlight
import tempfile, os, shutil
from typing import List
from media_processing import process_clips_highlight
from fastapi.middleware.cors import CORSMiddleware
from db import init_db, get_session
from models import Job, JobStatus, Render
from storage import new_job_id, job_upload_dir, job_export_dir
from security import validate_job_id, validate_file_path
from sqlmodel import select, func
import logging

logger = logging.getLogger(__name__)
from tasks import render_job
from api_v2 import router as v2_router
from api_accounts_v2 import router as accounts_v2_router
from api_styles_v2 import router as styles_v2_router
from api_social_v2 import router as social_v2_router
from config import settings
from api_billing_v2 import router as billing_v2_router
from api_upload import router as upload_router
from api_auth import router as auth_router
from api_admin import router as admin_router
from api_weekly_montages import router as weekly_montages_router
from api_analytics import router as analytics_router
from api_ai import router as ai_router
from api_feed import router as feed_router
from api_communities import router as communities_router
from api_profiles import router as profiles_router
from api_ai_content import router as ai_content_router
from api_ai_code import router as ai_code_router
from api_ai_ux import router as ai_ux_router
from api_ai_video import router as ai_video_router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uuid
import logging

# Set up structured logging
from logging_config import setup_logging
setup_logging()

logger = logging.getLogger(__name__)

# Frontend learning router - optional dependency
try:
    from api_frontend_learning import router as frontend_learning_router
    FRONTEND_LEARNING_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Frontend learning module not available: {e}")
    frontend_learning_router = None
    FRONTEND_LEARNING_AVAILABLE = False

# Initialize Sentry for error tracking (if enabled)
if settings.SENTRY_ENABLED and settings.SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        from sentry_sdk.integrations.celery import CeleryIntegration
        
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.SENTRY_ENVIRONMENT,
            traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
                CeleryIntegration(),
            ],
            # Set release version if available
            release=os.environ.get("RELEASE_VERSION", None),
            # Don't send PII
            send_default_pii=False,
        )
        logger.info("Sentry error tracking initialized")
    except ImportError:
        logger.warning("sentry-sdk not installed, error tracking disabled")
    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")
else:
    logger.info("Sentry error tracking disabled (SENTRY_ENABLED=false or SENTRY_DSN not set)")

app = FastAPI(title="Cosmiv - AI Gaming Montage Platform")

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration (environment-based with security validation)
cors_origins_str = os.getenv("CORS_ORIGINS", settings.ALLOWED_ORIGINS)
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

# Security validation for production
if settings.ENVIRONMENT == "production":
    if any("localhost" in origin or "127.0.0.1" in origin for origin in cors_origins):
        raise ValueError(
            "Localhost origins not allowed in production CORS configuration"
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit methods only
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-CSRF-Token",
    ],  # Explicit headers only
    max_age=3600,  # Cache preflight requests for 1 hour
)


# Request ID middleware for log tracking
@app.middleware("http")
async def add_request_id(request, call_next):
    """Add unique request ID to each request for log tracking"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Store request ID in context for logging
    # This will be picked up by the JSONFormatter
    import contextvars
    request_id_var = contextvars.ContextVar('request_id', default=None)
    request_id_var.set(request_id)
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    # XSS protection
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # HSTS for production
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
    return response


# Global exception handler for consistent error responses
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from utils.errors import CosmivError, format_error_response, handle_exception

@app.exception_handler(CosmivError)
async def cosmiv_error_handler(request, exc: CosmivError):
    """Handle CosmivError exceptions with consistent format"""
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(exc)
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with consistent format"""
    from utils.errors import CosmivError
    cosmiv_error = CosmivError(
        status_code=exc.status_code,
        detail=exc.detail,
        error_code=f"HTTP_{exc.status_code}",
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(cosmiv_error)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """Handle validation errors with consistent format"""
    from utils.errors import ValidationError
    errors = exc.errors()
    first_error = errors[0] if errors else None
    
    field = first_error.get("loc", [None])[-1] if first_error else None
    message = first_error.get("msg", "Validation error") if first_error else "Validation error"
    
    validation_error = ValidationError(
        detail=message,
        field=str(field) if field else None,
    )
    return JSONResponse(
        status_code=400,
        content=format_error_response(validation_error)
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle all other exceptions"""
    cosmiv_error = handle_exception(exc)
    return JSONResponse(
        status_code=cosmiv_error.status_code,
        content=format_error_response(cosmiv_error)
    )


@app.on_event("startup")
async def on_startup():
    # Only initialize DB if not in test mode
    # Tests will set up their own database via conftest
    import os

    # Skip DB initialization during tests - conftest handles it
    if os.getenv("PYTEST_CURRENT_TEST") is None and not os.getenv("TESTING"):
        init_db()


@app.get("/health")
async def health_check():
    """Health check endpoint to verify DB, Redis, storage, and Celery connectivity"""
    import redis
    from config import settings
    from services.storage_adapters import get_storage
    import time

    health = {"status": "healthy", "checks": {}, "timestamp": time.time()}

    # Check database
    try:
        with get_session() as session:
            start_time = time.time()
            session.exec(select(func.count(Job.id)))
            db_time = (time.time() - start_time) * 1000  # Convert to ms
            health["checks"]["database"] = {"status": "ok", "response_time_ms": round(db_time, 2)}
    except Exception as e:
        health["checks"]["database"] = {"status": "error", "error": str(e)}
        health["status"] = "degraded"

    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL)
        start_time = time.time()
        r.ping()
        redis_time = (time.time() - start_time) * 1000
        health["checks"]["redis"] = {"status": "ok", "response_time_ms": round(redis_time, 2)}
    except Exception as e:
        health["checks"]["redis"] = {"status": "error", "error": str(e)}
        health["status"] = "degraded"

    # Check storage
    try:
        storage = get_storage()
        # Try to list (may fail if not configured, that's ok)
        health["checks"]["storage"] = {"status": "ok"}
    except Exception as e:
        health["checks"]["storage"] = {"status": "warning", "error": str(e)}

    # Check Celery worker (via Redis inspection)
    try:
        r = redis.from_url(settings.REDIS_URL)
        # Check Celery worker registry - workers register themselves with keys like "celery@hostname"
        worker_keys = r.keys("celery@*")
        if worker_keys:
            health["checks"]["celery"] = {
                "status": "ok",
                "workers_detected": len(worker_keys),
                "workers": [key.decode() if isinstance(key, bytes) else str(key) for key in worker_keys[:5]]  # Show first 5
            }
        else:
            # Also check for active tasks as fallback
            active_tasks = r.keys("celery-task-meta-*")
            if active_tasks:
                health["checks"]["celery"] = {"status": "ok", "workers_detected": True, "note": "Detected via active tasks"}
            else:
                health["checks"]["celery"] = {"status": "warning", "message": "No active workers detected"}
    except Exception as e:
        health["checks"]["celery"] = {"status": "warning", "error": str(e)}

    return health


# Existing endpoints
@app.post("/upload")
async def upload_zip(file: UploadFile = File(...), target_duration: int = Form(60)):
    workdir = tempfile.mkdtemp()
    try:
        zip_path = os.path.join(workdir, file.filename)
        with open(zip_path, "wb") as f:
            f.write(await file.read())
        highlight_path = process_zip_highlight(zip_path, target_duration, workdir)
        return FileResponse(
            highlight_path,
            filename="highlight.mp4",
            media_type="video/mp4",
            background=BackgroundTask(shutil.rmtree, workdir, True),
        )
    except Exception as e:
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Upload error: {safe_error}")
        shutil.rmtree(workdir, ignore_errors=True)
        return JSONResponse({"error": "Internal server error"}, status_code=500)


@app.post("/upload-clips")
async def upload_clips(
    files: List[UploadFile] = File(...), target_duration: int = Form(60)
):
    workdir = tempfile.mkdtemp()
    try:
        saved_paths: List[str] = []
        os.makedirs(workdir, exist_ok=True)
        for uf in files:
            dst = os.path.join(workdir, uf.filename)
            with open(dst, "wb") as f:
                f.write(await uf.read())
            saved_paths.append(dst)

        highlight_path = process_clips_highlight(saved_paths, target_duration, workdir)
        return FileResponse(
            highlight_path,
            filename="highlight.mp4",
            media_type="video/mp4",
            background=BackgroundTask(shutil.rmtree, workdir, True),
        )
    except Exception as e:
        from security import sanitize_log_message
        safe_error = sanitize_log_message(str(e))
        logger.error(f"Upload error: {safe_error}")
        shutil.rmtree(workdir, ignore_errors=True)
        return JSONResponse({"error": "Internal server error"}, status_code=500)


# Job endpoints
@app.post("/jobs")
async def create_job(
    files: List[UploadFile] = File(...), target_duration: int = Form(60)
):
    jid = new_job_id()
    uploads_dir = job_upload_dir(jid)

    for uf in files:
        dst = os.path.join(uploads_dir, uf.filename)
        with open(dst, "wb") as f:
            f.write(await uf.read())

    with get_session() as session:
        job = Job(job_id=jid, status=JobStatus.PENDING, target_duration=target_duration)
        session.add(job)
        session.commit()

    render_job.delay(jid, target_duration)

    return {
        "job_id": jid,
        "status": JobStatus.PENDING,
        "stage": job.stage,
        "progress": job.progress,
    }


@app.get("/jobs/{job_id}/status")
def job_status(job_id: str):
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            return JSONResponse({"error": "job not found"}, status_code=404)
        return {
            "job_id": job.job_id,
            "status": job.status,
            "error": job.error,
            "stage": job.stage,
            "progress": job.progress,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "finished_at": job.finished_at.isoformat() if job.finished_at else None,
            "updated_at": job.updated_at.isoformat() if job.updated_at else None,
        }


@app.get("/jobs/{job_id}/download")
def job_download(job_id: str, format: str = "landscape"):
    # Validate job_id to prevent path traversal
    validate_job_id(job_id)
    
    export_dir = job_export_dir(job_id)
    # For MVP we have a single file named final_highlight.mp4
    path = os.path.join(export_dir, "final_highlight.mp4")
    
    # Validate path is within export directory
    try:
        path = validate_file_path(path, export_dir)
    except ValueError:
        return JSONResponse({"error": "file not ready"}, status_code=404)
    
    if not os.path.exists(path):
        return JSONResponse({"error": "file not ready"}, status_code=404)
    return FileResponse(path, filename="highlight.mp4", media_type="video/mp4")


@app.get("/analytics/summary")
def analytics_summary():
    with get_session() as session:
        total = session.exec(select(func.count()).select_from(Job)).one()
        success = session.exec(
            select(func.count()).select_from(Job).where(Job.status == JobStatus.SUCCESS)
        ).one()
        failed = session.exec(
            select(func.count()).select_from(Job).where(Job.status == JobStatus.FAILED)
        ).one()
        return {
            "total_jobs": total,
            "success_jobs": success,
            "failed_jobs": failed,
        }


app.include_router(v2_router)
app.include_router(accounts_v2_router)
app.include_router(styles_v2_router)
app.include_router(social_v2_router)
app.include_router(billing_v2_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(weekly_montages_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(feed_router)
app.include_router(communities_router)
app.include_router(profiles_router)
app.include_router(ai_content_router)
app.include_router(ai_code_router)
app.include_router(ai_ux_router)
app.include_router(ai_video_router)
if FRONTEND_LEARNING_AVAILABLE and frontend_learning_router:
    app.include_router(frontend_learning_router)

# Initialize rate limiter for auth router
from auth import set_limiter
set_limiter(limiter)
