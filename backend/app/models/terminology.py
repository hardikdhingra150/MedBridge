import uuid

from sqlalchemy import (
    Column,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID

from app.database.database import Base


class NamasteTerm(Base):
    __tablename__ = "namaste_terms"
    __table_args__ = (
        UniqueConstraint(
            "release_id",
            "code",
            name="uq_namaste_release_code",
        ),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    release_id = Column(
        UUID(as_uuid=True),
        ForeignKey("terminology_releases.id"),
        nullable=False,
        index=True,
    )
    code = Column(String, nullable=False, index=True)
    display = Column(String, nullable=False, index=True)
    devanagari = Column(String, nullable=True)
    category = Column(String, nullable=True)
    definition = Column(Text, nullable=True)
    synonyms = Column(Text, nullable=True)


class ICDTerm(Base):
    __tablename__ = "icd_terms"
    __table_args__ = (
        UniqueConstraint(
            "release_id",
            "code",
            name="uq_icd_release_code",
        ),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    release_id = Column(
        UUID(as_uuid=True),
        ForeignKey("terminology_releases.id"),
        nullable=False,
        index=True,
    )
    code = Column(String, nullable=False, index=True)
    display = Column(String, nullable=False, index=True)
    definition = Column(Text, nullable=True)
    synonyms = Column(Text, nullable=True)
