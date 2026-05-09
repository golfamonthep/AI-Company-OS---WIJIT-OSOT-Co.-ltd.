# Persistence Migration Plan

This plan moves AI Company OS from file-first persistence to Supabase-backed persistence without deleting existing files.

## Phase 1: Dual-Write Foundation

Status: started.

- Keep markdown and file memory as source-compatible inputs.
- Add repository layer for database writes.
- Add in-memory fallback when Supabase env is missing.
- Add canonical persistence migrations.
- Add migration bridge for Content Creator agent docs and starter memory.

## Phase 2: Dual-Read

- Read from database first when configured.
- Fall back to markdown/files when records are missing.
- Add dashboard APIs that use repositories instead of static demo data.
- Keep file-based memory visible in Memory Explorer.

## Phase 3: Controlled Migration

- Migrate `company-os/agents/*/AGENT.md` into `agents`.
- Migrate `company-os/agents/*/SKILLS.md` into `agent_skills`.
- Migrate `memory/company/*` into `company_memory`.
- Migrate `memory/agents/*` into `agent_memory`.
- Migrate task and workflow logs into `task_history` and `workflow_runs`.

## Phase 4: pgvector Retrieval

- Add embedding generation job.
- Store embeddings in `company_memory` and `agent_memory`.
- Add vector retrieval alongside keyword search.
- Keep semantic tags and source metadata for explainability.

## Phase 5: Production Hardening

- Add repository tests.
- Add RLS tests.
- Add migration dry-run script.
- Add audit reporting for migrated records.
- Add admin UI to approve memory promotion and archival.

## Non-Destructive Rule

No markdown, logs, memory files, artifacts, or older migrations should be deleted during this migration. Database records must store `source_type`, `source_id`, and `source_path` where possible so every migrated record is traceable.
