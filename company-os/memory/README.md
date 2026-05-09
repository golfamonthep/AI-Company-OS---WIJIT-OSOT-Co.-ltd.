# Memory Layer

The Memory Layer defines what the company and agents remember.

## Memory Categories

### Company Memory

Shared institutional knowledge:

- Company facts
- Brand preferences
- Product facts
- SOPs
- Market knowledge
- Reusable workflow lessons

### Agent Memory

Role-specific learning:

- Agent preferences
- Skill improvements
- Past mistakes
- Successful patterns
- Role-specific constraints

### Task History

Execution memory:

- Assigned tasks
- Progress updates
- Blockers
- Outputs
- Approval history
- Final results

### Decision Log

Strategic memory:

- Decision
- Owner
- Rationale
- Tradeoffs
- Rejected options
- Approval source
- Date

## Retrieval Rules

- Agents retrieve memory before acting.
- SOPs and approved decisions outrank suggestions.
- Role-based access controls what an agent can retrieve.
- Memory should return citations and confidence.
- Sensitive memory requires stricter access policy.

## Current Runtime Integration

The first Memory Retrieval Engine lives in:

- `src/modules/agent-runtime/memory`

Current implementation:

- Loads markdown memory files from `memory/`
- Registers company, agent, task history, decision log, and workflow memory
- Retrieves relevant memory by keyword ranking
- Injects limited context into SkillExecutor
- Logs retrieval to file and Supabase-ready table
- Saves task history and agent learning notes after runtime completion

Vector search is not active yet. The structure is prepared for future Supabase pgvector integration.

## Write Rules

- Not every agent output becomes memory.
- Important results become memory candidates.
- Approved decisions become decision log entries.
- Repeated lessons become company memory.
- Sensitive memory promotion can require approval.

## Migration From Existing Code

- `src/modules/memory` becomes runtime memory repository/retrieval.
- `docs/shared-organizational-memory-system.md` remains detailed design reference.
- Supabase `memory_items` is current long-term memory table.
- Task and workflow history should eventually write reusable lessons back here.
