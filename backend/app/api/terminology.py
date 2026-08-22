from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.terminology import NamasteTerm
from app.models.terminology_release import TerminologyRelease
from app.models.user import User

from app.core.auth import require_roles

from rapidfuzz import fuzz
from app.services.audit_service import add_audit_event


router = APIRouter(
    prefix="/api/v1/terminology",
    tags=["Terminology"]
)


@router.get("/search")
def search_terminology(
    q: str = Query(min_length=1),
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

    terms = (
        db.query(NamasteTerm)
        .filter(NamasteTerm.release_id == active_release.id)
        .all()
    )

    results = []

    query = q.lower().strip()

    for term in terms:

        searchable = " ".join(
            filter(
                None,
                [term.display, term.synonyms, term.devanagari],
            )
        ).lower()

        score = fuzz.ratio(
            query,
            searchable,
        )

        if query in searchable:
            score = max(score, 95)

        if term.display.lower().startswith(query):
            score = max(score, 97)

        if score >= 45:

            results.append({
                "id": str(term.id),

                "code": term.code,

                "display": term.display,

                "devanagari": term.devanagari,

                "category": term.category,

                "version": active_release.version,

                "releaseId": str(active_release.id),

                "source": active_release.source_name,

                "score": score,
            })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    add_audit_event(
        db,
        action="TERMINOLOGY_SEARCH",
        entity_type="NAMASTE_RELEASE",
        entity_id=str(active_release.id),
        actor=current_user.email,
        details={"query": q.strip(), "resultCount": min(len(results), 10)},
    )
    db.commit()

    return results[:10]
