create table public.skill_execution_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null,
  skill_id text not null,
  workflow_id text,
  task_intent text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  validation_result jsonb not null default '{}'::jsonb,
  harness_status jsonb not null default '[]'::jsonb,
  errors text[] not null default '{}',
  improvement_notes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index skill_execution_logs_org_agent_created_idx on public.skill_execution_logs(organization_id, agent_id, created_at desc);
create index skill_execution_logs_org_skill_created_idx on public.skill_execution_logs(organization_id, skill_id, created_at desc);
create index skill_execution_logs_workflow_idx on public.skill_execution_logs(workflow_id, created_at desc);

alter table public.skill_execution_logs enable row level security;

create policy "Members can read skill execution logs" on public.skill_execution_logs for select using (public.is_org_member(organization_id));
create policy "Members can write skill execution logs" on public.skill_execution_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
