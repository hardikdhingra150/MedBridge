import json
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.database.database import get_db
from app.models.audit_log import AuditLog
from app.models.import_job import ImportJob
from app.models.mapping import ConceptMap
from app.models.mapping_candidate import MappingCandidate
from app.models.terminology import ICDTerm, NamasteTerm
from app.models.terminology_release import TerminologyRelease
from app.models.user import User
from app.services.terminology_import_service import (
    DuplicateReleaseError,
    TerminologyImportError,
    import_terminology_csv,
)


router = APIRouter(
    prefix="/api/v1/admin/terminology",
    tags=["Terminology Administration"],
)


def _release_uuid(release_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(release_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terminology release not found",
        )


def _term_count(db: Session, release: TerminologyRelease) -> int:
    model = NamasteTerm if release.system == "NAMASTE" else ICDTerm
    return (
        db.query(func.count(model.id))
        .filter(model.release_id == release.id)
        .scalar()
    )


@router.get("/releases")
def get_releases(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    releases = (
        db.query(TerminologyRelease)
        .order_by(TerminologyRelease.imported_at.desc())
        .all()
    )
    return [
        {
            "id": str(release.id),
            "system": release.system,
            "version": release.version,
            "sourceName": release.source_name,
            "sourceType": release.source_type,
            "sourceUri": release.source_uri,
            "active": release.is_active,
            "importedBy": release.imported_by,
            "importedAt": release.imported_at,
            "termCount": _term_count(db, release),
        }
        for release in releases
    ]


@router.get("/releases/{release_id}/terms")
def get_release_terms(
    release_id: str,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    release = db.get(TerminologyRelease, _release_uuid(release_id))
    if not release:
        raise HTTPException(status_code=404, detail="Terminology release not found")

    model = NamasteTerm if release.system == "NAMASTE" else ICDTerm
    terms = (
        db.query(model)
        .filter(model.release_id == release.id)
        .order_by(model.code.asc())
        .limit(limit)
        .all()
    )
    return {
        "release": {
            "id": str(release.id),
            "system": release.system,
            "version": release.version,
            "sourceName": release.source_name,
            "active": release.is_active,
        },
        "terms": [
            {
                "id": str(term.id),
                "code": term.code,
                "display": term.display,
                "definition": term.definition,
                "synonyms": term.synonyms,
                **(
                    {
                        "devanagari": term.devanagari,
                        "category": term.category,
                    }
                    if release.system == "NAMASTE"
                    else {}
                ),
            }
            for term in terms
        ],
    }


@router.post("/releases/{release_id}/activate")
def activate_release(
    release_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    release_uuid = _release_uuid(release_id)
    release = db.get(TerminologyRelease, release_uuid)
    if not release:
        raise HTTPException(status_code=404, detail="Terminology release not found")
    if _term_count(db, release) == 0:
        raise HTTPException(
            status_code=400,
            detail="An empty terminology release cannot be activated",
        )

    # Serialize activation within one terminology system. This prevents two
    # concurrent admin requests from violating the one-active-release index.
    (
        db.query(TerminologyRelease)
        .filter(TerminologyRelease.system == release.system)
        .with_for_update()
        .all()
    )

    (
        db.query(TerminologyRelease)
        .filter(TerminologyRelease.system == release.system)
        .update(
            {TerminologyRelease.is_active: False},
            synchronize_session=False,
        )
    )
    (
        db.query(TerminologyRelease)
        .filter(TerminologyRelease.id == release.id)
        .update(
            {TerminologyRelease.is_active: True},
            synchronize_session=False,
        )
    )
    db.add(
        AuditLog(
            action="TERMINOLOGY_RELEASE_ACTIVATED",
            entity_type="TERMINOLOGY_RELEASE",
            entity_id=str(release.id),
            actor=current_user.email,
            details=f"{release.system} {release.version}",
        )
    )
    db.commit()
    return {
        "message": "Terminology release activated",
        "releaseId": str(release.id),
        "system": release.system,
        "version": release.version,
    }


@router.post("/import")
async def import_release(
    system: str = Form(...),
    version: str = Form(...),
    source_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="A CSV file is required")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="CSV file must be 5 MB or smaller")

    try:
        result = import_terminology_csv(
            db=db,
            file_source=content,
            system=system,
            version=version,
            source_name=source_name,
            imported_by=current_user.email,
            source_uri=file.filename,
        )
    except DuplicateReleaseError as error:
        raise HTTPException(status_code=409, detail=str(error))
    except TerminologyImportError as error:
        raise HTTPException(status_code=400, detail=str(error))

    db.add(
        AuditLog(
            action="TERMINOLOGY_RELEASE_IMPORTED",
            entity_type="TERMINOLOGY_RELEASE",
            entity_id=result["releaseId"],
            actor=current_user.email,
            details=(
                f"{result['system']} {result['version']}: "
                f"{result['imported']} imported, "
                f"{result['rejected']} rejected"
            ),
        )
    )
    db.commit()
    return result


@router.get("/imports")
def get_import_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    jobs = db.query(ImportJob).order_by(ImportJob.created_at.desc()).limit(50).all()
    return [
        {
            "id": str(job.id),
            "releaseId": str(job.release_id) if job.release_id else None,
            "system": job.terminology_system,
            "version": job.version,
            "sourceName": job.source_name,
            "importedBy": job.imported_by,
            "status": job.status,
            "total": job.total_rows,
            "imported": job.imported_rows,
            "rejected": job.rejected_rows,
            "errors": json.loads(job.error_report) if job.error_report else [],
            "createdAt": job.created_at,
            "completedAt": job.completed_at,
        }
        for job in jobs
    ]


@router.get("/coverage")
def get_coverage(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    namaste_release = (
        db.query(TerminologyRelease)
        .filter(
            TerminologyRelease.system == "NAMASTE",
            TerminologyRelease.is_active.is_(True),
        )
        .first()
    )
    icd_release = (
        db.query(TerminologyRelease)
        .filter(
            TerminologyRelease.system == "ICD11-TM2",
            TerminologyRelease.is_active.is_(True),
        )
        .first()
    )

    namaste_terms = _term_count(db, namaste_release) if namaste_release else 0
    icd_terms = _term_count(db, icd_release) if icd_release else 0
    verified_mappings = 0
    pending_candidates = 0
    if namaste_release:
        verified_mappings = (
            db.query(func.count(func.distinct(ConceptMap.namaste_term_id)))
            .filter(
                ConceptMap.source_release_id == namaste_release.id,
                ConceptMap.status == "VERIFIED",
            )
            .scalar()
        )
        pending_candidates = (
            db.query(func.count(MappingCandidate.id))
            .filter(
                MappingCandidate.source_release_id == namaste_release.id,
                MappingCandidate.status == "PENDING",
            )
            .scalar()
        )

    unmapped_terms = max(namaste_terms - verified_mappings, 0)
    coverage_percent = (
        round((verified_mappings / namaste_terms) * 100, 1)
        if namaste_terms
        else 0
    )
    return {
        "activeNamasteVersion": namaste_release.version if namaste_release else None,
        "activeIcdVersion": icd_release.version if icd_release else None,
        "namasteTerms": namaste_terms,
        "icdTerms": icd_terms,
        "verifiedMappings": verified_mappings,
        "pendingCandidates": pending_candidates,
        "unmappedTerms": unmapped_terms,
        "coveragePercent": coverage_percent,
    }
