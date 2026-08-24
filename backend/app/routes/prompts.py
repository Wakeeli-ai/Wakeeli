"""
Prompt management endpoints for the Wakeeli portal.

Prompts are AI message templates (qualification, greeting, followup, etc.)
owned by a portal user and optionally scoped to a client. Shared prompts
are visible to all authenticated users.

Prefix: /api/prompts
Auth: Supabase JWT via get_portal_user
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.supabase_jwt import AuthenticatedUser, get_portal_user
from app.database import get_db
from app.models import WakeeliClient, WakeeliPrompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/prompts", tags=["Prompts"])


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class PromptCreate(BaseModel):
    name: str
    type: str
    content: str
    is_shared: bool = False
    client_id: Optional[str] = None


class PromptUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    content: Optional[str] = None
    is_shared: Optional[bool] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_user_client(user_id: str, db: Session) -> Optional[WakeeliClient]:
    return (
        db.query(WakeeliClient)
        .filter(WakeeliClient.user_id == user_id)
        .first()
    )


def _serialize_prompt(p: WakeeliPrompt) -> dict:
    return {
        "id": p.id,
        "client_id": p.client_id,
        "user_id": p.user_id,
        "name": p.name,
        "type": p.type,
        "content": p.content,
        "is_shared": p.is_shared,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("")
async def list_prompts(
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """
    Return prompts visible to the authenticated user.
    Includes prompts the user owns (any client_id) plus all shared prompts.
    """
    try:
        client = _get_user_client(user.user_id, db)
        client_id = client.id if client else None

        query = db.query(WakeeliPrompt)

        if client_id:
            query = query.filter(
                (WakeeliPrompt.user_id == user.user_id)
                | (WakeeliPrompt.is_shared == True)  # noqa: E712
            )
        else:
            query = query.filter(
                (WakeeliPrompt.user_id == user.user_id)
                | (WakeeliPrompt.is_shared == True)  # noqa: E712
            )

        prompts = query.order_by(WakeeliPrompt.created_at.desc()).all()
        return [_serialize_prompt(p) for p in prompts]

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("list_prompts failed for user %s: %s", user.user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch prompts")


@router.post("")
async def create_prompt(
    body: PromptCreate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """
    Create a new prompt. If client_id is omitted, it is inferred from
    the authenticated user's client record (nullable if user has no client yet).
    """
    try:
        client_id = body.client_id

        if client_id:
            client = (
                db.query(WakeeliClient)
                .filter(WakeeliClient.id == client_id)
                .first()
            )
            if not client:
                raise HTTPException(status_code=404, detail="Client not found")
            if client.user_id != user.user_id:
                raise HTTPException(status_code=403, detail="Not your client")
        else:
            client = _get_user_client(user.user_id, db)
            client_id = client.id if client else None

        prompt = WakeeliPrompt(
            client_id=client_id,
            user_id=user.user_id,
            name=body.name,
            type=body.type,
            content=body.content,
            is_shared=body.is_shared,
        )
        db.add(prompt)
        db.commit()
        db.refresh(prompt)
        return _serialize_prompt(prompt)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("create_prompt failed for user %s: %s", user.user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to create prompt")


@router.put("/{prompt_id}")
async def update_prompt(
    prompt_id: str,
    body: PromptUpdate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Update a prompt. Only the prompt owner may update it."""
    try:
        prompt = (
            db.query(WakeeliPrompt)
            .filter(WakeeliPrompt.id == prompt_id)
            .first()
        )
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")
        if prompt.user_id != user.user_id:
            raise HTTPException(status_code=403, detail="Not your prompt")

        if body.name is not None:
            prompt.name = body.name
        if body.type is not None:
            prompt.type = body.type
        if body.content is not None:
            prompt.content = body.content
        if body.is_shared is not None:
            prompt.is_shared = body.is_shared

        db.commit()
        db.refresh(prompt)
        return _serialize_prompt(prompt)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("update_prompt failed for user %s prompt %s: %s", user.user_id, prompt_id, exc)
        raise HTTPException(status_code=500, detail="Failed to update prompt")


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Delete a prompt. Only the prompt owner may delete it."""
    try:
        prompt = (
            db.query(WakeeliPrompt)
            .filter(WakeeliPrompt.id == prompt_id)
            .first()
        )
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")
        if prompt.user_id != user.user_id:
            raise HTTPException(status_code=403, detail="Not your prompt")

        db.delete(prompt)
        db.commit()
        return {"deleted": True, "id": prompt_id}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("delete_prompt failed for user %s prompt %s: %s", user.user_id, prompt_id, exc)
        raise HTTPException(status_code=500, detail="Failed to delete prompt")
