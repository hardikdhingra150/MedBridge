from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.models.mapping_candidate import MappingCandidate
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.terminology_release import TerminologyRelease
from app.models.import_job import ImportJob

# Import models so SQLAlchemy knows about them
from app.models.patient import Patient
from app.models.terminology import NamasteTerm, ICDTerm
from app.models.mapping import ConceptMap
from app.models.diagnosis import Diagnosis

# Routers
from app.api.terminology import router as terminology_router
from app.api.mappings import router as mappings_router
from app.api.patients import router as patients_router
from app.api.diagnoses import router as diagnoses_router
from app.api.candidates import router as candidates_router
from app.api.reviews import router as reviews_router
from app.api.fhir import router as fhir_router
from app.api.auth import router as auth_router
from app.api.terminology_admin import router as terminology_admin_router
from app.api.audit import router as audit_router
from app.api.dashboard import router as dashboard_router
from app.core.config import CORS_ORIGINS, ENVIRONMENT
from app.database.database import SessionLocal



# FastAPI app
app = FastAPI(
    title="MedBridge API",
    version="0.3.0",
    docs_url=None if ENVIRONMENT == "production" else "/docs",
    redoc_url=None if ENVIRONMENT == "production" else "/redoc",
)

app.include_router(fhir_router)
app.include_router(candidates_router)
app.include_router(reviews_router)
app.include_router(auth_router)
app.include_router(terminology_admin_router)
app.include_router(audit_router)
app.include_router(dashboard_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(terminology_router)
app.include_router(mappings_router)
app.include_router(patients_router)
app.include_router(diagnoses_router)


@app.get("/")
def root():
    return {
        "name": "MedBridge API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "ok", "environment": ENVIRONMENT}


@app.get("/ready")
def readiness():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from error
    finally:
        db.close()
    return {"status": "ready"}
