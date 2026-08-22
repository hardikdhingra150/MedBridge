import uuid

from sqlalchemy import (
    Column,
    String,
    Float,
    Text,
    ForeignKey,
    DateTime,
    Index,
    text,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.database.database import Base


class MappingCandidate(Base):
    __tablename__ = "mapping_candidates"
    __table_args__ = (
        Index(
            "uq_pending_mapping_candidate_pair",
            "namaste_term_id",
            "icd_term_id",
            unique=True,
            postgresql_where=text("status = 'PENDING'"),
            sqlite_where=text("status = 'PENDING'"),
        ),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    namaste_term_id = Column(
        UUID(as_uuid=True),
        ForeignKey("namaste_terms.id"),
        nullable=False,
    )

    icd_term_id = Column(
        UUID(as_uuid=True),
        ForeignKey("icd_terms.id"),
        nullable=False,
    )

    source_release_id = Column(
        UUID(as_uuid=True),
        ForeignKey("terminology_releases.id"),
        nullable=False,
        index=True,
    )

    target_release_id = Column(
        UUID(as_uuid=True),
        ForeignKey("terminology_releases.id"),
        nullable=False,
        index=True,
    )

    confidence_score = Column(
        Float,
        nullable=False,
    )

    lexical_score = Column(
        Float,
        nullable=True,
    )

    definition_score = Column(Float, nullable=True)

    algorithm_version = Column(
        String,
        nullable=False,
        default="lexical-v1",
    )

    explanation = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        default="PENDING",
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    reviewed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    reviewed_by = Column(
        String,
        nullable=True,
    )
