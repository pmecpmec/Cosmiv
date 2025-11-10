"""
Admin API endpoints for user 'pmec' and other admins.
Requires admin authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select, func, or_
from typing import List, Optional
from datetime import datetime, timedelta
from db import get_session
from models import User, Job, JobStatus, Entitlement, Render
from auth import get_current_admin_user
from config import settings

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """List all users with pagination and search."""
    with get_session() as session:
        query = select(User)

        if search:
            query = query.where(
                or_(
                    User.username.contains(search),
                    User.email.contains(search),
                    User.user_id.contains(search),
                )
            )

        total = session.exec(select(func.count(User.id))).one()
        users = session.exec(query.offset(offset).limit(limit)).all()

        return {
            "total": total,
            "offset": offset,
            "limit": limit,
            "users": [
                {
                    "user_id": u.user_id,
                    "username": u.username,
                    "email": u.email,
                    "is_admin": u.is_admin,
                    "is_active": u.is_active,
                    "created_at": u.created_at.isoformat() if u.created_at else None,
                }
                for u in users
            ],
        }


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
):
    """Get detailed user information."""
    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get user's entitlements
        entitlements = session.exec(
            select(Entitlement).where(Entitlement.user_id == user_id)
        ).all()

        # Get user's jobs count (note: jobs don't have user_id yet, so we skip this for now)
        # TODO: Add user_id to Job model when user association is implemented
        jobs_total = 0
        jobs_success = 0

        return {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "entitlements": [
                {
                    "plan": e.plan,
                    "expires_at": e.expires_at.isoformat() if e.expires_at else None,
                }
                for e in entitlements
            ],
            "stats": {
                "total_jobs": jobs_total,
                "successful_jobs": jobs_success,
            },
        }


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    is_active: Optional[bool] = None,
    is_admin: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """Update user properties (activate/deactivate, admin status)."""
    if user_id == current_user.user_id and is_admin is False:
        raise HTTPException(
            status_code=400, detail="Cannot remove admin status from yourself"
        )

    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if is_active is not None:
            user.is_active = is_active
        if is_admin is not None:
            user.is_admin = is_admin

        session.add(user)
        session.commit()
        session.refresh(user)

        return {
            "user_id": user.user_id,
            "username": user.username,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
        }


@router.get("/queue")
async def get_queue_status(
    current_user: User = Depends(get_current_admin_user),
):
    """Get AI processing queue status."""
    with get_session() as session:
        pending = session.exec(
            select(Job)
            .where(Job.status == JobStatus.PENDING)
            .order_by(Job.created_at.desc())
            .limit(50)
        ).all()

        processing = session.exec(
            select(Job)
            .where(Job.status == JobStatus.PROCESSING)
            .order_by(Job.created_at.desc())
            .limit(50)
        ).all()

        # Get stats
        total_pending = session.exec(
            select(func.count(Job.id)).where(Job.status == JobStatus.PENDING)
        ).one()

        total_processing = session.exec(
            select(func.count(Job.id)).where(Job.status == JobStatus.PROCESSING)
        ).one()

        # Recent failures
        recent_failures = session.exec(
            select(Job)
            .where(Job.status == JobStatus.FAILED)
            .order_by(Job.created_at.desc())
            .limit(10)
        ).all()

        return {
            "pending": {
                "total": total_pending,
                "jobs": [
                    {
                        "job_id": j.job_id,
                        "created_at": j.created_at.isoformat(),
                        "target_duration": j.target_duration,
                        "progress": j.progress,
                    }
                    for j in pending
                ],
            },
            "processing": {
                "total": total_processing,
                "jobs": [
                    {
                        "job_id": j.job_id,
                        "created_at": j.created_at,
                        "target_duration": j.target_duration,
                        "progress": j.progress,
                    }
                    for j in processing
                ],
            },
            "recent_failures": [
                {
                    "job_id": j.job_id,
                    "created_at": j.created_at.isoformat(),
                    "error": j.error,
                }
                for j in recent_failures
            ],
        }


@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(get_current_admin_user),
):
    """Get platform-wide analytics."""
    with get_session() as session:
        # User stats
        total_users = session.exec(select(func.count(User.id))).one()
        active_users = session.exec(
            select(func.count(User.id)).where(User.is_active == True)
        ).one()
        admin_users = session.exec(
            select(func.count(User.id)).where(User.is_admin == True)
        ).one()

        # Job stats
        total_jobs = session.exec(select(func.count(Job.id))).one()
        success_jobs = session.exec(
            select(func.count(Job.id)).where(Job.status == JobStatus.SUCCESS)
        ).one()
        failed_jobs = session.exec(
            select(func.count(Job.id)).where(Job.status == JobStatus.FAILED)
        ).one()
        pending_jobs = session.exec(
            select(func.count(Job.id)).where(Job.status == JobStatus.PENDING)
        ).one()
        processing_jobs = session.exec(
            select(func.count(Job.id)).where(Job.status == JobStatus.PROCESSING)
        ).one()

        # Payment stats (from entitlements)
        free_users = session.exec(
            select(func.count(Entitlement.id)).where(Entitlement.plan == "free")
        ).one()
        pro_users = session.exec(
            select(func.count(Entitlement.id)).where(Entitlement.plan == "pro")
        ).one()

        # Recent activity (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_jobs = session.exec(
            select(func.count(Job.id)).where(Job.created_at >= yesterday)
        ).one()

        recent_users = session.exec(
            select(func.count(User.id)).where(User.created_at >= yesterday)
        ).one()

        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "admins": admin_users,
                "recent_24h": recent_users,
            },
            "jobs": {
                "total": total_jobs,
                "success": success_jobs,
                "failed": failed_jobs,
                "pending": pending_jobs,
                "processing": processing_jobs,
                "success_rate": (
                    (success_jobs / total_jobs * 100) if total_jobs > 0 else 0
                ),
                "recent_24h": recent_jobs,
            },
            "revenue": {
                "free_tier": free_users,
                "pro_tier": pro_users,
                "total_subscribers": free_users + pro_users,
            },
        }


@router.get("/jobs")
async def list_all_jobs(
    limit: int = Query(50, le=500),
    offset: int = Query(0),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """List all jobs (admin view)."""
    with get_session() as session:
        query = select(Job)

        if status:
            query = query.where(Job.status == status)

        total = session.exec(select(func.count(Job.id))).one()
        jobs = session.exec(
            query.order_by(Job.created_at.desc()).offset(offset).limit(limit)
        ).all()

        # Get renders for each job
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
                    "created_at": j.created_at.isoformat(),
                    "updated_at": j.updated_at.isoformat() if j.updated_at else None,
                    "error": j.error,
                    "progress": j.progress,
                    "renders": [
                        {"format": r.format, "path": r.output_path} for r in renders
                    ],
                }
            )

        return {
            "total": total,
            "offset": offset,
            "limit": limit,
            "jobs": result,
        }
