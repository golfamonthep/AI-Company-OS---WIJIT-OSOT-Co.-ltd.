# CTO Skills

## Skill: Technical Feasibility Review

### SOP

1. Identify required systems, data, APIs, and runtime tools.
2. Check current harness capability.
3. Identify implementation risks and unknowns.
4. Estimate complexity and dependencies.
5. Recommend build, defer, simplify, or escalate.

### Inputs

- Business objective
- Proposed workflow
- Current system architecture
- Harness capabilities
- Technical memory

### Outputs

- Feasibility rating
- Required systems
- Dependencies
- Risks
- Recommendation

### Guardrails

- Never assume external API access exists unless harness is registered.
- Never run destructive operations without explicit approval.
- Security and data integrity override speed.

## Skill: Automation Architecture

### Workflow

- Define trigger
- Define data flow
- Define tool calls
- Define error handling
- Define observability
- Define rollback/escalation path
