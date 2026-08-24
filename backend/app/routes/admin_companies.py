"""Super-admin companies router.

Handles creating and listing companies for the Wakeeli owner portal.
Also provides portal admin endpoints: pre-approved emails, client-roles.
"""

import re
import secrets
import hashlib
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext
from app.database import get_db, engine
from app.models import Company, User
from app.auth.supabase_jwt import get_portal_user, AuthenticatedUser

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _normalize(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _hash(password: str) -> str:
    return pwd_context.hash(_normalize(password))


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


class CompanyCreate(BaseModel):
    name: str
    agency_name: str = ""
    whatsapp: str = ""
    email: str
    plan_tier: str = "starter"
    agent_count: int = 1


class CompanyResponse(BaseModel):
    id: int
    name: str
    agency_name: str | None
    whatsapp_number: str | None
    contact_email: str | None
    plan_tier: str
    agent_count: int
    slug: str
    status: str


@router.post("/companies")
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    """Create a new company and generate admin credentials for it."""
    base_slug = _slug(payload.name)
    slug = base_slug

    # Ensure slug is unique
    counter = 1
    while db.query(Company).filter(Company.slug == slug).first():
        slug = f"{base_slug}_{counter}"
        counter += 1

    company = Company(
        name=payload.name,
        agency_name=payload.agency_name or None,
        whatsapp_number=payload.whatsapp or None,
        contact_email=payload.email,
        plan_tier=payload.plan_tier,
        agent_count=payload.agent_count,
        slug=slug,
        status="active",
    )
    db.add(company)
    db.flush()  # get company.id before commit

    plain_password = secrets.token_urlsafe(9)
    username = f"Admin_{slug}"

    # Ensure username is unique
    u_counter = 1
    base_username = username
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}_{u_counter}"
        u_counter += 1

    user = User(
        username=username,
        email=payload.email or None,
        hashed_password=_hash(plain_password),
        role="admin",
        is_active=True,
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    db.refresh(company)

    return {
        "company_id": company.id,
        "username": username,
        "password": plain_password,
    }


@router.get("/companies")
def list_companies(db: Session = Depends(get_db)):
    """Return all companies."""
    companies = db.query(Company).order_by(Company.created_at.desc()).all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "agency_name": c.agency_name or "",
            "whatsapp_number": c.whatsapp_number or "",
            "contact_email": c.contact_email or "",
            "plan_tier": c.plan_tier,
            "agent_count": c.agent_count,
            "slug": c.slug,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else "",
        }
        for c in companies
    ]


# ---------------------------------------------------------------------------
# Portal admin endpoints (Supabase JWT auth required)
# ---------------------------------------------------------------------------

def _require_admin(user: AuthenticatedUser) -> None:
    """Verify the authenticated user has admin role in wakeeli_user_roles."""
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT role FROM wakeeli_user_roles WHERE user_id = :uid"),
            {"uid": user.user_id},
        ).fetchone()
    if not result or result[0] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


class PreApprovalCreate(BaseModel):
    email: str
    role: str = "client"
    client_ids: List[str] = []


@router.get("/pre-approved-emails")
async def list_pre_approved_emails(user: AuthenticatedUser = Depends(get_portal_user)):
    _require_admin(user)
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, email, role, client_ids, created_at FROM wakeeli_pre_approved_emails ORDER BY created_at DESC")
        ).fetchall()
    entries = [
        {
            "id": r[0],
            "email": r[1],
            "role": r[2],
            "client_ids": r[3] if r[3] else [],
            "created_at": r[4].isoformat() if r[4] else "",
        }
        for r in rows
    ]
    return {"entries": entries}


@router.post("/pre-approved-emails")
async def add_pre_approved_email(
    payload: PreApprovalCreate,
    user: AuthenticatedUser = Depends(get_portal_user),
):
    _require_admin(user)
    import json
    entry_id = str(uuid.uuid4())
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO wakeeli_pre_approved_emails (id, email, role, client_ids) "
                "VALUES (:id, :email, :role, :client_ids::jsonb)"
            ),
            {
                "id": entry_id,
                "email": payload.email,
                "role": payload.role,
                "client_ids": json.dumps(payload.client_ids),
            },
        )
    return {"id": entry_id, "email": payload.email, "role": payload.role}


@router.delete("/pre-approved-emails/{entry_id}")
async def delete_pre_approved_email(
    entry_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
):
    _require_admin(user)
    with engine.begin() as conn:
        conn.execute(
            text("DELETE FROM wakeeli_pre_approved_emails WHERE id = :id"),
            {"id": entry_id},
        )
    return {"deleted": entry_id}


class ClientRoleCreate(BaseModel):
    user_id: str
    role: str
    client_id: Optional[str] = None


@router.get("/client-roles")
async def list_client_roles(
    user_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
):
    _require_admin(user)
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, user_id, role, created_at FROM wakeeli_user_roles WHERE user_id = :uid ORDER BY created_at DESC"),
            {"uid": user_id},
        ).fetchall()
    assignments = [
        {
            "id": r[0],
            "user_id": r[1],
            "role": r[2],
            "client_id": None,
            "created_at": r[3].isoformat() if r[3] else "",
        }
        for r in rows
    ]
    return {"assignments": assignments}


@router.post("/client-roles")
async def create_client_role(
    payload: ClientRoleCreate,
    user: AuthenticatedUser = Depends(get_portal_user),
):
    _require_admin(user)
    role_id = str(uuid.uuid4())
    with engine.begin() as conn:
        conn.execute(
            text("INSERT INTO wakeeli_user_roles (id, user_id, role) VALUES (:id, :user_id, :role)"),
            {"id": role_id, "user_id": payload.user_id, "role": payload.role},
        )
    return {"id": role_id, "user_id": payload.user_id, "role": payload.role}


@router.delete("/client-roles/{assignment_id}")
async def delete_client_role(
    assignment_id: str,
    user: AuthenticatedUser = Depends(get_portal_user),
):
    _require_admin(user)
    with engine.begin() as conn:
        conn.execute(
            text("DELETE FROM wakeeli_user_roles WHERE id = :id"),
            {"id": assignment_id},
        )
    return {"deleted": assignment_id}
