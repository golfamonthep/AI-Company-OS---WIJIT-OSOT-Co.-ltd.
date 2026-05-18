# AGENTS.md

This file orients future AI agents working in this repository.

## Project Mission

AI Company OS is an AI-native operating system for running a company with agents, workflows, memory, governance, learning, operations, and safe execution harnesses.

The product is not a generic chatbot platform. It should become a CEO AI Command Center for Thai business owners.

## Current Product Direction

The user should mainly talk to CEO AI.

Internal agents should remain mostly hidden and support CEO AI in the background. The system should feel like:

> I can ask CEO AI to help run my company.

The first real capability is the Content Department MVP, centered on the Mother-and-baby TikTok Campaign workflow.

## Architecture Overview

- `src/app`: Next.js App Router pages and API routes.
- `src/dashboard`: active dashboard implementation.
- `src/components`: shared UI and workflow components.
- `src/modules`: domain logic, agents, workflows, runtime, live MVP.
- `src/modules/live-mvp`: Content Department and Ads Performance MVP logic.
- `src/modules/agent-runtime`: shared agent runtime, skills, memory, harness, governance, learning, operations.
- `src/database`: repositories, persistence service, Supabase client factory.
- `src/server/api`: route handler, request context, permission guards.
- `company-os`: canonical operating docs for agents, skills, harness, memory, and workflows.
- `memory`: existing file-based operational memory.
- `AI_MEMORY`: concise notes for future AI agents.
- `supabase/migrations`: database schema and RLS migrations.

## Important Rules

- Do not rewrite the project from scratch.
- Do not delete backend, workflow, agent, memory, governance, or runtime logic.
- Keep changes incremental and scoped.
- Preserve Supabase and in-memory fallback behavior.
- Preserve OpenAI and deterministic fallback behavior.
- Preserve governance approval for publishing, external writes, spending, finance, and customer contact.
- Use Thai-first business wording in user-facing product flows.
- Check `git status --short` before edits.
- Never revert unrelated user/session changes.

## What Not To Do

- Do not redesign `/dashboard` unless explicitly asked.
- Do not add new departments or agents without a clear phase plan.
- Do not add database/vector memory for `AI_MEMORY`.
- Do not wire these markdown memory files into runtime automatically.
- Do not remove mock/static fallback data until live API replacements are verified.
- Do not bypass API validation, permission guards, approvals, audit logs, or emergency controls.
- Do not hardcode secrets, Supabase keys, OpenAI keys, or service role credentials.

## Build And Verification Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:simulation
npm run test:regression
npm run preflight:mvp
```

If normal npm is blocked in PowerShell, check `NEXT_TASKS.md` for the bundled local npm command path.

## AI Memory Folder Usage

Use `AI_MEMORY` as a lightweight handoff layer for future AI agents.

- Read it at the start of a session.
- Keep entries concise and factual.
- Update it when product direction, architecture decisions, UX principles, prompts, or debugging knowledge changes.
- Keep it markdown-only.
- Do not treat it as a database, vector store, or runtime memory system.
- Do not duplicate long docs; summarize and point to source files.

Recommended reading order:

1. `AGENTS.md`
2. `AI_MEMORY/00_PROJECT_MAP.md`
3. `AI_MEMORY/01_PRODUCT_DIRECTION.md`
4. `AI_MEMORY/02_DECISIONS.md`
5. `PROJECT_RULES.md`
6. `MVP_SCOPE.md`
7. `NEXT_TASKS.md`
