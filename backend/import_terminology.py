import argparse
import json

from app.database.database import SessionLocal
from app.services.terminology_import_service import (
    import_terminology_csv,
)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import an immutable MedBridge terminology release."
    )
    parser.add_argument("system", choices=["NAMASTE", "ICD11-TM2"])
    parser.add_argument("version")
    parser.add_argument("file")
    parser.add_argument(
        "--source-name",
        default="MedBridge Demo CSV",
    )
    parser.add_argument("--imported-by", default="CLI_ADMIN")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        result = import_terminology_csv(
            db=db,
            file_source=args.file,
            system=args.system,
            version=args.version,
            source_name=args.source_name,
            imported_by=args.imported_by,
            source_uri=args.file,
        )
        print(json.dumps(result, indent=2, ensure_ascii=False))
    finally:
        db.close()


if __name__ == "__main__":
    main()
