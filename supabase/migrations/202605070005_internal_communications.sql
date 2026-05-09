create type public.communication_type as enum ('direct_message', 'task_delegation', 'workflow_collaboration', 'team_discussion', 'status_report', 'approval_request', 'escalation', 'memory_reference');
create type public.communication_priority as enum ('low', 'medium', 'high', 'critical');
create type public.communication_event_status as enum ('queued', 'processing', 'completed', 'failed', 'cancelled');
create type public.inbox_item_status as enum ('unread', 'read', 'acknowledged', 'archived');
create type public.delegation_status as enum ('assigned', 'accepted', 'declined', 'in_progress', 'completed', 'blocked', 'cancelled');
create type public.approval_status as enum ('requested', 'approved', 'rejected', 'changes_requested', 'cancelled');
create type public.escalation_status as enum ('open', 'acknowledged', 'resolved', 'dismissed');

create table public.communication_threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  thread_type public.communication_type not null,
  title text not null,
  department_id uuid references public.departments(id) on delete set null,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  priority public.communication_priority not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.communication_participants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  thread_id uuid not null references public.communication_threads(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  participant_role text not null default 'member',
  joined_at timestamptz not null default now(),
  unique (thread_id, agent_id, user_id),
  check (agent_id is not null or user_id is not null)
);

create table public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  thread_id uuid not null references public.communication_threads(id) on delete cascade,
  sender_agent_id uuid references public.agents(id) on delete set null,
  sender_user_id uuid references public.profiles(id) on delete set null,
  recipient_agent_id uuid references public.agents(id) on delete set null,
  message_type public.communication_type not null,
  subject text not null default '',
  body text not null,
  priority public.communication_priority not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (sender_agent_id is not null or sender_user_id is not null)
);

