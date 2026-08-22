from datetime import datetime, timezone
from pathlib import Path

from app.database.database import SessionLocal
from app.models.mapping import ConceptMap
from app.models.mapping_candidate import MappingCandidate
from app.models.terminology import ICDTerm, NamasteTerm
from app.models.terminology_release import TerminologyRelease
from app.services.terminology_import_service import import_terminology_csv


DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "terminology"
VERSION = "2026-DEMO-v2"
DEMO_MAPPINGS = {
    "DEMO-NAM-001": "DEMO-TM2-001",
    "DEMO-NAM-002": "DEMO-TM2-002",
    "DEMO-NAM-003": "DEMO-TM2-003",
    "DEMO-NAM-004": "DEMO-TM2-004",
    "DEMO-NAM-005": "DEMO-TM2-005",
    "DEMO-NAM-006": "DEMO-TM2-006",
    "DEMO-NAM-007": "DEMO-TM2-007",
}
PENDING_CANDIDATES = {
    "DEMO-NAM-008": ["DEMO-TM2-008", "DEMO-TM2-007"],
    "DEMO-NAM-009": ["DEMO-TM2-009", "DEMO-TM2-008"],
    "DEMO-NAM-010": ["DEMO-TM2-010", "DEMO-TM2-018"],
}


def ensure_release(db, system: str, filename: str):
    release = (
        db.query(TerminologyRelease)
        .filter(
            TerminologyRelease.system == system,
            TerminologyRelease.version == VERSION,
        )
        .first()
    )
    if release:
        return release

    result = import_terminology_csv(
        db=db,
        file_source=DATA_DIR / filename,
        system=system,
        version=VERSION,
        source_name="MedBridge Synthetic Demo CSV",
        imported_by="PHASE_8_DEMO_SEED",
        source_uri=filename,
    )
    return db.get(TerminologyRelease, result["releaseId"])


def main() -> None:
    db = SessionLocal()
    try:
        namaste_release = ensure_release(
            db,
            "NAMASTE",
            "namaste_demo_v2.csv",
        )
        icd_release = ensure_release(
            db,
            "ICD11-TM2",
            "icd_tm2_demo_v2.csv",
        )

        for release in (namaste_release, icd_release):
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
        db.commit()

        for source_code, target_code in DEMO_MAPPINGS.items():
            source = (
                db.query(NamasteTerm)
                .filter(
                    NamasteTerm.release_id == namaste_release.id,
                    NamasteTerm.code == source_code,
                )
                .one()
            )
            target = (
                db.query(ICDTerm)
                .filter(
                    ICDTerm.release_id == icd_release.id,
                    ICDTerm.code == target_code,
                )
                .one()
            )
            existing = (
                db.query(ConceptMap)
                .filter(
                    ConceptMap.namaste_term_id == source.id,
                    ConceptMap.icd_term_id == target.id,
                    ConceptMap.status == "VERIFIED",
                )
                .first()
            )
            if not existing:
                db.add(
                    ConceptMap(
                        namaste_term_id=source.id,
                        icd_term_id=target.id,
                        source_release_id=namaste_release.id,
                        target_release_id=icd_release.id,
                        relationship="RELATED",
                        status="VERIFIED",
                        source="DEMO",
                        reviewed_by="PHASE_8_DEMO_SEED",
                        reviewed_at=datetime.now(timezone.utc),
                        review_comment="Synthetic demo mapping only",
                        mapping_method="DEMO",
                    )
                )
        for source_code, target_codes in PENDING_CANDIDATES.items():
            source = (
                db.query(NamasteTerm)
                .filter(
                    NamasteTerm.release_id == namaste_release.id,
                    NamasteTerm.code == source_code,
                )
                .one()
            )
            for rank, target_code in enumerate(target_codes, start=1):
                target = (
                    db.query(ICDTerm)
                    .filter(
                        ICDTerm.release_id == icd_release.id,
                        ICDTerm.code == target_code,
                    )
                    .one()
                )
                existing = (
                    db.query(MappingCandidate)
                    .filter(
                        MappingCandidate.namaste_term_id == source.id,
                        MappingCandidate.icd_term_id == target.id,
                        MappingCandidate.status == "PENDING",
                    )
                    .first()
                )
                if not existing:
                    score = 94.0 if rank == 1 else 58.0
                    db.add(
                        MappingCandidate(
                            namaste_term_id=source.id,
                            icd_term_id=target.id,
                            source_release_id=namaste_release.id,
                            target_release_id=icd_release.id,
                            confidence_score=score,
                            lexical_score=score,
                            definition_score=score,
                            algorithm_version="seeded-demo-v2",
                            explanation=(
                                "Seeded demonstration candidate; expert "
                                "verification is required."
                            ),
                            status="PENDING",
                        )
                    )
        db.commit()
        print("Phase 8 demo releases and mappings are ready.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
