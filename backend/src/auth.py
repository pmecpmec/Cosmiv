"""
Authentication endpoints for Cosmiv
Handles user registration, login, and token management
"""

from fastapi import APIRouter, HTTPException, Depends, status, Header, Request
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import timedelta
from typing import Optional
from db import get_session
from models import User
from sqlmodel import select
from security import create_access_token, log_security_event, verify_token
import secrets
from fastapi.security import HTTPBearer
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# Rate limiter - will be set from app state after app initialization
limiter = None

def set_limiter(app_limiter):
    """Set limiter from app state"""
    global limiter
    limiter = app_limiter

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


def get_password_hash(password: str) -> str:
    """Alias for hash_password for compatibility"""
    return hash_password(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username_or_email: str, password: str) -> Optional[User]:
    """Authenticate a user by username/email and password."""
    with get_session() as session:
        # Try email first (username field may not exist)
        user = session.exec(select(User).where(User.email == username_or_email)).first()

        if not user:
            return None

        if not user.password_hash:
            return None
        if not verify_password(password, user.password_hash):
            return None

        return user


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    from security import create_access_token

    return create_access_token(data=data, expires_delta=timedelta(days=7))


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token."""
    try:
        from jose import jwt, JWTError
        import os

        secret = os.getenv("JWT_SECRET_KEY") or "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION"
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except (JWTError, Exception):
        return None


async def get_current_user(
    authorization: str = Header(None, alias="Authorization")
) -> User:
    """
    Get current authenticated user from JWT token
    Used as FastAPI dependency for protected routes
    """
    user_id = await verify_token(authorization)
    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )
        return user


async def get_current_user_optional(
    authorization: str = Header(None, alias="Authorization")
) -> Optional[User]:
    """
    Get current authenticated user if token is provided, otherwise return None
    Used for endpoints that work both authenticated and unauthenticated
    """
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the current user and verify they are an admin."""
    # Check if user has admin role (assuming User model has is_admin or role field)
    # For now, allow all authenticated users (adjust based on your User model)
    if hasattr(current_user, "is_admin") and not current_user.is_admin:
        if hasattr(current_user, "role") and current_user.role not in [
            "ADMIN",
            "OWNER",
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions - admin access required",
            )
    return current_user


def _register_wrapper(f):
    """Wrapper to apply rate limiting to register endpoint"""
    if limiter:
        return limiter.limit("5/minute")(f)
    return f

@router.post("/register", response_model=Token)
@_register_wrapper
async def register(request: Request, user_data: UserRegister):
    """
    Register a new user - Rate limited to 5 requests per minute

    NOTE: This is a simplified implementation for the security audit.
    In production, add:
    - Email verification
    - Password strength requirements
    - CAPTCHA for bot prevention
    """
    with get_session() as session:
        # Check if user already exists
        existing = session.exec(
            select(User).where(User.email == user_data.email)
        ).first()

        if existing:
            log_security_event(
                "REGISTRATION_ATTEMPT_DUPLICATE", None, {"email": user_data.email}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create new user
        user_id = secrets.token_urlsafe(16)
        password_hash = hash_password(user_data.password)

        new_user = User(
            user_id=user_id,
            email=user_data.email,
            password_hash=password_hash,
        )
        session.add(new_user)
        session.commit()

        log_security_event("USER_REGISTERED", user_id, {"email": user_data.email})

        # Create access token
        access_token = create_access_token(
            data={"sub": user_id, "email": user_data.email}
        )

        return Token(access_token=access_token, token_type="bearer", user_id=user_id)


def _login_wrapper(f):
    """Wrapper to apply rate limiting to login endpoint"""
    if limiter:
        return limiter.limit("10/minute")(f)
    return f

@router.post("/login", response_model=Token)
@_login_wrapper
async def login(request: Request, credentials: UserLogin):
    """
    Login with email and password - Rate limited to 10 requests per minute

    NOTE: In production, add:
    - Account lockout after failed attempts
    - Two-factor authentication option
    - Login attempt logging
    """
    with get_session() as session:
        user = session.exec(select(User).where(User.email == credentials.email)).first()

        if not user:
            log_security_event(
                "LOGIN_FAILED_USER_NOT_FOUND", None, {"email": credentials.email}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        # Verify password
        if not user.password_hash or not verify_password(
            credentials.password, user.password_hash
        ):
            log_security_event(
                "LOGIN_FAILED_INVALID_PASSWORD",
                user.user_id,
                {"email": credentials.email},
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        log_security_event("USER_LOGGED_IN", user.user_id, {"email": credentials.email})

        access_token = create_access_token(
            data={"sub": user.user_id, "email": user.email}
        )

        return Token(
            access_token=access_token, token_type="bearer", user_id=user.user_id
        )


@router.post("/dev-token")
async def create_dev_token(user_id: str = "dev-user"):
    """
    DEVELOPMENT ONLY: Create a token for testing
    This endpoint should be REMOVED or DISABLED in production
    """
    import os

    if os.getenv("ENVIRONMENT") == "production":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    access_token = create_access_token(
        data={"sub": user_id, "email": f"{user_id}@dev.local"}
    )

    return Token(access_token=access_token, token_type="bearer", user_id=user_id)
