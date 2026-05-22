import type { AgentPermissionProfile, GovernanceActionRequest, GovernanceEvaluation } from "@/modules/agent-runtime/governance/types";

const profiles: AgentPermissionProfile[] = [
  { agentId: "ceo", allowedWorkflows: ["content-production", "product-research", "ads-campaign", "weekly-business-review"], allowedHarnessTools: ["filesystem", "api"], canApprove: ["publishing", "campaign", "budget", "workflow"], canEscalateTo: ["human"], executionLimits: ["Final approval and strategic decisions"] },
  { agentId: "cto", allowedWorkflows: ["product-research", "weekly-business-review"], allowedHarnessTools: ["filesystem", "api", "node", "python"], canApprove: ["technical", "harness_runtime"], canEscalateTo: ["ceo", "human"], executionLimits: ["Runtime tools require explicit approval"] },
  { agentId: "cfo", allowedWorkflows: ["ads-campaign", "weekly-business-review"], allowedHarnessTools: ["filesystem", "api"], canApprove: ["budget", "finance"], canEscalateTo: ["ceo"], executionLimits: ["Financial data only within approved workflows"] },
  { agentId: "marketing", allowedWorkflows: ["content-production", "ads-campaign", "product-research", "weekly-business-review"], allowedHarnessTools: ["filesystem", "api"], canApprove: ["strategy"], canEscalateTo: ["ceo"], executionLimits: ["Cannot publish externally without CEO or human approval"] },
  { agentId: "ads-performance", allowedWorkflows: ["ads-campaign", "weekly-business-review", "content-production"], allowedHarnessTools: ["filesystem", "api"], canApprove: ["ads_targeting"], canEscalateTo: ["marketing", "ceo"], executionLimits: ["Cannot spend budget without CFO or CEO approval"] },
  { agentId: "content-creator", allowedWorkflows: ["content-production", "ads-campaign"], allowedHarnessTools: ["filesystem"], canApprove: ["none"], canEscalateTo: ["marketing", "rd", "ceo"], executionLimits: ["Cannot publish externally or modify company memory directly"] },
  { agentId: "video-editor", allowedWorkflows: ["content-production", "ads-campaign"], allowedHarnessTools: ["filesystem", "media"], canApprove: ["none"], canEscalateTo: ["marketing", "ceo"], executionLimits: ["Media harness is disabled until approved"] },
  { agentId: "rd", allowedWorkflows: ["product-research", "content-production"], allowedHarnessTools: ["filesystem", "api"], canApprove: ["product_claims", "evidence"], canEscalateTo: ["ceo"], executionLimits: ["Validates claims but does not publish"] },
  { agentId: "workflow-engine", allowedWorkflows: ["content-production", "product-research", "ads-campaign", "weekly-business-review"], allowedHarnessTools: ["filesystem"], canApprove: ["none"], canEscalateTo: ["ceo", "cto"], executionLimits: ["Coordinates only; cannot approve business actions"] }
];

export class PermissionManager {
  getProfile(agentId: AgentPermissionProfile["agentId"]) {
    return profiles.find((profile) => profile.agentId === agentId);
  }

  validateAction(request: GovernanceActionRequest): GovernanceEvaluation {
    const profile = this.getProfile(request.actorAgentId);
    if (!profile) return denied("Unknown agent profile.");

    if (request.actionType === "workflow_execute" && request.workflowId && !profile.allowedWorkflows.includes(request.workflowId)) {
      return denied(`${request.actorAgentId} cannot execute workflow ${request.workflowId}.`);
    }

    if (request.actionType === "harness_execute" && request.harnessTool && !profile.allowedHarnessTools.includes(request.harnessTool)) {
      return denied(`${request.actorAgentId} cannot use harness ${request.harnessTool}.`);
    }

    if (request.actionType === "approval_decision" && request.approvalDomain && !profile.canApprove.includes(request.approvalDomain)) {
      return denied(`${request.actorAgentId} cannot approve ${request.approvalDomain}.`);
    }

    if (request.actionType === "publish") {
      return {
        decision: "requires_approval",
        severity: "high",
        reasons: ["External publishing requires approval."],
        requiredApprovals: ["publishing"],
        restrictions: profile.executionLimits
      };
    }

    if (request.actionType === "memory_write" && request.actorAgentId === "content-creator") {
      return {
        decision: "requires_approval",
        severity: "medium",
        reasons: ["Content Creator cannot modify company memory directly."],
        requiredApprovals: ["workflow"],
        restrictions: profile.executionLimits
      };
    }

    return { decision: "allowed", severity: "info", reasons: ["Action is within agent permissions."], requiredApprovals: [], restrictions: profile.executionLimits };
  }
}

function denied(reason: string): GovernanceEvaluation {
  return { decision: "denied", severity: "high", reasons: [reason], requiredApprovals: [], restrictions: [reason] };
}
