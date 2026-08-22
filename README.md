# MedBridge

MedBridge is a demonstration terminology gateway connecting synthetic NAMASTE
concepts to synthetic ICD-11 TM2 targets through human-reviewed mappings. It
supports role-based clinical workflows, dual-coded diagnoses, FHIR R4 Condition
generation, terminology release management, audit trails, and live metrics.

> All terminology and mappings in this repository are synthetic demonstration
> data. They are not official NAMASTE or WHO ICD-11 distributions and must not
> be used for clinical care.

## Architecture

- **Frontend:** React 19, Vite, React Router
- **Backend:** FastAPI, SQLAlchemy, JWT authentication
- **Database:** PostgreSQL with Alembic migrations
- **Roles:** Doctor, Expert and Admin
- **Interoperability:** Dual-coded FHIR R4 Condition resources

## Local setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
# Set JWT_SECRET_KEY and DEMO_ACCOUNT_PASSWORD in backend/.env.
alembic upgrade head
python seed_users.py
python seed.py
uvicorn app.main:app --reload
```

Create the PostgreSQL database referenced by `backend/.env` before running the
migrations. Replace the example JWT secret with a long random value.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# For local demo-button autofill only, set VITE_DEMO_ACCOUNT_PASSWORD
# to the same demo value. Never use this variable for a real account.
npm run dev
```

Open `http://localhost:5173`. Personal Doctor accounts can be created from the
login page. Expert and Admin accounts require provisioning.

## Quality checks

```bash
cd backend && source venv/bin/activate && python -m pytest
cd ../frontend && npm run lint && npm run build
```

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the presentation workflow,
[VERIFICATION.md](VERIFICATION.md) for the full checklist, and
[DEPLOYMENT.md](DEPLOYMENT.md) for deployment configuration.
