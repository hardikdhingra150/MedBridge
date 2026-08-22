from app.database.database import SessionLocal
from app.models.patient import Patient
from seed_phase8 import main as seed_phase8


PATIENTS = [
    {
        "patient_identifier": "DEMO-P001",
        "name": "Ananya Sharma",
        "age": "34",
        "gender": "Female",
        "consent_active": True,
    },
    {
        "patient_identifier": "DEMO-P002",
        "name": "Rohan Iyer",
        "age": "46",
        "gender": "Male",
        "consent_active": True,
    },
    {
        "patient_identifier": "DEMO-P003",
        "name": "Meera Nair",
        "age": "29",
        "gender": "Female",
        "consent_active": False,
    },
]


def seed_patients() -> None:
    db = SessionLocal()
    try:
        for item in PATIENTS:
            patient = (
                db.query(Patient)
                .filter(
                    Patient.patient_identifier
                    == item["patient_identifier"]
                )
                .first()
            )
            if not patient:
                db.add(Patient(**item))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_patients()
    seed_phase8()
    print("Demo data is ready.")
