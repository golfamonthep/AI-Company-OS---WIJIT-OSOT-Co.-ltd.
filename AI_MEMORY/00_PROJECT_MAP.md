# Project Map

## Stack

- Framework: Next.js App Router with React and TypeScript.
- Styling: Tailwind CSS plus small shadcn-style primitives in `src/components/ui`.
- State/UI helpers: Zustand, Recharts, lucide-react.
- Backend: App Router API routes under `src/app/api`.
- Persistence: Supabase/PostgreSQL when configured, in-memory fallback when env vars are missing.
- AI runtime: LangGraph-ready architecture, deterministic fallbacks, OpenAI Responses API path when `OPENAI_API_KEY` exists.

## Important Routes

- `/dashboard`: main AI Company OS dashboard.
- `/workflows/content-production`: primary Content Production workflow UI.
- `/workflows/content-department`: live MVP Content Department console.
- `/login` and `/workspaces`: auth/workspace entry paths.

## Key Folders

- `src/app`: pages and API routes.
- `src/dashboard`: active dashboard implementation.
- `src/components`: shared UI and workflow components.
- `src/modules`: domain logic, agents, workflows, runtime, live MVP.
- `src/database`: persistence service and repositories.
- `src/server/api`: API context, permissions, route handler.
- `company-os`: canonical agent, skill, harness, memory, and workflow docs.
- `memory`: existing file-based operational memory.
- `supabase/migrations`: schema and RLS migrations.

## Dashboard Entrypoint

- Page: `src/app/dashboard/page.tsx`.
- Main component: `src/dashboard/components/ControlCenterDashboard.tsx`.
- Layout: `src/dashboard/layout/DashboardLayoutSystem.tsx`.
- Snapshot API: `GET /api/live/content-department/dashboard`.

## Runtime Entrypoints

- CEO command stub: `src/app/api/ceo/command/route.ts`.
- CEO workflow adapter: `src/modules/orchestration/ceo-workflow.ts`.
- Live Content Department service: `src/modules/live-mvp/content-department.ts`.
- Content Creator runtime: `src/modules/content-creator-agent`.
- Shared agent runtime: `src/modules/agent-runtime`.
