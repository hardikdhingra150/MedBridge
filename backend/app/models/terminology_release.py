import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Index,
    String,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.database import Base


class TerminologyRelease(Base):
    __tablename__ = "terminology_releases"
    __table_args__ = (
        UniqueConstraint(
            "system",
            "version",
            name="uq_terminology_release_system_version",
        ),
        Index(
            "uq_terminology_release_active_system",
            "system",
            unique=True,
            postgresql_where=text("is_active"),
        ),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    system = Column(String, nullable=False, index=True)
    version = Column(String, nullable=False)
    source_name = Column(String, nullable=False)
    source_type = Column(
        String,
        nullable=False,
        default="DEMO",
    )
    source_uri = Column(String, nullable=True)
    is_active = Column(
        Boolean,
        nullable=False,
        default=False,
    )
    imported_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    imported_by = Column(String, nullable=True)
