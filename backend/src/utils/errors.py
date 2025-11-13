"""
Centralized error handling utilities for Cosmiv API
Provides consistent error responses and user-friendly error messages
"""

from fastapi import HTTPException, status
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class CosmivError(HTTPException):
    """Base exception class for Cosmiv API errors"""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None,
        user_message: Optional[str] = None,
        internal_message: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None,
    ):
        """
        Create a Cosmiv API error
        
        Args:
            status_code: HTTP status code
            detail: Error detail (used as user_message if user_message not provided)
            error_code: Machine-readable error code (e.g., "INVALID_CREDENTIALS")
            user_message: User-friendly error message
            internal_message: Internal error message (logged but not sent to user)
            extra_data: Additional error context
        """
        self.error_code = error_code
        self.user_message = user_message or detail
        self.internal_message = internal_message
        self.extra_data = extra_data or {}
        
        # Log internal message if provided
        if internal_message:
            logger.error(
                f"Error {error_code}: {internal_message}",
                extra={"error_code": error_code, "extra_data": extra_data}
            )
        
        super().__init__(status_code=status_code, detail=self.user_message)


class ValidationError(CosmivError):
    """Validation error (400 Bad Request)"""
    
    def __init__(
        self,
        detail: str,
        field: Optional[str] = None,
        user_message: Optional[str] = None,
        **kwargs
    ):
        error_code = f"VALIDATION_ERROR_{field.upper()}" if field else "VALIDATION_ERROR"
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code=error_code,
            user_message=user_message or f"Invalid input: {detail}",
            extra_data={"field": field} if field else {},
            **kwargs
        )


class AuthenticationError(CosmivError):
    """Authentication error (401 Unauthorized)"""
    
    def __init__(
        self,
        detail: str = "Authentication required",
        user_message: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code="AUTHENTICATION_REQUIRED",
            user_message=user_message or "Please sign in to continue",
            **kwargs
        )


class AuthorizationError(CosmivError):
    """Authorization error (403 Forbidden)"""
    
    def __init__(
        self,
        detail: str = "Insufficient permissions",
        user_message: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code="INSUFFICIENT_PERMISSIONS",
            user_message=user_message or "You don't have permission to perform this action",
            **kwargs
        )


class NotFoundError(CosmivError):
    """Resource not found error (404 Not Found)"""
    
    def __init__(
        self,
        resource_type: str = "Resource",
        resource_id: Optional[str] = None,
        user_message: Optional[str] = None,
        **kwargs
    ):
        detail = f"{resource_type} not found"
        if resource_id:
            detail = f"{resource_type} '{resource_id}' not found"
        
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code="RESOURCE_NOT_FOUND",
            user_message=user_message or detail,
            extra_data={"resource_type": resource_type, "resource_id": resource_id},
            **kwargs
        )


class ConflictError(CosmivError):
    """Resource conflict error (409 Conflict)"""
    
    def __init__(
        self,
        detail: str = "Resource conflict",
        user_message: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code="RESOURCE_CONFLICT",
            user_message=user_message or detail,
            **kwargs
        )


class RateLimitError(CosmivError):
    """Rate limit exceeded error (429 Too Many Requests)"""
    
    def __init__(
        self,
        detail: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
        user_message: Optional[str] = None,
        **kwargs
    ):
        user_msg = user_message or f"Too many requests. Please try again later."
        if retry_after:
            user_msg = f"Too many requests. Please try again in {retry_after} seconds."
        
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            error_code="RATE_LIMIT_EXCEEDED",
            user_message=user_msg,
            extra_data={"retry_after": retry_after},
            **kwargs
        )


class InternalServerError(CosmivError):
    """Internal server error (500)"""
    
    def __init__(
        self,
        detail: str = "An internal error occurred",
        internal_message: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code="INTERNAL_SERVER_ERROR",
            user_message="Something went wrong. Please try again later.",
            internal_message=internal_message or detail,
            **kwargs
        )


class ServiceUnavailableError(CosmivError):
    """Service unavailable error (503)"""
    
    def __init__(
        self,
        service: str = "Service",
        user_message: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{service} is currently unavailable",
            error_code="SERVICE_UNAVAILABLE",
            user_message=user_message or f"{service} is temporarily unavailable. Please try again later.",
            **kwargs
        )


def handle_exception(e: Exception) -> CosmivError:
    """
    Convert generic exceptions to CosmivError
    
    Args:
        e: Exception to convert
        
    Returns:
        CosmivError instance
    """
    if isinstance(e, CosmivError):
        return e
    
    # Log the original exception
    logger.exception(f"Unhandled exception: {type(e).__name__}: {str(e)}")
    
    # Convert to internal server error
    return InternalServerError(
        internal_message=f"{type(e).__name__}: {str(e)}"
    )


def format_error_response(error: CosmivError) -> Dict[str, Any]:
    """
    Format error response for API
    
    Args:
        error: CosmivError instance
        
    Returns:
        Formatted error response dictionary
    """
    response = {
        "error": {
            "code": error.error_code or "UNKNOWN_ERROR",
            "message": error.user_message,
            "status_code": error.status_code,
        }
    }
    
    # Add extra data if available
    if error.extra_data:
        response["error"]["data"] = error.extra_data
    
    return response

