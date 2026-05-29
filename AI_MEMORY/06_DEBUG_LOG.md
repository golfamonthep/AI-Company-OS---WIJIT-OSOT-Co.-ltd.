# Debug Log

## 2026-05-18 Initial Inspection

Inspection only. No code changes were made during Step 1.

## Observed State

- Framework: Next.js App Router with TypeScript.
- Package manager: npm.
- Dashboard entrypoint: `src/app/dashboard/page.tsx`.
- Active dashboard system: `src/dashboard`.
- Older dashboard components still exist in `src/components/dashboard`.
- Live dashboard fetches `GET /api/live/content-department/dashboard`.
- Live MVP service is `src/modules/live-mvp/content-department.ts`.
- Persistence uses Supabase when configured and in-memory fallback otherwise.
- Content Creator runtime uses OpenAI when configured and deterministic fallback otherwise.
- CEO command path exists but is still a deterministic adapter.

## Current Risks

- Dashboard can expose too much internal system complexity.
- Static fallback data and live snapshot data coexist.
- Mobile dashboard navigation may need manual QA.
- Some Thai text can display incorrectly in PowerShell output.
- Dirty worktree changes may already exist and must be preserved.

## 2026-05-29 Command Loop And Memory Checkpoint Notes

Implementation notes:

- CEO command loop is implemented as a deterministic, approval-gated planning path, not full autonomy. Key files: `src/modules/orchestration/ceo-command-service.ts`, `src/modules/orchestration/types.ts`, `src/app/api/ceo/command/route.ts`, and `src/dashboard/ceo-command-client.ts`.
- Command loop tests live in `tests/unit/ceo-command-service.test.ts`, `tests/unit/ceo-command-loop-types.test.ts`, and `tests/unit/ceo-command-dashboard-client.test.ts`.
- Content Department workflow is implemented in `src/modules/live-mvp/content-department.ts` and exposed in the console at `src/components/live-mvp/content-department-console.tsx`.
- Approval flow for Content Department starts with generated work in `waiting_approval`, then routes human review through `approveMotherBabyCampaign()` and `POST /api/live/content-department/approve`.
- Memory checkpoint flow is intentionally separate from approval. Approval prepares `memoryCheckpoint` candidates and returns memory persistence as `pending_user_confirmation`; company memory is saved only by `confirmMemoryCheckpoint()` and `POST /api/live/content-department/memory-checkpoint`.
- Candidate kinds currently supported: `approved_campaign_style`, `tone_of_voice`, `preferred_messaging`, `rejected_pattern`, and `workflow_preference`.
- Local fallback persistence must remain shared across Next route handlers. `src/database/PersistenceService.ts` stores the mock `memoryStore` on `globalThis`; without that, `/start` followed by `/approve` can fail with "Workflow run ... was not found" in local dev.

Verification notes from Step 14/15 work:

- Use `npm.cmd` on this machine when PowerShell blocks `npm.ps1`.
- Focused regression: `npm.cmd run test -- tests/integration/live-content-quality-review.test.ts`.
- Type safety: `npm.cmd run typecheck`.
- Lint: `npm.cmd run lint`.
- Browser route for the live console is `/workflows/content-department`; `/live/content-department` returns 404.
- Browser DOM/interaction validation confirmed the console loads, the approval path exposes the Thai memory checkpoint prompt, and memory confirmation calls the new route. Browser screenshot capture timed out through CDP, so use DOM and console-log evidence if screenshot capture remains flaky.
- Running the live workflow or tests may create `artifacts/content-creator/*-content-output.json`; remove only artifacts generated during the current session and do not touch older unrelated artifacts.

## Useful Commands

```bash
npm run preflight:mvp
npm run typecheck
npm run lint
npm run build
npm run test:unit
npm run test:integration
```

If normal npm is blocked in PowerShell, use the local bundled npm path documented in `NEXT_TASKS.md`.
