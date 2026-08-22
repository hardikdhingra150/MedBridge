# MedBridge concise demo script

## Prepare

```bash
cd backend
source venv/bin/activate
# Copy .env.example to .env, then set JWT_SECRET_KEY and a local
# DEMO_ACCOUNT_PASSWORD. Keep both values outside Git.
alembic upgrade head
python seed_users.py
python seed.py
uvicorn app.main:app --reload
```

In another terminal:

```bash
cd frontend
cp .env.example .env.local
# Set VITE_DEMO_ACCOUNT_PASSWORD in .env.local to the same local demo
# value if you want the role buttons to autofill it.
npm install
npm run dev
```

Open `http://localhost:5173/login`.

## 1. Doctor: verified clinical path

Sign in as `doctor@medbridge.demo` using the locally configured demo password.

1. Open Clinical Workspace and select consent-active patient `DEMO-P001`.
2. Search `Amlapitta` (`DEMO-NAM-001`) and inspect its verified mapping.
3. Confirm the dual-code diagnosis.
4. Show the FHIR R4 Condition, the `VALID` structural-check summary, and both codings.
5. Open Audit Trail and show the search, mapping, diagnosis, and FHIR events.

## 2. Security: frontend and backend RBAC

While signed in as Doctor, navigate directly to `/review`; React redirects.
Copy the Doctor token from browser storage and call the API directly:

```bash
curl -i -X POST \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  http://127.0.0.1:8000/api/v1/candidates/generate/DEMO-NAM-008
```

Expected: `403 Forbidden` from FastAPI.

## 3. Expert: unmapped review path

Sign in as `expert@medbridge.demo` using the locally configured demo password.

1. Open Mapping Review.
2. Generate candidates for `DEMO-NAM-008` (Atisara), an intentionally unmapped term.
3. Approve the best candidate with a review comment.
4. Repeat the request or review attempt to show idempotency/double-review protection.

Sign back in as Doctor. Atisara can now be used for a confirmed diagnosis.

## 4. Admin: operations and live evidence

Sign in as `admin@medbridge.demo` using the locally configured demo password.

1. Show live dashboard counts and recent activity.
2. Open Terminology Releases and show active v2 releases plus preserved v1 history.
3. Show v2 coverage: 12 NAMASTE terms, 20 ICD targets, and the mapping count increased from the seven seeded mappings after expert approval.
4. Open Audit Trail; Admin can inspect system-wide events and filter by actor/action.

All terminology in this repository is synthetic demonstration data and must not
be presented as an official NAMASTE or WHO ICD-11 distribution.
