from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.patient import Patient
from app.models.user import User

from app.core.auth import require_roles


router = APIRouter(
    prefix="/api/v1/patients",
    tags=["Patients"]
)


@router.get("")
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("DOCTOR", "ADMIN")
    ),
):
    patients = (
        db.query(Patient)
        .order_by(
            Patient.consent_active.desc(),
            Patient.patient_identifier.asc(),
        )
        .all()
    )

    return [
        {
            "id": str(patient.id),
            "patientIdentifier":
                patient.patient_identifier,
            "name":
                patient.name,
            "age":
                patient.age,
            "gender":
                patient.gender,
            "consentActive":
                patient.consent_active
        }

        for patient in patients
    ]
