# Observability Guide

ai-company-os uses structured MVP observability instead of a heavy monitoring stack.

## Structured Logs

Logs are produced by `src/infrastructure/StructuredLogger.ts`.

Every log entry includes:

- `timestamp`
- `level`
- `layer`
- `event`
- `message`
- optional `organizationId`
- optional `workflowId`
- optional `agentId`
- optional `correlationId`
- optional `durationMs`
- optional structured `metadata`

## Health Checks

`HealthCheckService` reports:

- environment health
- retry queue health
- workflow recovery health
- API readiness
- workflow success/failure rate
- retry backlog
- dead-letter count
- log error count

## Dashboard Integration

The dashboard can read health data from `HealthCheckService.getSystemHealth()` through a future `/api/health` route.

Recommended dashboard panels:

- System status
- Workflow recovery state
- Retry queue backlog
- Recent structured logs
- Approval bottlenecks
- Connector execution status
- Learning review queue backlog

## MVP Alert Rules

- `unhealthy` environment check: block production release.
- dead-letter count above zero: human review required.
- workflow failure rate above 20 percent: pause automation rollout.
- retry backlog growing for more than one review period: inspect harness/API failures.
