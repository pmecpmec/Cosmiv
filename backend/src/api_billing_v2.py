from fastapi import APIRouter, Form, Request
from fastapi.responses import JSONResponse
from db import get_session
from sqlmodel import select
from models import Entitlement
from datetime import datetime, timedelta

router = APIRouter(prefix="/v2/billing")

PLANS = [
    {"id":"free","name":"Cosmic Cadet","price":0,"features":["60s limit","watermark"]},
    {"id":"pro","name":"Nebula Knight","price":9,"features":["longer renders","no watermark"]},
]

@router.get("/plans")
def plans():
    return {"plans": PLANS}

@router.post("/checkout")
def checkout(user_id: str = Form(...), plan: str = Form("pro")):
    # Mock checkout; in production create Stripe session
    return {"checkout_url": f"https://example.com/checkout/{plan}/{user_id}"}

@router.post("/webhook")
async def webhook(_: Request):
    # Mock webhook; in production verify signature and update entitlements
    return JSONResponse({"ok": True})

@router.post("/entitlements")
def set_entitlement(user_id: str = Form(...), plan: str = Form("pro")):
    # Admin/test endpoint to set entitlement
    with get_session() as session:
        ent = session.exec(select(Entitlement).where(Entitlement.user_id == user_id)).first()
        if not ent:
            ent = Entitlement(user_id=user_id, plan=plan, expires_at=datetime.utcnow() + timedelta(days=30))
        else:
            ent.plan = plan
            ent.expires_at = datetime.utcnow() + timedelta(days=30)
        session.add(ent)
        session.commit()
    return {"user_id": user_id, "plan": plan}

@router.get("/entitlements")
def get_entitlement(user_id: str):
    with get_session() as session:
        ent = session.exec(select(Entitlement).where(Entitlement.user_id == user_id)).first()
        if not ent:
            return {"user_id": user_id, "plan": "free"}
        return {"user_id": user_id, "plan": ent.plan, "expires_at": ent.expires_at.isoformat() if ent.expires_at else None}
