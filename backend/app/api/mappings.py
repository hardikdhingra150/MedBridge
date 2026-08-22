from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.terminology import NamasteTerm, ICDTerm
from app.models.mapping import ConceptMap
from app.models.user import User
from app.models.terminology_release import TerminologyRelease

from app.core.auth import require_roles
from app.services.audit_service import add_audit_event


router = APIRouter(
    prefix="/api/v1/mappings",
    tags=["Mappings"]
)


@router.get("/{namaste_code}")
def get_mapping(
    namaste_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("DOCTOR", "EXPERT", "ADMIN")
    ),
):

    active_release = (
        db.query(TerminologyRelease)
        .filter(
            TerminologyRelease.system == "NAMASTE",
            TerminologyRelease.is_active.is_(True),
        )
        .first()
    )
    if not active_release:
        raise HTTPException(
            status_code=503,
            detail="No active NAMASTE terminology release",
        )

    namaste = (
        db.query(NamasteTerm)
        .filter(
            NamasteTerm.code == namaste_code,
            NamasteTerm.release_id == active_release.id,
        )
        .first()
    )

    if not namaste:
        raise HTTPException(
            status_code=404,
            detail="NAMASTE term not found"
        )


    mapping = (
        db.query(ConceptMap)
        .filter(
            ConceptMap.namaste_term_id == namaste.id,
            ConceptMap.status == "VERIFIED",
        )
        .first()
    )


    if not mapping:
        raise HTTPException(
            status_code=404,
            detail="Mapping not found"
        )


    icd = (
        db.query(ICDTerm)
        .filter(
            ICDTerm.id == mapping.icd_term_id
        )
        .first()
    )

    source_release = db.get(
        TerminologyRelease,
        mapping.source_release_id,
    )
    target_release = db.get(
        TerminologyRelease,
        mapping.target_release_id,
    )

    add_audit_event(
        db,
        action="MAPPING_VIEWED",
        entity_type="CONCEPT_MAP",
        entity_id=str(mapping.id),
        actor=current_user.email,
        details={"namasteCode": namaste.code, "icdCode": icd.code},
    )
    db.commit()


    return {

        "source": {
            "code": namaste.code,
            "display": namaste.display,
            "version": source_release.version,
            "releaseId": str(source_release.id),
            "source": source_release.source_name,
        },

        "target": {
            "code": icd.code,
            "display": icd.display,
            "version": target_release.version,
            "releaseId": str(target_release.id),
            "source": target_release.source_name,
        },

        "relationship":
            mapping.relationship,

        "status":
            mapping.status,

        "provenance": {
            "source": mapping.source,
            "method": mapping.mapping_method,
            "reviewedBy": mapping.reviewed_by,
            "reviewedAt": mapping.reviewed_at,
            "reviewComment": mapping.review_comment,
        }
    }
