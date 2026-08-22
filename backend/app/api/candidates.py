from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.database import get_db

from app.models.terminology import (
    NamasteTerm,
    ICDTerm,
)

from app.models.mapping_candidate import (
    MappingCandidate,
)
from app.models.user import User
from app.models.terminology_release import TerminologyRelease

from app.core.auth import require_roles

from app.services.candidate_service import (
    generate_candidates,
)
from app.services.audit_service import add_audit_event


router = APIRouter(
    prefix="/api/v1/candidates",
    tags=["Mapping Candidates"],
)


@router.post(
    "/generate/{namaste_code}"
)
def create_candidates(
    namaste_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("EXPERT", "ADMIN")
    ),
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
    if not namaste_release or not icd_release:
        raise HTTPException(
            status_code=503,
            detail="Active NAMASTE and ICD11-TM2 releases are required",
        )

    namaste = (
        db.query(NamasteTerm)
        .filter(
            NamasteTerm.code == namaste_code,
            NamasteTerm.release_id == namaste_release.id,
        )
        .first()
    )

    if not namaste:
        raise HTTPException(
            status_code=404,
            detail="NAMASTE term not found",
        )

    icd_terms = (
        db.query(ICDTerm)
        .filter(ICDTerm.release_id == icd_release.id)
        .all()
    )

    if not icd_terms:
        raise HTTPException(
            status_code=404,
            detail="No ICD terminology available",
        )

    results = generate_candidates(
        namaste,
        icd_terms,
        limit=5,
    )

    output = []

    for result in results:

        icd = result["icd_term"]

        explanation = (
            "Candidate retrieved using "
            "terminology name and definition "
            "similarity. Expert verification "
            "is required."
        )

        candidate = (
            db.query(MappingCandidate)
            .filter(
                MappingCandidate.namaste_term_id == namaste.id,
                MappingCandidate.icd_term_id == icd.id,
                MappingCandidate.status == "PENDING",
            )
            .first()
        )
        if not candidate:
            candidate = MappingCandidate(
                namaste_term_id=namaste.id,
                icd_term_id=icd.id,
                source_release_id=namaste_release.id,
                target_release_id=icd_release.id,
                confidence_score=result["score"],
                lexical_score=result["name_score"],
                definition_score=result["definition_score"],
                algorithm_version="lexical-v1",
                explanation=explanation,
                status="PENDING",
            )
            db.add(candidate)
            try:
                db.flush()
            except IntegrityError:
                db.rollback()
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Candidates were generated concurrently. "
                        "Retry to load the existing candidate set."
                    ),
                )

        output.append({
            "candidateId":
                str(candidate.id),

            "source": {
                "code":
                    namaste.code,

                "display":
                    namaste.display,

                "version": namaste_release.version,

                "releaseId": str(namaste_release.id),
            },

            "target": {
                "code":
                    icd.code,

                "display":
                    icd.display,

                "version": icd_release.version,

                "releaseId": str(icd_release.id),
            },

            "retrievalScore":
                result["score"],

            "lexicalScore":
                result["name_score"],

            "definitionScore":
                result[
                    "definition_score"
                ],

            "status":
                candidate.status,

            "algorithmVersion":
                candidate.algorithm_version,

            "explanation":
                explanation,
        })

    add_audit_event(
        db,
        action="CANDIDATES_GENERATED",
        entity_type="NAMASTE_TERM",
        entity_id=str(namaste.id),
        actor=current_user.email,
        details={
            "namasteCode": namaste.code,
            "candidateCount": len(output),
            "algorithmVersion": "lexical-v1",
        },
    )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Candidates were generated concurrently. "
                "Retry to load the existing candidate set."
            ),
        )

    return output
