import { PersistenceService } from "@/database/PersistenceService";
import { createSupabaseServiceClient } from "@/database/supabaseClient";
import { AgentRepository } from "@/database/repositories/AgentRepository";
import { SkillRepository } from "@/database/repositories/SkillRepository";
import { MemoryRepository } from "@/database/repositories/MemoryRepository";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";
import { AuditLogRepository } from "@/database/repositories/AuditLogRepository";

export async function runPersistContentProductionWorkflowDemo() {
  const runtime = createSupabaseServiceClient();
  const persistence = new PersistenceService(runtime.client);
  const organizationId = "00000000-0000-0000-0000-000000000001";

  const agents = new AgentRepository(persistence);
  const skills = new SkillRepository(persistence);
  const memory = new MemoryRepository(persistence);
  const workflows = new WorkflowRepository(persistence);
  const approvals = new ApprovalRepository(persistence);
  const auditLogs = new AuditLogRepository(persistence);

  const agent = await agents.save({
    organization_id: organizationId,
    agent_key: "content-creator",
    role: "content-creator",
    name: "Content Creator AI",
    responsibilities: ["Generate hooks", "Write captions", "Create TikTok scripts"],
    kpis: ["Hook quality", "Content throughput", "Brand consistency"],
    behavior_rules: ["Do not publish externally", "Follow brand voice", "Escalate regulated claims"],
    status: "active",
    metadata: { demo: true }
  });

  const skillExecution = await skills.saveExecution({
    organization_id: organizationId,
    agent_key: "content-creator",
    skill_id: "hook-generation",
    workflow_id: "content-production",
    task_intent: "Generate TikTok hooks for a mother-and-baby product",
    status: "completed",
    input: { objective: "Generate TikTok hooks for a mother-and-baby product" },
    output: { hooks: ["New mom? This one small routine can save your morning."] },
    validation_result: { passed: true },
    errors: [],
    metadata: { demo: true }
  });

  const memoryEntry = await memory.saveCompanyMemory({
    organization_id: organizationId,
    title: "Mother-and-baby content learning",
    content: "Soft, practical hooks with empathy for new mothers perform better than hard-selling claims.",
    memory_type: "lesson",
    source_type: "demo",
    source_id: "persist-content-production-workflow",
    semantic_tags: ["content", "mother-and-baby", "hooks"],
    importance: 7,
    embedding_model: "pending",
    metadata: { vectorReady: true }
  });

  const workflowRun = await workflows.saveRun({
    organization_id: organizationId,
    run_key: `content-production-demo-${Date.now()}`,
    workflow_key: "content-production",
    objective: "Persist Content Production Workflow",
    status: "completed",
    input: { brief: "Mother-and-baby TikTok Campaign" },
    output: { hooksGenerated: 1, approvalRequired: true },
    metrics: { durationMs: 0 },
    metadata: { demo: true }
  });

  const approval = await approvals.saveApproval({
    organization_id: organizationId,
    approval_key: `approval-demo-${Date.now()}`,
    requester_agent_key: "content-creator",
    approver_agent_keys: ["ceo"],
    domain: "workflow",
    subject: "Approve content production package",
    summary: "Demo approval record for content production persistence.",
    status: "approved",
    decisions: [{ approver: "ceo", decision: "approved", decidedAt: new Date().toISOString() }],
    metadata: { demo: true }
  });

  const audit = await auditLogs.save({
    organization_id: organizationId,
    actor_agent_key: "content-creator",
    event_type: "persistence_demo_completed",
    severity: "info",
    summary: "Persist Content Production Workflow demo wrote agent, skill execution, memory, workflow run, approval, and audit records.",
    decision: "allowed",
    metadata: { demo: true }
  });

  const dashboard = {
    agents: await agents.list(organizationId),
    skillExecutions: await skills.listExecutions(organizationId),
    memory: await memory.listCompanyMemory(organizationId),
    workflowRuns: await workflows.listRuns(organizationId),
    approvals: await approvals.list(organizationId),
    auditLogs: await auditLogs.list(organizationId)
  };

  return {
    mode: runtime.mode,
    reason: runtime.reason,
    writes: { agent, skillExecution, memoryEntry, workflowRun, approval, audit },
    dashboard
  };
}
