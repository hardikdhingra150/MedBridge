from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.database.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User


router = APIRouter(prefix="/api/v1/audit", tags=["Audit"])


@router.get("")
def list_audit_events(
    action: str | None = None,
    actor: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("DOCTOR", "EXPERT", "ADMIN")
    ),
):
    query = db.query(AuditLog)
    if current_user.role != "ADMIN":
        query = query.filter(AuditLog.actor == current_user.email)
    elif actor:
        query = query.filter(AuditLog.actor == actor.strip().lower())

    if action:
        query = query.filter(AuditLog.action == action.strip().upper())

    total = query.count()
    events = (
        query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "events": [
            {
                "id": str(event.id),
                "action": event.action,
                "entityType": event.entity_type,
                "entityId": event.entity_id,
                "actor": event.actor,
                "details": event.details,
                "createdAt": (
                    event.created_at.isoformat()
                    if event.created_at
                    else None
                ),
            }
            for event in events
        ],
    }
