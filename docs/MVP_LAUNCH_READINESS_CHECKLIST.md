# MVP Launch Readiness Checklist

Scope: internal MVP validation for Content Department AI only.

## Local Production-Like Setup

- Install dependencies with `npm install`.
- Copy `config/development.env.example` to `.env.local`.
- Run `npm run typecheck`.
- Run `npm run test:unit`.
- Run `npm run build`.
- Run `npm run dev` and open `/login`.

## Supabase Setup

- Create or select the Supabase project for MVP validation.
- Apply all migrations in `supabase/migrations`.
- Confirm these tables exist:
  - `workflow_runs`
  - `approvals`
  - `audit_logs`
  - `task_history`
  - `company_memory`
  - `learning_events`
- Confirm `202605080012_live_content_workflow_hardening.sql` has run.
- Verify workspace-scoped reads and writes before using real business data.

## Vercel Setup

- Create a Vercel preview deployment.
- Set production-like environment variables:
  - `APP_ENV`
  - `DEPLOYMENT_TARGET`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `OPENAI_API_KEY`
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is server-only.

## MVP Smoke Test

- Login and select workspace.
- Open `/workflows/content-production`.
- Start the Mother-and-baby TikTok Campaign.
- Confirm outputs are generated.
- Submit reviewer score, thumbs, satisfaction, and quality notes.
- Approve the workflow.
- Repeat once and request changes with a rejection reason.
- Open `/dashboard`.
- Confirm recent workflows, approval queue, audit summary, memory summary, learning events, operational metrics, and alerts update.

## Launch Gate

- No failing typecheck, unit test, or build.
- No unresolved critical operational alerts.
- Approval and rejection paths both persist correctly.
- Dashboard visibility is acceptable to internal testers.
- External publishing remains disabled.
