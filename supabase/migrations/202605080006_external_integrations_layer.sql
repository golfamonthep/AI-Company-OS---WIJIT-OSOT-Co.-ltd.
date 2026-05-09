create table public.connector_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null,
  connector_id text not null,
  action_id text not null,
  action_type text not null,
  status text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.connector_execution_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null,
  connector_id text not null,
  action_id text not null,
  status text not null,
  output jsonb not null default '{}'::jsonb,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.connector_oauth_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  connector_id text not null,
  auth_type text not null,
  scopes text[] not null default '{}',
  status text not null default 'stub',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, connector_id)
);

create index connector_audit_logs_org_created_idx on public.connector_audit_logs(organization_id, created_at desc);
create index connector_audit_logs_connector_idx on public.connector_audit_logs(organization_id, connector_id, action_id, created_at desc);
create index connector_execution_logs_org_created_idx on public.connector_execution_logs(organization_id, created_at desc);
create index connector_execution_logs_connector_idx on public.connector_execution_logs(organization_id, connector_id, action_id, created_at desc);
create index connector_oauth_configs_org_connector_idx on public.connector_oauth_configs(organization_id, connector_id);

alter table public.connector_audit_logs enable row level security;
alter table public.connector_execution_logs enable row level security;
alter table public.connector_oauth_configs enable row level security;

create policy "Members can read connector audit logs" on public.connector_audit_logs for select using (public.is_org_member(organization_id));
create policy "Members can write connector audit logs" on public.connector_audit_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read connector execution logs" on public.connector_execution_logs for select using (public.is_org_member(organization_id));
create policy "Members can write connector execution logs" on public.connector_execution_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read connector oauth configs" on public.connector_oauth_configs for select using (public.is_org_member(organization_id));
create policy "Members can write connector oauth configs" on public.connector_oauth_configs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
