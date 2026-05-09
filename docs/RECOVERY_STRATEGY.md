# Recovery Strategy

## Scenario: Workflow Failure Recovery

1. Content Production Workflow starts.
2. A simulated harness/API failure occurs.
3. `GlobalErrorHandler` converts the failure into a structured recoverable error.
4. `RetryQueueManager` queues a retry item.
5. `WorkflowRecoveryManager` stores the last safe checkpoint.
6. Governance receives a structured failure event.
7. `HealthCheckService` reports degraded retry/workflow health while recovery is pending.
8. The workflow resumes from the checkpoint and completes with deterministic fallback output if needed.

## Recovery Components

- Checkpoints store `workflowId`, `organizationId`, `agentId`, `currentStep`, and safe context.
- Retry queue tracks attempts, availability time, and dead-letter state.
- Error handler marks whether the failure is retryable and workflow-safe.
- Health service exposes backlog and failed workflow signals for the dashboard.

## MVP Persistence

Current retry queue and recovery checkpoints are in-memory.

Production-ready next step:

- Persist retry items in Supabase.
- Persist workflow checkpoints in canonical workflow run tables.
- Resume queued recovery work from a cron/job runner after deployment restart.

## Human Review Rules

- Dead-letter workflows require human review.
- Recovered workflows should still retain the failure log.
- External publishing must not resume automatically after recovery without governance approval.
