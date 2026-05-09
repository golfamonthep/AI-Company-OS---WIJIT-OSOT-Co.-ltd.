create type public.task_stage_key as enum ('intake', 'assigned', 'accepted', 'in_progress', 'review', 'approval', 'completed', 'blocked', 'cancelled');
create type public.task_collaborator_role as enum ('owner', 'collaborator', 'reviewer', 'approver', 'observer');
create type public.task_acceptance_decision as enum ('accepted', 'rejected');
create type public.task_approval_decision as enum ('approved', 'rejected', 'changes_requested');

create table public.task_workflow_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  stage_key public.task_stage_key not null,
  name text not null,
  description text not null default '',
  position integer not null default 0,
  requires_approval boolean not null default false,
  is_terminal boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, stage_key)
);

create table public.task_stage_transitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  from_stage public.task_stage_key not null,
  to_stage public.task_stage_key not null,
  requires_approval boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, from_stage, to_stage),
  check (from_stage <> to_stage)
);

alter table public.tasks
  add column if not exists current_stage public.task_stage_key not null default 'intake',
  add column if not exists progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  add column if not exists deadline_at timestamptz,
  add column if not exists approval_required boolean not null default false,
  add column if not exists completed_at timestamptz;

alter table public.agent_task_delegations
  add column if not exists priority public.task_priority not null default 'medium',
  add column if not exists deadline_at timestamptz,
  add column if not exists expected_output text not null default '',
  add column if not exists rejection_reason text,
  add column if not exists accepted_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists completed_at timestamptz;

create table public.task_collaborators (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  role public.task_collaborator_role not null default 'collaborator',
  responsibility text not null default '',
  joined_at timestamptz not null default now(),
  unique (task_id, agent_id, role)
);

create table public.task_progress_updates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  progress_percent integer not null check (progress_percent between 0 and 100),
  summary text not null,
  blockers text[] not null default '{}',
  next_action text,
  created_at timestamptz not null default now()
);

create table public.task_activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  actor_agent_id uuid references public.agents(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  summary text not null,
  from_stage public.task_stage_key,
  to_stage public.task_stage_key,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.task_acceptance_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  delegation_id uuid not null references public.agent_task_delegations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  decision public.task_acceptance_decision not null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.task_approval_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  approval_request_id uuid not null references public.approval_requests(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  approver_agent_id uuid references public.agents(id) on delete set null,
  approver_user_id uuid references public.profiles(id) on delete set null,
  decision public.task_approval_decision not null,
  decision_notes text,
  created_at timestamptz not null default now()
);

create index tasks_stage_priority_idx on public.tasks(organization_id, current_stage, priority);
create index tasks_deadline_idx on public.tasks(organization_id, deadline_at) where deadline_at is not null;
create index task_collaborators_task_idx on public.task_collaborators(task_id);
create index task_collaborators_agent_idx on public.task_collaborators(agent_id, role);
create index task_progress_updates_task_idx on public.task_progress_updates(task_id, created_at desc);
create index task_activity_log_task_idx on public.task_activity_log(task_id, created_at desc);
create index task_acceptance_decisions_delegation_idx on public.task_acceptance_decisions(delegation_id, created_at desc);
create index task_approval_decisions_request_idx on public.task_approval_decisions(approval_request_id, created_at desc);

alter table public.task_workflow_stages enable row level security;
alter table public.task_stage_transitions enable row level security;
alter table public.task_collaborators enable row level security;
alter table public.task_progress_updates enable row level security;
alter table public.task_activity_log enable row level security;
alter table public.task_acceptance_decisions enable row level security;
alter table public.task_approval_decisions enable row level security;

create policy "Members can read task workflow stages" on public.task_workflow_stages for select using (public.is_org_member(organization_id));
create policy "Members can write task workflow stages" on public.task_workflow_stages for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read task stage transitions" on public.task_stage_transitions for select using (public.is_org_member(organization_id));
create policy "Members can write task stage transitions" on public.task_stage_transitions for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read task collaborators" on public.task_collaborators for select using (public.is_org_member(organization_id));
create policy "Members can write task collaborators" on public.task_collaborators for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read task progress updates" on public.task_progress_updates for select using (public.is_org_member(organization_id));
create policy "Members can write task progress updates" on public.task_progress_updates for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read task activity log" on public.task_activity_log for select using (public.is_org_member(organization_id));
create policy "Members can write task activity log" on public.task_activity_log for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read task acceptance decisions" on public.task_acceptance_decisions for select using (public.is_org_member(organization_id));
create policy "Members can write task acceptance decisions" on public.task_acceptance_decisions for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read task approval decisions" on public.task_approval_decisions for select using (public.is_org_member(organization_id));
create policy "Members can write task approval decisions" on public.task_approval_decisions for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
