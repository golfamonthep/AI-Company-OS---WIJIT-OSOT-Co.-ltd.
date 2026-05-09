# MVP_SCOPE

Last updated: 2026-05-09 16:12 +07:00

This file defines the active MVP scope for `ai-company-os`.

## MVP Goal

Make the Content Department AI operational end-to-end through a stable Thai-friendly web interface.

The MVP should let a Thai business user:

1. Open the dashboard.
2. Start the Mother-and-baby TikTok Campaign workflow.
3. See Marketing AI audience analysis.
4. See a complete Content Creator AI production content pack.
5. See Ads Performance AI review.
6. Score and approve/reject individual content pack items.
7. Review and approve or request changes for the workflow.
8. See workflow status update.
9. See memory, audit, learning, quality, and feedback records reflected in the dashboard.

The current MVP is allowed to use structured mock fallback as long as the UI clearly remains stable and the real API wiring path is preserved.

## In Scope

### Departments

- Content Department AI.
- Ads Performance Department MVP adapter only as part of Content Production Workflow.

### Agents in Active MVP Flow

- Marketing AI: deterministic audience analysis.
- Content Creator AI: runtime-backed content output with deterministic fallback.
- Ads Performance AI: deterministic performance review.
- Governance/Human reviewer: approval or changes requested.

### Workflow

- Content Production Workflow.
- Mother-and-baby TikTok Campaign test scenario.
- Production Content Workflow Pack for one Thai TikTok business campaign.
- Real Skill Evaluation and Human Review flow for generated content items.
- Memory Curation and Skill Improvement Proposal flow, with human approval required before applying major skill changes.
- UI routes:
  - `/workflows/content-production`
  - `/workflows/content-department`

### UI

- `/dashboard`
- `/workflows/content-production`
- `/workflows/content-department`
- `/login`
- `/workspaces`

Current UI quality target:

- Thai-first user-facing labels.
- Clear business-user wording.
- Light mode first.
- White cards.
- Soft neutral background.
- Subtle borders.
- Calm accent colors.
- Readable spacing and typography.
- Professional SaaS/admin feel.
- Avoid developer-demo wording in primary user flows.
- Avoid cyberpunk, neon, dark glass, or overly futuristic styling on primary MVP routes.

### APIs

- `POST /api/live/content-department/start`
- `POST /api/live/content-department/approve`
- `GET /api/live/content-department/dashboard`
- `POST /api/workflows/content-production/start`
- `POST /api/workflows/content-production/[id]/approve`
- `GET /api/auth/session`
- `GET /api/workspaces`
- `GET /api/health`

### Data and Persistence

- Workflow runs.
- Approval records.
- Audit logs.
- Task history.
- Company memory.
- Agent memory.
- Learning events.
- Feedback summary.
- Operational metrics.

In local development, in-memory fallback is allowed and expected when Supabase env vars are missing.

### Dashboard Requirements

Dashboard must show:

- Active workflows.
- Workflow states.
- Pending approvals.
- Recent AI outputs.
- Latest production content pack when available.
- Quality review summary and low-performing output alerts.
- Memory curation summary and skill improvement proposals.
- Recent learning events.
- Recent memory updates.
- Audit log summary.
- Operational health.
- Fallback/mock state when backend/database is not ready.

### Workflow Console Requirements

Workflow console must:

- Let the user edit campaign brief, product, and target audience.
- Start the existing Content Department live MVP API.
- Show Marketing AI analysis.
- Show Content Creator AI production content pack:
  - Campaign Summary
  - Hooks
  - Captions
  - Scripts
  - CTA
  - Shooting Notes
  - Quality Scores
  - Memory Updates
- Show Ads Performance AI review.
- Show the governance approval checkpoint.
- Let the user score, approve, or reject generated content items.
- Let the user approve or request changes for the whole workflow.
- Require a rejection reason before requesting changes.
- Save reviewer feedback fields through the existing approval API.
- Display a small dashboard snapshot from the live dashboard API.
- Keep external publishing clearly blocked.
- Stay light, readable, Thai-friendly, and professional.

## Out of Scope

- New departments.
- New agents beyond documented/current MVP participants.
- Live social publishing.
- Live ad platform activation.
- Budget changes.
- Financial mutation.
- Customer contact automation.
- External account writes.
- OAuth token exchange.
- Enterprise infrastructure expansion.
- Advanced orchestration.
- AGI or uncontrolled autonomy.
- Automatic rewriting of governance, runtime code, or skill manuals.
- Replacing the current architecture.
- Removing mock fallback before Supabase/Auth verification.
- Automatically rewriting `SKILLS.md` or runtime skill manuals without human approval.

## Mock-to-Real Strategy

Use this order:

1. Keep stable structured mock fallback.
2. Read from existing live MVP APIs where available.
3. Wire dashboard panels to existing APIs progressively.
4. Verify Supabase persistence only after local fallback path is stable.
5. Keep all external integrations stub-only until governance and audit are production verified.

Current structured fallback:

- `src/dashboard/mock-snapshot.ts`

Current static fallback:

- `src/dashboard/data.ts`

Do not delete static fallback until each panel has an equivalent stable API-backed source.
Do not require Supabase for local preview while the fallback path is still needed.

## Current MVP Quality Bar

Before public MVP:

- `npm run typecheck` passes.
- `npm run build` passes.
- Unit tests pass.
- Integration tests for workflow start/approval/dashboard pass.
- Browser QA passes on desktop/tablet/mobile.
- Supabase migrations are applied and verified.
- Auth/workspace membership works with real sessions.
- Dashboard remains useful when Supabase/OpenAI are missing.
- Workflow console remains useful when Supabase/OpenAI are missing.
- External publishing and ad spend remain disabled.

## Current Status Against Quality Bar

Passing in the latest session:

- Typecheck.
- Production build.
- MVP preflight.
- Unit tests.
- Integration/workflow/governance tests.
- HTTP `200` route checks for workflow console routes and live dashboard API.

Still missing:

- Browser screenshot QA.
- Mobile/tablet manual QA.
- Real Supabase migration/RLS verification.
- Real Auth/workspace session verification.
- Vercel preview verification.
- Native Thai business copy review.
- Git status/diff from a shell with Git available.

## Current Test Scenario

Use:

```text
Mother-and-baby TikTok Campaign
```

Verify:

1. Workflow starts.
2. Workflow visible in dashboard.
3. Marketing AI analyzed audience.
4. Content Creator AI generated a production content pack with 10 hooks, 5 captions, 3 scripts, CTA options, thumbnail ideas, shooting direction, hashtags, and system quality scores.
5. Ads Performance AI review appears.
6. Approval request created.
7. User can score and approve/reject content items.
8. User can approve the workflow.
9. User can request changes with a reason.
10. Workflow status updates.
11. Approved/rejected patterns are saved through memory curation.
12. Learning event and skill improvement proposal appear.
13. Audit log visible.
14. Feedback summary visible.
15. Workflow console remains readable on desktop/tablet/mobile.
16. No primary MVP route uses dark/neon/cyberpunk styling.
