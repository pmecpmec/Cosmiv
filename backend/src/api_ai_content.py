"""
API endpoints for AI Content Renewal System
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from auth import get_current_user, get_current_admin_user
from models import User
from services.ai_content_renewal import content_renewal_service
from models_ai import ContentVersion
from db import get_session
from sqlmodel import select
import json

router = APIRouter(prefix="/v2/ai/content", tags=["AI Content"])


class ContentRenewalRequest(BaseModel):
    content_id: str
    content_type: str
    force: bool = False


class ContentGenerationRequest(BaseModel):
    content_type: str
    context: Optional[dict] = None
    style: Optional[str] = None


class PublishVersionRequest(BaseModel):
    content_id: str
    version: int


@router.post("/generate")
async def generate_content(
    request: ContentGenerationRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Generate new content using AI"""
    result = content_renewal_service.generate_content(
        content_type=request.content_type,
        context=request.context,
        style=request.style,
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
    
    return result


@router.post("/renew")
async def renew_content(
    request: ContentRenewalRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Renew existing content with AI-generated version"""
    result = content_renewal_service.renew_content(
        content_id=request.content_id,
        content_type=request.content_type,
        force=request.force,
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Renewal failed"))
    
    return result


@router.get("/versions/{content_id}")
async def get_content_versions(
    content_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get all versions of content"""
    with get_session() as session:
        versions = session.exec(
            select(ContentVersion)
            .where(ContentVersion.content_id == content_id)
            .order_by(ContentVersion.version.desc())
        ).all()
        
        return {
            "content_id": content_id,
            "versions": [
                {
                    "version": v.version,
                    "status": v.status,
                    "generated_by": v.generated_by,
                    "created_at": v.created_at.isoformat(),
                    "published_at": v.published_at.isoformat() if v.published_at else None,
                    "performance_score": v.performance_score,
                }
                for v in versions
            ],
        }


@router.get("/latest/{content_id}")
async def get_latest_content(
    content_id: str,
    current_user: Optional[User] = Depends(get_current_user),
):
    """Get the latest published version of content"""
    latest = content_renewal_service.get_latest_version(content_id)
    
    if not latest:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {
        "content_id": latest.content_id,
        "content_type": latest.content_type,
        "version": latest.version,
        "content_data": json.loads(latest.content_data) if latest.content_data else {},
        "status": latest.status,
        "created_at": latest.created_at.isoformat(),
    }


@router.post("/publish")
async def publish_version(
    request: PublishVersionRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Publish a content version"""
    success = content_renewal_service.publish_version(
        content_id=request.content_id,
        version=request.version,
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Version not found or publish failed")
    
    return {"success": True, "message": f"Version {request.version} published"}


@router.post("/schedule-renewals")
async def schedule_renewals(
    current_user: User = Depends(get_current_admin_user),
):
    """Manually trigger scheduled content renewals"""
    result = content_renewal_service.schedule_renewals()
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Scheduling failed"))
    
    return result

