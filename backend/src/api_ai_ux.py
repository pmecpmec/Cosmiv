"""
API endpoints for AI UX/UI Analysis System
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from auth import get_current_user, get_current_admin_user
from models import User
from services.ai_ux_analyzer import ux_analyzer_service
from models_ai import UXAnalysis
from db import get_session
from sqlmodel import select
import json

router = APIRouter(prefix="/v2/ai/ux", tags=["AI UX"])


class ComponentAnalysisRequest(BaseModel):
    component_path: str
    page_url: Optional[str] = None
    analysis_type: str = "general"


class BehaviorAnalysisRequest(BaseModel):
    user_id: Optional[str] = None
    time_range_days: int = 7


class GenerateImprovementsRequest(BaseModel):
    component_path: str
    issues: List[str]
    context: Optional[dict] = None


class AccessibilityAnalysisRequest(BaseModel):
    component_code: str


class ABTestRequest(BaseModel):
    component_path: str
    metrics: dict


@router.post("/analyze-component")
async def analyze_component(
    request: ComponentAnalysisRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Analyze a component for UX/UI improvements"""
    result = ux_analyzer_service.analyze_component(
        component_path=request.component_path,
        page_url=request.page_url,
        analysis_type=request.analysis_type,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))

    return result


@router.post("/analyze-behavior")
async def analyze_behavior(
    request: BehaviorAnalysisRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Analyze user behavior patterns"""
    result = ux_analyzer_service.analyze_user_behavior(
        user_id=request.user_id,
        time_range_days=request.time_range_days,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))

    return result


@router.post("/generate-improvements")
async def generate_improvements(
    request: GenerateImprovementsRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Generate improvement suggestions for a component"""
    result = ux_analyzer_service.generate_improvements(
        component_path=request.component_path,
        issues=request.issues,
        context=request.context,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))

    return result


@router.post("/analyze-accessibility")
async def analyze_accessibility(
    request: AccessibilityAnalysisRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Analyze component for accessibility issues"""
    result = ux_analyzer_service.analyze_accessibility(
        component_code=request.component_code,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Analysis failed"))

    return result


@router.post("/suggest-ab-tests")
async def suggest_ab_tests(
    request: ABTestRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Suggest A/B tests for UX improvements"""
    result = ux_analyzer_service.suggest_ab_tests(
        component_path=request.component_path,
        metrics=request.metrics,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Suggestion failed"))

    return result


@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a UX analysis record"""
    analysis = ux_analyzer_service.get_analysis(analysis_id)

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "analysis_id": analysis.analysis_id,
        "component_path": analysis.component_path,
        "page_url": analysis.page_url,
        "analysis_type": analysis.analysis_type,
        "metrics": json.loads(analysis.metrics) if analysis.metrics else {},
        "status": analysis.status,
        "improvement_suggestions": (
            json.loads(analysis.improvement_suggestions) if analysis.improvement_suggestions else None
        ),
        "analyzed_at": analysis.analyzed_at.isoformat() if analysis.analyzed_at else None,
        "improved_at": analysis.improved_at.isoformat() if analysis.improved_at else None,
    }


@router.get("/analyses")
async def list_analyses(
    component_path: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """List all UX analyses"""
    with get_session() as session:
        query = select(UXAnalysis)

        if component_path:
            query = query.where(UXAnalysis.component_path == component_path)
        if status:
            query = query.where(UXAnalysis.status == status)

        analyses = session.exec(query.order_by(UXAnalysis.analyzed_at.desc())).all()

        return {
            "analyses": [
                {
                    "analysis_id": a.analysis_id,
                    "component_path": a.component_path,
                    "analysis_type": a.analysis_type,
                    "status": a.status,
                    "analyzed_at": a.analyzed_at.isoformat() if a.analyzed_at else None,
                }
                for a in analyses
            ],
        }
