"""
Enhanced accounts API with OAuth flow support
"""

from fastapi import APIRouter, Form, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse, JSONResponse
from typing import Optional
from db import get_session
from sqlmodel import select
from models import User, UserAuth, DiscoveredClip
from services.clip_discovery import list_providers, mock_fetch_recent_clips
from services.platform_oauth import get_oauth_handler
from tasks import sync_user_clips
from auth import get_current_user
import secrets
from datetime import datetime
from config import settings

router = APIRouter(prefix="/v2/accounts", tags=["accounts"])


# Store OAuth state temporarily (in production, use Redis)
oauth_states = {}


@router.get("/providers")
def providers():
    """List available gaming platforms"""
    providers_list = list_providers()

    # Add platform metadata
    platform_info = {
        "steam": {"icon": "🎮", "color": "bg-blue-600", "description": "Steam Library"},
        "xbox": {"icon": "🟢", "color": "bg-green-600", "description": "Xbox Game Clips"},
        "playstation": {"icon": "🔵", "color": "bg-blue-800", "description": "PlayStation Share"},
        "switch": {"icon": "🔴", "color": "bg-red-600", "description": "Nintendo Switch"},
    }

    enhanced = []
    for p in providers_list:
        info = platform_info.get(p["id"], {})
        enhanced.append(
            {
                **p,
                "icon": info.get("icon", "🎮"),
                "color": info.get("color", "bg-gray-600"),
                "description": info.get("description", f"Link {p['name']} account"),
            }
        )

    return {"providers": enhanced}


@router.get("/oauth/{provider}")
async def start_oauth(
    provider: str,
    current_user: User = Depends(get_current_user),
):
    """
    Start OAuth flow for a gaming platform.
    Redirects user to platform's OAuth page.
    """
    handler = get_oauth_handler(provider)
    if not handler:
        raise HTTPException(status_code=404, detail="Platform not supported")

    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    oauth_states[state] = {
        "user_id": current_user.user_id,
        "provider": provider,
        "created_at": datetime.utcnow(),
    }

    # Get redirect URI
    redirect_uri = f"{settings.BASE_URL}/api/v2/accounts/oauth/{provider}/callback"

    # Get authorization URL
    auth_url = handler.get_authorize_url(redirect_uri, state)

    return RedirectResponse(url=auth_url)


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    mock: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
):
    """
    Handle OAuth callback from gaming platform.
    """
    if error:
        # OAuth error
        return RedirectResponse(url=f"{settings.BASE_URL}/accounts?error={error}")

    # Verify state
    if not state or state not in oauth_states:
        return RedirectResponse(url=f"{settings.BASE_URL}/accounts?error=invalid_state")

    state_data = oauth_states.pop(state)
    user_id = state_data["user_id"]

    handler = get_oauth_handler(provider)
    if not handler:
        return RedirectResponse(url=f"{settings.BASE_URL}/accounts?error=invalid_platform")

    try:
        # Exchange code for tokens (or use mock data)
        if mock == "true" or not code:
            # Mock mode
            platform_data = {
                "platform_user_id": f"{provider}_mock_{datetime.utcnow().timestamp()}",
                "platform_username": f"Mock{provider.title()}User",
                "access_token": f"mock_{provider}_token",
                "refresh_token": f"mock_{provider}_refresh",
                "expires_at": None,
            }
        else:
            # Real OAuth exchange
            redirect_uri = f"{settings.BASE_URL}/api/v2/accounts/oauth/{provider}/callback"
            platform_data = await handler.exchange_code(code, redirect_uri)

        # Save connection to database
        with get_session() as session:
            # Check if connection exists
            existing = session.exec(
                select(UserAuth).where(UserAuth.user_id == user_id, UserAuth.provider == provider)
            ).first()

            expires_at = None
            if platform_data.get("expires_at"):
                expires_at = datetime.fromisoformat(platform_data["expires_at"])

            if existing:
                # Update existing
                existing.access_token = platform_data["access_token"]
                existing.refresh_token = platform_data.get("refresh_token")
                existing.expires_at = expires_at
                existing.platform_user_id = platform_data["platform_user_id"]
                existing.platform_username = platform_data["platform_username"]
                session.add(existing)
            else:
                # Create new
                connection = UserAuth(
                    user_id=user_id,
                    provider=provider,
                    access_token=platform_data["access_token"],
                    refresh_token=platform_data.get("refresh_token"),
                    expires_at=expires_at,
                    platform_user_id=platform_data["platform_user_id"],
                    platform_username=platform_data["platform_username"],
                )
                session.add(connection)

            session.commit()

        # Trigger initial sync
        sync_user_clips.delay(user_id)

        return RedirectResponse(url=f"{settings.BASE_URL}/accounts?success={provider}")
    except Exception as e:
        return RedirectResponse(url=f"{settings.BASE_URL}/accounts?error={str(e)}")


