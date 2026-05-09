# PROJECT_STATUS

Last updated: 2026-05-09 16:12 +07:00

This is the master continuation context for `ai-company-os`.

Session handoff status: current for the end of the MVP Stabilization + Skill Optimization continuation session.

## Project Identity

`ai-company-os` is an AI-native company operating system, not a chatbot platform. The system models company work through governed departments, operational skills, executable harnesses, memory, workflow state, approval gates, audit logs, learning records, and dashboard visibility.

Preserve the existing operating layers:

- Agent Layer
- Skill Layer
- Harness Layer
- Memory Layer
- Workflow Layer
- Governance Layer
- Learning Layer
- Operations Layer
- External Integrations Layer
- Database and Persistence Layer
- API Layer
- Dashboard Layer

Do not redesign these layers unless explicitly requested.

## Current Phase

Current development phase: MVP Stabilization + Skill Optimization.

Current goal: Make the Content Department AI operational end-to-end and usable through a clean Thai-friendly web dashboard and workflow console.

Current operating mode:

- Preserve existing architecture.
- Stabilize existing MVP workflows.
- Improve Thai business content quality and user-facing UX.
- Keep structured mock fallback stable.
- Progressively wire existing APIs into dashboard surfaces.
- Do not add departments, autonomous behavior, or live external integrations.
- Treat local preview stability as higher priority than feature expansion.

## Current MVP Scope

The MVP is limited to:

- Marketing AI deterministic audience analysis.
- Content Creator AI runtime-backed hooks, captions, scripts, CTAs, assumptions, and guardrail notes.
- Ads Performance AI deterministic MVP review inside the Content Production Workflow.
- Governance approval flow with `approved` and `changes_requested`.
- Dashboard visibility for workflow state, approvals, outputs, memory, audit, learning, and operations.
- Repository-backed persistence with in-memory fallback when Supabase env vars are missing.
- Audit log records for important workflow and approval events.
- Learning event records from workflow generation and reviewer feedback.

Current non-goals:

- No new departments beyond Content and Ads Performance.
- No live external publishing.
- No live ad spend or platform mutation.
- No financial mutation.
- No customer contact automation.
- No uncontrolled autonomy.
- No enterprise infrastructure expansion.

## Working Entry Points

Local app URL:

```text
http://127.0.0.1:3000/dashboard
```

Main routes:

- `/dashboard`
- `/workflows/content-production`
- `/workflows/content-department`
- `/workspaces`
- `/login`
- `/api/health`
- `/api/live/content-department/dashboard`

Main live MVP APIs:

- `POST /api/live/content-department/start`
- `POST /api/live/content-department/approve`
- `GET /api/live/content-department/dashboard`
- `POST /api/workflows/content-production/start`
- `POST /api/workflows/content-production/[id]/approve`

## Local Tooling Status

Package tooling has been restored enough for local development and build checks.

Implemented:

- `package-lock.json` generated.
- Dependencies installed.
- Local portable Node/npm folder added under `.tools/`.
- `.tools` added to `.gitignore`.
- `npm run typecheck` passes when executed through the available local Node/npm path.
- `npm run build` passes when run outside the sandbox because Next.js worker access to project config can be blocked inside the sandbox.
- `npm run test:unit` passes outside the sandbox.
- `npm run test:integration` passes outside the sandbox.
- `node scripts/mvp-preflight-check.cjs` passes.

Important local notes:

- PowerShell may prefer blocked `npm.ps1` shims. Use `npm.cmd` if available, or the existing portable npm path.
- In this shell, `npm.cmd` is not on PATH.
- Vitest/esbuild can fail inside the sandbox with `Cannot read directory "../../..": Access is denied`; rerunning through the approved outside-sandbox portable npm path works.
- Browser automation in the in-app browser is currently not available/blocked, so rendered QA still needs manual browser verification.
- `git` is unavailable in the current shell, so git status/diff could not be verified here.

Portable npm command used successfully:

```bash
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js <script>
```

## Completed Systems

Completed architecture and operating docs:

- `SYSTEM_ARCHITECTURE.md`
- `COMPANY_STRUCTURE.md`
- `ROADMAP.md`
- `PROJECT_RULES.md`
- `GOVERNANCE_RULES.md` under `governance/`
- `docs/DAILY_OPERATIONS_CHECKLIST.md`
- `docs/MVP_LAUNCH_READINESS_CHECKLIST.md`
- `docs/MVP_LAUNCH_CHECKLIST.md`
- `docs/FIRST_WORKFLOW_GUIDE.md`
- `docs/LOCAL_DEVELOPMENT_GUIDE.md`
- `docs/PRODUCTION_READINESS.md`

