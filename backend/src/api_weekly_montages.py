"""
API endpoints for weekly montages
"""
from fastapi import APIRouter, Depends, HTTPException, Body, Form
from sqlmodel import select, func, or_
from typing import List, Optional
from datetime import datetime, timedelta
from db import get_session
from models import WeeklyMontage, Render, Job
from auth import get_current_user, get_current_admin_user
from tasks import compile_weekly_montage
from models import User
import json

router = APIRouter(prefix="/v2/weekly-montages", tags=["weekly-montages"])


@router.get("")
def list_weekly_montages(
    limit: int = 10,
    featured_only: bool = False,
):
    """
    List weekly montages, optionally filtered to featured only.
    """
    with get_session() as session:
        query = select(WeeklyMontage)
        
        if featured_only:
            query = query.where(WeeklyMontage.is_featured == True)
        
        montages = session.exec(
            query.order_by(WeeklyMontage.week_start.desc()).limit(limit)
        ).all()
        
        result = []
        for m in montages:
            # Get render URLs if job completed
            render_paths = {}
            if m.job_id:
                renders = session.exec(
                    select(Render).where(Render.job_id == m.job_id)
                ).all()
                for r in renders:
                    render_paths[r.format] = r.output_path
            
            result.append({
                "id": m.id,
                "week_start": m.week_start.isoformat(),
                "title": m.title,
                "clip_count": m.clip_count,
                "total_duration": m.total_duration,
                "is_featured": m.is_featured,
                "created_at": m.created_at.isoformat(),
                "featured_user_ids": json.loads(m.featured_user_ids) if m.featured_user_ids else [],
                "renders": render_paths,
            })
        
        return {"montages": result}


@router.get("/latest")
def get_latest_montage():
    """Get the most recent weekly montage."""
    with get_session() as session:
        montage = session.exec(
            select(WeeklyMontage).order_by(WeeklyMontage.week_start.desc()).limit(1)
        ).first()
        
        if not montage:
            raise HTTPException(status_code=404, detail="No weekly montages found")
        
        # Get renders
        render_paths = {}
        if montage.job_id:
            renders = session.exec(
                select(Render).where(Render.job_id == montage.job_id)
            ).all()
            for r in renders:
                render_paths[r.format] = r.output_path
        
        return {
            "id": montage.id,
            "week_start": montage.week_start.isoformat(),
            "title": montage.title,
            "clip_count": montage.clip_count,
            "total_duration": montage.total_duration,
            "is_featured": montage.is_featured,
            "created_at": montage.created_at.isoformat(),
            "featured_user_ids": json.loads(montage.featured_user_ids) if montage.featured_user_ids else [],
            "renders": render_paths,
        }


@router.get("/{montage_id}")
def get_montage(montage_id: int):
    """Get specific weekly montage by ID."""
    with get_session() as session:
        montage = session.exec(
            select(WeeklyMontage).where(WeeklyMontage.id == montage_id)
        ).first()
        
        if not montage:
            raise HTTPException(status_code=404, detail="Montage not found")
        
        # Get renders
        render_paths = {}
        if montage.job_id:
            renders = session.exec(
                select(Render).where(Render.job_id == montage.job_id)
            ).all()
            for r in renders:
                render_paths[r.format] = r.output_path
        
        return {
            "id": montage.id,
            "week_start": montage.week_start.isoformat(),
            "title": montage.title,
            "clip_count": montage.clip_count,
            "total_duration": montage.total_duration,
            "is_featured": montage.is_featured,
            "created_at": montage.created_at.isoformat(),
            "featured_user_ids": json.loads(montage.featured_user_ids) if montage.featured_user_ids else [],
            "renders": render_paths,
        }


@router.post("/compile")
async def trigger_compilation(
    current_user: User = Depends(get_current_admin_user),
):
    """
    Manually trigger weekly montage compilation (admin only).
    """
    try:
        result = compile_weekly_montage.delay()
        return {
            "message": "Weekly montage compilation started",
            "task_id": result.id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start compilation: {str(e)}")


@router.patch("/{montage_id}/feature")
async def toggle_feature(
    montage_id: int,
    is_featured: bool = Body(...),
    current_user: User = Depends(get_current_admin_user),
):
    """Feature or unfeature a weekly montage (admin only)."""
    with get_session() as session:
        montage = session.exec(
            select(WeeklyMontage).where(WeeklyMontage.id == montage_id)
        ).first()
        
        if not montage:
            raise HTTPException(status_code=404, detail="Montage not found")
        
        montage.is_featured = is_featured
        session.add(montage)
        session.commit()
        
        return {
            "id": montage.id,
            "is_featured": montage.is_featured,
        }


@router.patch("/{montage_id}/title")
async def update_title(
    montage_id: int,
    title: str = Form(...),
    current_user: User = Depends(get_current_admin_user),
):
    """Update weekly montage title (admin only)."""
    with get_session() as session:
        montage = session.exec(
            select(WeeklyMontage).where(WeeklyMontage.id == montage_id)
        ).first()
        
        if not montage:
            raise HTTPException(status_code=404, detail="Montage not found")
        
        montage.title = title
        session.add(montage)
        session.commit()
        
        return {
            "id": montage.id,
            "title": montage.title,
        }

