import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID

from app.database.database import Base


class ConceptMap(Base):
    __tablename__ = "concept_maps"
    __table_args__ = (
        Index(
            "uq_verified_concept_map_pair",
            "namaste_term_id",
            "icd_term_id",
            unique=True,
            postgresql_where=text("status = 'VERIFIED'"),
            sqlite_where=text("status = 'VERIFIED'"),
        ),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    namaste_term_id = Column(
        UUID(as_uuid=True),
        ForeignKey("namaste_terms.id"),
        nullable=False
    )

    icd_term_id = Column(
        UUID(as_uuid=True),
        ForeignKey("icd_terms.id"),
        nullable=False
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

    relationship = Column(
        String,
        default="RELATED"
    )

    status = Column(
        String,
        default="REVIEW_REQUIRED"
    )

    source = Column(
        String,
        default="DEMO"
    )

    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_comment = Column(Text, nullable=True)
    mapping_method = Column(
        String,
        nullable=False,
        default="EXPERT_REVIEW",
    )
