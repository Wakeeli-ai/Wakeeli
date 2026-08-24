"""
Portal user roles and client routes.

These endpoints are consumed exclusively by the wakeeli-portal frontend.
Authentication is via Supabase JWT validated through GoTrue (not the legacy
local-password JWT used by the agency admin dashboard).

Prefix: /api/me
"""
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.supabase_jwt import AuthenticatedUser, get_portal_user
from app.database import get_db
from app.models import WakeeliClient, WakeeliUserRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/me", tags=["Portal User"])


@router.get("/roles")
async def get_my_roles(
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """
    Return the authenticated user's roles and client onboarding status.

    Response shape (mirrors the ai-dm-setter reference implementation):
    {
        user_id:              str,
        email:                str,
        role:                 str,           # from Supabase app_metadata
        global_roles:         list[str],     # rows from wakeeli_user_roles
        client_assignments:   list,          # always [] for Wakeeli (no multi-client model)
        client_approved:      bool | None,   # null for staff roles
        intake_completion_pct: int | None,   # null for staff roles
    }
    """
    try:
        role_rows = (
            db.query(WakeeliUserRole)
            .filter(WakeeliUserRole.user_id == user.user_id)
            .all()
        )
        global_roles = [r.role for r in role_rows]

        staff_roles = {"admin", "setter", "editor"}
        is_staff = (
            user.role in staff_roles
            or bool(staff_roles.intersection(global_roles))
        )

        client_approved = None
        intake_completion_pct = None

        if not is_staff:
            client = (
                db.query(WakeeliClient)
                .filter(WakeeliClient.user_id == user.user_id)
                .first()
            )
            if client:
                client_approved = client.approved
                intake_completion_pct = client.intake_completion_pct

        return {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "global_roles": global_roles,
            "client_assignments": [],
            "client_approved": client_approved,
            "intake_completion_pct": intake_completion_pct,
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("get_my_roles failed for user %s: %s", user.user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch user roles")


@router.get("/client")
async def get_my_client(
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """
    Return the WakeeliClient record owned by the authenticated user.

    Returns 404 when no client record exists yet (user has not started
    or completed onboarding intake).
    """
    try:
        client = (
            db.query(WakeeliClient)
            .filter(WakeeliClient.user_id == user.user_id)
            .first()
        )
        if not client:
            raise HTTPException(
                status_code=404,
                detail="No client record found for this user",
            )

        return {
            "id": client.id,
            "user_id": client.user_id,
            "brand_name": client.brand_name,
            "approved": client.approved,
            "intake_completion_pct": client.intake_completion_pct,
            "created_at": client.created_at.isoformat() if client.created_at else None,
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("get_my_client failed for user %s: %s", user.user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch client record")


@router.get("/clients")
async def get_accessible_clients(
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """
    Return list of clients accessible to this user.
    For setters/editors: returns assigned clients.
    For admins: returns all clients.
    For regular clients: returns their own client record.
    """
    try:
        role_rows = (
            db.query(WakeeliUserRole)
            .filter(WakeeliUserRole.user_id == user.user_id)
            .all()
        )
        global_roles = [r.role for r in role_rows]
        is_admin = "admin" in global_roles or user.role == "admin"

        if is_admin:
            clients = db.query(WakeeliClient).all()
        else:
            client = (
                db.query(WakeeliClient)
                .filter(WakeeliClient.user_id == user.user_id)
                .first()
            )
            clients = [client] if client else []

        return {
            "clients": [
                {
                    "id": c.id,
                    "user_id": c.user_id,
                    "brand_name": c.brand_name,
                    "approved": c.approved,
                    "intake_completion_pct": c.intake_completion_pct,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                }
                for c in clients
            ]
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("get_accessible_clients failed for user %s: %s", user.user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch clients")
