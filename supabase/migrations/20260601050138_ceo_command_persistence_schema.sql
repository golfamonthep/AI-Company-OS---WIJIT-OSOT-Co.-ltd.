create extension if not exists pgcrypto;

create table if not exists public.ceo_commands (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  organization_id text not null default 'local-demo-org',
  workspace_id text,
  created_by text,
  updated_by text,
  user_id text,
  command_text text not null,
  intent text,
  requested_by text not null default 'human',
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ceo_plans (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  organization_id text not null default 'local-demo-org',
  workspace_id text,
  created_by text,
  updated_by text,
  command_external_id text,
  summary text not null,
  status text not null default 'draft',
  recommended_actions jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delegated_tasks (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  organization_id text not null default 'local-demo-org',
  workspace_id text,
  created_by text,
  updated_by text,
  plan_external_id text,
  command_external_id text,
  workflow_execution_external_id text,
  title text not null,
  description text,
  owner_agent_id text not null,
  status text not null default 'queued',
  priority text,
  expected_output text,
  approval_required boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_executions (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  organization_id text not null default 'local-demo-org',
  workspace_id text,
  created_by text,
  updated_by text,
  plan_external_id text,
  command_external_id text,
  workflow_key text not null,
  status text not null default 'queued',
  current_step text,
  objective text,
  delegated_task_ids jsonb not null default '[]'::jsonb,
  output_summary text,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_checkpoints (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  organization_id text not null default 'local-demo-org',
  workspace_id text,
  created_by text,
  updated_by text,
  plan_external_id text,
  command_external_id text,
  title text not null,
  domain text not null,
  required_approvers jsonb not null default '[]'::jsonb,
  status text not null default 'requested',
  risk_level text not null default 'medium',
  related_task_external_id text,
  related_workflow_execution_external_id text,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_items (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  organization_id text not null default 'local-demo-org',
  workspace_id text,
  created_by text,
  updated_by text,
  title text not null,
  content text not null,
  scope text not null,
  source_type text not null,
  status text not null default 'proposed',
  importance integer,
  tags text[] not null default '{}',
  related_command_id text,
  related_workflow_execution_id text,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ceo_commands enable row level security;
alter table public.ceo_plans enable row level security;
alter table public.delegated_tasks enable row level security;
alter table public.workflow_executions enable row level security;
alter table public.approval_checkpoints enable row level security;
alter table public.memory_items enable row level security;

grant select, insert, update on table public.ceo_commands to authenticated;
grant select, insert, update on table public.ceo_plans to authenticated;
grant select, insert, update on table public.delegated_tasks to authenticated;
grant select, insert, update on table public.workflow_executions to authenticated;
grant select, insert, update on table public.approval_checkpoints to authenticated;
grant select, insert, update on table public.memory_items to authenticated;

drop policy if exists "Authenticated users can manage CEO commands" on public.ceo_commands;
create policy "Authenticated users can manage CEO commands"
  on public.ceo_commands for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage CEO plans" on public.ceo_plans;
create policy "Authenticated users can manage CEO plans"
  on public.ceo_plans for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage delegated tasks" on public.delegated_tasks;
create policy "Authenticated users can manage delegated tasks"
  on public.delegated_tasks for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage workflow executions" on public.workflow_executions;
create policy "Authenticated users can manage workflow executions"
  on public.workflow_executions for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage approval checkpoints" on public.approval_checkpoints;
create policy "Authenticated users can manage approval checkpoints"
  on public.approval_checkpoints for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage memory items" on public.memory_items;
create policy "Authenticated users can manage memory items"
  on public.memory_items for all
  to authenticated
  using (true)
  with check (true);
