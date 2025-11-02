from fastapi import APIRouter, UploadFile, File, Form, Query, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from storage import job_upload_dir, job_export_dir
from models import Job, JobStatus, Render, User
from db import get_session
from sqlmodel import select
from tasks import render_job
from services.storage_adapters import get_storage
from auth import get_current_user
import os
from config import settings

router = APIRouter(prefix="/v2")

@router.post("/jobs")
async def create_job_v2(
    files: List[UploadFile] = File(...),
    target_duration: int = Form(60),
    style: Optional[str] = Form(None),
    formats: Optional[str] = Form("landscape,portrait"),
    hud_remove: Optional[bool] = Form(False),
    watermark: Optional[bool] = Form(True),
    current_user: Optional[User] = Depends(get_current_user),
):
    from storage import new_job_id
    jid = new_job_id()
    uploads_dir = job_upload_dir(jid)

    for uf in files:
        dst = f"{uploads_dir}/{uf.filename}"
        with open(dst, "wb") as f:
            f.write(await uf.read())

    if target_duration > settings.FREEMIUM_MAX_DURATION:
        return JSONResponse({"error": f"Max duration {settings.FREEMIUM_MAX_DURATION}s on free tier"}, status_code=400)

    user_id = current_user.user_id if current_user else None
    
    with get_session() as session:
        job = Job(
            job_id=jid,
            status=JobStatus.PENDING,
            target_duration=target_duration,
            user_id=user_id,
            style_id=style,
        )
        session.add(job)
        session.commit()

    render_job.delay(jid, target_duration)

    return {
        "job_id": jid,
        "status": JobStatus.PENDING,
        "stage": job.stage,
        "progress": job.progress,
    }

@router.get("/jobs")
def list_jobs(limit: int = 20):
    with get_session() as session:
        jobs = session.exec(select(Job).order_by(Job.id.desc()).limit(limit)).all()
        result = []
        for j in jobs:
            renders = session.exec(select(Render).where(Render.job_id == j.job_id)).all()
            result.append({
                "job_id": j.job_id,
                "status": j.status,
                "target_duration": j.target_duration,
                "stage": j.stage,
                "progress": j.progress,
                "started_at": j.started_at.isoformat() if j.started_at else None,
                "finished_at": j.finished_at.isoformat() if j.finished_at else None,
                "renders": [{"format": r.format, "path": r.output_path} for r in renders],
            })
        return {"jobs": result}

@router.get("/jobs/{job_id}/status")
def job_status_v2(job_id: str):
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            return JSONResponse({"error": "job not found"}, status_code=404)
        
        result = {
            "job_id": job.job_id,
            "status": job.status,
            "error": job.error,
            "stage": job.stage,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "finished_at": job.finished_at.isoformat() if job.finished_at else None,
            "updated_at": job.updated_at.isoformat() if job.updated_at else None,
        }
        
        # Include progress if available
        if job.progress:
            try:
                import json
                result["progress"] = json.loads(job.progress)
            except Exception:
                pass
        
        # Include error details if available
        if job.error_detail:
            try:
                import json
                result["error_detail"] = json.loads(job.error_detail)
            except Exception:
                pass
        
        return result

@router.get("/jobs/{job_id}/download")
def job_download_v2(job_id: str, format: str = Query("landscape", enum=["landscape","portrait"])):
    storage = get_storage()
    export_dir = job_export_dir(job_id)
    local_path = os.path.join(export_dir, f"final_{format}.mp4")
    if not os.path.exists(local_path):
        return JSONResponse({"error": "file not ready"}, status_code=404)

    # If object storage was used, attempt to construct public URL; else return file path
    try:
        return {"url": storage.public_url(f"exports/{job_id}/final_{format}.mp4")}
    except Exception:
        return {"path": local_path}
