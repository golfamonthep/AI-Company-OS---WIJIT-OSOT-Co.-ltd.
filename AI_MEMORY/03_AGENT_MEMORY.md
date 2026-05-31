# Agent Memory

## Notes For Future Agents

- Start by reading `AGENTS.md`, this folder, `PROJECT_RULES.md`, `MVP_SCOPE.md`, and `NEXT_TASKS.md`.
- The repo already contains substantial architecture. Treat it as a living system, not a scaffold.
- The active dashboard implementation is in `src/dashboard`, not the older dark dashboard components in `src/components/dashboard`.
- The live operational path is Content Department, especially `src/modules/live-mvp/content-department.ts`.
- CEO AI command loop currently exists as a deterministic adapter/service plus API route: `src/modules/orchestration/ceo-command-service.ts`, shared contracts in `src/modules/orchestration/types.ts`, dashboard client helpers in `src/dashboard/ceo-command-client.ts`, and `POST /api/ceo/command`. It creates approval-gated CEO plans and dashboard previews; it is not yet the full autonomous command center.
- `POST /api/ceo/command` now wires a server-only OpenAI Responses API provider through `src/lib/ai/openai-provider.ts` when `OPENAI_API_KEY` exists. Structured CEO brain output is validated in `src/lib/ai/ceo-brain.ts`, mapped back into the existing `CEOPlan` contract, and falls back to deterministic mock planning if the key is missing or parsing/API calls fail.
- `/dashboard` now starts with a CEO AI Command Center surface backed by `src/dashboard/ceo-command-center.ts`; keep using the live Content Department dashboard snapshot and approval queue instead of adding a parallel dashboard data path.
- Content Department workflow now exposes a CEO-readable `workflowPackage` from `src/modules/live-mvp/content-department.ts`: business request, CEO strategy, content ideas, Marketing review, Design creative direction, visible approval checkpoint, final package summary, and memory candidate. Keep this as the primary visible workflow contract.
- `workflowPackage.executionState` is the executive workflow status contract. It supports `waiting_for_approval`, `approved`, `executing`, `review_required`, and `completed`, with current step, progress percent, and next required action for the UI.
- Content Department memory checkpoint is confirmation-based: starting and approving a campaign keeps workflow memory `queued_after_approval` / `pending_user_confirmation`; company memory rows are saved only after the user edits/selects candidates and confirms `บันทึกสิ่งนี้เป็นความจำของบริษัทหรือไม่?`.
- Approval workflow is two-stage for Content Department: first, human approves/rejects/requests revision for the content pack through `approveMotherBabyCampaign()` / `/api/live/content-department/approve`; second, if approved, CEO AI presents editable memory candidates through `memoryCheckpoint` and saves only via `confirmMemoryCheckpoint()` / `/api/live/content-department/memory-checkpoint`.
- Memory checkpoint candidates are structured for future DB integration: `approved_campaign_style`, `tone_of_voice`, `preferred_messaging`, `rejected_pattern`, and `workflow_preference`, each with title, content, tags, importance, source, editability, and save flag.
- Local/mock persistence now relies on a global in-memory store in `src/database/PersistenceService.ts` so Next route handlers can share fallback data across start, approve, dashboard, and memory-checkpoint calls.
- Content workflow implementation lives in `ContentDepartmentLiveMvpService`: `startMotherBabyCampaign()` generates the package and pauses for approval; `approveMotherBabyCampaign()` records review/learning and prepares memory candidates; `confirmMemoryCheckpoint()` persists selected company memory; `getDashboardSnapshot()` surfaces workflow package, approval state, quality review, learning, and memory checkpoint data.
- The app is designed to work without Supabase and OpenAI credentials in local demo mode.
- Thai text may appear as mojibake in some PowerShell output; inspect files in an editor if exact Thai copy matters.

## Safe Extension Points

- Add CEO-facing UX around existing live workflow APIs.
- Improve Thai copy/status mapping in existing dashboard panels.
- Add small adapters from existing snapshot data to simpler business-user views.
- Add DB-backed memory checkpoint persistence by mapping the existing structured candidate contract into Supabase tables/repositories; do not change the user confirmation requirement.
- Add docs and memory notes when product decisions change.

## Caution

- The worktree may already contain user/session changes. Do not revert unrelated files.
- Do not bypass governance or approval flows.
- Do not remove fallback data until replacement data is reliable.
- Do not introduce new infrastructure for simple memory notes.
