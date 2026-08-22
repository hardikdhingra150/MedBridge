import json

from app.models.audit_log import AuditLog


def add_audit_event(
    db,
    *,
    action: str,
    entity_type: str,
    entity_id: str,
    actor: str,
    details: dict | str | None = None,
) -> AuditLog:
    serialized = (
        json.dumps(details, ensure_ascii=False, default=str)
        if isinstance(details, dict)
        else details
    )
    event = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor=actor,
        details=serialized,
    )
    db.add(event)
    return event
