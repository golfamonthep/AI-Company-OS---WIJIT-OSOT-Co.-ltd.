# AI Company OS

AI Company OS is an AI-native operating system for running a company with structured agents, operational skills, real execution harnesses, shared memory, and repeatable workflows.

This project is not a multi-chatbot app. It is being organized as a company operating system where agents can plan, delegate, execute, learn, and improve.

## Core Layers

- Agent Layer: CEO, CTO, CFO, Marketing, Ads Performance, Content Creator, Video Editor, R&D
- Skill Layer: SOPs, workflows, input/output contracts, quality checks, guardrails
- Harness Layer: runtimes and tools agents can actually use
- Memory Layer: company memory, agent memory, task history, decision log
- Workflow Layer: company operations such as product creation, ads, content, finance, and research
- Governance Layer: permissions, approvals, auditability, emergency controls
- Learning Layer: controlled feedback loops and human-reviewed improvement proposals
- Operations Layer: monitored, scheduled, recommendation-driven operations with approval routing
- External Integrations Layer: safe OAuth-ready connector stubs, connector permissions, audit logs, and approval-gated external actions
- Database and Persistence Layer: Supabase/PostgreSQL-ready repositories, migrations, in-memory fallback, and file-to-database migration bridge
- API Layer: official App Router backend routes with validation, permission guards, audit helper, and repository-backed persistence

## First Real Workflow

AI Content Production Pipeline:

- Canonical workflow: `company-os/workflows/ai-content-production-pipeline.md`
- Architecture doc: `docs/ai-content-production-pipeline.md`
- UI: `/workflows/content-production`
- Start API: `POST /api/workflows/content-production/start`
- Approval API: `POST /api/workflows/content-production/[id]/approve`

## First Production-Ready Agent

Content Creator Agent:

- Agent manual: `company-os/agents/content-creator/AGENT.md`
- Skill manual: `company-os/agents/content-creator/SKILLS.md`
- Runtime architecture: `company-os/agents/content-creator/ARCHITECTURE.md`
- Runtime doc: `docs/content-creator-agent-runtime.md`
- Runtime module: `src/modules/content-creator-agent`
- Execute API: `POST /api/agents/content-creator/execute`

This agent validates the intended separation between agent profile, skill SOPs, harness tools, memory retrieval, workflow execution, task history, and learning notes.

## Core Agent Runtime

The shared execution engine lives in:

- Runtime doc: `docs/core-agent-runtime.md`
- Runtime module: `src/modules/agent-runtime`
- Runtime schema: `supabase/migrations/202605070010_core_agent_runtime.sql`

The first implementation is wired only to Content Creator Agent. Future agents should add small workflow adapters instead of duplicating runtime loading, memory, harness, output, and communication logic.

## Skill Execution Engine

Executable skills live under the Core Agent Runtime:

- Skill engine doc: `docs/skill-execution-engine.md`
- Skill engine module: `src/modules/agent-runtime/skills`
- Skill log module: `src/modules/agent-runtime/logs`
- Skill log schema: `supabase/migrations/202605070011_skill_execution_engine.sql`
- Content workflow sample: `company-os/workflows/content-production/WORKFLOW.md`

Content Creator `SKILLS.md` is now written in the standard executable skill schema.

## Memory Retrieval Engine

File-first memory retrieval lives under the Core Agent Runtime:

- Memory engine doc: `docs/memory-retrieval-engine.md`
- Memory engine module: `src/modules/agent-runtime/memory`
- Starter memory files: `memory`
- Retrieval log schema: `supabase/migrations/202605070012_memory_retrieval_engine.sql`

The engine retrieves company memory, agent memory, task history, decision logs, and workflow memory, then injects ranked context into skill execution.

## Workflow Execution Engine

Structured workflow orchestration lives under the Core Agent Runtime:

- Workflow engine doc: `docs/workflow-execution-engine.md`
- Workflow engine module: `src/modules/agent-runtime/workflows`
- Workflow schema: `supabase/migrations/202605070013_workflow_execution_engine.sql`
- Generic execute API: `POST /api/workflows/execute`

The first implemented workflow is `content-production`, with Content Creator Agent executing the real runtime step and other participating agents represented as routed structured handoffs.

## Harness Execution Layer

Executable tools and connector boundaries live under the Core Agent Runtime:

- Harness layer doc: `docs/harness-execution-layer.md`
- Harness module: `src/modules/agent-runtime/harness`
- Harness schema: `supabase/migrations/202605080001_harness_execution_layer.sql`

The first active harness integration saves Content Creator outputs to `artifacts/content-creator/` through FileSystemHarness and logs execution metadata.

## Multi-Agent Collaboration Layer

Agent communication and coordination live under the Core Agent Runtime:

- Collaboration doc: `docs/multi-agent-collaboration-layer.md`
- Collaboration module: `src/modules/agent-runtime/collaboration`
- Collaboration schema: `supabase/migrations/202605080002_multi_agent_collaboration_layer.sql`

The first collaboration sample is the Mother-and-baby TikTok Campaign flow across CEO, Marketing, Content Creator, Video Editor, and Ads Performance.

## Human Oversight and Governance Layer

Governance, approvals, permissions, emergency controls, and auditability live under the Core Agent Runtime:

