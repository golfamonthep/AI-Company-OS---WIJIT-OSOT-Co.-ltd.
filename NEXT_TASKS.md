# NEXT_TASKS

Last updated: 2026-05-09 16:12 +07:00

Current phase: MVP Stabilization + Skill Optimization.

Work only inside the current MVP scope. Do not add new departments, architecture, live integrations, or uncontrolled autonomy.

## Start Of Next Session

Read these files first:

- `PROJECT_STATUS.md`
- `MVP_SCOPE.md`
- `CURRENT_BLOCKERS.md`
- `NEXT_TASKS.md`
- `SYSTEM_ARCHITECTURE.md`
- `governance/GOVERNANCE_RULES.md`

Then continue carefully from the verified state below.

## Current Verified State

Latest checks passed:

```bash
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run test:unit
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run test:integration
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run typecheck
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run preflight:mvp
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run build
```

Route checks passed:

- `/workflows/content-production` returned `200`.
- `/workflows/content-department` returned `200`.
- `/api/live/content-department/dashboard` returned `200`.

Most recent code verification in this session:

- `npm run typecheck`: passed.
- `npm run test:unit`: 7 files passed, 16 tests passed.
- `npm run test:integration`: 5 files passed, 10 tests passed.
- `npm run preflight:mvp`: passed.
- `npm run build`: passed.
- `git status --short`: not available because `git` is not installed or not on PATH in the current shell.

Recent completed implementation:

- Real Skill Evaluation and Human Review System is implemented for Content Creator outputs.
- Memory Curation and Skill Improvement Loop is implemented with human approval required before skill changes.
- Production Content Workflow Pack is implemented for the Mother-and-baby TikTok campaign.
- `src/modules/live-mvp/content-pack.ts` builds campaign angle, audience insight, 10 hooks, 5 captions, 3 scripts, CTA options, thumbnail text ideas, shooting direction, hashtags, and quality scores.
- `src/components/live-mvp/content-department-console.tsx` now shows complete content pack review sections and per-item approval/rejection.
- `src/modules/live-mvp/content-department.ts` exposes the content pack in workflow output and live dashboard snapshot.
- Approval flow behavior and governance boundaries were preserved.

## Immediate Next Tasks

1. Manual browser QA.
   - Open `/dashboard`.
   - Open `/workflows/content-production`.
   - Open `/workflows/content-department`.
   - Check desktop, tablet, and mobile widths.
   - Verify no dark/neon/cyberpunk styling remains on primary MVP routes.
   - Verify text is readable and not clipped.
   - Verify action buttons remain visible and usable.

2. Re-run Mother-and-baby workflow smoke tests through the UI.
   - Start workflow.
   - Confirm Marketing AI analysis appears.
   - Confirm Content Pack appears with Campaign Summary, Hooks, Captions, Scripts, CTA, Shooting Notes, Quality Scores, Review & Approval, and Memory Updates.
   - Confirm Ads Performance review appears.
   - Confirm approval request appears.
   - Score and approve/reject several content items.
   - Approve once.
   - Request changes once.
   - Confirm memory, audit, learning, feedback, and status changes show in dashboard.

3. Native Thai business content review.
   - Review the generated mother-and-baby hooks for naturalness and specificity.
   - Review captions and CTAs for clear but non-pushy business language.
   - Review scripts and shooting notes for real team usability.
   - Mark repeated weak phrasing through the review UI so memory curation can learn from it.

4. Improve remaining Thai status/copy mapping.
   - Prioritize backend status values visible in dashboard panels.
   - Keep agent names understandable for business users.
   - Avoid developer-demo wording in primary flows.
   - Keep scope to existing panels and existing data.

5. Improve Content Creator AI quality inside the existing flow.
   - Focus on Thai TikTok business content.
   - Improve hooks, scripts, captions, CTAs, assumptions, and guardrail notes.
   - Use approved/rejected memory patterns and approved skill proposals as evidence.
   - Use existing skill/runtime/fallback path.
   - Do not add a new agent, department, or orchestration system.

6. Replace remaining dashboard fallback data only where existing APIs already exist.
   - Keep `src/dashboard/mock-snapshot.ts` as stable fallback.
   - Do not remove `src/dashboard/data.ts` until each panel has a reliable API-backed source.
   - Prefer small selectors/adapters over new systems.

7. Supabase verification.
   - Configure `.env.local` with Supabase variables.
   - Apply migrations under `supabase/migrations`.
   - Confirm `202605080012_live_content_workflow_hardening.sql` ran.
   - Verify writes to `workflow_runs`, `approvals`, `audit_logs`, `task_history`, `company_memory`, `agent_memory`, and `learning_events`.
   - Verify RLS with real workspace membership before public use.

