create table public.harness_execution_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null,
  module_id text not null,
  action text not null,
  status text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text,
  attempts integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index harness_execution_logs_org_agent_created_idx on public.harness_execution_logs(organization_id, agent_id, created_at desc);
create index harness_execution_logs_org_module_created_idx on public.harness_execution_logs(organization_id, module_id, created_at desc);
create index harness_execution_logs_status_created_idx on public.harness_execution_logs(status, created_at desc);

alter table public.harness_execution_logs enable row level security;

create policy "Members can read harness execution logs" on public.harness_execution_logs for select using (public.is_org_member(organization_id));
create policy "Members can write harness execution logs" on public.harness_execution_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
