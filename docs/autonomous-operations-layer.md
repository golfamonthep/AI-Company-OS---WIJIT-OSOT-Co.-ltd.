# Autonomous Operations Layer

The Autonomous Operations Layer lets AI Company OS operate proactively while staying supervised, auditable, and approval-based for high-impact actions.

This is not unrestricted autonomy. The layer monitors, detects, recommends, schedules, and routes actions. It does not publish, spend, delete memory, modify finances, change governance, or execute irreversible external actions without approval.

## Architecture

```txt
OperationsScheduler
  -> TriggerEngine
  -> OperationsMonitor
  -> RecommendationEngine
  -> RiskDetector
  -> ActionApprovalRouter
  -> OperationsLogger
  -> Governance approval or low-risk internal task
```

## Components

### OperationsMonitor

Builds company operations snapshots and detects signals from:

- task backlog
- workflow health
- KPI changes
- agent workload
- memory quality

### TriggerEngine

Evaluates scheduled and event-driven triggers.

Supported trigger families:

- weekly review
- KPI drop
- failed workflow
- task backlog
- memory quality issue

### RecommendationEngine

Creates ranked recommended actions from operational signals.

Ranking considers:

- impact
- urgency
- signal severity
- approval requirement

### OperationsScheduler

Registers recurring low-risk internal operations.

Initial schedules:

- daily content planning
- weekly AI company review
- monthly financial review

Schedules prepare internal work. They do not perform high-impact external actions.

### RiskDetector

Detects high-impact or restricted operations.

High-impact patterns include:

- publish
- spend
- budget
- financial
- delete memory
- external
- governance
- permission
- irreversible

### ActionApprovalRouter

Routes high-impact recommendations to Governance through `ApprovalWorkflowManager`.

Low-risk recommendations may remain internal tasks.

### OperationsLogger

Writes operations events to:

- `operations/OPERATIONS_LOG.md`
- `operations_logs`

## Weekly AI Company Review Flow

1. OperationsScheduler triggers weekly review.
2. CEO gathers workflow results.
3. CFO reviews financial notes.
4. Marketing reviews campaign performance.
5. Content Creator reviews content output.
6. Learning system summarizes improvements.
7. CEO generates weekly report.
8. Governance routes report and high-impact recommendations for approval.
9. Approved learnings become candidates for controlled memory updates.

Sample module:

- `src/modules/agent-runtime/operations/sample-weekly-company-review.ts`

Workflow definition:

- `workflows/weekly-company-review/WORKFLOW.md`

## Database Schema

Migration:

- `supabase/migrations/202605080005_autonomous_operations_layer.sql`

Tables:

- `operations_logs`
- `operations_schedules`
- `operations_runs`
- `operations_recommendations`

All tables use organization-scoped RLS through `public.is_org_member(organization_id)`.

## Final Folder Tree

```txt
operations/
  AUTONOMY_BOUNDARIES.md
  OPERATIONS_POLICY.md
  SCHEDULED_OPERATIONS.md
  TRIGGER_RULES.md

src/modules/agent-runtime/operations/
  ActionApprovalRouter.ts
  OperationsLogger.ts
  OperationsMonitor.ts
  OperationsScheduler.ts
  RecommendationEngine.ts
  RiskDetector.ts
  TriggerEngine.ts
  sample-weekly-company-review.ts
  types.ts

workflows/weekly-company-review/
  WORKFLOW.md

supabase/migrations/
  202605080005_autonomous_operations_layer.sql
```

## Next Step

Wire OperationsScheduler to a real job runner or cron abstraction, then build an oversight UI that shows triggers, risks, recommendations, approvals, and generated reports before any action is executed.
