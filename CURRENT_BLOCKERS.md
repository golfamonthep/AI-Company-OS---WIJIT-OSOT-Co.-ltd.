# CURRENT_BLOCKERS

Last updated: 2026-05-09 16:12 +07:00

This file lists current MVP blockers and unstable areas.

## Critical MVP Blockers

Local preview is not blocked. Public MVP readiness is blocked by the items below.

### 1. Supabase production verification is not complete

Status: blocking public MVP.

Details:

- Migrations exist but were not applied to a real Supabase project in this session.
- RLS behavior has not been verified with real organizations, workspaces, users, and memberships.
- Writes to workflow, approval, audit, memory, and learning tables need real-project verification.
- In-memory fallback works for preview but is not durable.

Required next step:

- Apply migrations in order and run the Mother-and-baby workflow against real Supabase env vars.

### 2. Real Auth/workspace session is not verified

Status: blocking public MVP.

Details:

- Local development uses mocked owner session and demo workspace fallback.
- Supabase Auth session path exists but needs testing with real tokens and memberships.
- `/api/auth/session` and `/api/workspaces` are in scope but have not been verified with production-like auth.

Required next step:

- Verify `/api/auth/session` and `/api/workspaces` with real Supabase session and workspace membership.

### 3. Browser/mobile QA is incomplete

Status: blocking public MVP polish.

Details:

- In-app browser automation was not available/blocked in the current environment.
- HTTP, API, typecheck, test, preflight, and build checks pass.
- Screenshot QA was not completed.
- Mobile/tablet visual pass still needed.
- The workflow console was restyled to light mode, but it still needs actual viewport inspection.

Required next step:

- Perform manual browser QA or restore browser automation access.
- Check `/dashboard`, `/workflows/content-production`, and `/workflows/content-department` at desktop, tablet, and mobile widths.

### 4. Vercel preview has not been deployed

Status: blocking public MVP handoff.

Details:

- Production build passes locally.
- Vercel config exists.
- Preview deployment and route smoke tests have not been performed in this session.

Required next step:

- Deploy preview with production env configured from `config/production.env.example`.
- Smoke test `/login`, `/workspaces`, `/dashboard`, `/workflows/content-production`, and `/api/health`.

## Recently Cleared Blockers

### Unit/integration tests not run in final state

Status: cleared for this session.

Latest result:

- `npm run test:unit`: 7 files passed, 16 tests passed.
- `npm run test:integration`: 5 files passed, 10 tests passed.
- `npm run typecheck`, `npm run preflight:mvp`, and `npm run build` pass.

Notes:

- Initial sandbox runs failed with `Cannot read directory "../../..": Access is denied` while Vitest/esbuild tried to load `vitest.config.ts`.
- Outside-sandbox runs through the portable npm path passed.

### Workflow console style not aligned with dashboard

Status: improved, needs browser QA.

Latest result:

- `src/components/live-mvp/content-department-console.tsx` was updated to the light Thai-friendly SaaS direction.
- The workflow console now supports complete production content pack review, not hook-only review.
- Thai default strings in the active console were corrected.
- Console status labels were mapped to Thai.
- API behavior was preserved.

Remaining work:

- Manual viewport QA.
- Native Thai business copy review.

## Major Unstable Areas

### Production content pack needs rendered UI QA

Impact:

- Typecheck, unit tests, integration tests, preflight, and production build pass.
- The new content pack review console has not been visually inspected in a real browser at desktop, tablet, and mobile widths during this session.
- Long Thai text, scripts, and review cards may need spacing/copy adjustments after viewport review.

Next step:

- Open `/workflows/content-department`, generate the Mother-and-baby content pack, and inspect all pack sections plus review cards across common viewport widths.

### In-memory fallback is not durable

Impact:

- Local preview works.
- Data resets when the server restarts unless Supabase is configured.

Next step:

- Keep fallback for demos, but verify Supabase before public use.

### Dashboard still has partial static fallback

Impact:

- Core MVP dashboard reads live snapshot.
- Some secondary panel content still comes from `src/dashboard/data.ts` when live data is empty.

Next step:

- Progressively replace static fallback with existing API-backed data where safe.
- Do not remove static fallback until each panel has a reliable API-backed source.

### No realtime dashboard updates

Impact:

- Dashboard uses fetch/poll/manual refresh.
- Realtime subscriptions are not wired.

Next step:

- Do not add realtime yet unless explicitly prioritized. Current polling/manual refresh is acceptable for MVP preview.

### Thai copy needs user/native review

Impact:

- Main labels are Thai-friendly.
- Workflow console defaults and primary copy are improved.
- Some content remains English because backend outputs, technical statuses, and agent names are still English.

Next step:

- Add status mapping and improve user-facing Thai copy incrementally.
- Prioritize MVP routes only.

### Content Creator AI Thai quality needs continued refinement

Impact:

- The runtime-backed Content Creator path is the most mature agent path.
- Deterministic fallback works.
- Production content pack generation now covers campaign angle, audience insight, hooks, captions, scripts, CTAs, thumbnail text, shooting notes, hashtags, and system quality scores.
- Thai TikTok business content should still be reviewed by a native Thai business user for naturalness, less generic phrasing, shooting practicality, captions, CTAs, and guardrail wording.

Next step:

- Improve prompt/skill guidance only within existing Content Creator AI flow after human review evidence accumulates.
- Do not add a new agent or new orchestration layer.

### Git inspection unavailable in current shell

Impact:

- File edits were made and verified by direct project checks.
- `git status` and `git diff` could not be used in this environment.

Next step:

- Run git status/diff from a terminal with Git available before committing.

## Known Environment Issues

- `git` is unavailable in the current shell.
- `npm.cmd` is unavailable in the current shell.
- PowerShell can block `npm.ps1`; use the portable npm under `.tools`.
- Vitest/esbuild can fail inside sandbox with access-denied config loading.
- Next.js worker can hit sandbox permission errors when build/dev runs inside the sandbox.
- Production build passes outside the sandbox.
- In-app browser automation currently cannot be used from this session.

## Known Product Gaps

- Public deployment has not been performed.
- Real Supabase migrations not verified.
- Real OpenAI output quality not verified in this final UI state.
- External integrations are intentionally stub-only.
- Browser/media harnesses are intentionally not enabled.
- Durable retry queue/recovery persistence not implemented.
- Error states are improved on dashboard but not uniformly across all pages.
- Some non-MVP pages may still look like older demo surfaces.

## Not Blockers For MVP Preview

- Missing Supabase/OpenAI env vars, because structured fallback is expected locally.
- No live publishing.
- No live ad spend.
- No new departments.
- No full runtime adapters for CEO, CTO, CFO, Video Editor, or R&D.
- No realtime subscriptions.
- Browser automation missing, as long as manual QA is performed before public demo/release.

These are non-goals or acceptable limitations for the current MVP stabilization phase.
