from fastapi import APIRouter, Form, Request, Header, HTTPException, Depends
from fastapi.responses import JSONResponse
from db import get_session
from sqlmodel import select
from models import Entitlement, User
from datetime import datetime, timedelta
from auth import get_current_user
from config import settings
import stripe
import hmac
import hashlib
from typing import Optional

router = APIRouter(prefix="/v2/billing")

# Initialize Stripe (only if key is provided)
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY
else:
    stripe = None  # Will use mock mode

PLANS = [
    {
        "id": "free",
        "name": "Cosmic Cadet",
        "price": 0,
        "features": ["60s limit", "Watermark", "Basic styles"],
        "stripe_price_id": None,
    },
    {
        "id": "pro",
        "name": "Nebula Knight",
        "price": 9,
        "features": ["120s limit", "No watermark", "All styles", "Priority queue"],
        "stripe_price_id": settings.STRIPE_PRICE_ID_PRO,
    },
    {
        "id": "creator",
        "name": "Creator+",
        "price": 19,
        "features": ["Unlimited duration", "No watermark", "All styles", "Top priority", "Weekly montage inclusion"],
        "stripe_price_id": settings.STRIPE_PRICE_ID_CREATOR,
    },
]

@router.get("/plans")
def plans():
    """Get available subscription plans."""
    return {"plans": PLANS}


