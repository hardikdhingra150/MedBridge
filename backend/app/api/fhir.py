from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from uuid import UUID

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.diagnosis import Diagnosis
from app.models.patient import Patient
from app.models.user import User

from app.core.auth import require_roles

from app.services.fhir_service import (
    generate_condition,
)
from app.services.fhir_validation_service import validate_condition
from app.services.audit_service import add_audit_event


router = APIRouter(
    prefix="/api/v1/fhir",
    tags=["FHIR"],
)


def _build_condition(db: Session, diagnosis_id: UUID):
    diagnosis = (
        db.query(Diagnosis)
        .filter(
            Diagnosis.id == diagnosis_id
        )
        .first()
    )

    if not diagnosis:
        raise HTTPException(
            status_code=404,
            detail="Diagnosis not found",
        )

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == diagnosis.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    return diagnosis, generate_condition(
        diagnosis,
        patient,
    )


def _audit_generation(db, diagnosis, current_user, validation):
    add_audit_event(
        db,
        action="FHIR_GENERATED",
        entity_type="DIAGNOSIS",
        entity_id=str(diagnosis.id),
        actor=current_user.email,
        details={"validationStatus": validation["status"]},
    )
    db.commit()


@router.get("/condition/{diagnosis_id}")
def get_fhir_condition(
    diagnosis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("DOCTOR", "ADMIN")
    ),
):
    diagnosis, resource = _build_condition(db, diagnosis_id)
    validation = validate_condition(resource)
    _audit_generation(db, diagnosis, current_user, validation)
    return resource


@router.get("/condition/{diagnosis_id}/validated")
def get_validated_fhir_condition(
    diagnosis_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("DOCTOR", "ADMIN")
    ),
):
    diagnosis, resource = _build_condition(db, diagnosis_id)
    validation = validate_condition(resource)
    _audit_generation(db, diagnosis, current_user, validation)
    return {"resource": resource, "validation": validation}
