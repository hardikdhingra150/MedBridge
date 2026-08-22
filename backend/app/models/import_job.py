import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.database import Base


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    release_id = Column(
        UUID(as_uuid=True),
        ForeignKey("terminology_releases.id"),
        nullable=True,
        index=True,
    )
    terminology_system = Column(String, nullable=False)
    version = Column(String, nullable=False)
    source_name = Column(String, nullable=False)
    imported_by = Column(String, nullable=True)
    status = Column(
        String,
        nullable=False,
        default="PENDING",
    )
    total_rows = Column(Integer, nullable=False, default=0)
    imported_rows = Column(Integer, nullable=False, default=0)
    rejected_rows = Column(Integer, nullable=False, default=0)
    error_report = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
