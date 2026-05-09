# AUTH_WORKSPACE_ARCHITECTURE

The Authentication, User, and Workspace Layer adds the SaaS boundary for AI Company OS without redesigning the existing runtime layers.

## Purpose

Each workspace represents one AI company. Runtime records remain compatible with the existing `organization_id` model while new code treats `workspace_id` as the isolation key for multi-company support.

## Components

- `src/auth/AuthService.ts`: resolves the current Supabase Auth user when a bearer token is available, otherwise returns a safe mocked development user.
- `src/auth/WorkspaceService.ts`: resolves the active workspace from request headers and exposes create, switch, and list placeholders.
- `src/auth/RolePermissionService.ts`: owns role-to-permission mapping and approval authority checks.
- `src/auth/WorkspaceGuard.ts`: stamps records with `workspace_id`, `organization_id`, `created_by`, and `updated_by`, and blocks cross-workspace access.
- `src/auth/UserProfileService.ts`: manages profile and preference placeholders.
- `src/server/auth.ts`, `src/server/workspace.ts`, `src/server/permissions.ts`: server-side helpers for routes and dashboard session state.

## Request Context

Development mode supports these headers:

- `x-user-id`
- `x-user-email`
- `x-user-name`
- `x-workspace-id`
- `x-workspace-name`
- `x-workspace-role`
- `x-agent-id`

If Supabase Auth environment variables are missing, the system uses a mocked owner session. This keeps local development running and does not grant production credentials.

## Workspace Ownership

A workspace owns:

- agents
- skills
- memory
- workflows
- workflow runs
- approvals
- audit logs
- learning proposals
- integrations
- operations
- dashboard data

New records should be stamped with both `workspace_id` and `organization_id` until the compatibility migration is complete.

## Demo Flow

The safe demo flow is implemented through `POST /api/workflows/start`:

1. Resolve current user and workspace from headers or mock fallback.
2. Check workspace role permission `workflow:start`.
3. Run existing governance evaluation for workflow execution.
4. Create workflow and workflow run with `workspace_id`.
5. Create approval checkpoint with `workspace_id`.
6. Log audit event with `workspace_id` and `user_id`.
7. Dashboard overview returns workspace metadata, role, permissions, read-only state, and approval authority.

## Supabase Auth Readiness

The layer is Supabase Auth-ready, but real Auth is not required to run immediately. When `Authorization: Bearer <token>` is present and Supabase anon env vars exist, `AuthService` attempts `supabase.auth.getUser(token)`.

## Boundaries

- Auth determines who the human user is.
- Workspace determines which AI company is active.
- RBAC determines what the user may do.
- Governance still determines whether the AI action itself is allowed or requires approval.
- Persistence stores scoped records and remains compatible with in-memory fallback.
