-- Canonical memory persistence layer with pgvector-ready columns.

create table if not exists public.company_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  memory_type text not null default 'company',
  content text not null,
  source_type text not null default 'manual',
  source_id text,
  semantic_tags text[] not null default '{}',
  importance integer not null default 5 check (importance between 1 and 10),
  relevance_score numeric(6, 4),
  embedding extensions.vector(1536),
  embedding_model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_key text not null,
  title text not null,
  memory_type text not null default 'agent',
  content text not null,
  source_type text not null default 'manual',
  source_id text,
  semantic_tags text[] not null default '{}',
  importance integer not null default 5 check (importance between 1 and 10),
  relevance_score numeric(6, 4),
  embedding extensions.vector(1536),
  embedding_model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_key text,
  agent_key text,
  workflow_id text,
  title text not null,
  task_intent text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  result_summary text,
  status text not null default 'completed',
  feedback jsonb not null default '{}'::jsonb,
  semantic_tags text[] not null default '{}',
  source_type text not null default 'runtime',
  source_id text,
  embedding extensions.vector(1536),
  embedding_model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.decision_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  decision_key text,
  owner_agent_key text,
  workflow_id text,
  title text not null,
  decision text not null,
  reasoning text not null default '',
  impact text not null default '',
  status text not null default 'active',
  source_type text not null default 'manual',
  source_id text,
  semantic_tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_memory_org_type_idx on public.company_memory(organization_id, memory_type, created_at desc);
create index if not exists company_memory_tags_idx on public.company_memory using gin(semantic_tags);
create index if not exists company_memory_embedding_hnsw_idx on public.company_memory using hnsw (embedding vector_cosine_ops);
create index if not exists agent_memory_org_agent_idx on public.agent_memory(organization_id, agent_key, created_at desc);
create index if not exists agent_memory_tags_idx on public.agent_memory using gin(semantic_tags);
create index if not exists agent_memory_embedding_hnsw_idx on public.agent_memory using hnsw (embedding vector_cosine_ops);
create index if not exists task_history_org_agent_idx on public.task_history(organization_id, agent_key, created_at desc);
create index if not exists task_history_workflow_idx on public.task_history(organization_id, workflow_id, created_at desc);
create index if not exists decision_logs_org_workflow_idx on public.decision_logs(organization_id, workflow_id, created_at desc);

alter table public.company_memory enable row level security;
alter table public.agent_memory enable row level security;
alter table public.task_history enable row level security;
alter table public.decision_logs enable row level security;
