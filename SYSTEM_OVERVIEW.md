# SYSTEM_OVERVIEW

AI Company OS is being reset into a layered AI-native company operating system.

The system is not a chatbot platform. It is an operating model where agents use documented skills, real harness tools, shared memory, and workflows to run company work.

## Canonical Architecture

The new source of truth starts here:

- `SYSTEM_ARCHITECTURE.md`
- `COMPANY_STRUCTURE.md`
- `ROADMAP.md`
- `company-os/MIGRATION_PLAN.md`
- `company-os/agents/*/AGENT.md`
- `company-os/agents/*/SKILLS.md`
- `company-os/skills/README.md`
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

## Operating Layers

1. Agent Layer: CEO, CTO, CFO, Marketing, Ads Performance, Content Creator, Video Editor, R&D
2. Skill Layer: SOP, workflow, inputs/outputs, quality checklist, guardrails
3. Harness Layer: Node, Python, browser automation, file system, Supabase/Postgres, API connectors
4. Memory Layer: company memory, agent memory, task history, decision log
5. Workflow Layer: create product, run ads, create content, analyze finance, research market
6. Governance Layer: permissions, approvals, audit logs, emergency stops, operational safety
7. Learning Layer: feedback loops, skill performance, improvement proposals, human review
8. Operations Layer: monitoring, triggers, recommendations, schedules, approval routing
9. External Integrations Layer: OAuth-ready connector stubs, connector permissions, safe read/write boundaries, and connector audit logs
10. Database and Persistence Layer: Supabase-ready migrations, typed repositories, persistence fallback, and file-to-database bridge
11. API Layer: official backend interface with validation, route guards, audit helper, repositories, and dashboard-ready routes

## First Real Workflow

- AI Content Production Pipeline
- Canonical doc: `company-os/workflows/ai-content-production-pipeline.md`
- Architecture doc: `docs/ai-content-production-pipeline.md`
- UI: `/workflows/content-production`
- Start API: `POST /api/workflows/content-production/start`
- Approval API: `POST /api/workflows/content-production/[id]/approve`

## First Production-Ready Agent

- Content Creator Agent
- Agent manual: `company-os/agents/content-creator/AGENT.md`
- Skill manual: `company-os/agents/content-creator/SKILLS.md`
- Runtime architecture: `company-os/agents/content-creator/ARCHITECTURE.md`
- Runtime doc: `docs/content-creator-agent-runtime.md`
- Runtime module: `src/modules/content-creator-agent`
- Execute API: `POST /api/agents/content-creator/execute`

The Content Creator Agent is the first runtime proof that markdown agent definitions, skill manuals, harness tools, memory, guardrails, persistence, and structured outputs can work together without merging the layers into one chatbot prompt.

## Core Agent Runtime

- Runtime doc: `docs/core-agent-runtime.md`
- Runtime module: `src/modules/agent-runtime`
- Runtime schema: `supabase/migrations/202605070010_core_agent_runtime.sql`

The core runtime is the shared execution engine for all future agents. Current production implementation is intentionally limited to the Content Creator Agent through `src/modules/content-creator-agent/runtime-adapter.ts`.

## Skill Execution Engine

- Skill engine doc: `docs/skill-execution-engine.md`
- Skill engine module: `src/modules/agent-runtime/skills`
- Skill log module: `src/modules/agent-runtime/logs`
- Skill log schema: `supabase/migrations/202605070011_skill_execution_engine.sql`

The Skill Execution Engine makes `SKILLS.md` structured, selectable, executable, validated, and logged while keeping the skill/harness boundary clear.

## Memory Retrieval Engine

- Memory engine doc: `docs/memory-retrieval-engine.md`
- Memory engine module: `src/modules/agent-runtime/memory`
- Starter memory files: `memory`
- Retrieval log schema: `supabase/migrations/202605070012_memory_retrieval_engine.sql`

The Memory Retrieval Engine is file-first and pgvector-ready. It retrieves relevant memory by keyword ranking now and injects context into SkillExecutor without mixing memory storage with prompt logic.

