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
