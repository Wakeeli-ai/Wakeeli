"""
Conversation rules and client settings endpoints for the Wakeeli portal.

Conversation rules define WhatsApp routing and escalation logic scoped to
a client (keyword triggers, intent detection, time-based rules, escalation
to human agents, auto-booking, etc.).

Also exposes the general-inbound toggle, which controls whether the AI
handles all inbound WhatsApp messages for a client.

Prefix: /api/clients/{client_id}
Auth: Supabase JWT via get_portal_user
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.supabase_jwt import AuthenticatedUser, get_portal_user
from app.database import get_db
from app.models import WakeeliClient, WakeeliClientSettings, WakeeliConversationRule

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/clients", tags=["Conversation Rules"])


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class ConversationRuleCreate(BaseModel):
    name: str
    condition_type: str
    condition_value: str
    action_type: str
    action_value: Optional[str] = None
    priority: int = 0
    is_active: bool = True


class ConversationRuleUpdate(BaseModel):
    name: Optional[str] = None
    condition_type: Optional[str] = None
    condition_value: Optional[str] = None
    action_type: Optional[str] = None
    action_value: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class ActiveToggle(BaseModel):
    is_active: bool


class GeneralInboundUpdate(BaseModel):
    enabled: bool


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_client(client_id: str, user_id: str, db: Session) -> WakeeliClient:
    """Fetch a client and verify the requesting user owns it."""
    client = db.query(WakeeliClient).filter(WakeeliClient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return client


def _get_or_create_settings(client_id: str, db: Session) -> WakeeliClientSettings:
    """Return client settings row, creating it with defaults if absent."""
    settings = (
        db.query(WakeeliClientSettings)
        .filter(WakeeliClientSettings.client_id == client_id)
        .first()
    )
    if not settings:
        settings = WakeeliClientSettings(client_id=client_id, general_inbound_enabled=True)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _serialize_rule(r: WakeeliConversationRule) -> dict:
    return {
        "id": r.id,
        "client_id": r.client_id,
        "name": r.name,
        "condition_type": r.condition_type,
        "condition_value": r.condition_value,
        "action_type": r.action_type,
        "action_value": r.action_value,
        "priority": r.priority,
        "is_active": r.is_active,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


# ---------------------------------------------------------------------------
# Conversation rule endpoints
# ---------------------------------------------------------------------------

@router.get("/{client_id}/conversation-rules")
async def list_conversation_rules(
    client_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Return all conversation rules for a client, ordered by priority then name."""
    try:
        _resolve_client(client_id, user.user_id, db)
        rules = (
            db.query(WakeeliConversationRule)
            .filter(WakeeliConversationRule.client_id == client_id)
            .order_by(
                WakeeliConversationRule.priority.desc(),
                WakeeliConversationRule.name,
            )
            .all()
        )
        return [_serialize_rule(r) for r in rules]

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("list_conversation_rules failed for client %s user %s: %s", client_id, user.user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch conversation rules")


@router.post("/{client_id}/conversation-rules")
async def create_conversation_rule(
    client_id: str,
    body: ConversationRuleCreate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Create a new conversation rule for a client."""
    try:
        _resolve_client(client_id, user.user_id, db)
        rule = WakeeliConversationRule(
            client_id=client_id,
            name=body.name,
            condition_type=body.condition_type,
            condition_value=body.condition_value,
            action_type=body.action_type,
            action_value=body.action_value,
            priority=body.priority,
            is_active=body.is_active,
        )
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return _serialize_rule(rule)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("create_conversation_rule failed for client %s user %s: %s", client_id, user.user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to create conversation rule")


@router.put("/{client_id}/conversation-rules/{rule_id}")
async def update_conversation_rule(
    client_id: str,
    rule_id: str,
    body: ConversationRuleUpdate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Update an existing conversation rule."""
    try:
        _resolve_client(client_id, user.user_id, db)
        rule = (
            db.query(WakeeliConversationRule)
            .filter(
                WakeeliConversationRule.id == rule_id,
                WakeeliConversationRule.client_id == client_id,
            )
            .first()
        )
        if not rule:
            raise HTTPException(status_code=404, detail="Conversation rule not found")

        if body.name is not None:
            rule.name = body.name
        if body.condition_type is not None:
            rule.condition_type = body.condition_type
        if body.condition_value is not None:
            rule.condition_value = body.condition_value
        if body.action_type is not None:
            rule.action_type = body.action_type
        if body.action_value is not None:
            rule.action_value = body.action_value
        if body.priority is not None:
            rule.priority = body.priority
        if body.is_active is not None:
            rule.is_active = body.is_active

        db.commit()
        db.refresh(rule)
        return _serialize_rule(rule)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("update_conversation_rule failed for rule %s: %s", rule_id, exc)
        raise HTTPException(status_code=500, detail="Failed to update conversation rule")


@router.delete("/{client_id}/conversation-rules/{rule_id}")
async def delete_conversation_rule(
    client_id: str,
    rule_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Delete a conversation rule."""
    try:
        _resolve_client(client_id, user.user_id, db)
        rule = (
            db.query(WakeeliConversationRule)
            .filter(
                WakeeliConversationRule.id == rule_id,
                WakeeliConversationRule.client_id == client_id,
            )
            .first()
        )
        if not rule:
            raise HTTPException(status_code=404, detail="Conversation rule not found")

        db.delete(rule)
        db.commit()
        return {"deleted": True, "id": rule_id}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("delete_conversation_rule failed for rule %s: %s", rule_id, exc)
        raise HTTPException(status_code=500, detail="Failed to delete conversation rule")


@router.patch("/{client_id}/conversation-rules/{rule_id}/active")
async def toggle_conversation_rule_active(
    client_id: str,
    rule_id: str,
    body: ActiveToggle,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Toggle the is_active flag on a conversation rule."""
    try:
        _resolve_client(client_id, user.user_id, db)
        rule = (
            db.query(WakeeliConversationRule)
            .filter(
                WakeeliConversationRule.id == rule_id,
                WakeeliConversationRule.client_id == client_id,
            )
            .first()
        )
        if not rule:
            raise HTTPException(status_code=404, detail="Conversation rule not found")

        rule.is_active = body.is_active
        db.commit()
        db.refresh(rule)
        return _serialize_rule(rule)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("toggle_conversation_rule_active failed for rule %s: %s", rule_id, exc)
        raise HTTPException(status_code=500, detail="Failed to toggle conversation rule")


# ---------------------------------------------------------------------------
# General inbound endpoints
# ---------------------------------------------------------------------------

@router.get("/{client_id}/general-inbound")
async def get_general_inbound(
    client_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Return the general-inbound enabled state for a client. Defaults to True."""
    try:
        _resolve_client(client_id, user.user_id, db)
        settings = _get_or_create_settings(client_id, db)
        return {"enabled": settings.general_inbound_enabled}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("get_general_inbound failed for client %s: %s", client_id, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch general-inbound setting")


@router.patch("/{client_id}/general-inbound")
async def set_general_inbound(
    client_id: str,
    body: GeneralInboundUpdate,
    user: AuthenticatedUser = Depends(get_portal_user),
    db: Session = Depends(get_db),
):
    """Enable or disable general-inbound AI handling for a client."""
    try:
        _resolve_client(client_id, user.user_id, db)
        settings = _get_or_create_settings(client_id, db)
        settings.general_inbound_enabled = body.enabled
        db.commit()
        db.refresh(settings)
        return {"enabled": settings.general_inbound_enabled}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("set_general_inbound failed for client %s: %s", client_id, exc)
        raise HTTPException(status_code=500, detail="Failed to update general-inbound setting")
