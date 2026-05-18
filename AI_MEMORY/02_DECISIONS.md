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

## Implementation Defaults

- Reuse existing APIs, repositories, runtime modules, and dashboard primitives.
- Prefer adapters and small selectors over new systems.
- Preserve mock/static fallback until API-backed replacements are verified.
- Keep internal complexity available for inspection but not dominant in primary UX.

## Explicit Non-Decisions

- No vector database memory yet.
- No live external publishing yet.
- No new departments yet.
- No automatic skill manual rewrites.
- No uncontrolled autonomy.
