# Agent Memory

## Notes For Future Agents

- Start by reading `AGENTS.md`, this folder, `PROJECT_RULES.md`, `MVP_SCOPE.md`, and `NEXT_TASKS.md`.
- The repo already contains substantial architecture. Treat it as a living system, not a scaffold.
- The active dashboard implementation is in `src/dashboard`, not the older dark dashboard components in `src/components/dashboard`.
- The live operational path is Content Department, especially `src/modules/live-mvp/content-department.ts`.
- CEO AI currently exists as a deterministic adapter and API route. It is not yet the full command center.
- `/dashboard` now starts with a CEO AI Command Center surface backed by `src/dashboard/ceo-command-center.ts`; keep using the live Content Department dashboard snapshot and approval queue instead of adding a parallel dashboard data path.
- The app is designed to work without Supabase and OpenAI credentials in local demo mode.
- Thai text may appear as mojibake in some PowerShell output; inspect files in an editor if exact Thai copy matters.

## Safe Extension Points

- Add CEO-facing UX around existing live workflow APIs.
- Improve Thai copy/status mapping in existing dashboard panels.
- Add small adapters from existing snapshot data to simpler business-user views.
- Add docs and memory notes when product decisions change.

## Caution

- The worktree may already contain user/session changes. Do not revert unrelated files.
- Do not bypass governance or approval flows.
- Do not remove fallback data until replacement data is reliable.
- Do not introduce new infrastructure for simple memory notes.
