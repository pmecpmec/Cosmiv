"""
API endpoints for AI Code Generation System
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from auth import get_current_user, get_current_admin_user
from models import User
from services.ai_code_generator import code_generator_service
from models_ai import CodeGeneration
from db import get_session
from sqlmodel import select

router = APIRouter(prefix="/v2/ai/code", tags=["AI Code"])


class FrontendGenerationRequest(BaseModel):
    description: str
    framework: str = "react"
    style_system: str = "tailwind"
    context: Optional[dict] = None


class BackendGenerationRequest(BaseModel):
    description: str
    framework: str = "fastapi"
    context: Optional[dict] = None


class CodeOptimizationRequest(BaseModel):
    code: str
    language: str
    optimization_type: str = "general"


class UpdateGenerationRequest(BaseModel):
    generation_id: str
    status: str
    review_notes: Optional[str] = None
    file_path: Optional[str] = None


@router.post("/generate-frontend")
async def generate_frontend(
    request: FrontendGenerationRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Generate a React component from description"""
    result = code_generator_service.generate_frontend_component(
        description=request.description,
        framework=request.framework,
        style_system=request.style_system,
        context=request.context,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))

    return result


@router.post("/generate-backend")
async def generate_backend(
    request: BackendGenerationRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Generate a FastAPI endpoint from description"""
    result = code_generator_service.generate_backend_endpoint(
        description=request.description,
        framework=request.framework,
        context=request.context,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))

    return result


@router.post("/optimize")
async def optimize_code(
    request: CodeOptimizationRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Optimize existing code"""
    result = code_generator_service.optimize_code(
        code=request.code,
        language=request.language,
        optimization_type=request.optimization_type,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Optimization failed"))

    return result


@router.get("/generation/{generation_id}")
async def get_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a code generation record"""
    generation = code_generator_service.get_generation(generation_id)

    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")

    return {
        "generation_id": generation.generation_id,
        "code_type": generation.code_type,
        "language": generation.language,
        "original_spec": generation.original_spec,
        "generated_code": generation.generated_code,
        "status": generation.status,
        "file_path": generation.file_path,
        "review_notes": generation.review_notes,
        "created_at": generation.created_at.isoformat(),
        "deployed_at": generation.deployed_at.isoformat() if generation.deployed_at else None,
    }


@router.get("/generations")
async def list_generations(
    code_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """List all code generations"""
    with get_session() as session:
        query = select(CodeGeneration)

        if code_type:
            query = query.where(CodeGeneration.code_type == code_type)
        if status:
            query = query.where(CodeGeneration.status == status)

        generations = session.exec(query.order_by(CodeGeneration.created_at.desc())).all()

        return {
            "generations": [
                {
                    "generation_id": g.generation_id,
                    "code_type": g.code_type,
                    "language": g.language,
                    "status": g.status,
                    "created_at": g.created_at.isoformat(),
                }
                for g in generations
            ],
        }


@router.patch("/generation")
async def update_generation(
    request: UpdateGenerationRequest,
    current_user: User = Depends(get_current_admin_user),
):
    """Update code generation status"""
    success = code_generator_service.update_generation_status(
        generation_id=request.generation_id,
        status=request.status,
        review_notes=request.review_notes,
        file_path=request.file_path,
    )

    if not success:
        raise HTTPException(status_code=404, detail="Generation not found")

    return {"success": True, "message": "Generation updated"}
