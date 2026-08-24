"""
Triggers endpoints for the Wakeeli portal.

All routes are scoped to a specific client_id and require Supabase JWT auth.
The authenticated user must own the client record (wakeeli_clients.user_id match).
"""
import uuid as _uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.supabase_jwt import AuthenticatedUser, get_portal_user
from app.database import get_db
from app.models import WakeeliClient, WakeeliTrigger

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Triggers"])


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _resolve_client(client_id: str, user: AuthenticatedUser, db: Session) -> WakeeliClient:
    """Return the WakeeliClient if it exists and belongs to the requesting user."""
    client = db.query(WakeeliClient).filter(WakeeliClient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    if client.user_id != user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return client


def _trigger_dict(t: WakeeliTrigger) -> dict:
    return {
        "id": t.id,
        "client_id": t.client_id,
        "keyword": t.keyword,
        "opt_in": t.opt_in,
        "message": t.message,
        "is_active": t.is_active,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
    }


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class TriggerCreate(BaseModel):
    keyword: str
    opt_in: str
    message: str
    is_active: bool = True


class TriggerUpdate(BaseModel):
    keyword: Optional[str] = None
    opt_in: Optional[str] = None
    message: Optional[str] = None
    is_active: Optional[bool] = None


class ToggleActiveBody(BaseModel):
    is_active: bool


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/api/clients/{client_id}/triggers")
async def list_triggers(
    client_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Return all triggers for the authenticated user's client."""
    _resolve_client(client_id, user, db)
    triggers = (
        db.query(WakeeliTrigger)
        .filter(WakeeliTrigger.client_id == client_id)
        .order_by(WakeeliTrigger.created_at)
        .all()
    )
    return [_trigger_dict(t) for t in triggers]


@router.post("/api/clients/{client_id}/triggers", status_code=status.HTTP_201_CREATED)
async def create_trigger(
    client_id: str,
    body: TriggerCreate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Create a new trigger for the client."""
    _resolve_client(client_id, user, db)
    trigger = WakeeliTrigger(
        id=str(_uuid.uuid4()),
        client_id=client_id,
        keyword=body.keyword,
        opt_in=body.opt_in,
        message=body.message,
        is_active=body.is_active,
    )
    db.add(trigger)
    db.commit()
    db.refresh(trigger)
    return _trigger_dict(trigger)


@router.put("/api/clients/{client_id}/triggers/{trigger_id}")
async def update_trigger(
    client_id: str,
    trigger_id: str,
    body: TriggerUpdate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Replace trigger fields. Only provided fields are updated."""
    _resolve_client(client_id, user, db)
    trigger = (
        db.query(WakeeliTrigger)
        .filter(
            WakeeliTrigger.id == trigger_id,
            WakeeliTrigger.client_id == client_id,
        )
        .first()
    )
    if not trigger:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trigger not found")

    if body.keyword is not None:
        trigger.keyword = body.keyword
    if body.opt_in is not None:
        trigger.opt_in = body.opt_in
    if body.message is not None:
        trigger.message = body.message
    if body.is_active is not None:
        trigger.is_active = body.is_active

    db.commit()
    db.refresh(trigger)
    return _trigger_dict(trigger)


@router.delete("/api/clients/{client_id}/triggers/{trigger_id}")
async def delete_trigger(
    client_id: str,
    trigger_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Delete a trigger. Returns JSON so the frontend client.delete() call succeeds."""
    _resolve_client(client_id, user, db)
    trigger = (
        db.query(WakeeliTrigger)
        .filter(
            WakeeliTrigger.id == trigger_id,
            WakeeliTrigger.client_id == client_id,
        )
        .first()
    )
    if not trigger:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trigger not found")
    db.delete(trigger)
    db.commit()
    return {"deleted": True, "id": trigger_id}


@router.patch("/api/clients/{client_id}/triggers/{trigger_id}/active")
async def toggle_trigger_active(
    client_id: str,
    trigger_id: str,
    body: ToggleActiveBody,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Toggle the is_active flag on a trigger."""
    _resolve_client(client_id, user, db)
    trigger = (
        db.query(WakeeliTrigger)
        .filter(
            WakeeliTrigger.id == trigger_id,
            WakeeliTrigger.client_id == client_id,
        )
        .first()
    )
    if not trigger:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trigger not found")
    trigger.is_active = body.is_active
    db.commit()
    db.refresh(trigger)
    return _trigger_dict(trigger)


@router.post(
    "/api/clients/{client_id}/triggers/{trigger_id}/duplicate",
    status_code=status.HTTP_201_CREATED,
)
async def duplicate_trigger(
    client_id: str,
    trigger_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Create a copy of an existing trigger. The copy starts as inactive."""
    _resolve_client(client_id, user, db)
    original = (
        db.query(WakeeliTrigger)
        .filter(
            WakeeliTrigger.id == trigger_id,
            WakeeliTrigger.client_id == client_id,
        )
        .first()
    )
    if not original:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trigger not found")

    copy = WakeeliTrigger(
        id=str(_uuid.uuid4()),
        client_id=client_id,
        keyword=original.keyword + " (copy)",
        opt_in=original.opt_in,
        message=original.message,
        is_active=False,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return _trigger_dict(copy)
