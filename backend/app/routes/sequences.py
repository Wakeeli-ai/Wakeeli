"""
Sequences endpoints for the Wakeeli portal.

All routes are scoped to a specific client_id and require Supabase JWT auth.
The authenticated user must own the client record (wakeeli_clients.user_id match).

Sequences always include their steps in list/get responses so the frontend
can render a full sequence card in a single request.
"""
import uuid as _uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.supabase_jwt import AuthenticatedUser, get_portal_user
from app.database import get_db
from app.models import WakeeliClient, WakeeliSequence, WakeeliSequenceStep

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Sequences"])


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _resolve_client(client_id: str, user: AuthenticatedUser, db: Session) -> WakeeliClient:
    client = db.query(WakeeliClient).filter(WakeeliClient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    if client.user_id != user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return client


def _resolve_sequence(sequence_id: str, client_id: str, db: Session) -> WakeeliSequence:
    seq = (
        db.query(WakeeliSequence)
        .filter(
            WakeeliSequence.id == sequence_id,
            WakeeliSequence.client_id == client_id,
        )
        .first()
    )
    if not seq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sequence not found")
    return seq


def _step_dict(s: WakeeliSequenceStep) -> dict:
    return {
        "id": s.id,
        "sequence_id": s.sequence_id,
        "step_number": s.step_number,
        "delay_days": s.delay_days,
        "message": s.message,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


def _sequence_dict(seq: WakeeliSequence) -> dict:
    return {
        "id": seq.id,
        "client_id": seq.client_id,
        "name": seq.name,
        "trigger_type": seq.trigger_type,
        "is_active": seq.is_active,
        "created_at": seq.created_at.isoformat() if seq.created_at else None,
        "updated_at": seq.updated_at.isoformat() if seq.updated_at else None,
        "steps": [_step_dict(s) for s in seq.steps],
    }


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class SequenceCreate(BaseModel):
    name: str
    trigger_type: str
    is_active: bool = True


class SequenceUpdate(BaseModel):
    name: Optional[str] = None
    trigger_type: Optional[str] = None
    is_active: Optional[bool] = None


class StepCreate(BaseModel):
    step_number: int
    delay_days: int
    message: str


class StepUpdate(BaseModel):
    step_number: Optional[int] = None
    delay_days: Optional[int] = None
    message: Optional[str] = None


# ---------------------------------------------------------------------------
# Sequence routes
# ---------------------------------------------------------------------------

@router.get("/api/clients/{client_id}/sequences")
async def list_sequences(
    client_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Return all sequences (with steps) for the authenticated user's client."""
    _resolve_client(client_id, user, db)
    sequences = (
        db.query(WakeeliSequence)
        .filter(WakeeliSequence.client_id == client_id)
        .order_by(WakeeliSequence.created_at)
        .all()
    )
    return [_sequence_dict(seq) for seq in sequences]


@router.post("/api/clients/{client_id}/sequences", status_code=status.HTTP_201_CREATED)
async def create_sequence(
    client_id: str,
    body: SequenceCreate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Create a new sequence for the client."""
    _resolve_client(client_id, user, db)
    seq = WakeeliSequence(
        id=str(_uuid.uuid4()),
        client_id=client_id,
        name=body.name,
        trigger_type=body.trigger_type,
        is_active=body.is_active,
    )
    db.add(seq)
    db.commit()
    db.refresh(seq)
    return _sequence_dict(seq)


@router.put("/api/clients/{client_id}/sequences/{sequence_id}")
async def update_sequence(
    client_id: str,
    sequence_id: str,
    body: SequenceUpdate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Update sequence metadata. Only provided fields are changed."""
    _resolve_client(client_id, user, db)
    seq = _resolve_sequence(sequence_id, client_id, db)

    if body.name is not None:
        seq.name = body.name
    if body.trigger_type is not None:
        seq.trigger_type = body.trigger_type
    if body.is_active is not None:
        seq.is_active = body.is_active

    db.commit()
    db.refresh(seq)
    return _sequence_dict(seq)


@router.delete("/api/clients/{client_id}/sequences/{sequence_id}")
async def delete_sequence(
    client_id: str,
    sequence_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Delete a sequence and all its steps (cascade). Returns JSON for frontend compatibility."""
    _resolve_client(client_id, user, db)
    seq = _resolve_sequence(sequence_id, client_id, db)
    db.delete(seq)
    db.commit()
    return {"deleted": True, "id": sequence_id}


# ---------------------------------------------------------------------------
# Step routes
# ---------------------------------------------------------------------------

@router.post(
    "/api/clients/{client_id}/sequences/{sequence_id}/steps",
    status_code=status.HTTP_201_CREATED,
)
async def add_sequence_step(
    client_id: str,
    sequence_id: str,
    body: StepCreate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Append a step to an existing sequence."""
    _resolve_client(client_id, user, db)
    _resolve_sequence(sequence_id, client_id, db)

    step = WakeeliSequenceStep(
        id=str(_uuid.uuid4()),
        sequence_id=sequence_id,
        step_number=body.step_number,
        delay_days=body.delay_days,
        message=body.message,
    )
    db.add(step)
    db.commit()
    db.refresh(step)
    return _step_dict(step)


@router.put("/api/clients/{client_id}/sequences/{sequence_id}/steps/{step_id}")
async def update_sequence_step(
    client_id: str,
    sequence_id: str,
    step_id: str,
    body: StepUpdate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Update a step's fields. Only provided fields are changed."""
    _resolve_client(client_id, user, db)
    _resolve_sequence(sequence_id, client_id, db)

    step = (
        db.query(WakeeliSequenceStep)
        .filter(
            WakeeliSequenceStep.id == step_id,
            WakeeliSequenceStep.sequence_id == sequence_id,
        )
        .first()
    )
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")

    if body.step_number is not None:
        step.step_number = body.step_number
    if body.delay_days is not None:
        step.delay_days = body.delay_days
    if body.message is not None:
        step.message = body.message

    db.commit()
    db.refresh(step)
    return _step_dict(step)


@router.delete("/api/clients/{client_id}/sequences/{sequence_id}/steps/{step_id}")
async def delete_sequence_step(
    client_id: str,
    sequence_id: str,
    step_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Delete a single step. Returns JSON for frontend compatibility."""
    _resolve_client(client_id, user, db)
    _resolve_sequence(sequence_id, client_id, db)

    step = (
        db.query(WakeeliSequenceStep)
        .filter(
            WakeeliSequenceStep.id == step_id,
            WakeeliSequenceStep.sequence_id == sequence_id,
        )
        .first()
    )
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")

    db.delete(step)
    db.commit()
    return {"deleted": True, "id": step_id}
