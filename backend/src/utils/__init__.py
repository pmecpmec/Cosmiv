"""
Utility modules for Cosmiv backend
"""

from .errors import (
    CosmivError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    InternalServerError,
    ServiceUnavailableError,
    handle_exception,
    format_error_response,
)

from .responses import (
    success_response,
    error_response,
    paginated_response,
    created_response,
    no_content_response,
)

__all__ = [
    # Errors
    "CosmivError",
    "ValidationError",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "ConflictError",
    "RateLimitError",
    "InternalServerError",
    "ServiceUnavailableError",
    "handle_exception",
    "format_error_response",
    # Responses
    "success_response",
    "error_response",
    "paginated_response",
    "created_response",
    "no_content_response",
]

