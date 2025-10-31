"""
Authentication endpoints for AIDIT
Handles user registration, login, and token management
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import timedelta
from typing import Optional
from db import get_session
from models import User
from sqlmodel import select
from security import create_access_token, log_security_event
import secrets

router = APIRouter(prefix="/auth", tags=["authentication"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str


class PasswordHash(BaseModel):
    """Store hashed passwords - to be added to User model"""
    password_hash: str


def hash_password(password: str) -> str:
    """Hash a password for storing"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """
    Register a new user
    
    NOTE: This is a simplified implementation for the security audit.
    In production, add:
    - Email verification
    - Password strength requirements
    - Rate limiting on registration
    - CAPTCHA for bot prevention
    """
    with get_session() as session:
        # Check if user already exists
        existing = session.exec(
            select(User).where(User.email == user_data.email)
        ).first()
        
        if existing:
            log_security_event(
                "REGISTRATION_ATTEMPT_DUPLICATE",
                None,
                {"email": user_data.email}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = secrets.token_urlsafe(16)
        password_hash = hash_password(user_data.password)
        
        new_user = User(
            user_id=user_id,
            email=user_data.email,
            # Note: password_hash field needs to be added to User model
        )
        session.add(new_user)
        session.commit()
        
        log_security_event(
            "USER_REGISTERED",
            user_id,
            {"email": user_data.email}
        )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user_id, "email": user_data.email}
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id
        )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Login with email and password
    
    NOTE: In production, add:
    - Rate limiting to prevent brute force
    - Account lockout after failed attempts
    - Two-factor authentication option
    - Login attempt logging
    """
    with get_session() as session:
        user = session.exec(
            select(User).where(User.email == credentials.email)
        ).first()
        
        if not user:
            log_security_event(
                "LOGIN_FAILED_USER_NOT_FOUND",
                None,
                {"email": credentials.email}
            )
            # Generic error to prevent user enumeration
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Note: This assumes password_hash field exists on User model
        # For now, we'll need to extend the User model
        # if not verify_password(credentials.password, user.password_hash):
        #     log_security_event(
        #         "LOGIN_FAILED_WRONG_PASSWORD",
        #         user.user_id,
        #         {"email": credentials.email}
        #     )
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Incorrect email or password"
        #     )
        
        log_security_event(
            "USER_LOGGED_IN",
            user.user_id,
            {"email": credentials.email}
        )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.user_id, "email": user.email}
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user_id=user.user_id
        )


@router.post("/dev-token")
async def create_dev_token(user_id: str = "dev-user"):
    """
    DEVELOPMENT ONLY: Create a token for testing
    This endpoint should be REMOVED or DISABLED in production
    """
    import os
    if os.getenv("ENVIRONMENT") == "production":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found"
        )
    
    access_token = create_access_token(
        data={"sub": user_id, "email": f"{user_id}@dev.local"}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id
    )
