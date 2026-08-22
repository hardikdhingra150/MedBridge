from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel
from uuid import UUID

from sqlalchemy.orm import Session

from app.database.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.models.terminology import (
    NamasteTerm,
    ICDTerm,
)

from app.models.mapping import (
    ConceptMap,
)

from app.models.diagnosis import (
    Diagnosis,
)

from app.models.audit_log import (
    AuditLog,
)

from app.core.auth import require_roles
from app.models.user import User
from app.models.terminology_release import TerminologyRelease


router = APIRouter(
    prefix="/api/v1/diagnoses",
    tags=["Diagnoses"],
)


class DiagnosisRequest(BaseModel):
    patient_id: UUID
    namaste_code: str


@router.post("")
def create_diagnosis(
    payload: DiagnosisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("DOCTOR", "ADMIN")
    ),
):

    # --------------------------------
    # PATIENT
    # --------------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.id
            == payload.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # --------------------------------
    # CONSENT
    # --------------------------------

    if not patient.consent_active:
        raise HTTPException(
            status_code=403,
            detail=(
                "Patient consent is inactive"
            ),
        )

    # --------------------------------
    # NAMASTE
    # --------------------------------

    active_namaste_release = (
        db.query(TerminologyRelease)
        .filter(
            TerminologyRelease.system == "NAMASTE",
            TerminologyRelease.is_active.is_(True),
        )
        .first()
    )
    if not active_namaste_release:
        raise HTTPException(
            status_code=503,
            detail="No active NAMASTE terminology release",
        )

    namaste = (
        db.query(NamasteTerm)
        .filter(
            NamasteTerm.code == payload.namaste_code,
            NamasteTerm.release_id == active_namaste_release.id,
        )
        .first()
    )

    if not namaste:
        raise HTTPException(
            status_code=404,
            detail=(
                "NAMASTE terminology "
                "not found"
            ),
        )

    # --------------------------------
    # VERIFIED MAPPING ONLY
    # --------------------------------

    mapping = (
        db.query(ConceptMap)
        .filter(
            ConceptMap.namaste_term_id
            == namaste.id,

            ConceptMap.status
            == "VERIFIED",
        )
        .first()
    )

    if not mapping:
        raise HTTPException(
            status_code=400,
            detail=(
                "No verified mapping exists "
                "for this terminology"
            ),
        )

    # --------------------------------
    # ICD TARGET
    # --------------------------------

    icd = (
        db.query(ICDTerm)
        .filter(
            ICDTerm.id
            == mapping.icd_term_id
        )
        .first()
    )

    if not icd:
        raise HTTPException(
            status_code=404,
            detail=(
                "ICD-11 TM2 concept "
                "not found"
            ),
        )

    target_release = db.get(
        TerminologyRelease,
        mapping.target_release_id,
    )
    if not target_release:
        raise HTTPException(
            status_code=500,
            detail="Mapping target release is unavailable",
        )

    # --------------------------------
    # CREATE SNAPSHOT
    # --------------------------------

    diagnosis = Diagnosis(
        patient_id=
            patient.id,

        namaste_code=
            namaste.code,

        namaste_display=
            namaste.display,

        namaste_version=
            active_namaste_release.version,

        icd_code=
            icd.code,

        icd_display=
            icd.display,

        icd_version=
            target_release.version,

        status="CONFIRMED",
    )

    db.add(diagnosis)

    # Flush gives diagnosis.id
    # before commit.

    db.flush()

    # --------------------------------
    # AUDIT
    # --------------------------------

    audit = AuditLog(
        action=
            "DIAGNOSIS_CONFIRMED",

        entity_type=
            "DIAGNOSIS",

        entity_id=
            str(diagnosis.id),

        actor=
            current_user.email,

        details=(
            f"NAMASTE "
            f"{namaste.code} "
            f"mapped to ICD-11 TM2 "
            f"{icd.code}"
        ),
    )

    db.add(audit)

    try:
        db.commit()

        db.refresh(
            diagnosis
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save diagnosis"
            ),
        )

    return {
        "id":
            str(diagnosis.id),

        "patientId":
            str(patient.id),

        "namaste": {
            "code":
                diagnosis
                .namaste_code,

            "display":
                diagnosis
                .namaste_display,

            "version":
                diagnosis
                .namaste_version,
        },

        "icd": {
            "code":
                diagnosis
                .icd_code,

            "display":
                diagnosis
                .icd_display,

            "version":
                diagnosis
                .icd_version,
        },

        "status":
            diagnosis.status,
    }
