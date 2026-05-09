import { createAuditEvent } from "@/modules/agent-runtime/governance/AuditLogger";
import { healthCheckService } from "@/infrastructure/HealthCheckService";
import { ProductionError } from "@/infrastructure/GlobalErrorHandler";
import { structuredLogger } from "@/infrastructure/StructuredLogger";
import { workflowRecoveryManager } from "@/infrastructure/WorkflowRecoveryManager";

export async function runWorkflowFailureRecoveryDemo() {
  const workflowId = `content-production-demo-${Date.now()}`;
  const organizationId = "demo-org";
  const agentId = "content-creator";

  workflowRecoveryManager.checkpoint({
    workflowId,
    organizationId,
    agentId,
    currentStep: "content_harness_execution",
    checkpoint: {
      workflow: "content-production",
      brief: "Mother-and-baby TikTok campaign draft",
      selectedSkillIds: ["hook_generation", "tiktok_scripting"]
    }
  });

  try {
    throw new ProductionError("HARNESS_FAILED", "Simulated API harness failure during content generation.", {
      severity: "recoverable",
      retryable: true,
      workflowSafe: true,
      context: { harness: "api", action: "generate_content" }
    });
  } catch (error) {
    const failure = workflowRecoveryManager.captureFailure({
      workflowId,
      organizationId,
      agentId,
      currentStep: "content_harness_execution",
      checkpoint: {
        workflow: "content-production",
        brief: "Mother-and-baby TikTok campaign draft",
        selectedSkillIds: ["hook_generation", "tiktok_scripting"]
      },
      error
    });

    const auditEvent = createAuditEvent({
      organizationId,
      actorAgentId: agentId,
      eventType: "workflow_failure_recovery_queued",
      severity: "medium",
      summary: "Simulated harness failure was caught and queued for recovery.",
      decision: "requires_revision",
      relatedWorkflowId: workflowId,
      metadata: { retryId: failure.retry.id, errorId: failure.error.errorId }
    });

    structuredLogger.warn({
      layer: "governance",
      event: auditEvent.eventType,
      message: auditEvent.summary,
      organizationId,
      workflowId,
      agentId,
      metadata: auditEvent
    });
  }

  const recovered = await workflowRecoveryManager.recover(workflowId, async (state) => ({
    workflowId: state.workflowId,
    status: "completed_safely",
    output: {
      hooks: ["Before you choose, check this first."],
      recoveryNote: "Recovered from checkpoint and completed deterministic fallback output."
    }
  }));

  const health = healthCheckService.getSystemHealth();
  return {
    scenario: "Workflow Failure Recovery",
    workflowId,
    recovered,
    health
  };
}