create table public.communication_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type public.communication_type not null,
  status public.communication_event_status not null default 'queued',
  sender_agent_id uuid references public.agents(id) on delete set null,
  recipient_agent_id uuid references public.agents(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  thread_id uuid references public.communication_threads(id) on delete set null,
  message_id uuid references public.agent_messages(id) on delete set null,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  priority public.communication_priority not null default 'medium',
  subject text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  error text,
  scheduled_for timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.agent_inbox_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  event_id uuid references public.communication_events(id) on delete cascade,
  thread_id uuid references public.communication_threads(id) on delete cascade,
  message_id uuid references public.agent_messages(id) on delete cascade,
  status public.inbox_item_status not null default 'unread',
  priority public.communication_priority not null default 'medium',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_task_delegations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  delegator_agent_id uuid references public.agents(id) on delete set null,
  assignee_agent_id uuid not null references public.agents(id) on delete cascade,
  thread_id uuid references public.communication_threads(id) on delete set null,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  status public.delegation_status not null default 'assigned',
  instructions text not null default '',
  acceptance_notes text,
  result_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  requester_agent_id uuid references public.agents(id) on delete set null,
  approver_agent_id uuid references public.agents(id) on delete set null,
  approver_user_id uuid references public.profiles(id) on delete set null,
  thread_id uuid references public.communication_threads(id) on delete set null,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  request_body text not null,
  status public.approval_status not null default 'requested',
  decision_notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.escalations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_agent_id uuid references public.agents(id) on delete set null,
  escalation_agent_id uuid references public.agents(id) on delete set null,
  escalation_user_id uuid references public.profiles(id) on delete set null,
  thread_id uuid references public.communication_threads(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  severity public.communication_priority not null default 'high',
  title text not null,
  reason text not null,
  status public.escalation_status not null default 'open',
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_memory_references (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  message_id uuid references public.agent_messages(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  memory_item_id uuid references public.memory_items(id) on delete cascade,
  knowledge_document_id uuid references public.knowledge_documents(id) on delete cascade,
  reference_note text not null default '',
  created_at timestamptz not null default now(),
  check (memory_item_id is not null or knowledge_document_id is not null)
);

create table public.workflow_collaborators (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  role text not null default 'collaborator',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  unique (workflow_run_id, agent_id)
);

create table public.workflow_step_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  workflow_step_id uuid references public.workflow_steps(id) on delete set null,
  message_id uuid not null references public.agent_messages(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_id uuid references public.communication_events(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  channel text not null default 'in_app',
  status text not null default 'pending',
  delivered_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index communication_threads_org_type_idx on public.communication_threads(organization_id, thread_type, created_at desc);
create index communication_participants_thread_idx on public.communication_participants(thread_id);
create index agent_messages_thread_created_idx on public.agent_messages(thread_id, created_at);
create index communication_events_status_priority_idx on public.communication_events(status, priority, created_at);
create index communication_events_recipient_idx on public.communication_events(recipient_agent_id, status, created_at desc);
create index agent_inbox_items_agent_status_idx on public.agent_inbox_items(agent_id, status, priority, created_at desc);
create index agent_task_delegations_assignee_idx on public.agent_task_delegations(assignee_agent_id, status, created_at desc);
create index approval_requests_approver_idx on public.approval_requests(approver_agent_id, status, created_at desc);
create index escalations_status_severity_idx on public.escalations(status, severity, created_at desc);
create index message_memory_references_message_idx on public.message_memory_references(message_id);
create index workflow_collaborators_run_idx on public.workflow_collaborators(workflow_run_id);
create index workflow_step_messages_run_step_idx on public.workflow_step_messages(workflow_run_id, workflow_step_id);
create index notification_deliveries_target_idx on public.notification_deliveries(agent_id, user_id, status);

alter table public.communication_threads enable row level security;
alter table public.communication_participants enable row level security;
alter table public.agent_messages enable row level security;
alter table public.communication_events enable row level security;
alter table public.agent_inbox_items enable row level security;
alter table public.agent_task_delegations enable row level security;
alter table public.approval_requests enable row level security;
alter table public.escalations enable row level security;
alter table public.message_memory_references enable row level security;
alter table public.workflow_collaborators enable row level security;
alter table public.workflow_step_messages enable row level security;
alter table public.notification_deliveries enable row level security;

create policy "Members can read communication threads" on public.communication_threads for select using (public.is_org_member(organization_id));
create policy "Members can write communication threads" on public.communication_threads for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read communication participants" on public.communication_participants for select using (public.is_org_member(organization_id));
create policy "Members can write communication participants" on public.communication_participants for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent messages" on public.agent_messages for select using (public.is_org_member(organization_id));
create policy "Members can write agent messages" on public.agent_messages for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read communication events" on public.communication_events for select using (public.is_org_member(organization_id));
create policy "Members can write communication events" on public.communication_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent inbox items" on public.agent_inbox_items for select using (public.is_org_member(organization_id));
create policy "Members can write agent inbox items" on public.agent_inbox_items for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent task delegations" on public.agent_task_delegations for select using (public.is_org_member(organization_id));
create policy "Members can write agent task delegations" on public.agent_task_delegations for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read approval requests" on public.approval_requests for select using (public.is_org_member(organization_id));
create policy "Members can write approval requests" on public.approval_requests for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read escalations" on public.escalations for select using (public.is_org_member(organization_id));
create policy "Members can write escalations" on public.escalations for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read message memory references" on public.message_memory_references for select using (public.is_org_member(organization_id));
create policy "Members can write message memory references" on public.message_memory_references for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read workflow collaborators" on public.workflow_collaborators for select using (public.is_org_member(organization_id));
create policy "Members can write workflow collaborators" on public.workflow_collaborators for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read workflow step messages" on public.workflow_step_messages for select using (public.is_org_member(organization_id));
create policy "Members can write workflow step messages" on public.workflow_step_messages for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read notification deliveries" on public.notification_deliveries for select using (public.is_org_member(organization_id));
create policy "Members can write notification deliveries" on public.notification_deliveries for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
