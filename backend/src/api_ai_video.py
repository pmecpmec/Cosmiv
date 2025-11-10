"""
API endpoints for AI Video Enhancement System
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from auth import get_current_user, get_current_admin_user
from models import User
from services.ai_video_enhancer import video_enhancer_service
from models_ai import VideoEnhancement
from db import get_session
from sqlmodel import select
import json

router = APIRouter(prefix="/v2/ai/video", tags=["AI Video"])


class VideoEnhancementRequest(BaseModel):
    job_id: str
    enhancement_type: str  # captions, transitions, color_grade, effects, motion_graphics
    input_video_path: str
    params: Optional[dict] = None


class CaptionGenerationRequest(BaseModel):
    video_path: str
    style: str = "gaming"
    position: str = "bottom"


class EditSuggestionsRequest(BaseModel):
    video_description: str
    target_duration: int
    style: str = "cinematic"


class ThumbnailGenerationRequest(BaseModel):
    video_path: str
    style: str = "gaming"
    text: Optional[str] = None


@router.post("/enhance")
async def enhance_video(
    request: VideoEnhancementRequest,
    current_user: User = Depends(get_current_user),
):
    """Enhance a video using AI"""
    result = video_enhancer_service.enhance_video(
        job_id=request.job_id,
        enhancement_type=request.enhancement_type,
        input_video_path=request.input_video_path,
        params=request.params,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Enhancement failed"))

    return result


@router.post("/generate-captions")
async def generate_captions(
    request: CaptionGenerationRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate AI-powered captions for video"""
    result = video_enhancer_service.generate_captions(
        video_path=request.video_path,
        style=request.style,
        position=request.position,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Caption generation failed"))

    return result


@router.post("/suggest-edits")
async def suggest_edits(
    request: EditSuggestionsRequest,
    current_user: User = Depends(get_current_user),
):
    """Get AI suggestions for video editing"""
    result = video_enhancer_service.suggest_edits(
        video_description=request.video_description,
        target_duration=request.target_duration,
        style=request.style,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Suggestion failed"))

    return result


@router.post("/generate-thumbnail")
async def generate_thumbnail(
    request: ThumbnailGenerationRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate thumbnail design suggestions"""
    result = video_enhancer_service.generate_thumbnail(
        video_path=request.video_path,
        style=request.style,
        text=request.text,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Thumbnail generation failed"))

    return result


@router.get("/enhancement/{enhancement_id}")
async def get_enhancement(
    enhancement_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a video enhancement record"""
    enhancement = video_enhancer_service.get_enhancement(enhancement_id)

    if not enhancement:
        raise HTTPException(status_code=404, detail="Enhancement not found")

    return {
        "enhancement_id": enhancement.enhancement_id,
        "job_id": enhancement.job_id,
        "enhancement_type": enhancement.enhancement_type,
        "input_video_path": enhancement.input_video_path,
        "output_video_path": enhancement.output_video_path,
        "status": enhancement.status,
        "quality_score": enhancement.quality_score,
        "params": json.loads(enhancement.enhancement_params) if enhancement.enhancement_params else {},
        "created_at": enhancement.created_at.isoformat(),
        "completed_at": enhancement.completed_at.isoformat() if enhancement.completed_at else None,
    }


@router.get("/enhancements")
async def list_enhancements(
    job_id: Optional[str] = None,
    enhancement_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """List video enhancements"""
    with get_session() as session:
        query = select(VideoEnhancement)

        if job_id:
            query = query.where(VideoEnhancement.job_id == job_id)
        if enhancement_type:
            query = query.where(VideoEnhancement.enhancement_type == enhancement_type)

        enhancements = session.exec(query.order_by(VideoEnhancement.created_at.desc())).all()

        return {
            "enhancements": [
                {
                    "enhancement_id": e.enhancement_id,
                    "job_id": e.job_id,
                    "enhancement_type": e.enhancement_type,
                    "status": e.status,
                    "quality_score": e.quality_score,
                    "created_at": e.created_at.isoformat(),
                }
                for e in enhancements
            ],
        }
