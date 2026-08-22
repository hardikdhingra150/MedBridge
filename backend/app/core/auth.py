import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.database import get_db
from app.models.user import User


bearer_scheme = HTTPBearer(auto_error=False)


def authentication_error(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise authentication_error("Authentication required")

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise authentication_error("Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise authentication_error("Invalid token")

    try:
        parsed_user_id = uuid.UUID(user_id)
    except (TypeError, ValueError):
        raise authentication_error("Invalid token")

    user = (
        db.query(User)
        .filter(User.id == parsed_user_id)
        .first()
    )
    if not user:
        raise authentication_error("User not found")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled",
        )

    return user


def require_roles(*allowed_roles: str):
    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission to perform "
                    "this action"
                ),
            )
        return current_user

    return role_checker
