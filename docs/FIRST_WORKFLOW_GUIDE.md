# First Workflow Guide

Workflow: Mother-and-baby TikTok Campaign

## What It Does

The workflow makes the Content Department AI operational end-to-end:

1. User submits campaign brief.
2. Workflow run is created.
3. Marketing AI creates audience analysis.
4. Content Creator AI generates hooks, captions, and TikTok scripts.
5. Governance creates a human approval checkpoint.
6. Human approves.
7. Results are saved.
8. Learning event is logged.
9. Memory update is saved.
10. Dashboard snapshot becomes realtime-ready.

## UI Flow

- Login: `/login`
- Workspace selection: `/workspaces`
- Live workflow console: `/workflows/content-department`
- Dashboard: `/dashboard`

## API Flow

Start workflow:

```http
POST /api/live/content-department/start
content-type: application/json
```

```json
{
  "campaignBrief": "Create a mother-and-baby TikTok campaign that builds trust and asks viewers to message us.",
  "productName": "ผลิตภัณฑ์แม่และเด็ก",
  "targetAudience": "คุณแม่และครอบครัวไทยที่ต้องการข้อมูลก่อนตัดสินใจ",
  "channel": "tiktok",
  "contentGoal": "engagement",
  "tone": "friendly"
}
```

Approve workflow:

```http
POST /api/live/content-department/approve
content-type: application/json
```

```json
{
  "runKey": "mother-baby-tiktok-...",
  "approvalNotes": "Approved for MVP content package use."
}
```

Dashboard snapshot:

```http
GET /api/live/content-department/dashboard
```

## Persistence

The workflow writes to:

- `workflow_runs`
- `approvals`
- `audit_logs`
- `task_history`
- `company_memory`
- `learning_events`

When Supabase env vars are missing, the same repository calls use the in-memory fallback.

## Guardrails

- No external publishing.
- No unsupported medical or performance claims.
- Human approval is required before the run is marked completed.
- Memory promotion happens only after approval.
