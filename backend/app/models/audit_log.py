import uuid

from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.database.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    action = Column(
        String,
        nullable=False,
    )

    entity_type = Column(
        String,
        nullable=False,
    )

    entity_id = Column(
        String,
        nullable=False,
    )

    actor = Column(
        String,
        nullable=False,
    )

    details = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )