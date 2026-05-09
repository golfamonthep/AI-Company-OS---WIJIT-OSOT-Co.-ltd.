import type { WorkflowDefinition } from "@/modules/agent-runtime/workflows/types";

export class MockWorkflowFactory {
  createContentProductionWorkflow(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
    return {
      workflowId: overrides.workflowId ?? "content-production",
      name: overrides.name ?? "Content Production Workflow",
      purpose: overrides.purpose ?? "Create governed content artifacts from a campaign brief.",
      participatingAgents: overrides.participatingAgents ?? ["ceo", "marketing", "content-creator"],
      inputs: overrides.inputs ?? ["objective", "audience", "channel"],
      outputs: overrides.outputs ?? ["audience_analysis", "scripts", "approval", "learning_event"],
      approvalPoints: overrides.approvalPoints ?? ["governance-approval"],
      memoryUpdates: overrides.memoryUpdates ?? ["campaign-learning-event"],
      successMetrics: overrides.successMetrics ?? ["approval completed", "audit logs generated"],
      failureHandling: overrides.failureHandling ?? ["retry failed agent steps once", "escalate approval denial"],
      rawMarkdown: overrides.rawMarkdown ?? "# Content Production Workflow",
      steps: overrides.steps ?? [
        {
          stepId: "ceo-campaign-brief",
          name: "CEO starts campaign",
          type: "agent_task",
          agentId: "ceo",
          description: "Create campaign objective.",
          dependsOn: [],
          approvalRequired: false,
          maxRetries: 1,
          expectedOutput: "Campaign brief"
        },
        {
          stepId: "marketing-audience-analysis",
          name: "Marketing analyzes audience",
          type: "handoff",
          agentId: "marketing",
          description: "Analyze target audience and angle.",
          dependsOn: ["ceo-campaign-brief"],
          approvalRequired: false,
          maxRetries: 1,
          expectedOutput: "Audience analysis"
        },
        {
          stepId: "content-script-generation",
          name: "Content Creator generates scripts",
          type: "agent_task",
          agentId: "content-creator",
          description: "Generate TikTok scripts.",
          dependsOn: ["marketing-audience-analysis"],
          approvalRequired: false,
          maxRetries: 1,
          expectedOutput: "Script options"
        },
        {
          stepId: "governance-approval",
          name: "Governance approval",
          type: "approval",
          agentId: "ceo",
          description: "Human approval before publish-ready status.",
          dependsOn: ["content-script-generation"],
          approvalRequired: true,
          maxRetries: 0,
          expectedOutput: "Approval decision"
        },
        {
          stepId: "learning-memory-update",
          name: "Learning event generated",
          type: "memory_update",
          agentId: "content-creator",
          description: "Record outcome for future campaigns.",
          dependsOn: ["governance-approval"],
          approvalRequired: false,
          maxRetries: 1,
          expectedOutput: "Learning event"
        }
      ]
    };
  }
}
