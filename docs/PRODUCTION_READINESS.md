# MVP Production Readiness

This layer prepares ai-company-os for stable MVP usage without introducing enterprise-scale infrastructure too early.

## Architecture

- `ConfigManager` centralizes environment config, safe defaults, and deployment target detection.
- `EnvironmentValidator` checks whether local, staging, or production config is deployable.
- `GlobalErrorHandler` normalizes runtime failures into structured, workflow-safe errors.
- `StructuredLogger` creates JSON logs with layer, workflow, agent, correlation, and metadata fields.
- `HealthCheckService` reports system, workflow, retry queue, API, and environment health.
- `WorkflowRecoveryManager` stores restart-safe workflow checkpoints in memory for MVP and can be backed by persistence later.
- `RetryQueueManager` queues failed workflow tasks and tracks queued, running, completed, and dead-letter states.
- `RateLimitManager` provides in-memory API, connector, workflow, and agent throttling for MVP safety.
- `DeploymentConfigGenerator` creates environment templates and deployment checklists.

## MVP Boundaries

- Local development must keep working without Supabase or OpenAI.
- Production should configure Supabase and OpenAI before real business usage.
- External connector writes remain approval-gated.
- Retry queues are in-memory for MVP demos; durable queue persistence is the next hardening step.
- Structured logs are emitted to console and retained in memory for health summaries.

## Safety Defaults

- Missing Supabase uses repository fallback behavior.
- Missing OpenAI uses deterministic agent fallback output.
- Workflow failures are captured as structured recoverable errors when possible.
- High-impact external actions remain blocked by governance requirements.

## Observability Metrics

- Workflow success rate
- Workflow failure rate
- Retry backlog
- Dead-letter count
- Log error count
- Learning queue backlog placeholder
- Approval bottleneck placeholder
