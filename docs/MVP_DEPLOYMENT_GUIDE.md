# MVP Deployment Guide

## Local Development

1. Copy `config/development.env.example` to `.env.local`.
2. Keep Supabase and OpenAI empty if you want deterministic local fallback behavior.
3. Run `npm install`.
4. Run `npm run dev`.

## Vercel Deployment

1. Create a Vercel project from this repo.
2. Set `APP_ENV=production`.
3. Set `DEPLOYMENT_TARGET=vercel`.
4. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
5. Add Supabase public keys and keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
6. Run Supabase migrations before using real workspace data.
7. Keep external write connectors disabled until governance approval APIs are verified.

## Docker Deployment

From the repo root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

The compose file uses `config/development.env.example` by default. For staging or production, provide a real env file and do not commit secrets.

## Supabase Compatibility

Supabase is optional for local demos and required for production persistence.

Before production usage:

- Apply migrations in `supabase/migrations`.
- Confirm RLS policies for organization-scoped tables.
- Verify service role key is not exposed to the browser.
- Confirm file fallback behavior remains available for emergency local demos.

## Release Checklist

- `npm run typecheck`
- `npm run test`
- environment validation has no production errors
- dashboard loads
- health checks are healthy or accepted degraded
- governance approval flow works
- external connector writes remain blocked unless approved
