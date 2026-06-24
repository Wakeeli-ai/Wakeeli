"""Super-admin companies router.

Handles creating and listing companies for the Wakeeli owner portal.
No auth required at route level (super-admin portal handles auth client-side).
"""

import re
import secrets
import hashlib
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import get_db
from app.models import Company, User

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
