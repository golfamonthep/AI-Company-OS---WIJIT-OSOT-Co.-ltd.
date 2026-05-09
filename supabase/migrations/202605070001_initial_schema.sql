create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create type public.agent_status as enum ('active', 'planning', 'running', 'completed', 'blocked');
create type public.task_status as enum ('todo', 'in_progress', 'review', 'done', 'blocked');
create type public.task_priority as enum ('low', 'medium', 'high', 'critical');
create type public.memory_type as enum ('fact', 'decision', 'preference', 'lesson', 'sop_improvement', 'report_summary');
create type public.message_role as enum ('user', 'agent', 'system', 'tool');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  locale text not null default 'th',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'th',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  role text not null,
  name text not null,
  goals jsonb not null default '[]'::jsonb,
  personality text not null default '',
  system_prompt text not null default '',
  model_config jsonb not null default '{}'::jsonb,
  status public.agent_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  name text not null,
  description text,
  proficiency integer not null default 1 check (proficiency between 1 and 10),
  created_at timestamptz not null default now()
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  document_type text not null default 'sop',
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_sops (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  knowledge_document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (agent_id, knowledge_document_id)
);

create table public.memory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  memory_type public.memory_type not null,
  content text not null,
  importance integer not null default 5 check (importance between 1 and 10),
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  thread_id uuid not null references public.conversation_threads(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  role public.message_role not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_agent_id uuid references public.agents(id) on delete set null,
  created_by_user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null default '',
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_at timestamptz,
  result text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  definition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  status text not null default 'queued',
  graph_state jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tool_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  tool_name text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.agent_feedback (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  rating integer check (rating between 1 and 5),
  comment text,
  accepted_output boolean,
  created_at timestamptz not null default now()
);

create table public.agent_learning_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  event_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index organizations_created_at_idx on public.organizations(created_at);
create index memberships_user_id_idx on public.memberships(user_id);
create index departments_org_idx on public.departments(organization_id);
create index agents_org_status_idx on public.agents(organization_id, status);
create index tasks_org_status_idx on public.tasks(organization_id, status);
create index tasks_owner_agent_idx on public.tasks(owner_agent_id);
create index messages_thread_created_idx on public.messages(thread_id, created_at);
create index memory_items_org_agent_idx on public.memory_items(organization_id, agent_id);
create index memory_items_tags_idx on public.memory_items using gin(tags);
create index knowledge_documents_search_idx on public.knowledge_documents using gin(to_tsvector('simple', title || ' ' || content));
create index memory_items_embedding_hnsw_idx on public.memory_items using hnsw (embedding vector_cosine_ops);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.departments enable row level security;
alter table public.agents enable row level security;
alter table public.agent_skills enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.agent_sops enable row level security;
alter table public.memory_items enable row level security;
alter table public.conversation_threads enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.tool_runs enable row level security;
alter table public.agent_feedback enable row level security;
alter table public.agent_learning_events enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and user_id = auth.uid()
  );
$$;

create policy "Profiles are readable by owner" on public.profiles for select using (id = auth.uid());
create policy "Profiles are insertable by owner" on public.profiles for insert with check (id = auth.uid());
create policy "Profiles are editable by owner" on public.profiles for update using (id = auth.uid());

create policy "Members can read their organizations" on public.organizations for select using (public.is_org_member(id));
create policy "Members can read memberships" on public.memberships for select using (public.is_org_member(organization_id));

create policy "Members can read departments" on public.departments for select using (public.is_org_member(organization_id));
create policy "Members can read agents" on public.agents for select using (public.is_org_member(organization_id));
create policy "Members can read agent skills" on public.agent_skills for select using (public.is_org_member(organization_id));
create policy "Members can read knowledge" on public.knowledge_documents for select using (public.is_org_member(organization_id));
create policy "Members can read agent sops" on public.agent_sops for select using (public.is_org_member(organization_id));
create policy "Members can read memory" on public.memory_items for select using (public.is_org_member(organization_id));
create policy "Members can read threads" on public.conversation_threads for select using (public.is_org_member(organization_id));
create policy "Members can read messages" on public.messages for select using (public.is_org_member(organization_id));
create policy "Members can read tasks" on public.tasks for select using (public.is_org_member(organization_id));
create policy "Members can read workflows" on public.workflows for select using (public.is_org_member(organization_id));
create policy "Members can read workflow runs" on public.workflow_runs for select using (public.is_org_member(organization_id));
create policy "Members can read tool runs" on public.tool_runs for select using (public.is_org_member(organization_id));
create policy "Members can read feedback" on public.agent_feedback for select using (public.is_org_member(organization_id));
create policy "Members can read learning events" on public.agent_learning_events for select using (public.is_org_member(organization_id));
create policy "Members can read reports" on public.reports for select using (public.is_org_member(organization_id));
create policy "Members can read audit logs" on public.audit_logs for select using (public.is_org_member(organization_id));

create policy "Members can write departments" on public.departments for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write agents" on public.agents for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write agent skills" on public.agent_skills for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write knowledge" on public.knowledge_documents for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write agent sops" on public.agent_sops for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write memory" on public.memory_items for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write threads" on public.conversation_threads for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write messages" on public.messages for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write tasks" on public.tasks for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write workflows" on public.workflows for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write workflow runs" on public.workflow_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write tool runs" on public.tool_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write feedback" on public.agent_feedback for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write learning events" on public.agent_learning_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can write reports" on public.reports for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
