from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.database.database import get_db
from app.models.audit_log import AuditLog
from app.models.diagnosis import Diagnosis
from app.models.mapping import ConceptMap
from app.models.mapping_candidate import MappingCandidate
from app.models.patient import Patient
from app.models.terminology import ICDTerm, NamasteTerm
from app.models.terminology_release import TerminologyRelease
from app.models.user import User


router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


def _active_release_id(db: Session, system: str):
    return (
        db.query(TerminologyRelease.id)
        .filter(
            TerminologyRelease.system == system,
            TerminologyRelease.is_active.is_(True),
        )
        .scalar()
    )


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("DOCTOR", "EXPERT", "ADMIN")
    ),
):
    namaste_release_id = _active_release_id(db, "NAMASTE")
    icd_release_id = _active_release_id(db, "ICD11-TM2")

    namaste_terms = (
        db.query(func.count(NamasteTerm.id))
        .filter(NamasteTerm.release_id == namaste_release_id)
        .scalar()
        if namaste_release_id
        else 0
    )
    icd_terms = (
        db.query(func.count(ICDTerm.id))
        .filter(ICDTerm.release_id == icd_release_id)
        .scalar()
        if icd_release_id
        else 0
    )
    verified_mappings = (
        db.query(func.count(ConceptMap.id))
        .filter(
            ConceptMap.status == "VERIFIED",
            ConceptMap.source_release_id == namaste_release_id,
            ConceptMap.target_release_id == icd_release_id,
        )
        .scalar()
        if namaste_release_id and icd_release_id
        else 0
    )
    pending_candidates = (
        db.query(func.count(MappingCandidate.id))
        .filter(
            MappingCandidate.status == "PENDING",
            MappingCandidate.source_release_id == namaste_release_id,
            MappingCandidate.target_release_id == icd_release_id,
        )
        .scalar()
        if namaste_release_id and icd_release_id
        else 0
    )

    audit_query = db.query(AuditLog)
    if current_user.role != "ADMIN":
        audit_query = audit_query.filter(
            AuditLog.actor == current_user.email
        )
    recent = (
        audit_query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
        .limit(5)
        .all()
    )

    stats = {
        "namasteTerms": namaste_terms or 0,
        "icdTerms": icd_terms or 0,
        "verifiedMappings": verified_mappings or 0,
        "recentActivity": [
            {
                "id": str(event.id),
                "action": event.action,
                "actor": event.actor,
                "createdAt": (
                    event.created_at.isoformat()
                    if event.created_at
                    else None
                ),
            }
            for event in recent
        ],
    }
    if current_user.role in {"EXPERT", "ADMIN"}:
        stats["pendingCandidates"] = pending_candidates or 0
    if current_user.role in {"DOCTOR", "ADMIN"}:
        stats["patients"] = db.query(func.count(Patient.id)).scalar() or 0
        stats["confirmedDiagnoses"] = (
            db.query(func.count(Diagnosis.id))
            .filter(Diagnosis.status == "CONFIRMED")
            .scalar()
            or 0
        )
        stats["fhirExchanges"] = (
            db.query(func.count(AuditLog.id))
            .filter(AuditLog.action == "FHIR_GENERATED")
            .scalar()
            or 0
        )
    return stats
