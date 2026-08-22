from sqlalchemy import func, inspect

from app.database.database import SessionLocal, engine
from app.models.mapping import ConceptMap
from app.models.mapping_candidate import MappingCandidate
from app.models.patient import Patient
from app.models.terminology import ICDTerm, NamasteTerm
from app.models.terminology_release import TerminologyRelease


def active_release(db, system: str):
    return (
        db.query(TerminologyRelease)
        .filter(
            TerminologyRelease.system == system,
            TerminologyRelease.is_active.is_(True),
        )
        .one()
    )


def main() -> None:
    db = SessionLocal()
    try:
        namaste = active_release(db, "NAMASTE")
        icd = active_release(db, "ICD11-TM2")
        counts = {
            "patients": db.query(func.count(Patient.id)).scalar(),
            "namasteTerms": db.query(func.count(NamasteTerm.id))
            .filter(NamasteTerm.release_id == namaste.id)
            .scalar(),
            "icdTerms": db.query(func.count(ICDTerm.id))
            .filter(ICDTerm.release_id == icd.id)
            .scalar(),
            "verifiedMappings": db.query(func.count(ConceptMap.id))
            .filter(
                ConceptMap.source_release_id == namaste.id,
                ConceptMap.target_release_id == icd.id,
                ConceptMap.status == "VERIFIED",
            )
            .scalar(),
            "pendingCandidates": db.query(func.count(MappingCandidate.id))
            .filter(
                MappingCandidate.source_release_id == namaste.id,
                MappingCandidate.target_release_id == icd.id,
                MappingCandidate.status == "PENDING",
            )
            .scalar(),
        }
        indexes = {
            index["name"]
            for table in ("concept_maps", "mapping_candidates")
            for index in inspect(engine).get_indexes(table)
        }
        assert namaste.version == "2026-DEMO-v2"
        assert icd.version == "2026-DEMO-v2"
        assert counts["patients"] >= 3
        assert counts["namasteTerms"] == 12
        assert counts["icdTerms"] == 20
        assert counts["verifiedMappings"] >= 7
        assert counts["pendingCandidates"] >= 6
        assert "uq_verified_concept_map_pair" in indexes
        assert "uq_pending_mapping_candidate_pair" in indexes
        print(
            {
                "activeNamaste": namaste.version,
                "activeIcd": icd.version,
                **counts,
                "integrityIndexes": "present",
            }
        )
        print("Demo database verification passed.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
