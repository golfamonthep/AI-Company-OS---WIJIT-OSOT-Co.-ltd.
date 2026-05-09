# Local Development Guide

## Prerequisites

- Node.js
- npm
- Optional Supabase project
- Optional OpenAI API key

## Setup

1. Copy env template:

```bash
cp config/development.env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Run the app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000/login
```

## Local Fallback Mode

If Supabase env vars are empty:

- Auth uses a mocked demo owner session.
- Workspace selection shows a demo workspace.
- Persistence uses in-memory fallback.
- Dashboard snapshots work inside the current process.

If OpenAI is empty:

- Content Creator AI uses deterministic fallback output.
- Guardrails and approval still run.

## Useful Routes

- `/login`
- `/workspaces`
- `/dashboard`
- `/workflows/content-department`
- `/api/health`
- `/api/live/content-department/dashboard`

## Verification

Run when package tooling is available:

```bash
npm run typecheck
npm run test:unit
npm run build
```

The current Codex shell may not expose `npm`; in that case run these commands in a normal local terminal before deployment.
