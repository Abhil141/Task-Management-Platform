from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

from .deps import get_db, get_current_user
from .models import User
from .schemas import UserCreate, UserOut

# -----------------------------
# Router
# -----------------------------
router = APIRouter(prefix="/auth", tags=["Auth"])

# -----------------------------
# Security config
# -----------------------------
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "secret"          # safe default for assignment
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


# -----------------------------
# Helpers
# -----------------------------
def normalize_password(password: str) -> bytes:
    """
    bcrypt supports a maximum of 72 bytes.
    Always normalize passwords consistently.
    """
    return password.encode("utf-8")[:72]


# -----------------------------
# Register
# -----------------------------
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email.strip().lower())
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    safe_password = normalize_password(user.password)
    hashed_password = pwd.hash(safe_password)

    db_user = User(
        name=user.name.strip(),
        email=user.email.strip().lower(),
        password=hashed_password,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"message": "User registered successfully"}


# -----------------------------
# Login
# -----------------------------
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # OAuth2PasswordRequestForm uses "username"
    email = form_data.username.strip().lower()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    safe_password = normalize_password(form_data.password)

    if not pwd.verify(safe_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# -----------------------------
# Current user
# -----------------------------
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
