-- Live Content Production Workflow hardening.
-- Safe additive migration: re-assert workspace scope on MVP persistence tables
-- because older bridge migrations may run before some later tables exist.

alter table if exists public.workflows add column if not exists workspace_id uuid;
alter table if exists public.workflow_runs add column if not exists workspace_id uuid;
alter table if exists public.approvals add column if not exists workspace_id uuid;
alter table if exists public.audit_logs add column if not exists workspace_id uuid;
alter table if exists public.task_history add column if not exists workspace_id uuid;
alter table if exists public.company_memory add column if not exists workspace_id uuid;
alter table if exists public.learning_events add column if not exists workspace_id uuid;

create index if not exists idx_workflows_workspace_id on public.workflows(workspace_id);
create index if not exists idx_workflow_runs_workspace_id on public.workflow_runs(workspace_id);
create index if not exists idx_approvals_workspace_id on public.approvals(workspace_id);
create index if not exists idx_audit_logs_workspace_id on public.audit_logs(workspace_id);
create index if not exists idx_task_history_workspace_id on public.task_history(workspace_id);
create index if not exists idx_company_memory_workspace_id on public.company_memory(workspace_id);
create index if not exists idx_learning_events_workspace_id on public.learning_events(workspace_id);
