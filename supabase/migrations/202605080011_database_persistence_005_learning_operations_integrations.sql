-- Canonical learning, operations, and integrations persistence additions.

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_key text,
  workflow_id text,
  skill_id text,
  event_type text not null,
  summary text not null,
  score numeric(6, 4),
  source_type text not null default 'runtime',
  source_id text,
  semantic_tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  proposal_key text not null,
  proposal_type text not null,
  target_type text not null,
  target_id text not null,
  title text not null,
  summary text not null,
  proposed_change jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  risk_level text not null default 'low',
  status text not null default 'pending_review',
  reviewer_id text,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, proposal_key)
);

create table if not exists public.operations_triggers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  trigger_key text not null,
  trigger_type text not null,
  name text not null,
  description text not null default '',
  condition jsonb not null default '{}'::jsonb,
  target_workflow_id text,
  status text not null default 'active',
  last_triggered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, trigger_key)
);

create table if not exists public.connector_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  connector_id text not null,
  provider text not null,
  auth_type text not null,
  status text not null default 'stub',
  scopes text[] not null default '{}',
  read_actions jsonb not null default '[]'::jsonb,
  write_actions jsonb not null default '[]'::jsonb,
  approval_requirements jsonb not null default '[]'::jsonb,
  rate_limit_strategy text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, connector_id)
);

create index if not exists learning_events_org_agent_idx on public.learning_events(organization_id, agent_key, created_at desc);
create index if not exists learning_events_tags_idx on public.learning_events using gin(semantic_tags);
create index if not exists learning_proposals_org_status_idx on public.learning_proposals(organization_id, status, created_at desc);
create index if not exists operations_triggers_org_status_idx on public.operations_triggers(organization_id, status, trigger_type);
create index if not exists connector_configs_org_provider_idx on public.connector_configs(organization_id, provider, status);

alter table public.learning_events enable row level security;
alter table public.learning_proposals enable row level security;
alter table public.operations_triggers enable row level security;
alter table public.connector_configs enable row level security;
