import uuid
import secrets

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.database.database import Base, get_db
from app.main import app
from app.models.mapping import ConceptMap
from app.models.patient import Patient
from app.models.terminology import ICDTerm, NamasteTerm
from app.models.terminology_release import TerminologyRelease
from app.models.user import User


TEST_PASSWORD = "A1" + secrets.token_urlsafe(24)

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture()
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def seeded(db):
    namaste_release = TerminologyRelease(
        id=uuid.uuid4(),
        system="NAMASTE",
        version="TEST-v1",
        source_name="Tests",
        source_type="TEST",
        is_active=True,
    )
    icd_release = TerminologyRelease(
        id=uuid.uuid4(),
        system="ICD11-TM2",
        version="TEST-v1",
        source_name="Tests",
        source_type="TEST",
        is_active=True,
    )
    db.add_all([namaste_release, icd_release])
    db.flush()

    namaste_terms = {}
    for code, display, definition in [
        ("TEST-NAM-001", "Amlapitta", "acid digestive discomfort"),
        ("TEST-NAM-008", "Atisara", "frequent loose stools diarrhea"),
        ("TEST-NAM-009", "Chardi", "vomiting emesis"),
    ]:
        term = NamasteTerm(
            release_id=namaste_release.id,
            code=code,
            display=display,
            definition=definition,
            synonyms=definition,
        )
        db.add(term)
        namaste_terms[code] = term

    icd_terms = []
    for number, (display, definition) in enumerate(
        [
            ("Acid digestive disorder", "acid digestive discomfort"),
            ("Diarrhoeal disorder", "frequent loose stools diarrhea"),
            ("Vomiting disorder", "vomiting emesis"),
            ("Pain disorder", "non-specific pain"),
            ("Sleep disorder", "insomnia"),
        ],
        start=1,
    ):
        term = ICDTerm(
            release_id=icd_release.id,
            code=f"TEST-TM2-{number:03d}",
            display=display,
            definition=definition,
            synonyms=definition,
        )
        db.add(term)
        icd_terms.append(term)
    db.flush()

    db.add(
        ConceptMap(
            namaste_term_id=namaste_terms["TEST-NAM-001"].id,
            icd_term_id=icd_terms[0].id,
            source_release_id=namaste_release.id,
            target_release_id=icd_release.id,
            relationship="RELATED",
            status="VERIFIED",
            source="TEST",
            mapping_method="TEST",
        )
    )
    active_patient = Patient(
        patient_identifier="TEST-P001",
        name="Active Patient",
        age="34",
        gender="Female",
        consent_active=True,
    )
    inactive_patient = Patient(
        patient_identifier="TEST-P002",
        name="No Consent Patient",
        age="42",
        gender="Male",
        consent_active=False,
    )
    db.add_all([active_patient, inactive_patient])

    password_hash = hash_password(TEST_PASSWORD)
    for role in ("DOCTOR", "EXPERT", "ADMIN"):
        db.add(
            User(
                name=f"Test {role.title()}",
                email=f"{role.lower()}@example.com",
                password_hash=password_hash,
                role=role,
                is_active=True,
            )
        )
    db.commit()
    return {
        "activePatientId": str(active_patient.id),
        "inactivePatientId": str(inactive_patient.id),
    }


def login(client, role: str) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": f"{role.lower()}@example.com",
            "password": TEST_PASSWORD,
        },
    )
    assert response.status_code == 200, response.text
    return {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }


@pytest.fixture()
def auth_headers(client, seeded):
    return {
        role: login(client, role)
        for role in ("DOCTOR", "EXPERT", "ADMIN")
    }
