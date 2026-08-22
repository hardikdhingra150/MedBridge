import os

from app.core.security import hash_password
from app.database.database import SessionLocal
from app.models.user import User


DEMO_PASSWORD_ENV = "DEMO_ACCOUNT_PASSWORD"

DEMO_USERS = [
    {
        "name": "Dr. Aarav Mehta",
        "email": "doctor@medbridge.demo",
        "role": "DOCTOR",
    },
    {
        "name": "Dr. Kavya Sharma",
        "email": "expert@medbridge.demo",
        "role": "EXPERT",
    },
    {
        "name": "MedBridge Admin",
        "email": "admin@medbridge.demo",
        "role": "ADMIN",
    },
]


def seed_users() -> None:
    demo_password = os.getenv(DEMO_PASSWORD_ENV)
    if not demo_password:
        raise RuntimeError(
            f"{DEMO_PASSWORD_ENV} must be set before seeding demo users"
        )

    db = SessionLocal()
    try:
        for item in DEMO_USERS:
            existing = (
                db.query(User)
                .filter(User.email == item["email"])
                .first()
            )
            if existing:
                existing.password_hash = hash_password(demo_password)
                existing.name = item["name"]
                existing.role = item["role"]
                existing.is_active = True
                print(f"Updated: {item['email']}")
                continue

            db.add(
                User(
                    name=item["name"],
                    email=item["email"],
                    password_hash=hash_password(
                        demo_password
                    ),
                    role=item["role"],
                    is_active=True,
                )
            )
            print(f"Created: {item['email']}")

        db.commit()
        print("Demo users ready.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
