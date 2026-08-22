# Verify the eight MedBridge hardening items

Run these commands from the repository root.

## Automated checks

```bash
cd backend
source venv/bin/activate
python -m pip install -r requirements-dev.txt
# Configure JWT_SECRET_KEY and DEMO_ACCOUNT_PASSWORD in backend/.env first.
alembic upgrade head
python seed_users.py
python seed.py
python verify_demo.py
python -m pytest
cd ../frontend
npm run lint
npm run build
```

Expected: Alembic reaches `20260822_0003`, the seed is safe to run repeatedly,
six backend tests pass, and frontend lint/build complete without
errors.

## Data and integrity

1. In Admin → Terminology Releases, confirm `2026-DEMO-v2` is active for both
   systems and older releases remain available.
2. Confirm active coverage shows 12 NAMASTE terms, 20 ICD terms and seven seeded
   verified mappings before any new expert review.
3. Generate candidates twice for `DEMO-NAM-008`; candidate IDs should be reused.
4. Approve one candidate, then retry the same review; expect a controlled 400.
5. The database partial unique indexes prevent duplicate `VERIFIED` concept-map
   pairs and duplicate `PENDING` candidate pairs during concurrent requests.

## RBAC and clinical workflow

1. Doctor: `/clinical` works; `/review` and candidate generation return 403.
2. Expert: `/review` works; patient, diagnosis and FHIR APIs return 403.
3. Admin: clinical, expert, terminology-admin and full audit access work.
4. Use `DEMO-P003` to confirm diagnosis creation returns 403 because consent is
   inactive.
5. Before expert approval, diagnosis creation for `DEMO-NAM-008` returns 400
   because it has no verified mapping.

## Audit, dashboard and FHIR

1. Complete login → search → mapping → diagnosis → FHIR → logout.
2. `/audit` should show each event. Doctors and Experts see only their own
   events; Admin sees all actors and can filter.
3. Dashboard counters should reflect database state and refresh every 30 seconds.
4. Generated FHIR should show `VALID`, R4, two codings and zero validation errors.
   The validator is explicitly a MedBridge structural check, not an official HL7
   validator.

## Deployment configuration

1. Backend uses `CORS_ORIGINS`, `ENVIRONMENT`, `DATABASE_URL` and JWT settings
   from environment variables.
2. Frontend uses `VITE_API_URL`; temporarily point it to an unavailable address
   to confirm the friendly connection error.
3. `GET /health` returns process health. `GET /ready` also verifies the database.
4. Review `DEPLOYMENT.md`, `render.yaml`, the backend Dockerfile and Vercel SPA
   rewrite before deploying.
