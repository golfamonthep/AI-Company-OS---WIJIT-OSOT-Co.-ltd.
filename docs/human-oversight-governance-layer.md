# Human Oversight and Governance Layer

The Human Oversight and Governance Layer controls what agents are allowed to do, when approval is required, and how important actions are audited.

This layer is intentionally separate from skills, memory, workflow, harness, and collaboration:

- Skills define SOPs and quality rules.
- Harness modules execute real tools.
- Workflows coordinate tasks.
- Collaboration coordinates agents.
- Governance decides whether the action is allowed, blocked, or approval-gated.

## Architecture

```txt
Agent or Workflow Request
  -> PermissionManager
  -> GovernancePolicyEngine
  -> ApprovalWorkflowManager when needed
  -> AuditLogger
  -> EmergencyControlManager override check
  -> Runtime continues, waits, revises, or stops
```

## Components

### PermissionManager

Defines agent authority:

- allowed workflows
- allowed harness tools
- approval domains
- escalation paths
- execution limits

The initial permission matrix covers CEO, CTO, CFO, Marketing, Ads Performance, Content Creator, Video Editor, R&D, and the workflow engine.

### GovernancePolicyEngine

Evaluates policy rules after permission checks.

Current rules:

- publishing requires approval
- company memory writes by Content Creator require approval
- Python, Node, Browser, and Media harnesses require runtime approval
- risky product claims require R&D/evidence approval

### ApprovalWorkflowManager

Creates and tracks approval requests.

Supported decisions:

- approved
- rejected
- changes_requested
- emergency_stopped

Approval records are kept in memory for local execution and upserted into Supabase when configured.

### AuditLogger

Writes important events to:

- `governance/AUDIT_LOG.md` for file-first local traceability
- `public.governance_audit_logs` when Supabase is configured

Audit records include actor, event type, severity, decision, workflow reference, task reference, metadata, and timestamp.

### OversightDashboardService

Builds a governance dashboard snapshot:

- approval counts
- high/critical audit event counts
- emergency state

This is service-level preparation for a future UI, not a dashboard implementation yet.

### EmergencyControlManager

Supports emergency stop and resume.

Emergency stop can pause:

- workflows
- agents
- dangerous runtime execution

Emergency state is kept in memory for local execution and upserted into Supabase when configured.

## Database Schema

Migration:

- `supabase/migrations/202605080003_human_oversight_governance_layer.sql`

Tables:

- `governance_audit_logs`
- `governance_approval_requests`
- `governance_emergency_controls`

All tables use organization-scoped RLS through `public.is_org_member(organization_id)`.

## Governance Execution Flow

Mother-and-baby TikTok Campaign sample:

1. CEO requests `content-production` workflow.
2. `GovernancePolicyEngine` validates CEO workflow authority.
3. Audit event records the governance evaluation.
4. Collaboration sample runs CEO -> Marketing -> Content Creator -> Video Editor -> Ads Performance -> CEO.
5. Content Creator prepares content package.
6. Publishing policy evaluates as `requires_approval`.
7. Approval request is created for CEO and human approval.
8. CEO records an approval decision.
9. Approval remains pending until all required approvers, including human approval when configured, have approved.
10. Audit events make the workflow traceable.
11. Emergency stop can pause the workflow if policy denies execution.

Sample module:

- `src/modules/agent-runtime/governance/sample-mother-baby-governance.ts`

## Current Boundaries

The governance layer is implemented as a reusable foundation. It is not yet enforced globally at every workflow, harness, and collaboration boundary.

Next integration work should call governance checks before:

- workflow execution
- harness execution
- memory writes
- approval decisions
- publishing/export actions
- high-risk collaboration handoffs

## Final Folder Tree

```txt
governance/
  APPROVAL_POLICIES.md
  AUDIT_REQUIREMENTS.md
  GOVERNANCE_RULES.md
  PERMISSION_MATRIX.md

src/modules/agent-runtime/governance/
  ApprovalWorkflowManager.ts
  AuditLogger.ts
  EmergencyControlManager.ts
  GovernancePolicyEngine.ts
  OversightDashboardService.ts
  PermissionManager.ts
  sample-mother-baby-governance.ts
  types.ts

supabase/migrations/
  202605080003_human_oversight_governance_layer.sql
```

## Next Step

Wire governance checks into the existing WorkflowExecutor and HarnessExecutor so approval gates become enforced runtime checkpoints instead of optional service calls.
