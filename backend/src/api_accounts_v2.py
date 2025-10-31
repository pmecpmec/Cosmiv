from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
from typing import Optional
from db import get_session
from sqlmodel import select
from models import User, UserAuth, DiscoveredClip
from services.clip_discovery import list_providers
from tasks import sync_user_clips

router = APIRouter(prefix="/v2/accounts")

@router.get("/providers")
def providers():
    return {"providers": list_providers()}

@router.post("/link")
def link_account(user_id: str = Form(...), provider: str = Form(...), access_token: str = Form("mock-token")):
    with get_session() as session:
        ua = UserAuth(user_id=user_id, provider=provider, access_token=access_token)
        session.add(ua)
        # ensure user exists
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            session.add(User(user_id=user_id))
        session.commit()
    return {"linked": True}

@router.get("/links")
def list_links(user_id: str):
    with get_session() as session:
        links = session.exec(select(UserAuth).where(UserAuth.user_id == user_id)).all()
        return {"links": [{"provider": l.provider} for l in links]}

@router.post("/sync")
def sync_now(user_id: str = Form(...)):
    sync_user_clips.delay(user_id)
    return {"scheduled": True}
