"""
Authentication API endpoints: Register, Login, Refresh, Current User
"""

from fastapi import APIRouter, HTTPException, status, Depends, Form
from fastapi.security import HTTPBearer
from pydantic import EmailStr
from sqlmodel import select
from db import get_session
from models import User, UserRole
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    get_current_admin_user,
)
from datetime import timedelta
from config import settings
import uuid
from typing import Optional

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register")
async def register(
    username: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(..., min_length=8),
):
    """
    Register a new user.

    Username and email must be unique.
    Password must be at least 8 characters.
    """
    with get_session() as session:
        # Check if username exists
        existing_user = session.exec(select(User).where(User.username == username)).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

        # Check if email exists
        existing_email = session.exec(select(User).where(User.email == email)).first()
        if existing_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = get_password_hash(password)

        # Set role based on username
        if username.lower() == "pmec":
            role = UserRole.OWNER
            is_admin = True
            storage_limit_mb = 500000.0  # 500 GB for owner
        else:
            role = UserRole.USER
            is_admin = False
            storage_limit_mb = 5120.0  # 5 GB default (Free tier)

        user = User(
            user_id=user_id,
            username=username,
            email=email,
            password_hash=password_hash,
            role=role,
            is_admin=is_admin,
            is_active=True,
            storage_limit_mb=storage_limit_mb,
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        # Generate tokens
        access_token = create_access_token(data={"sub": user.user_id, "username": user.username})
        refresh_token = create_refresh_token(data={"sub": user.user_id})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin,
                "role": user.role.value if user.role else "user",
            },
        }


@router.post("/login")
async def login(
    username_or_email: str = Form(...),
    password: str = Form(...),
):
    """
    Login with username/email and password.
    Returns access token and refresh token.
    """
    user = authenticate_user(username_or_email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate tokens
    access_token = create_access_token(data={"sub": user.user_id, "username": user.username})
    refresh_token = create_refresh_token(data={"sub": user.user_id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin,
        },
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str = Form(...)):
    """
    Refresh an access token using a refresh token.
    """
    payload = decode_token(refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Verify user exists and is active
    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

        username = user.username or ""

    # Generate new access token
    new_access_token = create_access_token(data={"sub": user_id, "username": username})

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "role": current_user.role.value if current_user.role else "user",
        "is_active": current_user.is_active,
        "is_online": current_user.is_online,
        "storage_used_mb": current_user.storage_used_mb,
        "storage_limit_mb": current_user.storage_limit_mb,
        "follower_count": current_user.follower_count,
        "following_count": current_user.following_count,
        "posts_count": current_user.posts_count,
    }


@router.post("/change-password")
async def change_password(
    current_password: str = Form(...),
    new_password: str = Form(..., min_length=8),
    current_user: User = Depends(get_current_user),
):
    """
    Change password for the current user.
    """
    from auth import verify_password

    # Verify current password
    if not current_user.password_hash or not verify_password(current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect current password")

    # Update password
    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == current_user.user_id)).first()
        if user:
            user.password_hash = get_password_hash(new_password)
            session.add(user)
            session.commit()

    return {"message": "Password changed successfully"}