Completed runtime foundations:

- Core Agent Runtime
- Skill Execution Engine
- Memory Retrieval Engine
- Workflow Execution Engine
- Harness Execution Layer
- Multi-Agent Collaboration foundation
- Human Oversight and Governance foundation
- Learning foundation
- Operations foundation
- External Integrations stubs
- Database repositories and in-memory fallback
- API route helpers
- Auth/workspace fallback
- Dashboard shell and MVP panels

Completed MVP/live work:

- Content Department live MVP service.
- Content Production Workflow reference path.
- Ads Performance Department MVP adapter.
- Live workflow console at `/workflows/content-production` and `/workflows/content-department`.
- Live workflow start and approval APIs.
- Live dashboard snapshot API.
- Dashboard reads `/api/live/content-department/dashboard`.
- Dashboard approval queue can approve or request changes through existing API.
- Feedback collection loop with output score, satisfaction, thumbs, notes, and rejection reason.
- Real Skill Evaluation and Human Review System for Content Creator outputs.
- Memory Curation and Skill Improvement Loop with human approval required before applying skill changes.
- Production Content Workflow Pack for Thai TikTok mother-and-baby campaigns.
- Memory, audit, and learning records created during the workflow.
- Structured mock fallback dashboard snapshot in `src/dashboard/mock-snapshot.ts`.
- Thai-friendly light-mode dashboard stabilization pass.
- Thai-friendly light-mode workflow console stabilization pass in `src/components/live-mvp/content-department-console.tsx`.

## Current UI and Dashboard Status

Dashboard direction has moved from dark cyberpunk/glass styling to a cleaner Thai-friendly business SaaS style.

Current dashboard UI:

- Light mode first.
- White cards.
- Subtle borders.
- Neutral background.
- Calm blue/green/amber/rose status colors.
- Thai-first navigation and main labels.
- Better dashboard status bar with refresh, fallback/error visibility, and link to workflow.
- Approval queue has live API actions and a Thai rejection reason field.
- Workflow visualization shows clear steps for brief, marketing analysis, content generation, approval, memory, and learning.
- Operations, memory, learning, governance, team AI, and ads review panels use the same light design language.

Current workflow console UI:

- `/workflows/content-production` and `/workflows/content-department` now use the same light Thai-friendly SaaS direction.
- `/workflows/content-department` now displays a complete production content pack instead of hook-only output.
- Content pack sections include Campaign Summary, Hooks, Captions, Scripts, CTA, Thumbnail text, Shooting Notes, Hashtags, Quality Scores, Review & Approval, and Memory Updates.
- Human reviewers can score and approve/reject each generated pack item.
- Thai defaults were replaced with readable Thai defaults in the active workflow console.
- Status values are mapped to Thai labels in the console.
- Approval and request-changes controls remain behaviorally unchanged.
- Dashboard snapshot card now uses clearer Thai business wording.
- External publishing remains clearly blocked in the approval copy.

Important dashboard files:

- `src/dashboard/layout/DashboardLayoutSystem.tsx`
- `src/dashboard/components/ControlCenterDashboard.tsx`
- `src/dashboard/components/dashboard-primitives.tsx`
- `src/dashboard/mock-snapshot.ts`
- `src/dashboard/analytics/CompanyHealthOverview.tsx`
- `src/dashboard/workflows/WorkflowVisualizationPanel.tsx`
- `src/dashboard/governance/ApprovalQueuePanel.tsx`
- `src/dashboard/governance/GovernanceControlPanel.tsx`
- `src/dashboard/operations/OperationsMonitorPanel.tsx`
- `src/dashboard/memory/MemoryExplorerPanel.tsx`
- `src/dashboard/learning/LearningAnalyticsPanel.tsx`
- `src/dashboard/agents/AgentMonitoringPanel.tsx`
- `src/dashboard/ads-performance/CampaignPerformancePanel.tsx`
- `src/components/live-mvp/content-department-console.tsx`

Current UI limitations:

- Manual desktop/tablet/mobile screenshot QA still needs completion.
- Some non-MVP pages outside dashboard/workflow may still use the older dark or demo visual style.
- Realtime subscriptions are not wired; dashboard refreshes via polling/manual refresh.
- Some panels still use fallback data from `src/dashboard/data.ts` when live snapshot lacks records.
- Some backend-generated labels/statuses remain English.
- Thai copy has improved but still needs native Thai business-user review.

## Current Workflow Status

Primary workflow: Content Production Workflow.

Test scenario: Mother-and-baby TikTok Campaign.

Current implementation state:

