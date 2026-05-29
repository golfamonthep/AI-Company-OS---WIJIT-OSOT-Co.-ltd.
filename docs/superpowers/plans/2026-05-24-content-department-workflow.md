# Content Department Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real Content Department workflow surface around the existing live MVP path.

**Architecture:** Extend `ContentDepartmentLiveMvpService` with a CEO-readable workflow package rather than adding a new workflow engine. The package is saved in workflow output/metadata, returned by the start API, exposed in the dashboard snapshot, and rendered in the existing clean workflow console.

**Tech Stack:** Next.js App Router, TypeScript, React, Vitest, existing repositories and in-memory/Supabase persistence fallback.

---

### Task 1: Workflow Package Contract

**Files:**
- Modify: `tests/integration/live-content-quality-review.test.ts`
- Modify: `src/modules/live-mvp/content-department.ts`

- [ ] Write a failing integration assertion that `startMotherBabyCampaign()` returns `workflowPackage` with ordered steps, campaign angle, post ideas, captions, creative direction, approval checkpoint, and memory candidate.
- [ ] Run `node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run test:integration -- tests/integration/live-content-quality-review.test.ts` and confirm it fails because `workflowPackage` is missing.
- [ ] Add minimal types and builder helpers in `src/modules/live-mvp/content-department.ts`.
- [ ] Store the package in workflow output and metadata.
- [ ] Return the package from `startMotherBabyCampaign()`.
- [ ] Re-run the focused integration test and confirm it passes.

### Task 2: Dashboard Snapshot

**Files:**
- Modify: `tests/integration/live-content-quality-review.test.ts`
- Modify: `src/modules/live-mvp/content-department.ts`

- [ ] Add a failing assertion that `getDashboardSnapshot().contentDepartment.workflowPackage` exposes the same visible package.
- [ ] Run the focused integration test and confirm it fails for the dashboard contract.
- [ ] Add `workflowPackage` to the dashboard snapshot, falling back to reconstructing it from saved output when needed.
- [ ] Re-run the focused integration test and confirm it passes.

### Task 3: Workflow Console UI

**Files:**
- Modify: `src/components/live-mvp/content-department-console.tsx`

- [ ] Add TypeScript types for `WorkflowPackage`.
- [ ] Render a compact workflow section showing campaign angle, post ideas, captions, creative direction, next required approval, and memory candidate.
- [ ] Keep the UI clean, light, and approval-focused.
- [ ] Run `node .\.tools\node-v22.11.0-win-x64\node_modules\npm\bin\npm-cli.js run typecheck`.

### Task 4: Verification

**Files:**
- No production files unless checks reveal a scoped issue.

- [ ] Run focused integration test.
- [ ] Run `typecheck`.
- [ ] Run `preflight:mvp` if time allows.
- [ ] Inspect `git diff -- src/modules/live-mvp/content-department.ts src/components/live-mvp/content-department-console.tsx tests/integration/live-content-quality-review.test.ts docs/superpowers/plans/2026-05-24-content-department-workflow.md`.
