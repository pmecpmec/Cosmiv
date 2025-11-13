"""
Consistent API response utilities for Cosmiv
Provides standardized response formats across all endpoints
"""

from typing import Any, Dict, Optional, List
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response model"""
    
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None


class PaginatedResponse(BaseModel):
    """Paginated response model"""
    
    success: bool = True
    data: List[Any]
    pagination: Dict[str, Any]
    meta: Optional[Dict[str, Any]] = None


def success_response(
    data: Any = None,
    message: Optional[str] = None,
    status_code: int = 200,
    meta: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """
    Create a success response
    
    Args:
        data: Response data
        message: Optional success message
        status_code: HTTP status code
        meta: Optional metadata
        
    Returns:
        JSONResponse with success format
    """
    response_data = {
        "success": True,
    }
    
    if data is not None:
        response_data["data"] = data
    
    if message:
        response_data["message"] = message
    
    if meta:
        response_data["meta"] = meta
    
    return JSONResponse(content=response_data, status_code=status_code)


def error_response(
    error_code: str,
    message: str,
    status_code: int = 400,
    data: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """
    Create an error response
    
    Args:
        error_code: Machine-readable error code
        message: User-friendly error message
        status_code: HTTP status code
        data: Optional error data
        
    Returns:
        JSONResponse with error format
    """
    response_data = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
        }
    }
    
    if data:
        response_data["error"]["data"] = data
    
    return JSONResponse(content=response_data, status_code=status_code)


def paginated_response(
    items: List[Any],
    page: int,
    page_size: int,
    total: int,
    meta: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """
    Create a paginated response
    
    Args:
        items: List of items for current page
        page: Current page number (1-indexed)
        page_size: Number of items per page
        total: Total number of items
        meta: Optional metadata
        
    Returns:
        JSONResponse with paginated format
    """
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    
    response_data = {
        "success": True,
        "data": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    }
    
    if meta:
        response_data["meta"] = meta
    
    return JSONResponse(content=response_data, status_code=200)


def created_response(
    data: Any = None,
    message: Optional[str] = None,
    location: Optional[str] = None,
) -> JSONResponse:
    """
    Create a 201 Created response
    
    Args:
        data: Created resource data
        message: Optional success message
        location: Optional resource location (for Location header)
        
    Returns:
        JSONResponse with 201 status
    """
    response = success_response(data=data, message=message, status_code=201)
    
    if location:
        response.headers["Location"] = location
    
    return response


def no_content_response() -> JSONResponse:
    """
    Create a 204 No Content response
    
    Returns:
        JSONResponse with 204 status
    """
    return JSONResponse(content=None, status_code=204)

