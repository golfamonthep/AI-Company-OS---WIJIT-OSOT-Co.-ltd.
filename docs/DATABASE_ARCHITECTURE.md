# Database Architecture

The Database and Persistence Layer is the canonical persistence foundation for AI Company OS.

It keeps the existing file-based system intact and adds Supabase/PostgreSQL-ready repositories for durable state.

## Goals

- Persist agents, skills, memory, workflows, tasks, approvals, audit logs, collaboration, harness, learning, operations, integrations, and artifacts.
- Support dual-read and dual-write migration from markdown/file storage to database storage.
- Prepare vector memory without requiring embeddings yet.
- Avoid hardcoded credentials and keep runtime usable when Supabase env is missing.

## Architecture

```txt
Runtime Layer
  -> Repository
  -> PersistenceService
  -> Supabase client if configured
  -> In-memory fallback if env is missing
```

## Core Files

- `src/database/supabaseClient.ts`
- `src/database/types.ts`
- `src/database/PersistenceService.ts`
- `src/database/repositories/*Repository.ts`
- `src/database/MigrationBridge.ts`
- `src/database/sample-persistence-demo.ts`

## Migration Files

- `supabase/migrations/202605080007_database_persistence_001_initial_schema.sql`
- `supabase/migrations/202605080008_database_persistence_002_memory_schema.sql`
- `supabase/migrations/202605080009_database_persistence_003_workflow_schema.sql`
- `supabase/migrations/202605080010_database_persistence_004_governance_schema.sql`
- `supabase/migrations/202605080011_database_persistence_005_learning_operations_integrations.sql`

These files are additive. Existing timestamped migrations remain preserved and still define many legacy/base tables.

They use timestamped filenames so they run after the existing base schema in this repository. The internal `001` to `005` labels describe the logical persistence phases, not raw Supabase execution order.

## Data Domains

Agents:

- `agents`
- `agent_skills`

Skills:

- `agent_skills`
- `skill_execution_logs`

Memory:

- `company_memory`
- `agent_memory`
- `task_history`
- `decision_logs`

Workflows:

- `workflows`
- `workflow_runs`
- `workflow_step_records`

Governance:

- `approvals`
- `audit_logs`

Learning:

- `learning_events`
- `learning_proposals`

Operations:

- `operations_triggers`

Integrations:

- `connector_configs`
- `connector_audit_logs`
- `connector_execution_logs`

Artifacts:

- `artifact_metadata`

## Vector Memory Preparation

Memory tables include:

- `embedding extensions.vector(1536)`
- `embedding_model`
- `semantic_tags`
- `source_type`
- `source_id`
- `relevance_score`

Embeddings are optional for now. Keyword/file memory continues to work.

## Security Model

- No hardcoded Supabase keys.
- `.env.example` documents required variables.
- RLS is enabled on new tables.
- Existing `public.is_org_member(organization_id)` remains the target RLS guard.
- Write operations stay permission-aware at repository caller boundaries.

## Persistence Demo

`runPersistContentProductionWorkflowDemo()` writes:

1. Content Creator Agent record
2. Hook Generation skill execution result
3. Company memory entry
4. Content Production workflow run
5. Approval record
6. Audit log
7. Dashboard retrieval snapshot

If Supabase env is missing, the demo runs through in-memory fallback and returns `mode: "missing_env"`.

## Important Constraint

The new persistence layer does not remove markdown files, memory files, or previous migrations. It is a bridge layer for gradual migration.
