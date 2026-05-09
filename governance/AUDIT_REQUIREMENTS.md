# Audit Requirements

## Events To Audit

- agent task execution
- skill execution
- workflow execution
- harness execution
- memory write
- collaboration message
- delegation
- handoff
- approval request
- approval decision
- escalation
- emergency stop
- permission denied

## Audit Record Fields

- organization_id
- actor_agent_id
- event_type
- severity
- summary
- decision
- related_workflow_id
- related_task_id
- metadata
- created_at

## Retention

- Keep audit logs indefinitely until retention policy is explicitly defined.
- Do not delete audit logs automatically.