- `src/modules/live-mvp/content-pack.ts` is the structured production pack builder.
- `src/modules/live-mvp/content-department.ts` starts the workflow, builds the production pack, saves it into workflow output, exposes it through the live dashboard snapshot, and keeps approval/memory/learning/audit behavior in the existing repositories.
- `src/modules/live-mvp/content-quality-evaluation.ts` supports review scoring for hooks, captions, scripts, CTAs, thumbnails, shooting notes, and hashtags.
- `src/modules/live-mvp/memory-curation.ts` converts reviewed outputs into approved patterns, rejected patterns, reviewer insights, ranked memories, repeated issue alerts, and a human-reviewable skill improvement proposal.
- `src/components/live-mvp/content-department-console.tsx` is now the primary human review UI for the production content pack.
- `src/app/api/live/content-department/approve/route.ts` accepts detailed content item reviews and persists them through the existing approval path.
- `src/dashboard/types.ts` and `src/dashboard/mock-snapshot.ts` include content pack, quality review, and memory curation fields.

Current flow:

1. User submits campaign brief.
2. Marketing AI creates deterministic audience analysis.
3. Content Creator AI generates hooks, captions, scripts, CTAs, assumptions, and guardrail notes.
4. Production content pack builder normalizes the output into campaign angle, audience insight, 10 hooks, 5 captions, 3 scripts, CTA options, thumbnail text ideas, shooting direction, hashtag suggestions, and system quality scores.
5. Ads Performance AI reviews CTR, targeting, creative performance, recommendations, and budget guardrails.
6. Governance approval checkpoint is created.
7. Human reviewer scores and approves/rejects pack items.
8. Workflow state updates.
9. Approval, audit, memory, and learning records are persisted through repositories.
10. Approved patterns and rejected patterns feed memory curation and a reviewable skill improvement proposal.
11. Dashboard snapshot reflects workflow state, quality review, content pack, memory curation, and learning proposal state.

Verified behavior from prior smoke checks:

- Workflow starts successfully.
- Status after start: `waiting_approval`.
- Pending approvals after start: `1`.
- Generated hooks visible.
- Audit entries visible.
- Approval path updates status to `completed`.
- Changes-requested path updates status to `changes_requested`.
- Pending approvals clear to `0`.
- Memory updates appear.
- Audit logs appear.
- Learning events appear.
- Feedback summary appears.
- Content pack appears in the workflow result and live dashboard snapshot.
- Review scores create quality summary, best-performing outputs, low-performing output alerts, memory updates, and skill improvement proposals.

Current session route checks:

- `/workflows/content-production` returned HTTP `200`.
- `/workflows/content-department` returned HTTP `200`.
- `/api/live/content-department/dashboard` returned HTTP `200`.

## Current Agent Quality Status

Marketing:

- Deterministic MVP logic inside `ContentDepartmentLiveMvpService`.
- Good enough for MVP workflow visibility.
- Not yet a full runtime adapter.

Content Creator:

- Most mature runtime path.
- Loads agent/skill docs.
- Executes selected skills through SkillExecutor.
- Uses OpenAI when configured.
- Falls back to deterministic structured output when OpenAI is unavailable.
- Output is now normalized into a production content pack for Thai TikTok business use.
- Pack item scoring covers hooks, captions, scripts, CTAs, thumbnails, shooting notes, and hashtags.
- Human feedback is converted into approved pattern memory, rejected pattern memory, reviewer insight memory, and reviewable skill improvement proposals.
- Saves artifacts through filesystem harness.
- Guardrails are active.
- Current improvement priority remains Thai naturalness, less generic phrasing, stronger shooting-ready scripts, and native Thai business copy review.

Ads Performance:

- Deterministic MVP adapter in `src/modules/live-mvp/ads-performance.ts`.
- Integrated after content generation and before governance approval.
- Produces CTR prediction, targeting suggestions, creative feedback, optimization recommendations, budget guardrails, reporting summary, learning signals, and governance notes.
- No live ads platform actions.

CEO, CTO, CFO, Video Editor, R&D:

- Documented.
- Not live production runtime adapters.
- Do not expand into them during the current MVP stabilization work unless explicitly requested.

## Mock vs Real Integration Status

Real enough for MVP preview:

- Next.js app routes.
- Local dashboard route.
- Content Department start/approve/dashboard APIs.
- Repository abstraction.
- In-memory persistence fallback.
- Deterministic AI fallback.
- Structured mock dashboard fallback.
- Health endpoint.
- Production build.

Mock/stub/fallback:

- Supabase persistence unless env vars are configured and migrations applied.
- Supabase Auth/workspace memberships.
- OpenAI generation when `OPENAI_API_KEY` is missing.
- Ads Performance real platform data.
- External integrations.
- OAuth/token exchange.
- Browser/media harnesses.
- Durable retry queue and recovery checkpoints.

