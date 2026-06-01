import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAnonClient } from "@/database/supabaseClient";
import { PersistenceService } from "@/database/PersistenceService";
import type { BaseRecord } from "@/database/types";
import type {
  ApprovalCheckpoint,
  CEOCommand,
  CEOPlan,
  DelegatedTask,
  MemoryCandidate,
  WorkflowExecution
} from "@/modules/orchestration/types";

const DEFAULT_ORGANIZATION_ID = "local-demo-org";

type StoreOptions = {
  supabase?: SupabaseClient | null;
};

type PersistableRecord = BaseRecord & {
  external_id?: string;
  status?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SupabasePersistenceWriteReport = {
  supabaseConfigured: boolean;
  persistedToSupabase: boolean;
  usedFallback: boolean;
  lastError?: string;
};

export type MemoryItemInput = {
  id?: string;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  title: string;
  content: string;
  scope: string;
  sourceType: string;
  status: string;
  importance?: number;
  tags?: string[];
  relatedCommandId?: string;
  relatedWorkflowExecutionId?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};

export type PersistedMemoryItem = {
  id: string;
  organization_id: string;
  workspace_id?: string;
  title: string;
  content: string;
  scope: string;
  source_type: string;
  status: string;
  importance?: number;
  tags?: string[];
  related_command_id?: string;
  related_workflow_execution_id?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
};

export function createSupabasePersistenceStore(options: StoreOptions = {}) {
  const runtimeClient = options.supabase === undefined ? createSupabaseAnonClient().client : options.supabase;
  const persistence = new PersistenceService(runtimeClient);
  const fallbackPersistence = new PersistenceService(null);
  const useFallbackIds = !runtimeClient;
  const writeReport: SupabasePersistenceWriteReport = {
    supabaseConfigured: Boolean(runtimeClient),
    persistedToSupabase: false,
    usedFallback: false
  };

  async function saveCEOCommand(command: CEOCommand) {
    await persist("ceo_commands", toCEOCommandRecord(command, useFallbackIds));
    return command;
  }

  async function saveCEOPlan(plan: CEOPlan) {
    const command = getPlanCommand(plan);
    if (command) {
      await saveCEOCommand(command);
    }

    await persist("ceo_plans", toCEOPlanRecord(plan, command, useFallbackIds));
    await saveDelegatedTasks(plan.delegatedTasks, plan, command);
    await Promise.all(plan.workflowExecutions.map((execution) => saveWorkflowExecution(execution, plan, command)));
    await Promise.all(plan.approvalCheckpoints.map((checkpoint) => saveApprovalCheckpoint(checkpoint, plan, command)));
    await Promise.all(plan.memoryCandidates.map((candidate) => saveMemoryItem(memoryCandidateToInput(candidate, plan, command))));

    return plan;
  }

  async function saveDelegatedTasks(tasks: DelegatedTask[], plan?: CEOPlan, command?: CEOCommand | null) {
    await Promise.all(tasks.map((task) => persist("delegated_tasks", toDelegatedTaskRecord(task, plan, command, useFallbackIds))));
    return tasks;
  }

  async function saveWorkflowExecution(execution: WorkflowExecution, plan?: CEOPlan, command?: CEOCommand | null) {
    await persist("workflow_executions", toWorkflowExecutionRecord(execution, plan, command, useFallbackIds));
    return execution;
  }

  async function saveApprovalCheckpoint(checkpoint: ApprovalCheckpoint, plan?: CEOPlan, command?: CEOCommand | null) {
    await persist("approval_checkpoints", toApprovalCheckpointRecord(checkpoint, plan, command, useFallbackIds));
    return checkpoint;
  }

  async function saveMemoryItem(item: MemoryItemInput) {
    await persist("memory_items", toMemoryItemRecord(item, useFallbackIds));
    return item;
  }

  async function listMemoryItems(organizationId = DEFAULT_ORGANIZATION_ID, limit = 50): Promise<PersistedMemoryItem[]> {
    const primaryResult = await persistence.list<PersistableRecord>("memory_items", organizationId, limit);
    const fallbackResult = await fallbackPersistence.list<PersistableRecord>("memory_items", organizationId, limit);
    const rowsById = new Map<string, PersistableRecord>();

    [...primaryResult.data, ...fallbackResult.data].forEach((row) => {
      rowsById.set(String(row.external_id ?? row.id), row);
    });

    return [...rowsById.values()]
      .map((row) => ({
        id: String(row.external_id ?? row.id),
        organization_id: row.organization_id,
        workspace_id: row.workspace_id,
        title: String(row.title ?? ""),
        content: String(row.content ?? ""),
        scope: String(row.scope ?? ""),
        source_type: String(row.source_type ?? ""),
        status: String(row.status ?? ""),
        importance: typeof row.importance === "number" ? row.importance : undefined,
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : undefined,
        related_command_id: typeof row.related_command_id === "string" ? row.related_command_id : undefined,
        related_workflow_execution_id:
          typeof row.related_workflow_execution_id === "string" ? row.related_workflow_execution_id : undefined,
        created_at: row.created_at,
        metadata: row.metadata
      }))
      .sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")))
      .slice(0, limit);
  }

  async function persist(table: string, record: PersistableRecord) {
    const result = await persistence.create(table, record);
    if (result.status !== "failed") {
      if (result.source === "supabase") {
        writeReport.persistedToSupabase = true;
      } else {
        writeReport.usedFallback = true;
      }
      return result;
    }

    writeReport.lastError = result.error;
    writeReport.usedFallback = true;
    return fallbackPersistence.create(table, withFallbackId(record));
  }

  return {
    saveCEOCommand,
    saveCEOPlan,
    saveDelegatedTasks,
    saveWorkflowExecution,
    saveApprovalCheckpoint,
    saveMemoryItem,
    listMemoryItems,
    getWriteReport: () => ({ ...writeReport }),
    isConfigured: () => persistence.isConfigured()
  };
}

function withFallbackId(record: PersistableRecord): PersistableRecord {
  return {
    ...record,
    id: record.id ?? record.external_id
  };
}

function getPlanCommand(plan: CEOPlan): CEOCommand | null {
  const command = plan.metadata?.command;
  if (!command || typeof command !== "object") return null;
  return command as CEOCommand;
}

function commonRecord(sourceId: string | undefined, command: CEOCommand | null | undefined, useFallbackIds: boolean): BaseRecord & { external_id?: string } {
  const organizationId = command?.organizationId ?? DEFAULT_ORGANIZATION_ID;
  return {
    ...(useFallbackIds && sourceId ? { id: sourceId } : {}),
    external_id: sourceId,
    organization_id: organizationId,
    workspace_id: command?.workspaceId,
    created_by: command?.userId,
    metadata: {}
  };
}

function toCEOCommandRecord(command: CEOCommand, useFallbackIds: boolean): PersistableRecord {
  return {
    ...commonRecord(command.id, command, useFallbackIds),
    user_id: command.userId,
    command_text: command.command,
    intent: command.intent,
    requested_by: command.requestedBy,
    status: command.status,
    created_at: command.createdAt,
    payload: command
  };
}

function toCEOPlanRecord(plan: CEOPlan, command: CEOCommand | null, useFallbackIds: boolean): PersistableRecord {
  return {
    ...commonRecord(plan.id, command, useFallbackIds),
    command_external_id: plan.commandId,
    summary: plan.summary,
    status: plan.status,
    recommended_actions: plan.recommendedActions ?? [],
    payload: plan,
    metadata: plan.metadata ?? {}
  };
}

function toDelegatedTaskRecord(task: DelegatedTask, plan: CEOPlan | undefined, command: CEOCommand | null | undefined, useFallbackIds: boolean): PersistableRecord {
  return {
    ...commonRecord(task.id, command, useFallbackIds),
    plan_external_id: plan?.id,
    command_external_id: plan?.commandId ?? command?.id,
    workflow_execution_external_id: task.workflowExecutionId,
    title: task.title,
    description: task.description,
    owner_agent_id: task.ownerAgentId,
    status: task.status,
    priority: task.priority,
    expected_output: task.expectedOutput,
    approval_required: task.approvalRequired ?? false,
    payload: task,
    metadata: task.metadata ?? {}
  };
}

function toWorkflowExecutionRecord(execution: WorkflowExecution, plan: CEOPlan | undefined, command: CEOCommand | null | undefined, useFallbackIds: boolean): PersistableRecord {
  return {
    ...commonRecord(execution.id, command, useFallbackIds),
    plan_external_id: plan?.id,
    command_external_id: plan?.commandId ?? command?.id,
    workflow_key: execution.workflowKey,
    status: execution.status,
    current_step: execution.currentStep,
    objective: execution.objective,
    delegated_task_ids: execution.delegatedTaskIds ?? [],
    output_summary: execution.outputSummary,
    payload: execution,
    metadata: execution.metadata ?? {}
  };
}

function toApprovalCheckpointRecord(checkpoint: ApprovalCheckpoint, plan: CEOPlan | undefined, command: CEOCommand | null | undefined, useFallbackIds: boolean): PersistableRecord {
  return {
    ...commonRecord(checkpoint.id, command, useFallbackIds),
    plan_external_id: plan?.id,
    command_external_id: plan?.commandId ?? command?.id,
    title: checkpoint.title,
    domain: checkpoint.domain,
    required_approvers: checkpoint.requiredApprovers,
    status: checkpoint.status,
    risk_level: checkpoint.riskLevel,
    related_task_external_id: checkpoint.relatedTaskId,
    related_workflow_execution_external_id: checkpoint.relatedWorkflowExecutionId,
    summary: checkpoint.summary,
    payload: checkpoint,
    metadata: checkpoint.metadata ?? {}
  };
}

function memoryCandidateToInput(candidate: MemoryCandidate, plan: CEOPlan, command: CEOCommand | null): MemoryItemInput {
  return {
    id: candidate.id,
    organizationId: command?.organizationId,
    workspaceId: command?.workspaceId,
    userId: command?.userId,
    title: candidate.title,
    content: candidate.content,
    scope: candidate.scope,
    sourceType: candidate.sourceType,
    status: candidate.status,
    importance: candidate.importance,
    tags: candidate.tags,
    relatedCommandId: candidate.relatedCommandId ?? plan.commandId,
    relatedWorkflowExecutionId: candidate.relatedWorkflowExecutionId,
    metadata: candidate.metadata
  };
}

function toMemoryItemRecord(item: MemoryItemInput, useFallbackIds: boolean): PersistableRecord {
  const command = {
    id: item.relatedCommandId ?? "",
    organizationId: item.organizationId,
    workspaceId: item.workspaceId,
    userId: item.userId,
    command: "",
    requestedBy: "system" as const,
    status: "completed" as const,
    createdAt: item.createdAt ?? new Date().toISOString()
  };

  return {
    ...commonRecord(item.id, command, useFallbackIds),
    title: item.title,
    content: item.content,
    scope: item.scope,
    source_type: item.sourceType,
    status: item.status,
    importance: item.importance,
    tags: item.tags ?? [],
    related_command_id: item.relatedCommandId,
    related_workflow_execution_id: item.relatedWorkflowExecutionId,
    created_at: item.createdAt,
    payload: item,
    metadata: item.metadata ?? {}
  };
}
