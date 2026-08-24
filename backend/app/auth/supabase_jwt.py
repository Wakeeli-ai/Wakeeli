"""
Supabase JWT validator for the Wakeeli portal.

Validates access tokens issued by the Wakeeli Supabase project via the
GoTrue HTTP endpoint (same pattern used across the ScaleSet ecosystem).
No local JWT parsing: the token is sent to Supabase and the user record
is returned if valid.
"""
import logging
from dataclasses import dataclass

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

SUPABASE_URL = "https://erwnfkxmderzivcrgkhy.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyd25ma3htZGVyeml2Y3Jna2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTcyMDIsImV4cCI6MjA5NTQzMzIwMn0"
    ".vzkJZMAesVsPGOdK445bJlzcitWsh6-M3bJiPHZbKSc"
)

_bearer_scheme = HTTPBearer(auto_error=True)


@dataclass
class AuthenticatedUser:
    """Represents a verified Supabase user."""
    user_id: str
    email: str
    role: str


async def validate_supabase_token(token: str) -> AuthenticatedUser:
    """
    Call Supabase GoTrue /auth/v1/user with the Bearer token.
    Returns an AuthenticatedUser on success, raises HTTP 401 on failure.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY,
                },
            )
    except httpx.RequestError as exc:
        logger.error("Supabase GoTrue request failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service unreachable",
        )

    if response.status_code == 401:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if response.status_code != 200:
        logger.error("Supabase GoTrue returned %s: %s", response.status_code, response.text)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

    data = response.json()
    user_id: str | None = data.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str = data.get("email") or ""
    app_metadata: dict = data.get("app_metadata") or {}
    user_metadata: dict = data.get("user_metadata") or {}

    # Role is stored in app_metadata (set server-side) with user_metadata as fallback
    role: str = (
        app_metadata.get("role")
        or user_metadata.get("role")
        or "client"
    )

    return AuthenticatedUser(user_id=user_id, email=email, role=role)


async def get_portal_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> AuthenticatedUser:
    """
    FastAPI dependency: extracts the Bearer token from the Authorization header
    and validates it against Supabase GoTrue.

    Usage:
        @router.get("/protected")
        async def my_route(user: AuthenticatedUser = Depends(get_portal_user)):
            ...
    """
    return await validate_supabase_token(credentials.credentials)
