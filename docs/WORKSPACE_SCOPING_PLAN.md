# WORKSPACE_SCOPING_PLAN

Workspace scoping is additive and preserves the existing architecture.

## Current Compatibility

Existing repositories and routes use `organization_id`. The workspace layer maps the current workspace to both:

- `workspace_id`: future SaaS isolation key
- `organization_id`: compatibility key for existing repositories and migrations

No existing files or tables are deleted.

## Database Plan

Migration `006_auth_workspace_schema.sql` adds:

- `profiles`
- `workspaces`
- `workspace_members`
- `workspace_roles`
- `role_permissions`
- `user_preferences`
- `workspace_settings`
- `workspace_invitations`

Migration `007_workspace_scope_existing_tables.sql` adds workspace ownership metadata to runtime tables:

- `workspace_id`
- `created_by`
- `updated_by`
- `owner_user_id` where ownership matters

## Runtime Plan

All future writes should:

1. Resolve the current workspace.
2. Check the required role permission.
3. Stamp records with `workspace_id`, `organization_id`, `created_by`, and `updated_by`.
4. Use `WorkspaceGuard` before reading or mutating resource-specific records.
5. Log audit events with both `workspace_id` and `user_id`.

## Read Isolation

Dashboard and API reads should prefer `workspace_id`. During migration, fallback reads may also accept matching `organization_id` in development memory mode.

## Existing Layer Mapping

- Agent Layer records belong to a workspace.
- Skill Layer records belong to a workspace, even when the skill manual is shared globally later.
- Memory Layer records are workspace-scoped and may also be agent-scoped.
- Workflow Layer definitions and runs are workspace-scoped.
- Governance approvals and audit logs are workspace-scoped.
- Learning proposals are workspace-scoped and require human review before applying changes.
- Operations triggers, runs, and recommendations are workspace-scoped.
- External integrations and connector audit logs are workspace-scoped.

## RLS Preparation

Supabase RLS policies should later allow access only when:

- `auth.uid()` is an active member of `workspace_members`.
- The member role has the required permission.
- Mutations stamp `created_by` or `updated_by` with `auth.uid()`.

Until RLS is fully implemented, API guards are the enforcement point.
