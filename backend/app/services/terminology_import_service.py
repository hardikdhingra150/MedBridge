import csv
import io
import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.import_job import ImportJob
from app.models.terminology import ICDTerm, NamasteTerm
from app.models.terminology_release import TerminologyRelease


SUPPORTED_SYSTEMS = {"NAMASTE", "ICD11-TM2"}


class TerminologyImportError(ValueError):
    pass


class DuplicateReleaseError(TerminologyImportError):
    pass


def normalize_system(system: str) -> str:
    normalized = system.strip().upper()
    aliases = {
        "ICD": "ICD11-TM2",
        "ICD-11-TM2": "ICD11-TM2",
        "ICD11_TM2": "ICD11-TM2",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in SUPPORTED_SYSTEMS:
        raise TerminologyImportError(
            "Unsupported terminology system"
        )
    return normalized


def _read_csv(file_source) -> csv.DictReader:
    if hasattr(file_source, "read"):
        content = file_source.read()
    else:
        content = Path(file_source).read_bytes()

    if isinstance(content, bytes):
        try:
            content = content.decode("utf-8-sig")
        except UnicodeDecodeError as error:
            raise TerminologyImportError(
                "CSV must be valid UTF-8"
            ) from error

    reader = csv.DictReader(io.StringIO(content))
    if not reader.fieldnames:
        raise TerminologyImportError("CSV header is required")

    reader.fieldnames = [
        (field or "").strip().lower()
        for field in reader.fieldnames
    ]
    missing_headers = {"code", "display"} - set(
        reader.fieldnames
    )
    if missing_headers:
        raise TerminologyImportError(
            "CSV must contain code and display columns"
        )
    return reader


def _clean_optional(row: dict, field: str) -> str | None:
    value = (row.get(field) or "").strip()
    return value or None


def import_terminology_csv(
    db: Session,
    file_source,
    system: str,
    version: str,
    source_name: str,
    imported_by: str,
    source_uri: str | None = None,
) -> dict:
    system = normalize_system(system)
    version = version.strip()
    source_name = source_name.strip()

    if not version:
        raise TerminologyImportError("Version is required")
    if not source_name:
        raise TerminologyImportError("Source name is required")

    existing_release = (
        db.query(TerminologyRelease)
        .filter(
            TerminologyRelease.system == system,
            TerminologyRelease.version == version,
        )
        .first()
    )
    if existing_release:
        raise DuplicateReleaseError(
            f"Release {system} {version} already exists"
        )

    job = ImportJob(
        terminology_system=system,
        version=version,
        source_name=source_name,
        imported_by=imported_by,
        status="RUNNING",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    errors: list[dict] = []
    total = 0
    imported = 0

    try:
        reader = _read_csv(file_source)
        release = TerminologyRelease(
            system=system,
            version=version,
            source_name=source_name,
            source_type="DEMO",
            source_uri=source_uri,
            is_active=False,
            imported_by=imported_by,
        )
        db.add(release)
        db.flush()

        seen_codes: set[str] = set()
        for row_number, row in enumerate(reader, start=2):
            total += 1
            code = (row.get("code") or "").strip()
            display = (row.get("display") or "").strip()

            if not code:
                errors.append(
                    {"row": row_number, "reason": "missing code"}
                )
                continue
            if not display:
                errors.append(
                    {"row": row_number, "reason": "missing display"}
                )
                continue
            if code in seen_codes:
                errors.append(
                    {
                        "row": row_number,
                        "reason": f"duplicate code {code}",
                    }
                )
                continue

            seen_codes.add(code)
            if system == "NAMASTE":
                term = NamasteTerm(
                    release_id=release.id,
                    code=code,
                    display=display,
                    devanagari=_clean_optional(row, "devanagari"),
                    category=_clean_optional(row, "category"),
                    definition=_clean_optional(row, "definition"),
                    synonyms=_clean_optional(row, "synonyms"),
                )
            else:
                term = ICDTerm(
                    release_id=release.id,
                    code=code,
                    display=display,
                    definition=_clean_optional(row, "definition"),
                    synonyms=_clean_optional(row, "synonyms"),
                )

            db.add(term)
            imported += 1

        if imported == 0:
            raise TerminologyImportError(
                "No valid terminology rows were imported"
            )

        job.release_id = release.id
        job.status = "COMPLETED"
        job.total_rows = total
        job.imported_rows = imported
        job.rejected_rows = len(errors)
        job.error_report = (
            json.dumps(errors, ensure_ascii=False) if errors else None
        )
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

        return {
            "jobId": str(job.id),
            "releaseId": str(release.id),
            "system": system,
            "version": version,
            "total": total,
            "imported": imported,
            "rejected": len(errors),
            "errors": errors,
        }
    except Exception as error:
        db.rollback()
        failed_job = db.get(ImportJob, job.id)
        if failed_job:
            failed_job.status = "FAILED"
            failed_job.total_rows = total
            failed_job.imported_rows = imported
            failed_job.rejected_rows = max(
                len(errors), total - imported
            )
            report = errors or [{"row": None, "reason": str(error)}]
            failed_job.error_report = json.dumps(
                report,
                ensure_ascii=False,
            )
            failed_job.completed_at = datetime.now(timezone.utc)
            db.commit()
        if isinstance(error, TerminologyImportError):
            raise
        raise TerminologyImportError(
            "Unable to import terminology release"
        ) from error


def import_namaste_csv(
    db,
    file_path,
    version,
    source_name,
    imported_by,
):
    return import_terminology_csv(
        db=db,
        file_source=file_path,
        system="NAMASTE",
        version=version,
        source_name=source_name,
        imported_by=imported_by,
        source_uri=str(file_path),
    )


def import_icd_csv(
    db,
    file_path,
    version,
    source_name,
    imported_by,
):
    return import_terminology_csv(
        db=db,
        file_source=file_path,
        system="ICD11-TM2",
        version=version,
        source_name=source_name,
        imported_by=imported_by,
        source_uri=str(file_path),
    )