8. Auth/workspace verification.
   - Verify `/api/auth/session` with real Supabase session.
   - Verify `/api/workspaces` with real membership.
   - Keep local mock owner session for development fallback.

9. Vercel preview.
   - Run `npm run build`.
   - Configure production env from `config/production.env.example`.
   - Deploy preview.
   - Smoke test `/login`, `/workspaces`, `/dashboard`, `/workflows/content-production`, and `/api/health`.

10. Commit-readiness check.
   - Run git status/diff from a terminal where Git is available.
   - Confirm generated `.tools` content remains ignored.
   - Confirm no unrelated user changes are reverted.

## Dashboard-Specific Follow-Ups

- Continue Thai-first UI copy.
- Keep the light SaaS visual style.
- Keep approval queue easy to find.
- Keep workflow state visible at a glance.
- Improve status mapping from backend values to Thai labels.
- Add clearer empty states for panels with no data.
- Add useful error states for API failures.
- Preserve structured mock fallback.
- Avoid heavy charts unless they clarify MVP operations.
- Avoid nested cards and decorative/marketing-style layouts.

## Content Creator AI Follow-Ups

- Improve Thai TikTok hooks so they sound useful, trustworthy, and natural for Thai business users.
- Ensure captions include clear CTAs without overclaiming.
- Keep medical/product/performance claims conservative unless evidence is provided.
- Make assumptions explicit.
- Make guardrail notes useful to the reviewer.
- Preserve deterministic fallback stability.
- Preserve OpenAI runtime path when configured.

## Current Component Focus

Primary dashboard files:

- `src/dashboard/layout/DashboardLayoutSystem.tsx`
- `src/dashboard/components/ControlCenterDashboard.tsx`
- `src/dashboard/components/dashboard-primitives.tsx`
- `src/dashboard/mock-snapshot.ts`
- `src/dashboard/analytics/CompanyHealthOverview.tsx`
- `src/dashboard/workflows/WorkflowVisualizationPanel.tsx`
- `src/dashboard/governance/ApprovalQueuePanel.tsx`
- `src/dashboard/operations/OperationsMonitorPanel.tsx`
- `src/dashboard/memory/MemoryExplorerPanel.tsx`
- `src/dashboard/learning/LearningAnalyticsPanel.tsx`
- `src/dashboard/agents/AgentMonitoringPanel.tsx`
- `src/dashboard/ads-performance/CampaignPerformancePanel.tsx`

Primary workflow files:

- `src/modules/live-mvp/content-pack.ts`
- `src/components/live-mvp/content-department-console.tsx`
- `src/modules/live-mvp/content-department.ts`
- `src/modules/live-mvp/content-quality-evaluation.ts`
- `src/modules/live-mvp/memory-curation.ts`
- `src/modules/live-mvp/ads-performance.ts`
- `src/app/api/live/content-department/start/route.ts`
- `src/app/api/live/content-department/approve/route.ts`
- `src/app/api/live/content-department/dashboard/route.ts`

Primary skill/agent quality files to inspect before changing Content Creator quality:

- `company-os/agents/content-creator/AGENT.md`
- `company-os/agents/content-creator/SKILLS.md`
- `src/modules/live-mvp/content-department.ts`
- `src/modules/skills`
- `src/modules/agent-runtime`

## Current Validation Commands

Use normal project scripts where possible:

```bash
npm run preflight:mvp
npm run typecheck
npm run build
npm run test:unit
npm run test:integration
```

If local PowerShell resolves blocked `npm.ps1`, or if `npm.cmd` is unavailable, use the portable npm path:

```bash
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run preflight:mvp
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run typecheck
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run build
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run test:unit
node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run test:integration
```

Known environment notes:

- Tests may need to run outside the sandbox because Vitest/esbuild can hit read-access errors.
- Build may need to run outside the sandbox because Next.js workers can hit project config access errors.
- Browser automation was not available in the latest session; use manual browser QA if needed.
- Git is unavailable in the current shell; use another terminal with Git available for status/diff/commit.

## Do Not Do

- Do not add new agents.
- Do not add new departments.
- Do not connect GitHub.
- Do not enable external publishing.
- Do not enable live ads.
- Do not add AGI/autonomous redesign.
- Do not remove mock fallback before real Supabase/Auth is verified.
- Do not do broad refactors outside MVP routes and dashboard components.
- Do not redesign backend architecture.
- Do not convert the product into a generic chatbot platform.