## Workflow Execution Engine

- Workflow engine doc: `docs/workflow-execution-engine.md`
- Workflow engine module: `src/modules/agent-runtime/workflows`
- Workflow schema: `supabase/migrations/202605070013_workflow_execution_engine.sql`
- Generic execute API: `POST /api/workflows/execute`

The Workflow Execution Engine loads `WORKFLOW.md`, manages states, routes tasks, handles approval checkpoints, logs workflow runs, and calls the Content Creator runtime for the first real workflow implementation.

## Harness Execution Layer

- Harness layer doc: `docs/harness-execution-layer.md`
- Harness module: `src/modules/agent-runtime/harness`
- Harness schema: `supabase/migrations/202605080001_harness_execution_layer.sql`

The Harness Execution Layer provides the executable boundary for filesystem, API, Python, Node, future browser automation, and future media processing. FileSystemHarness is wired into Content Creator output saving now.

## Multi-Agent Collaboration Layer

- Collaboration doc: `docs/multi-agent-collaboration-layer.md`
- Collaboration module: `src/modules/agent-runtime/collaboration`
- Collaboration schema: `supabase/migrations/202605080002_multi_agent_collaboration_layer.sql`

The collaboration layer provides messaging, delegation, handoffs, approvals, escalations, shared memory references, and collaboration logs without creating full autonomous company behavior.

## Human Oversight and Governance Layer

- Governance doc: `docs/human-oversight-governance-layer.md`
- Governance module: `src/modules/agent-runtime/governance`
- Governance policies: `governance`
- Governance schema: `supabase/migrations/202605080003_human_oversight_governance_layer.sql`

The governance layer provides permission validation, policy evaluation, approval tracking, audit logging, oversight summaries, and emergency controls. It is a supervision layer, not a self-improvement or full autonomy layer.

## Self-Improving Learning System

- Learning doc: `docs/self-improving-learning-system.md`
- Learning module: `src/modules/agent-runtime/learning`
- Learning policies: `learning`
- Learning schema: `supabase/migrations/202605080004_self_improving_learning_system.sql`

The learning layer provides feedback processing, execution analysis, skill performance tracking, SOP refinement proposals, memory refinement suggestions, review queue enforcement, and learning audit logs. It creates reviewable proposals only; it does not rewrite architecture, governance, permissions, or runtime code.

## Autonomous Operations Layer

- Operations doc: `docs/autonomous-operations-layer.md`
- Operations module: `src/modules/agent-runtime/operations`
- Operations policies: `operations`
- Weekly review workflow: `workflows/weekly-company-review/WORKFLOW.md`
- Operations schema: `supabase/migrations/202605080005_autonomous_operations_layer.sql`

The operations layer provides monitoring, scheduled/event-driven triggers, ranked recommendations, risk detection, approval routing, and operations logs. It prepares and recommends work but does not execute high-impact actions without governance approval.

## AI Company Control Center

- Dashboard doc: `docs/ai-company-control-center-dashboard.md`
- Dashboard route: `src/app/dashboard/page.tsx`
- Dashboard modules: `src/dashboard`

The control center is the executive operating console for monitoring agents, workflows, approvals, governance, learning, operations, memory, KPIs, and collaboration.

## External Integrations Layer

- Integrations doc: `docs/external-integrations-layer.md`
- Integrations module: `src/modules/agent-runtime/integrations`
- Integration policies: `integrations`
- Integrations schema: `supabase/migrations/202605080006_external_integrations_layer.sql`

The integrations layer provides safe connector definitions for Google Workspace, social platforms, advertising platforms, and business tools. All current connectors are stub-only. Reads are safe by default, while writes and external actions are approval-gated and audited.

## Database and Persistence Layer

- Database doc: `docs/DATABASE_ARCHITECTURE.md`
- Migration plan: `docs/PERSISTENCE_MIGRATION_PLAN.md`
- Database module: `src/database`
- Canonical additive migrations: `supabase/migrations/202605080007_database_persistence_001_initial_schema.sql` through `supabase/migrations/202605080011_database_persistence_005_learning_operations_integrations.sql`

