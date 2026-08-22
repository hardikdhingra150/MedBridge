# MedBridge deployment

## Backend

Set `DATABASE_URL`, a long random `JWT_SECRET_KEY`, `ENVIRONMENT=production`,
and `CORS_ORIGINS` as a comma-separated list of exact frontend origins. Run:

```bash
cd backend
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
```

Render can use the repository's `render.yaml`. Production mode disables the
interactive API documentation. `/health` checks the process and `/ready`
checks database connectivity.

## Frontend

Set `VITE_API_URL` to the deployed API URL including `/api/v1`, then run
`npm run build`. `frontend/vercel.json` preserves React Router deep links.

Never commit production secrets or use wildcard CORS origins with credentialed
requests.

`DEMO_ACCOUNT_PASSWORD` is only for optional local demo seeding. Do not seed
demo accounts or expose `VITE_DEMO_ACCOUNT_PASSWORD` in production builds.
