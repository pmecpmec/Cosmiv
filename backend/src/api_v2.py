from fastapi import APIRouter, UploadFile, File, Form, Query, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from storage import job_upload_dir, job_export_dir
from models import Job, JobStatus, Render, User
from db import get_session
from sqlmodel import select
from tasks import render_job
from services.storage_adapters import get_storage
from auth import get_current_user
from security import validate_video_file, MAX_FILE_SIZE, MAX_TOTAL_UPLOAD_SIZE, sanitize_filename, validate_job_id
import os
from config import settings

router = APIRouter(prefix="/api/v2")


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
    os.makedirs(uploads_dir, exist_ok=True)

    # Validate all files before processing
    total_size = 0
    for uf in files:
        if not uf.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All files must include a filename"
            )
        
        # Validate file type
        try:
            validate_video_file(uf.filename, uf.content_type)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file: {str(e)}"
            )
        
        # Sanitize filename
        try:
            safe_filename = sanitize_filename(uf.filename)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid filename: {str(e)}"
            )
        
        # Check file size (read in chunks to avoid loading entire file into memory)
        file_size = 0
        await uf.seek(0)
        chunk_size = 1024 * 1024  # 1MB chunks
        while True:
            chunk = await uf.read(chunk_size)
            if not chunk:
                break
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                max_mb = MAX_FILE_SIZE // (1024 * 1024)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File '{uf.filename}' exceeds maximum allowed size of {max_mb}MB"
                )
        
        total_size += file_size
        if total_size > MAX_TOTAL_UPLOAD_SIZE:
            max_gb = MAX_TOTAL_UPLOAD_SIZE // (1024 * 1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Total upload size exceeds maximum allowed size of {max_gb}GB"
            )
        
        # Reset file pointer and save
        await uf.seek(0)
        dst = os.path.join(uploads_dir, safe_filename)
        with open(dst, "wb") as f:
            while True:
                chunk = await uf.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)

    if target_duration > settings.FREEMIUM_MAX_DURATION:
        return JSONResponse(
            {"error": f"Max duration {settings.FREEMIUM_MAX_DURATION}s on free tier"},
            status_code=400,
        )

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
def list_jobs(
    limit: int = 20, current_user: Optional[User] = Depends(get_current_user)
):
    with get_session() as session:
        jobs = session.exec(select(Job).order_by(Job.id.desc()).limit(limit)).all()
        result = []
        for j in jobs:
            renders = session.exec(
                select(Render).where(Render.job_id == j.job_id)
            ).all()
            result.append(
                {
                    "job_id": j.job_id,
                    "status": j.status,
                    "target_duration": j.target_duration,
                    "stage": j.stage,
                    "progress": j.progress,
                    "started_at": j.started_at.isoformat() if j.started_at else None,
                    "finished_at": j.finished_at.isoformat() if j.finished_at else None,
                    "renders": [
                        {"format": r.format, "path": r.output_path} for r in renders
                    ],
                }
            )
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
def job_download_v2(
    job_id: str, format: str = Query("landscape", enum=["landscape", "portrait"])
):
    from fastapi.responses import FileResponse
    
    # Validate job_id to prevent path traversal
    validate_job_id(job_id)
    
    # Format is already validated by Query enum, but sanitize filename anyway
    safe_format = sanitize_filename(f"highlight_{format}.mp4").replace(".mp4", "") if format else "landscape"
    if safe_format not in ["landscape", "portrait"]:
        safe_format = "landscape"
    
    export_dir = job_export_dir(job_id)
    local_path = os.path.join(export_dir, f"final_{safe_format}.mp4")
    
    # Validate path is within export directory (double-check)
    from security import validate_file_path
    try:
        local_path = validate_file_path(local_path, export_dir)
    except ValueError:
        return JSONResponse({"error": "file not ready"}, status_code=404)
    
    # Also check for legacy filename
    if not os.path.exists(local_path):
        legacy_path = os.path.join(export_dir, "final_highlight.mp4")
        try:
            legacy_path = validate_file_path(legacy_path, export_dir)
            if os.path.exists(legacy_path):
                local_path = legacy_path
            else:
                return JSONResponse({"error": "file not ready"}, status_code=404)
        except ValueError:
            return JSONResponse({"error": "file not ready"}, status_code=404)

    # Return file directly for download
    return FileResponse(
        local_path,
        filename=f"highlight_{safe_format}.mp4",
        media_type="video/mp4"
    )
