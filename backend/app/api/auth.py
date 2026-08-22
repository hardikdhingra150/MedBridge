from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.auth import get_current_user
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
)
from app.services.audit_service import add_audit_event


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


def authentication_response(user: User, token: str) -> dict:
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post(
    "/register",
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = str(payload.email).strip().lower()
    if db.query(User.id).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=payload.name,
        email=email,
        password_hash=hash_password(payload.password),
        role="DOCTOR",
        is_active=True,
    )
    db.add(user)
    try:
        db.flush()
        add_audit_event(
            db,
            action="ACCOUNT_REGISTERED",
            entity_type="USER",
            entity_id=str(user.id),
            actor=user.email,
            details={"role": user.role},
        )
        token = create_access_token(str(user.id), user.role)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    return authentication_response(user, token)


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(payload.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        add_audit_event(
            db,
            action="LOGIN_FAILED",
            entity_type="AUTH_SESSION",
            entity_id=email,
            actor=email,
            details="Invalid email or password",
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        add_audit_event(
            db,
            action="LOGIN_FAILED",
            entity_type="AUTH_SESSION",
            entity_id=str(user.id),
            actor=user.email,
            details="Account disabled",
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled",
        )

    token = create_access_token(str(user.id), user.role)
    add_audit_event(
        db,
        action="LOGIN",
        entity_type="AUTH_SESSION",
        entity_id=str(user.id),
        actor=user.email,
        details={"role": user.role},
    )
    db.commit()
    return authentication_response(user, token)


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.post("/logout")
def logout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    add_audit_event(
        db,
        action="LOGOUT",
        entity_type="AUTH_SESSION",
        entity_id=str(current_user.id),
        actor=current_user.email,
    )
    db.commit()
    return {"message": "Signed out"}
