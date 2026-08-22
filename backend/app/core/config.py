import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _csv_setting(name: str, default: str) -> list[str]:
    return [
        value.strip().rstrip("/")
        for value in os.getenv(name, default).split(",")
        if value.strip()
    ]


ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
CORS_ORIGINS = _csv_setting(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
)
