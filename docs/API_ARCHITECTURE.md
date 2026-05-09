# API Architecture

The API Layer is the official backend interface for AI Company OS.

It connects:

- dashboard UI
- agent runtime
- skill execution
- memory
- workflows
- governance
- learning
- operations
- integrations
- database repositories

## Stack

- Next.js App Router API routes
- TypeScript
- Zod validation
- Repository pattern
- Centralized route handler
- Permission-aware route guard
- Audit helper for important actions

## Shared Server API Layer

```txt
src/server/api/
  auth.ts
  audit.ts
  errors.ts
  permissions.ts
  routeHandler.ts
  schemas.ts
  validation.ts
```

Responsibilities:

- `routeHandler.ts`: consistent JSON success/error envelopes
- `validation.ts`: Zod body/query parsing
- `auth.ts`: request context, organization, actor agent, persistence mode
- `permissions.ts`: GovernancePolicyEngine guard
- `audit.ts`: AuditLogRepository wrapper
- `errors.ts`: typed API errors
- `schemas.ts`: request schemas

## Persistence Behavior

Routes use `src/database` repositories. If Supabase env vars are missing, repositories use in-memory fallback through `PersistenceService`.

This keeps API demos usable without forcing database configuration.

## Security Rules

- Validate all request bodies with Zod.
- Do not expose or hardcode secrets.
- Use governance checks before workflow execution and approval actions.
- Audit important actions.
- Keep connector writes and external actions approval-gated.
- Keep emergency stop endpoint available.

## Safe Demo Flow

`POST /api/workflows/start`

1. Validates request.
2. Builds API context.
3. Evaluates governance permission.
4. Upserts workflow metadata.
5. Creates workflow run.
6. Creates approval checkpoint.
7. Writes audit log.
8. Returns `workflow_run_id` and status.

`GET /api/dashboard/overview`

Returns active agents, active workflows, pending approvals, recent audit logs, recent learning proposals, KPIs, alerts, and persistence mode.

## Next Step

Add automated API tests and connect dashboard panels to these routes.