@router.get("/plans/{plan_id}")
def get_plan(plan_id: str):
    """Get specific plan details."""
    plan = next((p for p in PLANS if p["id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("/checkout")
async def create_checkout(
    plan: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    """
    Create Stripe checkout session for subscription.
    Returns checkout URL for frontend to redirect.
    """
    if plan == "free":
        raise HTTPException(status_code=400, detail="Free plan doesn't require checkout")
    
    plan_data = next((p for p in PLANS if p["id"] == plan), None)
    if not plan_data:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if not plan_data["stripe_price_id"]:
        raise HTTPException(status_code=400, detail="Plan not configured with Stripe price ID")
    
    if not stripe:
        # Mock mode - return mock URL
        return {
            "checkout_url": f"https://checkout.stripe.com/mock/{plan}/{current_user.user_id}",
            "mode": "mock"
        }
    
    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": plan_data["stripe_price_id"],
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{settings.BASE_URL}/billing?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.BASE_URL}/billing?canceled=true",
            metadata={
                "user_id": current_user.user_id,
                "plan": plan,
            },
            subscription_data={
                "metadata": {
                    "user_id": current_user.user_id,
                    "plan": plan,
                }
            }
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id,
            "mode": "stripe"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout: {str(e)}")


@router.post("/checkout/success")
async def checkout_success(
    session_id: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    """
    Handle successful checkout - verify session and update entitlement.
    Called after user returns from Stripe checkout.
    """
    if not stripe:
        # Mock mode - just set entitlement
        with get_session() as session:
            ent = session.exec(
                select(Entitlement).where(Entitlement.user_id == current_user.user_id)
            ).first()
            if not ent:
                ent = Entitlement(
                    user_id=current_user.user_id,
                    plan="pro",
                    expires_at=datetime.utcnow() + timedelta(days=30)
                )
            else:
                ent.plan = "pro"
                ent.expires_at = datetime.utcnow() + timedelta(days=30)
            session.add(ent)
            session.commit()
        return {"success": True, "message": "Subscription activated (mock mode)"}
    
    try:
        # Retrieve session from Stripe
        session_obj = stripe.checkout.Session.retrieve(session_id)
        
        if session_obj.payment_status != "paid":
            raise HTTPException(status_code=400, detail="Payment not completed")
        
        # Get plan from metadata
        plan = session_obj.metadata.get("plan", "pro")
        
        # Update entitlement
        with get_session() as session:
            ent = session.exec(
                select(Entitlement).where(Entitlement.user_id == current_user.user_id)
            ).first()
            
            # Calculate expiration (1 month from now for subscriptions)
            expires_at = datetime.utcnow() + timedelta(days=30)
            
            if not ent:
                ent = Entitlement(
                    user_id=current_user.user_id,
                    plan=plan,
                    expires_at=expires_at,
                )
            else:
                ent.plan = plan
                ent.expires_at = expires_at
            
            session.add(ent)
            session.commit()
        
        return {"success": True, "message": "Subscription activated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process checkout: {str(e)}")

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
):
    """
    Handle Stripe webhook events.
    Processes subscription updates, cancellations, and payment failures.
    """
    payload = await request.body()
    
    if not stripe or not settings.STRIPE_WEBHOOK_SECRET:
        # Mock mode
        return JSONResponse({"ok": True, "mode": "mock"})
    
    try:
        # Verify webhook signature
        if stripe_signature:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
            )
        else:
            # In development, can skip signature verification
            import json
            event = json.loads(payload)
        
        # Handle event
        event_type = event.get("type", "")
        event_data = event.get("data", {}).get("object", {})
        
        if event_type == "checkout.session.completed":
            # Checkout completed
            metadata = event_data.get("metadata", {})
            user_id = metadata.get("user_id")
            plan = metadata.get("plan", "pro")
            
            if user_id:
                with get_session() as session:
                    ent = session.exec(
                        select(Entitlement).where(Entitlement.user_id == user_id)
                    ).first()
                    if not ent:
                        ent = Entitlement(
                            user_id=user_id,
                            plan=plan,
                            expires_at=datetime.utcnow() + timedelta(days=30),
                        )
                    else:
                        ent.plan = plan
                        ent.expires_at = datetime.utcnow() + timedelta(days=30)
                    session.add(ent)
                    session.commit()
        
        elif event_type == "customer.subscription.updated":
            # Subscription updated (plan change, renewal)
            subscription_id = event_data.get("id")
            customer_id = event_data.get("customer")
            metadata = event_data.get("metadata", {})
            user_id = metadata.get("user_id")
            
            # Get plan from subscription items
            items = event_data.get("items", {}).get("data", [])
            plan = metadata.get("plan", "pro")  # Default from metadata
            
            if user_id:
                expires_at = datetime.fromtimestamp(event_data.get("current_period_end", 0))
                with get_session() as session:
                    ent = session.exec(
                        select(Entitlement).where(Entitlement.user_id == user_id)
                    ).first()
                    if ent:
                        ent.plan = plan
                        ent.expires_at = expires_at
                        session.add(ent)
                        session.commit()
        
        elif event_type == "customer.subscription.deleted":
            # Subscription cancelled - downgrade to free
            metadata = event_data.get("metadata", {})
            user_id = metadata.get("user_id")
            
            if user_id:
                with get_session() as session:
                    ent = session.exec(
                        select(Entitlement).where(Entitlement.user_id == user_id)
                    ).first()
                    if ent:
                        ent.plan = "free"
                        ent.expires_at = None
                        session.add(ent)
                        session.commit()
        
        elif event_type == "invoice.payment_failed":
            # Payment failed - could downgrade or send notification
            subscription_id = event_data.get("subscription")
            # Handle payment failure (e.g., send email, mark for downgrade)
            pass
        
        return JSONResponse({"ok": True, "event": event_type})
    
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except Exception as e:
        error_type = type(e).__name__
        if "SignatureVerificationError" in error_type or "SignatureVerificationError" in str(type(e)):
            raise HTTPException(status_code=400, detail=f"Invalid signature: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")

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
def get_entitlement(
    current_user: User = Depends(get_current_user),
):
    """Get current user's entitlement."""
    with get_session() as session:
        ent = session.exec(
            select(Entitlement).where(Entitlement.user_id == current_user.user_id)
        ).first()
        
        if not ent:
            return {
                "user_id": current_user.user_id,
                "plan": "free",
                "expires_at": None,
                "is_active": True,
            }
        
        # Check if expired
        is_active = True
        if ent.expires_at and ent.expires_at < datetime.utcnow():
            is_active = False
            # Auto-downgrade expired subscriptions
            if ent.plan != "free":
                ent.plan = "free"
                session.add(ent)
                session.commit()
        
        return {
            "user_id": current_user.user_id,
            "plan": ent.plan,
            "expires_at": ent.expires_at.isoformat() if ent.expires_at else None,
            "is_active": is_active,
        }
