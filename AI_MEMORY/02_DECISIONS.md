# Decisions

## Current Decisions

- Do not rewrite the project from scratch.
- Do not delete backend, workflow, agent, memory, governance, or runtime logic.
- Do not redesign the dashboard yet.
- Keep changes safe, incremental, and scoped.
- Root direction: CEO AI Command Center for Thai business owners.
- Active MVP: Content Department AI plus Ads Performance adapter inside Content Production Workflow.
- UI direction: Thai-first, light SaaS, calm, professional, business-readable.
- Architecture direction: modular monolith before distributed systems.
- Persistence direction: Supabase-ready, but local in-memory fallback must keep working.
- AI direction: OpenAI when configured, deterministic fallback when unavailable.
- Governance direction: approval required before publishing, spending, external writes, financial mutation, or customer contact.
- CEO command loop direction: primary user commands should enter through CEO AI, produce an approval-gated plan, and keep internal agents/workflows mostly hidden behind CEO-readable summaries.
- Content workflow direction: Content Department MVP is the first live workflow, centered on Mother-and-baby TikTok campaign generation, review, approval, and optional memory capture.
- Memory checkpoint direction: workflow memory is not saved automatically after approval. The system presents editable candidates and saves company memory only after explicit user confirmation.
- Dashboard UX direction: `/dashboard` now uses a premium dark CEO AI Command Center shell with sidebar, top header, prominent command composer, agent command room, approval queue, outputs, memory, and system status. Preserve the CEO AI-first, approval-first mental model when editing this surface.
- Supabase persistence foundation direction: CEO command loop persistence now targets Supabase first through `src/lib/persistence/supabase-store.ts`, with local in-memory fallback when env vars are missing or Supabase rejects writes.
- Supabase schema direction: `supabase/schema.sql` defines the initial CEO command persistence tables (`ceo_commands`, `ceo_plans`, `delegated_tasks`, `workflow_executions`, `approval_checkpoints`, `memory_items`) with UUID primary keys and `external_id` fields for current app-level IDs.

## Implementation Defaults

- Reuse existing APIs, repositories, runtime modules, and dashboard primitives.
- Prefer adapters and small selectors over new systems.
- Preserve mock/static fallback until API-backed replacements are verified.
- Keep internal complexity available for inspection but not dominant in primary UX.
- For command-loop UX, prefer CEO-facing plan/reply/approval language over exposing raw runtime internals.
- For approval workflow UX, separate "approve the work" from "save this as company memory"; approval alone must not promote memory.
- For future DB integration, keep memory checkpoint candidates structured and repository-backed, not markdown-only or UI-only.
- For CEO command persistence, keep the current app-facing plan/task/workflow contracts stable and map them into Supabase rows through adapters instead of rewriting orchestration types.

## Explicit Non-Decisions

- No vector database memory yet.
- No live external publishing yet.
- No new departments yet.
- No automatic skill manual rewrites.
- No uncontrolled autonomy.
- No automatic company-memory promotion from workflow completion or approval alone.
