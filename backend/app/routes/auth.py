from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse
import hashlib

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# JWT settings - Use a proper secret key (fallback to admin password for MVP)
SECRET_KEY = getattr(settings, 'JWT_SECRET_KEY', None) or settings.ADMIN_PASSWORD
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

def normalize_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(normalize_password(password))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(normalize_password(plain_password), hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class AdminUser:
    """Mock admin user object for settings-based admin login."""
    def __init__(self):
        self.id = 0
        self.username = settings.ADMIN_USERNAME
        self.email = "admin@wakeeli.com"
        self.role = "admin"
        self.is_active = True


class AgentUser:
    """Mock agent user object for built-in agent login."""
    def __init__(self):
        self.id = 1
        self.username = "Agent"
        self.email = "agent@wakeeli.com"
        self.role = "agent"
        self.is_active = True


# Built-in agent credentials
AGENT_USERNAME = "Agent"
AGENT_PASSWORD = "Agent123"


def authenticate_user(db: Session, username: str, password: str) -> User | AdminUser | AgentUser | bool:
    """Authenticate user against database or built-in credentials."""
    # Check admin credentials
    if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
        return AdminUser()

    # Check built-in agent credentials
    if username == AGENT_USERNAME and password == AGENT_PASSWORD:
        return AgentUser()

    # Then check database users
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return False

        if not user.is_active:
            return False

        if not verify_password(password, user.hashed_password):
            return False

        return user
    except Exception:
        # DB schema may be out of date, fall back to rejecting
        return False





@router.post("/signup", response_model=TokenWithUser)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        """Signup endpoint - create a new user."""
        # Check if username already exists
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists (if provided)
        if user_data.email:
            existing_email = db.query(User).filter(User.email == user_data.email).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Validate role
        role = user_data.role if user_data.role in ["admin", "agent"] else "agent"
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            role=role,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Generate token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.username, "role": db_user.role}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": UserResponse(
                id=db_user.id,
                username=db_user.username,
                email=db_user.email,
                role=db_user.role,
                is_active=db_user.is_active
            )
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



@router.post("/login", response_model=TokenWithUser)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login endpoint."""
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role,
                is_active=user.is_active
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login error: {type(e).__name__}: {str(e)}")



@router.get("/me", response_model=UserResponse)
async def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user info."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Check built-in users
        if username == settings.ADMIN_USERNAME:
            return UserResponse(
                id=0,
                username=settings.ADMIN_USERNAME,
                email="admin@wakeeli.com",
                role="admin",
                is_active=True
            )

        if username == AGENT_USERNAME:
            return UserResponse(
                id=1,
                username=AGENT_USERNAME,
                email="agent@wakeeli.com",
                role="agent",
                is_active=True
            )

        # Otherwise, fetch from database
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            is_active=user.is_active
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
