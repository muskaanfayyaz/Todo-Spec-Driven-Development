"""
User API Router (Example Protected Route)

Demonstrates JWT authentication pattern for protected endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.auth import get_current_user


router = APIRouter(prefix="/api", tags=["user"])


class UserInfoResponse(BaseModel):
    """User information response schema."""

    user_id: str
    message: str


@router.get("/{user_id}/me", response_model=UserInfoResponse)
def get_user_info(
    user_id: str, authenticated_user_id: str = Depends(get_current_user)
) -> UserInfoResponse:
    """
    Get authenticated user information.

    This endpoint demonstrates the standard authentication pattern:
    1. Extract JWT token from Authorization header
    2. Verify token using get_current_user dependency
    3. Validate URL user_id matches token user_id
    4. Return user-specific data

    Security:
    - Requires valid JWT token in Authorization: Bearer <token> header
    - Enforces user_id matching between URL and token
    - Returns 401 if token is invalid/expired
    - Returns 403 if user_id mismatch (trying to access another user's data)

    Args:
        user_id: User ID from URL path (e.g., /api/user-123/me)
        authenticated_user_id: User ID extracted from JWT token (via dependency)

    Returns:
        UserInfoResponse with user_id and success message

    Raises:
        HTTPException 401: Invalid or expired token
        HTTPException 403: URL user_id doesn't match token user_id

    Example Request:
        GET /api/user-123/me
        Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

    Example Response:
        {
            "user_id": "user-123",
            "message": "Authentication successful"
        }
    """
    # CRITICAL SECURITY CHECK: Verify URL user_id matches token user_id
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot access another user's data",
        )

    # User is authenticated and authorized
    return UserInfoResponse(
        user_id=authenticated_user_id, message="Authentication successful"
    )


@router.get("/health/protected")
def protected_health_check(
    authenticated_user_id: str = Depends(get_current_user),
) -> dict:
    """
    Protected health check endpoint.

    Simpler authentication example without user_id in URL.
    Useful for verifying that JWT authentication is working.

    Security:
    - Requires valid JWT token
    - Returns 401 if token is invalid/expired

    Args:
        authenticated_user_id: User ID from JWT token

    Returns:
        Dictionary with health status and authenticated user_id

    Example Request:
        GET /api/health/protected
        Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

    Example Response:
        {
            "status": "healthy",
            "authenticated": true,
            "user_id": "user-123"
        }
    """
    return {
        "status": "healthy",
        "authenticated": True,
        "user_id": authenticated_user_id,
    }
