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
from sqlmodel import select, func
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

app = FastAPI(title="Cosmiv - AI Gaming Montage Platform")

# CORS configuration (environment-based with security validation)
cors_origins_str = os.getenv("CORS_ORIGINS", settings.ALLOWED_ORIGINS)
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

# Security validation for production
if settings.ENVIRONMENT == "production":
    if any("localhost" in origin or "127.0.0.1" in origin for origin in cors_origins):
        raise ValueError("Localhost origins not allowed in production CORS configuration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit methods only
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],  # Explicit headers only
    max_age=3600,  # Cache preflight requests for 1 hour
)


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
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
async def health_check():
    """Health check endpoint to verify DB, Redis, and storage connectivity"""
    import redis
    from config import settings
    from services.storage_adapters import get_storage

    health = {"status": "healthy", "checks": {}}

    # Check database
    try:
        with get_session() as session:
            session.exec(select(func.count(Job.id)))
        health["checks"]["database"] = "ok"
    except Exception as e:
        health["checks"]["database"] = f"error: {str(e)}"
        health["status"] = "degraded"

    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        health["checks"]["redis"] = "ok"
    except Exception as e:
        health["checks"]["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"

    # Check storage
    try:
        storage = get_storage()
        # Try to list (may fail if not configured, that's ok)
        health["checks"]["storage"] = "ok"
    except Exception as e:
        health["checks"]["storage"] = f"warning: {str(e)}"

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
        shutil.rmtree(workdir, ignore_errors=True)
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/upload-clips")
async def upload_clips(files: List[UploadFile] = File(...), target_duration: int = Form(60)):
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
        shutil.rmtree(workdir, ignore_errors=True)
        return JSONResponse({"error": str(e)}, status_code=500)


# Job endpoints
@app.post("/jobs")
async def create_job(files: List[UploadFile] = File(...), target_duration: int = Form(60)):
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

    return {"job_id": jid, "status": JobStatus.PENDING, "stage": job.stage, "progress": job.progress}


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
    export_dir = job_export_dir(job_id)
    # For MVP we have a single file named final_highlight.mp4
    path = os.path.join(export_dir, "final_highlight.mp4")
    if not os.path.exists(path):
        return JSONResponse({"error": "file not ready"}, status_code=404)
    return FileResponse(path, filename="highlight.mp4", media_type="video/mp4")


@app.get("/analytics/summary")
def analytics_summary():
    with get_session() as session:
        total = session.exec(select(func.count()).select_from(Job)).one()
        success = session.exec(select(func.count()).select_from(Job).where(Job.status == JobStatus.SUCCESS)).one()
        failed = session.exec(select(func.count()).select_from(Job).where(Job.status == JobStatus.FAILED)).one()
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
