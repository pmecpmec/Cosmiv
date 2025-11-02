"""
AI Services API Endpoints
Provides endpoints for all AI-powered features
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from services.ai_service import AIService
from auth import get_current_user, get_current_user_optional
from models import User

router = APIRouter(prefix="/v2/ai", tags=["ai"])

# Initialize AI service
ai_service = AIService()


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


class CodeGenRequest(BaseModel):
    prompt: str
    language: str = "python"
    context: Optional[str] = None


class CodeGenResponse(BaseModel):
    code: str
    explanation: Optional[str] = None


class UIImprovementRequest(BaseModel):
    current_ui: str
    improvement_request: str


class ContentRenewalRequest(BaseModel):
    content_type: str
    current_content: str
    style: Optional[str] = None


class VideoEditingRequest(BaseModel):
    video_description: str
    editing_style: str = "cinematic"


class MusicPromptRequest(BaseModel):
    video_description: str
    mood: str = "energetic"
    genre: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    AI Chatbot endpoint for customer support and questions
    
    Routes to human admin/owner if they're online, otherwise uses AI.
    Supports conversation context if conversation_id is provided
    """
    try:
        from db import get_session
        from sqlmodel import select, and_, or_
        from models import UserRole
        
        # Check if any admin/owner is online
        with get_session() as session:
            online_admins = session.exec(
                select(User).where(
                    and_(
                        or_(User.role == UserRole.ADMIN, User.role == UserRole.OWNER),
                        User.is_online == True,
                        User.is_active == True
                    )
                )
            ).all()
        
        # If admin/owner is online, queue message for them instead of AI
        if online_admins:
            # In production, create a support ticket/message for admins
            # For now, we'll still use AI but note admin availability
            system_prompt = """You are Aiditor's AI assistant. A human admin is currently online and may respond if needed.
Answer questions about:
- How to use the platform
- Video editing features
- Uploading clips
- Subscription plans
- Technical support
- Platform integrations (Steam, Xbox, PlayStation, Switch)

Be friendly, concise, and helpful. Mention that admins are available if they need more help.
"""
        else:
            system_prompt = """You are Aiditor's AI assistant - a helpful, professional support agent for our AI Gaming Montage Platform.
Answer questions about:
- How to use the platform
- Video editing features
- Uploading clips
- Subscription plans
- Technical support
- Platform integrations (Steam, Xbox, PlayStation, Switch)

Be friendly, concise, and helpful. If you don't know something, direct users to our support channels.
"""
        
        # Build messages
        messages = [{"role": "user", "content": request.message}]
        
        if request.context:
            system_prompt += f"\nAdditional Context: {request.context}\n"
        
        response_text = ai_service.chat(
            messages=messages,
            system_prompt=system_prompt,
            temperature=0.7,
        )
        
        # Add admin availability note if relevant
        if online_admins and not response_text.endswith("admin"):
            response_text += f"\n\n💡 Note: Our admins are currently online and ready to help if you need additional assistance!"
        
        # Generate conversation ID (in production, store in database)
        conversation_id = request.conversation_id or f"conv_{current_user.user_id if current_user else 'anonymous'}"
        
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")


@router.post("/code/generate", response_model=CodeGenResponse)
async def generate_code(
    request: CodeGenRequest,
    current_user: User = Depends(get_current_user),
):
    """
    AI Code Generator - Generate frontend or backend code
    
    Requires authentication (admin or developer role in production)
    """
    try:
        code = ai_service.generate_code(
            prompt=request.prompt,
            language=request.language,
            context=request.context,
        )
        
        return CodeGenResponse(
            code=code,
            explanation=None,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation error: {str(e)}")


@router.post("/ui/improve")
async def improve_ui(
    request: UIImprovementRequest,
    current_user: User = Depends(get_current_user),
):
    """
    AI UX/UI Improvement suggestions
    
    Requires authentication
    """
    try:
        result = ai_service.improve_ui(
            current_ui_description=request.current_ui,
            improvement_request=request.improvement_request,
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"UI improvement error: {str(e)}")


@router.post("/content/renew")
async def renew_content(
    request: ContentRenewalRequest,
    current_user: User = Depends(get_current_user),
):
    """
    AI Content Renewal - Automatically renew website content
    
    Requires authentication (admin in production)
    """
    try:
        renewed_content = ai_service.renew_content(
            content_type=request.content_type,
            current_content=request.current_content,
            style=request.style,
        )
        
        return {
            "renewed_content": renewed_content,
            "original_content": request.current_content,
            "content_type": request.content_type,
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content renewal error: {str(e)}")


@router.post("/video/editing")
async def get_video_editing_suggestions(
    request: VideoEditingRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    AI Video Editor - Get editing suggestions for video
    
    Can be used by any user
    """
    try:
        suggestions = ai_service.enhance_video_editing(
            video_description=request.video_description,
            editing_style=request.editing_style,
        )
        
        return suggestions
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video editing suggestions error: {str(e)}")


@router.post("/music/prompt")
async def generate_music_prompt(
    request: MusicPromptRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    AI DJ - Generate music prompt for copyright-free music generation
    
    Can be used by any user
    """
    try:
        prompt = ai_service.generate_music_prompt(
            video_description=request.video_description,
            mood=request.mood,
            genre=request.genre,
        )
        
        return {
            "music_prompt": prompt,
            "mood": request.mood,
            "genre": request.genre or "gaming electronic",
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Music prompt generation error: {str(e)}")


@router.get("/status")
async def ai_status():
    """Check AI service status and provider"""
    return {
        "provider": ai_service.provider,
        "available": ai_service._client is not None,
        "model": ai_service.default_model,
    }

