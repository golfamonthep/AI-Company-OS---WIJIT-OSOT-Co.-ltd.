create table public.governance_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_agent_id text,
  event_type text not null,
  severity text not null,
  summary text not null,
  decision text,
  related_workflow_id text,
  related_task_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.governance_approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  approval_key text not null,
  requester_agent_id text not null,
  approver_agent_ids text[] not null default '{}',
  domain text not null,
  subject text not null,
  summary text not null,
  status text not null default 'requested',
  decisions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, approval_key)
);

create table public.governance_emergency_controls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_key text not null default 'default',
  paused_agents text[] not null default '{}',
  paused_workflows text[] not null default '{}',
  dangerous_execution_disabled boolean not null default false,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, control_key)
);

create index governance_audit_logs_org_created_idx on public.governance_audit_logs(organization_id, created_at desc);
create index governance_audit_logs_org_event_idx on public.governance_audit_logs(organization_id, event_type, created_at desc);
create index governance_audit_logs_org_severity_idx on public.governance_audit_logs(organization_id, severity, created_at desc);
create index governance_approval_requests_org_status_idx on public.governance_approval_requests(organization_id, status, updated_at desc);
create index governance_approval_requests_domain_idx on public.governance_approval_requests(organization_id, domain, status);
create index governance_emergency_controls_org_disabled_idx on public.governance_emergency_controls(organization_id, dangerous_execution_disabled);

alter table public.governance_audit_logs enable row level security;
alter table public.governance_approval_requests enable row level security;
alter table public.governance_emergency_controls enable row level security;

create policy "Members can read governance audit logs" on public.governance_audit_logs for select using (public.is_org_member(organization_id));
create policy "Members can write governance audit logs" on public.governance_audit_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read governance approvals" on public.governance_approval_requests for select using (public.is_org_member(organization_id));
create policy "Members can write governance approvals" on public.governance_approval_requests for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read governance emergency controls" on public.governance_emergency_controls for select using (public.is_org_member(organization_id));
create policy "Members can write governance emergency controls" on public.governance_emergency_controls for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