Blocked by governance by design:

- External publishing.
- Live ad spend.
- Budget mutation.
- Account settings mutation.
- Customer contact automation.
- Financial mutation.

## Known Bugs and Unstable Areas

Known environment issues:

- `git` is unavailable in the current shell, so git status/diff could not be verified here.
- `npm.cmd` is unavailable in the current shell; use the portable npm path.
- In-app browser automation is unavailable/blocked, so browser screenshot QA was not completed.
- Vitest/esbuild can hit sandbox read errors when loading `vitest.config.ts`; outside-sandbox test execution passes.
- Next.js build/dev worker can hit sandbox permission errors when run inside the sandbox; production build passes outside the sandbox.

Known product/UI issues:

- Mobile and tablet layouts need a visual QA pass.
- Some older pages outside the MVP dashboard/workflow routes may still feel like demos.
- Some Thai copy still needs native business-user review.
- Status values from backend are still raw in some places outside the updated workflow console.

Known backend/persistence issues:

- Supabase migrations are not verified against a real project in this session.
- Real Supabase Auth/session/member path is not verified.
- In-memory fallback is not restart-safe.
- RLS policies need final verification with real workspace membership.
- API test coverage is improved but not exhaustive.

## Verification Status

Passing in current session:

- `npm run test:unit`: 7 files passed, 16 tests passed.
- `npm run test:integration`: 5 files passed, 10 tests passed.
- `npm run typecheck`
- `npm run preflight:mvp`
- `npm run build`
- HTTP route checks:
  - `/workflows/content-production`
  - `/workflows/content-department`
  - `/api/live/content-department/dashboard`

Previously verified:

- `/dashboard`
- `/workspaces`
- `/login`
- `/api/health`
- API smoke test for start + approve.
- API smoke test for start + changes_requested.

Not yet verified:

- Browser screenshot QA.
- Mobile responsive visual QA.
- Real Supabase persistence.
- Real Supabase Auth.
- Vercel preview deployment.
- Native Thai business-user copy review.
- Git status/diff from a terminal with Git available.

## Deployment Readiness

Current readiness: MVP preview/build candidate.

Ready:

- App can run locally.
- Dashboard route is accessible.
- Workflow console routes are accessible.
- Production build passes.
- Unit and integration suites pass.
- Vercel config exists.
- Mock fallback supports preview without Supabase/OpenAI.
- Health endpoint works and reports degraded fallback mode when env vars are missing.

Not ready for public production:

- Supabase migrations and RLS not verified in a real project.
- Production auth/workspace memberships not verified.
- Browser/mobile QA not completed.
- Real OpenAI Thai output quality not verified in this final UI state.
- External integrations remain stub-only by design.

## Safest Next Direction

Do next:

1. Perform manual browser QA on `/dashboard`, `/workflows/content-production`, and `/workflows/content-department` at desktop/tablet/mobile widths.
2. Re-run the Mother-and-baby workflow smoke checks through the UI using the new production content pack review.
3. Have a native Thai business reviewer inspect the generated hooks, captions, scripts, CTA, thumbnail text, and shooting notes.
4. Improve Thai status mapping and user-facing copy in remaining dashboard panels where raw backend values still appear.
5. Add small API-backed selectors for remaining dashboard fallback panels where existing APIs already exist.
6. Verify Supabase migrations in a real project.
7. Verify real Auth/workspace session path.
8. Deploy Vercel preview.
9. Run git status/diff from a terminal where Git is available before committing.

Do not do next:

- Do not add departments.
- Do not add new orchestration systems.
- Do not enable live publishing.
- Do not enable ad spend.
- Do not redesign backend architecture.
- Do not remove existing fallback behavior.

## Continuation Prompt

Use this in the next session:

```text
Read PROJECT_STATUS.md, MVP_SCOPE.md, CURRENT_BLOCKERS.md, NEXT_TASKS.md, SYSTEM_ARCHITECTURE.md, and governance/GOVERNANCE_RULES.md first.

Continue ai-company-os from MVP Stabilization + Skill Optimization.

Do not redesign architecture.
Do not add new departments.
Do not connect GitHub.
Do not enable external publishing or live ad spend.

Focus only on:
- fixing MVP bugs
- improving Content Creator AI Thai TikTok business quality
- improving Thai-friendly dashboard and workflow console usability
- keeping structured mock fallback stable
- progressively wiring existing APIs into dashboard panels
- running tests/build/smoke checks
- preparing Vercel/Supabase verification
```