The persistence layer stores agents, skills, memory, workflows, workflow runs, approvals, audit logs, learning records, operations triggers, connector metadata, and artifacts. It does not remove markdown/file persistence; repositories use Supabase when configured and an in-memory fallback when env vars are missing.

## API Layer

- API architecture: `docs/API_ARCHITECTURE.md`
- API endpoints: `docs/API_ENDPOINTS.md`
- Shared API utilities: `src/server/api`
- Backend routes: `src/app/api`

The API layer is the official interface between dashboard UI, runtime modules, governance, integrations, operations, learning, memory, and persistence repositories.

## MVP Hardening and Production Readiness Layer

- Production readiness doc: `docs/PRODUCTION_READINESS.md`
- Deployment guide: `docs/MVP_DEPLOYMENT_GUIDE.md`
- Observability guide: `docs/OBSERVABILITY_GUIDE.md`
- Recovery strategy: `docs/RECOVERY_STRATEGY.md`
- Infrastructure module: `src/infrastructure`
- Health API: `GET /api/health`
- Docker support: `docker/Dockerfile` and `docker/docker-compose.yml`
- Environment templates: `config/development.env.example` and `config/production.env.example`

The production readiness layer provides centralized config, environment validation, structured errors, structured logs, health checks, retry queues, workflow recovery, rate limiting, deployment templates, and a Workflow Failure Recovery demo. It is intentionally MVP-scoped and uses safe in-memory fallbacks until durable queue/checkpoint persistence is wired.

## First Live MVP Deployment Path

- Target department: Content Department AI
- Login route: `/login`
- Workspace route: `/workspaces`
- Workflow UI: `/workflows/content-department`
- Dashboard route: `/dashboard`
- Start API: `POST /api/live/content-department/start`
- Approval API: `POST /api/live/content-department/approve`
- Dashboard snapshot API: `GET /api/live/content-department/dashboard`
- Launch checklist: `docs/MVP_LAUNCH_CHECKLIST.md`
- First workflow guide: `docs/FIRST_WORKFLOW_GUIDE.md`
- Local development guide: `docs/LOCAL_DEVELOPMENT_GUIDE.md`

The first live workflow is the Mother-and-baby TikTok Campaign. It connects mocked/Supabase auth, workspace selection, Marketing AI audience analysis, Content Creator AI generation, governance approval, repository-backed persistence, learning events, memory updates, and realtime-ready dashboard snapshots.

## Current Stack

- Frontend/backend: Next.js App Router
- Language: TypeScript
- Styling: TailwindCSS + shadcn-style source components
- Database/Auth: Supabase
- Vector memory: pgvector
- AI orchestration target: LangGraph TypeScript
- Deployment target: Vercel + Supabase

## Existing Implementation Areas

These existing folders are preserved and will be mapped into the new architecture:

- `src/app`: Next.js routes and UI pages
- `src/components`: UI components
- `src/modules`: current runtime modules
- `src/lib`: shared infrastructure
- `supabase/migrations`: database schema
- `docs`: previous design documents and historical planning

## Reset Rule

Do not continue adding features from the previous step sequence until the new layer structure is stabilized.

Future work should start by answering:

1. Which agent owns this?
2. Which skill manual governs it?
3. Which harness capability executes it?
4. Which memory is read or written?
5. Which workflow does it belong to?
6. Which governance policy or approval gate controls it?
7. Does learning create only a reviewed proposal, or is this unsafe self-modification?
8. Is this operation low-risk internal work, or must it be routed for approval?
9. Does this touch an external system, and if so which connector permission and audit trail controls it?
10. Which repository persists this state, and what is the file fallback during migration?
11. Which API route exposes this behavior, and how is input validation/audit handled?
12. Which production-readiness boundary observes, rate-limits, recovers, or reports this behavior?
