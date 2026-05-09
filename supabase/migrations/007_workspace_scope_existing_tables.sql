-- Workspace scoping bridge for existing AI Company OS tables.
-- organization_id is preserved for compatibility; workspace_id becomes the SaaS isolation key.

alter table if exists public.agents add column if not exists workspace_id uuid;
alter table if exists public.agents add column if not exists created_by uuid;
alter table if exists public.agents add column if not exists updated_by uuid;
alter table if exists public.agents add column if not exists owner_user_id uuid;

alter table if exists public.agent_skills add column if not exists workspace_id uuid;
alter table if exists public.agent_skills add column if not exists created_by uuid;
alter table if exists public.agent_skills add column if not exists updated_by uuid;
alter table if exists public.skills add column if not exists workspace_id uuid;
alter table if exists public.skills add column if not exists created_by uuid;
alter table if exists public.skills add column if not exists updated_by uuid;

alter table if exists public.company_memory add column if not exists workspace_id uuid;
alter table if exists public.company_memory add column if not exists created_by uuid;
alter table if exists public.company_memory add column if not exists updated_by uuid;
alter table if exists public.agent_memory add column if not exists workspace_id uuid;
alter table if exists public.agent_memory add column if not exists created_by uuid;
alter table if exists public.agent_memory add column if not exists updated_by uuid;
alter table if exists public.task_history add column if not exists workspace_id uuid;
alter table if exists public.task_history add column if not exists created_by uuid;
alter table if exists public.task_history add column if not exists updated_by uuid;
alter table if exists public.decision_logs add column if not exists workspace_id uuid;
alter table if exists public.decision_logs add column if not exists created_by uuid;
alter table if exists public.decision_logs add column if not exists updated_by uuid;
alter table if exists public.memory_items add column if not exists workspace_id uuid;
alter table if exists public.memory_items add column if not exists created_by uuid;
alter table if exists public.memory_items add column if not exists updated_by uuid;

alter table if exists public.workflows add column if not exists workspace_id uuid;
alter table if exists public.workflows add column if not exists created_by uuid;
alter table if exists public.workflows add column if not exists updated_by uuid;
alter table if exists public.workflow_runs add column if not exists workspace_id uuid;
alter table if exists public.workflow_runs add column if not exists created_by uuid;
alter table if exists public.workflow_runs add column if not exists updated_by uuid;
alter table if exists public.workflow_execution_runs add column if not exists workspace_id uuid;
alter table if exists public.workflow_execution_steps add column if not exists workspace_id uuid;
alter table if exists public.workflow_execution_events add column if not exists workspace_id uuid;

alter table if exists public.approvals add column if not exists workspace_id uuid;
alter table if exists public.approvals add column if not exists created_by uuid;
alter table if exists public.approvals add column if not exists updated_by uuid;
alter table if exists public.approval_requests add column if not exists workspace_id uuid;
alter table if exists public.governance_approval_requests add column if not exists workspace_id uuid;
alter table if exists public.governance_audit_logs add column if not exists workspace_id uuid;
alter table if exists public.governance_emergency_controls add column if not exists workspace_id uuid;
alter table if exists public.audit_logs add column if not exists workspace_id uuid;
alter table if exists public.audit_logs add column if not exists user_id uuid;
alter table if exists public.audit_logs add column if not exists created_by uuid;
alter table if exists public.audit_logs add column if not exists updated_by uuid;

alter table if exists public.learning_events add column if not exists workspace_id uuid;
alter table if exists public.learning_proposals add column if not exists workspace_id uuid;
alter table if exists public.learning_audit_logs add column if not exists workspace_id uuid;
alter table if exists public.learning_feedback add column if not exists workspace_id uuid;
alter table if exists public.learning_skill_performance_metrics add column if not exists workspace_id uuid;
alter table if exists public.learning_improvement_proposals add column if not exists workspace_id uuid;
alter table if exists public.learning_memory_refinement_suggestions add column if not exists workspace_id uuid;

alter table if exists public.operations_triggers add column if not exists workspace_id uuid;
alter table if exists public.operations_logs add column if not exists workspace_id uuid;
alter table if exists public.operations_schedules add column if not exists workspace_id uuid;
alter table if exists public.operations_runs add column if not exists workspace_id uuid;
alter table if exists public.operations_recommendations add column if not exists workspace_id uuid;

alter table if exists public.connector_configs add column if not exists workspace_id uuid;
alter table if exists public.connector_audit_logs add column if not exists workspace_id uuid;
alter table if exists public.connector_execution_logs add column if not exists workspace_id uuid;
alter table if exists public.connector_oauth_configs add column if not exists workspace_id uuid;

alter table if exists public.harness_execution_logs add column if not exists workspace_id uuid;
alter table if exists public.agent_collaboration_sessions add column if not exists workspace_id uuid;
alter table if exists public.agent_collaboration_events add column if not exists workspace_id uuid;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'agents',
    'agent_skills',
    'skills',
    'company_memory',
    'agent_memory',
    'task_history',
    'decision_logs',
    'memory_items',
    'workflows',
    'workflow_runs',
    'approvals',
    'audit_logs',
    'learning_events',
    'learning_proposals',
    'operations_triggers',
    'connector_configs'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('create index if not exists idx_%I_workspace_id on public.%I(workspace_id)', table_name, table_name);
    end if;
  end loop;
end $$;
