import uuid

from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    DateTime,
)

from sqlalchemy.dialects.postgresql import (
    UUID,
)

from sqlalchemy.sql import func

from app.database.database import (
    Base,
)


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "patients.id"
        ),
        nullable=False,
        index=True,
    )

    # --------------------------------
    # NAMASTE SNAPSHOT
    # --------------------------------

    namaste_code = Column(
        String,
        nullable=False,
    )

    namaste_display = Column(
        String,
        nullable=False,
    )

    namaste_version = Column(
        String,
        nullable=False,
    )

    # --------------------------------
    # ICD-11 TM2 SNAPSHOT
    # --------------------------------

    icd_code = Column(
        String,
        nullable=False,
    )

    icd_display = Column(
        String,
        nullable=False,
    )

    icd_version = Column(
        String,
        nullable=False,
    )

    # --------------------------------
    # WORKFLOW STATUS
    # --------------------------------

    status = Column(
        String,
        nullable=False,
        default="CONFIRMED",
    )

    # --------------------------------
    # TIMESTAMP
    # --------------------------------

    created_at = Column(
        DateTime(
            timezone=True
        ),

        server_default=
            func.now(),

        nullable=False,
    )