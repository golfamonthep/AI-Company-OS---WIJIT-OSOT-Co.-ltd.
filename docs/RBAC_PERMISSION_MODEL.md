# RBAC_PERMISSION_MODEL

AI Company OS uses role-based access control at the workspace boundary.

## Roles

| Role | Intent |
| --- | --- |
| Owner | Full control, billing owner later, workspace management, all high-impact approvals |
| Admin | Manage agents and workflows, approve normal operations |
| Manager | Review workflows, approve content and reports |
| Operator | Run workflows, submit tasks, view dashboards |
| Viewer | Read-only access |

## Permission Groups

- Workspace: `workspace:manage`, `workspace:view`
- Agents: `agent:manage`, `agent:view`
- Workflows: `workflow:manage`, `workflow:start`, `workflow:review`, `workflow:view`
- Memory: `memory:write`, `memory:view`
- Approvals: `approval:approve_all`, `approval:approve_normal`, `approval:approve_content`, `approval:view`
- Integrations: `integration:manage`, `integration:read`, `integration:write`
- Operations: `operations:run`, `operations:view`
- Dashboard: `dashboard:view`

## Approval Authority

| Role | Approval authority |
| --- | --- |
| Owner | low, normal, high |
| Admin | low, normal |
| Manager | low, normal |
| Operator | none |
| Viewer | none |

High-impact actions include publish, send, spend, delete, account setting changes, customer contact, financial mutations, and connector write or external actions. These must not bypass governance.

## Enforcement Points

- API routes call workspace RBAC before executing protected actions.
- Governance evaluation still applies after RBAC.
- Connector write actions require a role with integration write authority and the existing governance approval flow.
- Viewer mode is read-only in the dashboard and should not expose mutation controls.

## Development Fallback

When auth is not configured, the fallback user has Owner role by default so local development remains usable. Tests and manual requests can simulate lower privileges with `x-workspace-role: viewer`, `operator`, `manager`, or `admin`.