- Governance doc: `docs/human-oversight-governance-layer.md`
- Governance module: `src/modules/agent-runtime/governance`
- Governance policies: `governance`
- Governance schema: `supabase/migrations/202605080003_human_oversight_governance_layer.sql`

The first governance sample wraps the Mother-and-baby TikTok Campaign with permission validation, approval request tracking, audit logs, and emergency stop support.

## Self-Improving Learning System

Controlled learning lives under the Core Agent Runtime:

- Learning doc: `docs/self-improving-learning-system.md`
- Learning module: `src/modules/agent-runtime/learning`
- Learning policies: `learning`
- Learning schema: `supabase/migrations/202605080004_self_improving_learning_system.sql`

The first learning sample processes human feedback for the Mother-and-baby TikTok Campaign, scores Hook Generation performance, proposes an SOP refinement, queues it for review, and requires human approval before future use.

## Autonomous Operations Layer

Supervised proactive operations live under the Core Agent Runtime:

- Operations doc: `docs/autonomous-operations-layer.md`
- Operations module: `src/modules/agent-runtime/operations`
- Operations policies: `operations`
- Weekly review workflow: `workflows/weekly-company-review/WORKFLOW.md`
- Operations schema: `supabase/migrations/202605080005_autonomous_operations_layer.sql`

The first operations sample runs a Weekly AI Company Review, detects operational signals, ranks recommendations, checks risk, routes high-impact actions to governance approval, and logs the run.

## AI Company Control Center

The central dashboard lives in:

- Dashboard doc: `docs/ai-company-control-center-dashboard.md`
- Dashboard route: `src/app/dashboard/page.tsx`
- Dashboard modules: `src/dashboard`

The dashboard visualizes executive health, agents, workflows, governance, learning, operations, memory, approvals, KPIs, and the Mother-and-baby TikTok Campaign demo flow.

## External Integrations Layer

Safe business-tool connectors live under the Core Agent Runtime:

- Integrations doc: `docs/external-integrations-layer.md`
- Integrations module: `src/modules/agent-runtime/integrations`
- Integration policies: `integrations`
- Integrations schema: `supabase/migrations/202605080006_external_integrations_layer.sql`

The first integration demo is a Google Docs draft stub for a Content Campaign Draft. It requires governance approval, writes no real external account, logs connector execution, and saves the integration result to task memory.

## Database and Persistence Layer

Database persistence lives in:

- Database doc: `docs/DATABASE_ARCHITECTURE.md`
- Migration plan: `docs/PERSISTENCE_MIGRATION_PLAN.md`
- Database module: `src/database`
- Canonical additive migrations: `supabase/migrations/202605080007_database_persistence_001_initial_schema.sql` through `supabase/migrations/202605080011_database_persistence_005_learning_operations_integrations.sql`

The persistence layer uses repositories over `PersistenceService`. If Supabase env vars are missing, it safely falls back to in-memory persistence for demos and local development.

## API Layer

Backend API routes live in:

- API architecture: `docs/API_ARCHITECTURE.md`
- Endpoint list: `docs/API_ENDPOINTS.md`
- Shared API utilities: `src/server/api`
- App Router routes: `src/app/api`

The first safe API demo is `POST /api/workflows/start`, which creates a workflow run, creates an approval checkpoint, audits the action, and returns `workflow_run_id` plus status. Dashboard overview is exposed at `GET /api/dashboard/overview`.

## Canonical Operating Structure

```txt
company-os/
  agents/
  skills/
  harness/
  memory/
  workflows/
learning/
governance/
operations/
integrations/
workflows/
src/database/
src/server/api/
```

Existing application code remains in:

- `src/app`: Next.js routes and pages
- `src/modules`: domain modules and runtime implementation
- `src/components`: UI components
- `supabase/migrations`: database schema and RLS
- `docs`: architecture history and supporting design documents

## Start Here

Read these files first:

- `SYSTEM_ARCHITECTURE.md`
- `COMPANY_STRUCTURE.md`
- `ROADMAP.md`
- `PROJECT_RULES.md`
- `CURRENT_STATUS.md`
- `NEXT_TASKS.md`

Then inspect:

- `company-os/agents/*/AGENT.md`
- `company-os/agents/*/SKILLS.md`
- `company-os/harness/README.md`
- `company-os/memory/README.md`
- `company-os/workflows/README.md`
- `governance/*.md`
- `learning/*.md`
- `operations/*.md`
- `integrations/*.md`
- `docs/DATABASE_ARCHITECTURE.md`
- `docs/PERSISTENCE_MIGRATION_PLAN.md`
- `docs/API_ARCHITECTURE.md`
- `docs/API_ENDPOINTS.md`

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase Auth/Postgres
- pgvector
- LangGraph TypeScript target

## Local Setup

Dependencies have not been installed in the current environment because `npm` is unavailable in the shell.

When available:

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000/dashboard
```

## Reset Principle

Future work should start from the operating layers:

1. Define the agent
2. Define the skill manual
3. Define required harness capability
4. Define memory read/write behavior
5. Define workflow integration
6. Define governance and learning review boundaries
7. Define operations trigger and approval behavior
8. Define database repository and file fallback behavior
9. Define API validation, permission guard, and audit behavior

Only then implement UI/API/runtime behavior.