@router.post("/link")
def link_account(
    user_id: str = Form(...),
    provider: str = Form(...),
    access_token: str = Form("mock-token"),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Legacy endpoint for manual linking (deprecated, use OAuth flow).
    Kept for backward compatibility.
    """
    with get_session() as session:
        ua = UserAuth(user_id=user_id, provider=provider, access_token=access_token)
        session.add(ua)
        # ensure user exists
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            session.add(User(user_id=user_id))
        session.commit()
    return {"linked": True, "message": "Use OAuth flow for production"}


@router.get("/links")
def list_links(
    current_user: User = Depends(get_current_user),
):
    """List user's linked gaming platform accounts"""
    with get_session() as session:
        links = session.exec(select(UserAuth).where(UserAuth.user_id == current_user.user_id)).all()

        return {
            "links": [
                {
                    "provider": link.provider,
                    "platform_username": link.platform_username,
                    "platform_user_id": link.platform_user_id,
                    "created_at": link.created_at.isoformat(),
                    "expires_at": link.expires_at.isoformat() if link.expires_at else None,
                    "is_active": link.expires_at is None or link.expires_at > datetime.utcnow(),
                }
                for link in links
            ]
        }


@router.delete("/links/{provider}")
def unlink_account(
    provider: str,
    current_user: User = Depends(get_current_user),
):
    """Unlink a gaming platform account"""
    with get_session() as session:
        link = session.exec(
            select(UserAuth).where(UserAuth.user_id == current_user.user_id, UserAuth.provider == provider)
        ).first()

        if not link:
            raise HTTPException(status_code=404, detail="Account not linked")

        session.delete(link)
        session.commit()

        return {"unlinked": True, "provider": provider}


@router.get("/clips")
def list_discovered_clips(
    provider: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
):
    """List discovered clips from linked accounts"""
    with get_session() as session:
        query = select(DiscoveredClip).where(DiscoveredClip.user_id == current_user.user_id)

        if provider:
            query = query.where(DiscoveredClip.provider == provider)

        clips = session.exec(query.order_by(DiscoveredClip.discovered_at.desc()).limit(limit)).all()

        return {
            "clips": [
                {
                    "id": c.id,
                    "provider": c.provider,
                    "external_id": c.external_id,
                    "title": c.title,
                    "url": c.url,
                    "discovered_at": c.discovered_at.isoformat(),
                }
                for c in clips
            ]
        }


@router.post("/sync")
def sync_now(
    provider: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    """Trigger manual sync for linked accounts"""
    if provider:
        # Sync specific provider
        with get_session() as session:
            link = session.exec(
                select(UserAuth).where(UserAuth.user_id == current_user.user_id, UserAuth.provider == provider)
            ).first()
            if not link:
                raise HTTPException(status_code=404, detail="Account not linked")

        sync_user_clips.delay(current_user.user_id)
    else:
        # Sync all providers
        sync_user_clips.delay(current_user.user_id)

    return {"scheduled": True, "message": "Sync started in background"}
