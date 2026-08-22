from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.database import (
    get_db,
)

from app.models.mapping_candidate import (
    MappingCandidate,
)

from app.models.mapping import (
    ConceptMap,
)

from app.models.audit_log import (
    AuditLog,
)

from app.core.auth import require_roles
from app.models.user import User


router = APIRouter(
    prefix="/api/v1/reviews",
    tags=["Expert Review"],
)


class ReviewRequest(BaseModel):
    action: str
    comment: str | None = None


@router.post("/{candidate_id}")
def review_candidate(
    candidate_id: UUID,
    payload: ReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("EXPERT", "ADMIN")
    ),
):

    # --------------------------------
    # FIND CANDIDATE
    # --------------------------------

    candidate = (
        db.query(MappingCandidate)
        .filter(
            MappingCandidate.id
            == candidate_id
        )
        .with_for_update()
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    # --------------------------------
    # PREVENT DOUBLE REVIEW
    # --------------------------------

    if candidate.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=(
                "Candidate has already "
                "been reviewed"
            ),
        )

    # --------------------------------
    # VALIDATE ACTION
    # --------------------------------

    action = (
        payload.action
        .strip()
        .upper()
    )

    if action not in {
        "APPROVE",
        "REJECT",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "Action must be "
                "APPROVE or REJECT"
            ),
        )

    # --------------------------------
    # APPROVE
    # --------------------------------

    if action == "APPROVE":



        existing_mapping = (
            db.query(ConceptMap)
            .filter(
                ConceptMap.namaste_term_id
                == candidate.namaste_term_id,

                ConceptMap.icd_term_id
                == candidate.icd_term_id,

                ConceptMap.status
                == "VERIFIED",
            )
            .first()
        )

        if not existing_mapping:

            mapping = ConceptMap(
                namaste_term_id=(
                    candidate
                    .namaste_term_id
                ),

                icd_term_id=(
                    candidate
                    .icd_term_id
                ),

                source_release_id=(
                    candidate.source_release_id
                ),

                target_release_id=(
                    candidate.target_release_id
                ),

                relationship="RELATED",

                status="VERIFIED",

                source="EXPERT_REVIEW",

                reviewed_by=current_user.email,

                reviewed_at=datetime.now(timezone.utc),

                review_comment=payload.comment,

                mapping_method="EXPERT_REVIEW",
            )

            db.add(mapping)

        candidate.status = "APPROVED"

    # --------------------------------
    # REJECT
    # --------------------------------

    else:

        candidate.status = "REJECTED"

    # --------------------------------
    # REVIEW METADATA
    # --------------------------------

    candidate.reviewed_by = current_user.email

    candidate.reviewed_at = (
        datetime.now(
            timezone.utc
        )
    )

    # --------------------------------
    # AUDIT LOG
    # --------------------------------

    audit = AuditLog(
        action=(
            "MAPPING_APPROVED"
            if action == "APPROVE"
            else "MAPPING_REJECTED"
        ),

        entity_type=(
            "MAPPING_CANDIDATE"
        ),

        entity_id=str(
            candidate.id
        ),

        actor=current_user.email,

        details=payload.comment,
    )

    db.add(audit)

    try:
        db.commit()

        db.refresh(candidate)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "This mapping was changed by another reviewer. "
                "Refresh the queue and try again."
            ),
        )
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to complete "
                "mapping review"
            ),
        )

    return {
        "candidateId":
            str(candidate.id),

        "status":
            candidate.status,

        "reviewedBy":
            candidate.reviewed_by,

        "message":
            (
                "Mapping verified."
                if action == "APPROVE"
                else
                "Candidate rejected."
            ),
    }
