create table public.memory_retrieval_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null,
  workflow_id text,
  task_intent text not null,
  retrieved_memory_ids text[] not null default '{}',
  retrieved_sources text[] not null default '{}',
  ranking_summary jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index memory_retrieval_logs_org_agent_created_idx on public.memory_retrieval_logs(organization_id, agent_id, created_at desc);
create index memory_retrieval_logs_workflow_created_idx on public.memory_retrieval_logs(workflow_id, created_at desc);

alter table public.memory_retrieval_logs enable row level security;

create policy "Members can read memory retrieval logs" on public.memory_retrieval_logs for select using (public.is_org_member(organization_id));
create policy "Members can write memory retrieval logs" on public.memory_retrieval_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
