# Workflow Layer

The Workflow Layer defines repeatable company operations that coordinate multiple agents, skills, harnesses, and memory.

## Workflow Contract

Each workflow should define:

- Business objective
- Owner agent
- Participant agents
- Required skills
- Required harness capabilities
- Memory context requirements
- Steps
- Conditional branches
- Approval gates
- Failure handling
- Outputs
- Memory writeback

## Runtime Contract

Shared workflow execution starts in:

- `src/modules/agent-runtime/workflow-executor.ts`
- `src/modules/agent-runtime/runtime.ts`
- `src/modules/agent-runtime/workflows`

Each production agent should provide a small workflow adapter that owns agent-specific choices while the core runtime owns loading, memory, harness, output, and event persistence.

## Current Workflow Execution Engine

The first structured workflow engine lives in:

- `src/modules/agent-runtime/workflows`
- `docs/workflow-execution-engine.md`

It loads `WORKFLOW.md`, routes steps to agents, manages workflow states, handles approval checkpoints, logs step results, and calls the Content Creator runtime for the first real workflow step.

## Core Workflows

### Create Product

Agents:

- CEO
- R&D
- CTO
- CFO
- Marketing
- Content Creator

Outcome:

- Product concept
- Feasibility
- Claims/evidence
- Budget
- Launch plan

### Run Ads

Agents:

- CEO
- Marketing
- Ads Performance
- Content Creator
- Video Editor
- CFO
- CTO

Outcome:

- Campaign strategy
- Creative assets
- Targeting plan
- Budget approval
- Tracking setup
- Performance report

### Create Content

Agents:

- Marketing
- Content Creator
- Video Editor
- R&D

Outcome:

- Hooks
- Drafts/scripts
- Asset checklist
- Compliance notes
- Performance learning

Canonical first implementation:

- `company-os/workflows/ai-content-production-pipeline.md`
- `company-os/workflows/content-production/WORKFLOW.md`
- UI: `/workflows/content-production`
- API: `POST /api/workflows/content-production/start`
- Approval API: `POST /api/workflows/content-production/[id]/approve`
- Generic execution API: `POST /api/workflows/execute`

### Analyze Finance

Agents:

- CFO
- CEO
- Ads Performance
- Marketing

Outcome:

- Budget analysis
- ROI assumptions
- Cost risks
- Approval recommendation

### Research Market

Agents:

- R&D
- Marketing
- CEO
- Content Creator

Outcome:

- Market insight
- Audience insight
- Competitor notes
- Product opportunity
- Evidence-backed recommendation

## Migration From Existing Code

- `src/modules/workflows` becomes runtime workflow engine.
- `docs/autonomous-workflow-engine.md` remains detailed design reference.
- Existing task delegation and communication modules become workflow execution bridges.

## Next Implementation Step

Define workflow templates as data and connect each step to:

- Agent
- Skill
- Harness capability
- Memory read/write rule
