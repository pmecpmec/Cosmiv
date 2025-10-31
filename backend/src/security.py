"""
Security utilities for AIDIT application
Handles authentication, input validation, and security helpers
"""
import os
import re
from pathlib import Path
from typing import Optional
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Header, status
from jose import JWTError, jwt
import logging

# Security logger
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60 * 24  # 24 hours

if not JWT_SECRET_KEY:
    # For development only - generate a warning
    JWT_SECRET_KEY = "INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION"
    security_logger.warning("JWT_SECRET_KEY not set! Using insecure default for development.")

# File upload constraints
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
MAX_TOTAL_UPLOAD_SIZE = 2 * 1024 * 1024 * 1024  # 2GB
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v'}
ALLOWED_MIME_TYPES = {
    'video/mp4', 'video/quicktime', 'video/x-matroska',
    'video/webm', 'video/avi', 'video/x-m4v', 'video/x-msvideo'
}


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Payload data (should include 'sub' for user_id)
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


async def verify_token(authorization: str = Header(None, alias="Authorization")) -> str:
    """
    Verify JWT token and extract user_id
    
    Args:
        authorization: Authorization header with Bearer token
        
    Returns:
        user_id from token payload
        
    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing user identifier"
            )
        return user_id
    except JWTError as e:
        security_logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


async def optional_verify_token(authorization: str = Header(None, alias="Authorization")) -> Optional[str]:
    """
    Optional token verification - returns None if no token provided
    Useful for endpoints that work both authenticated and unauthenticated
    """
    if not authorization:
        return None
    try:
        return await verify_token(authorization)
    except HTTPException:
        return None


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and other attacks
    
    Args:
        filename: Original filename from upload
        
    Returns:
        Sanitized filename safe for filesystem operations
        
    Raises:
        ValueError: If filename is invalid or empty after sanitization
    """
    if not filename:
        raise ValueError("Filename cannot be empty")
    
    # Remove any path components (prevent directory traversal)
    filename = os.path.basename(filename)
    
    # Remove or replace dangerous characters
    # Allow: alphanumeric, spaces, dots, hyphens, underscores
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # Remove leading/trailing whitespace and dots
    filename = filename.strip('. ')
    
    # Limit length to prevent filesystem issues
    filename = filename[:255]
    
    # Ensure we still have a valid filename
    if not filename or filename == '.':
        raise ValueError("Invalid filename after sanitization")
    
    # Ensure it has an extension
    if '.' not in filename:
        raise ValueError("Filename must have an extension")
    
    return filename


def validate_file_path(path: str, allowed_dir: str) -> str:
    """
    Validate that a file path is within an allowed directory
    Prevents path traversal attacks
    
    Args:
        path: File path to validate
        allowed_dir: Directory that path must be within
        
    Returns:
        Absolute path if valid
        
    Raises:
        ValueError: If path is outside allowed directory
    """
    abs_path = os.path.abspath(path)
    abs_allowed = os.path.abspath(allowed_dir)
    
    if not abs_path.startswith(abs_allowed):
        security_logger.warning(
            f"Path traversal attempt detected: {path} outside {allowed_dir}"
        )
        raise ValueError("Path traversal attempt detected")
    
    return abs_path


def validate_video_file(filename: str, content_type: Optional[str] = None) -> None:
    """
    Validate video file extension and content type
    
    Args:
        filename: Name of the file
        content_type: MIME type of the file
        
    Raises:
        HTTPException: If file type is not allowed
    """
    # Check extension
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension: {ext}. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
    
    # Check MIME type if provided
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {content_type}"
        )


def sanitize_ffmpeg_text(text: str) -> str:
    """
    Sanitize text for use in FFmpeg drawtext filter
    Prevents command injection through text parameters
    
    Args:
        text: Text to sanitize
        
    Returns:
        Sanitized text safe for FFmpeg
    """
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    text = text.replace("'", "").replace('"', '').replace('\\', '')
    text = text.replace('`', '').replace('$', '').replace(';', '')
    
    # Escape FFmpeg special characters
    text = text.replace(':', '\\:').replace(',', '\\,')
    
    # Limit length
    text = text[:100]
    
    return text


def log_security_event(event_type: str, user_id: Optional[str], details: dict) -> None:
    """
    Log security-relevant events for audit trail
    
    Args:
        event_type: Type of security event (e.g., "AUTH_FAILURE", "ACCOUNT_LINK")
        user_id: User identifier (None for unauthenticated events)
        details: Additional event details
    """
    security_logger.info(
        f"SECURITY_EVENT: {event_type} | "
        f"user={user_id or 'anonymous'} | "
        f"timestamp={datetime.utcnow().isoformat()} | "
        f"details={details}"
    )


def validate_user_owns_resource(user_id: str, resource_user_id: str) -> None:
    """
    Validate that a user owns a resource
    
    Args:
        user_id: Authenticated user ID
        resource_user_id: User ID associated with the resource
        
    Raises:
        HTTPException: If user doesn't own the resource
    """
    if user_id != resource_user_id:
        log_security_event(
            "UNAUTHORIZED_ACCESS_ATTEMPT",
            user_id,
            {"attempted_resource_user": resource_user_id}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this resource"
        )


# Rate limiting helpers (to be used with slowapi)
def get_user_identifier(authorization: str = Header(None, alias="Authorization")) -> str:
    """
    Get user identifier for rate limiting
    Returns user_id if authenticated, otherwise 'anonymous'
    """
    try:
        if authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return payload.get("sub", "anonymous")
    except:
        pass
    return "anonymous"
