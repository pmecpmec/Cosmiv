"""
Social media posting API endpoints
Supports TikTok, YouTube, Instagram with auto-posting capabilities
"""

from fastapi import APIRouter, Form, Depends, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime
from db import get_session
from models import SocialConnection, SocialPost, Render, Job, WeeklyMontage, User
from auth import get_current_user
from sqlmodel import select
from tasks import post_to_social_async
import json

router = APIRouter(prefix="/v2/social", tags=["social"])


@router.post("/connect")
async def connect_social_platform(
    platform: str = Form(...),
    access_token: str = Form(...),
    refresh_token: Optional[str] = Form(None),
    platform_user_id: Optional[str] = Form(None),
    platform_username: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    """
    Connect a social media platform account (OAuth callback or manual).
    """
    if platform not in ["tiktok", "youtube", "instagram"]:
        raise HTTPException(status_code=400, detail="Invalid platform")

    with get_session() as session:
        # Check if connection already exists
        existing = session.exec(
            select(SocialConnection).where(
                SocialConnection.user_id == current_user.user_id,
                SocialConnection.platform == platform,
            )
        ).first()

        if existing:
            # Update existing connection
            existing.access_token = access_token
            existing.refresh_token = refresh_token
            existing.platform_user_id = platform_user_id
            existing.platform_username = platform_username
            existing.updated_at = datetime.utcnow()
            existing.is_active = True
            session.add(existing)
        else:
            # Create new connection
            connection = SocialConnection(
                user_id=current_user.user_id,
                platform=platform,
                access_token=access_token,
                refresh_token=refresh_token,
                platform_user_id=platform_user_id,
                platform_username=platform_username,
            )
            session.add(connection)

        session.commit()

        return {
            "success": True,
            "platform": platform,
            "message": "Platform connected successfully",
        }


@router.get("/connections")
async def list_connections(
    current_user: User = Depends(get_current_user),
):
    """List user's connected social media platforms."""
    with get_session() as session:
        connections = session.exec(
            select(SocialConnection).where(
                SocialConnection.user_id == current_user.user_id
            )
        ).all()

        return {
            "connections": [
                {
                    "platform": c.platform,
                    "platform_username": c.platform_username,
                    "is_active": c.is_active,
                    "auto_post": c.auto_post,
                    "auto_post_weekly": c.auto_post_weekly,
                    "connected_at": c.created_at.isoformat(),
                }
                for c in connections
            ]
        }


@router.delete("/connections/{platform}")
async def disconnect_platform(
    platform: str,
    current_user: User = Depends(get_current_user),
):
    """Disconnect a social media platform."""
    with get_session() as session:
        connection = session.exec(
            select(SocialConnection).where(
                SocialConnection.user_id == current_user.user_id,
                SocialConnection.platform == platform,
            )
        ).first()

        if not connection:
            raise HTTPException(status_code=404, detail="Connection not found")

        connection.is_active = False
        session.add(connection)
        session.commit()

        return {"success": True, "message": f"{platform} disconnected"}


@router.patch("/connections/{platform}/auto-post")
async def toggle_auto_post(
    platform: str,
    auto_post: bool = Body(...),
    current_user: User = Depends(get_current_user),
):
    """Enable/disable auto-posting for a platform."""
    with get_session() as session:
        connection = session.exec(
            select(SocialConnection).where(
                SocialConnection.user_id == current_user.user_id,
                SocialConnection.platform == platform,
            )
        ).first()

        if not connection:
            raise HTTPException(status_code=404, detail="Connection not found")

        connection.auto_post = auto_post
        session.add(connection)
        session.commit()

        return {"success": True, "auto_post": auto_post}


@router.post("/post")
async def schedule_post(
    job_id: Optional[str] = Form(None),
    weekly_montage_id: Optional[int] = Form(None),
    platform: str = Form(...),
    caption: Optional[str] = Form(None),
    format: str = Form(
        "portrait"
    ),  # portrait for TikTok/Instagram, landscape for YouTube
    scheduled_at: Optional[str] = Form(None),  # ISO datetime string
    current_user: User = Depends(get_current_user),
):
    """
    Schedule or immediately post a video to social media.

    Can post from:
    - Completed job (job_id)
    - Weekly montage (weekly_montage_id)
    """
    if not job_id and not weekly_montage_id:
        raise HTTPException(
            status_code=400, detail="Either job_id or weekly_montage_id required"
        )

    if platform not in ["tiktok", "youtube", "instagram"]:
        raise HTTPException(status_code=400, detail="Invalid platform")

    with get_session() as session:
        # Check connection exists
        connection = session.exec(
            select(SocialConnection).where(
                SocialConnection.user_id == current_user.user_id,
                SocialConnection.platform == platform,
                SocialConnection.is_active == True,
            )
        ).first()

        if not connection:
            raise HTTPException(
                status_code=400,
                detail=f"Not connected to {platform}. Connect your account first.",
            )

        # Get video path
        video_path = None

        if job_id:
            # Get render from job
            render = session.exec(
                select(Render).where(Render.job_id == job_id, Render.format == format)
            ).first()

            if not render:
                raise HTTPException(
                    status_code=404,
                    detail=f"Render not found for job {job_id} with format {format}",
                )

            video_path = render.output_path

        elif weekly_montage_id:
            # Get weekly montage render
            montage = session.exec(
                select(WeeklyMontage).where(WeeklyMontage.id == weekly_montage_id)
            ).first()

            if not montage:
                raise HTTPException(status_code=404, detail="Weekly montage not found")

            if format == "portrait":
                video_path = montage.render_path_portrait
            else:
                video_path = montage.render_path_landscape

            if not video_path:
                raise HTTPException(
                    status_code=404, detail=f"Render not available for format {format}"
                )

        if not video_path:
            raise HTTPException(status_code=404, detail="Video file not found")

        # Create post record
        post = SocialPost(
            user_id=current_user.user_id,
            job_id=job_id,
            weekly_montage_id=weekly_montage_id,
            platform=platform,
            caption=caption or f"AI-edited montage from Cosmiv 🎬",
            status="pending",
            scheduled_at=(
                datetime.fromisoformat(scheduled_at)
                if scheduled_at
                else datetime.utcnow()
            ),
        )
        session.add(post)
        session.commit()
        session.refresh(post)

        # Trigger async posting
        post_to_social_async.delay(
            post.id,
            video_path,
            caption or f"AI-edited montage from Cosmiv 🎬",
            connection.access_token,
            platform=platform,
            user_id=current_user.user_id,
            platform_user_id=connection.platform_user_id,
        )

        return {
            "success": True,
            "post_id": post.id,
            "platform": platform,
            "status": "pending",
            "message": "Post scheduled successfully",
        }


@router.get("/posts")
async def list_posts(
    limit: int = 20,
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """List user's social media posts."""
    with get_session() as session:
        query = select(SocialPost).where(SocialPost.user_id == current_user.user_id)

        if platform:
            query = query.where(SocialPost.platform == platform)

        posts = session.exec(
            query.order_by(SocialPost.created_at.desc()).limit(limit)
        ).all()

        return {
            "posts": [
                {
                    "id": p.id,
                    "platform": p.platform,
                    "status": p.status,
                    "caption": p.caption,
                    "video_url": p.video_url,
                    "platform_post_id": p.platform_post_id,
                    "scheduled_at": (
                        p.scheduled_at.isoformat() if p.scheduled_at else None
                    ),
                    "posted_at": p.posted_at.isoformat() if p.posted_at else None,
                    "error": p.error,
                    "created_at": p.created_at.isoformat(),
                }
                for p in posts
            ]
        }


@router.get("/posts/{post_id}")
async def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific post."""
    with get_session() as session:
        post = session.exec(
            select(SocialPost).where(
                SocialPost.id == post_id, SocialPost.user_id == current_user.user_id
            )
        ).first()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        return {
            "id": post.id,
            "platform": post.platform,
            "status": post.status,
            "caption": post.caption,
            "video_url": post.video_url,
            "platform_post_id": post.platform_post_id,
            "scheduled_at": (
                post.scheduled_at.isoformat() if post.scheduled_at else None
            ),
            "posted_at": post.posted_at.isoformat() if post.posted_at else None,
            "error": post.error,
            "created_at": post.created_at.isoformat(),
        }
