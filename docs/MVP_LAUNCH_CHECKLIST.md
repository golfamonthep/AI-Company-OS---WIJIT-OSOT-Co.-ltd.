# MVP Launch Checklist

Target: first real deployment of Content Department AI.

## Scope

- User login with Supabase Auth when configured, safe demo session locally
- Workspace selection
- Dashboard access
- Mother-and-baby TikTok Campaign workflow
- Marketing AI audience analysis
- Content Creator AI hooks, captions, and TikTok scripts
- Governance approval checkpoint
- Human approval
- Workflow output persistence
- Memory update persistence
- Learning event logging
- Realtime-ready dashboard snapshot

## Required Environment

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `APP_ENV=production`
- `DEPLOYMENT_TARGET=vercel`

Local demos may leave Supabase and OpenAI empty. The app will use mocked persistence and deterministic output.

## Supabase

- Apply all migrations in `supabase/migrations`.
- Confirm workspace bridge migration has run.
- Confirm these tables exist:
  - `workflow_runs`
  - `approvals`
  - `audit_logs`
  - `task_history`
  - `company_memory`
  - `learning_events`
  - Content Creator runtime tables from the agent runtime migrations
- Confirm RLS and organization/workspace access patterns before using real customer data.

## Vercel

- Import repo into Vercel as a Next.js app.
- Add production env vars in Vercel project settings.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Confirm `vercel.json` is present.
- Deploy preview first, then production.

## Smoke Test

1. Open `/login`.
2. Continue to `/workspaces`.
3. Open `/workflows/content-department`.
4. Start the Mother-and-baby TikTok Campaign workflow.
5. Confirm marketing analysis appears.
6. Confirm hooks, captions, and TikTok scripts appear.
7. Confirm approval checkpoint is waiting.
8. Approve the workflow.
9. Open `/dashboard`.
10. Call `/api/live/content-department/dashboard` and confirm latest run is completed.
11. Call `/api/health` and confirm health is healthy or known degraded due to accepted fallbacks.

## Launch Gate

Do not enable live external publishing in this MVP. The approval only marks generated content as reviewed and stores learning/memory updates.
