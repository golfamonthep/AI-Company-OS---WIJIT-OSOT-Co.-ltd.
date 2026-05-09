import { GovernancePolicyEngine } from "@/modules/agent-runtime/governance/GovernancePolicyEngine";
import type { ApprovalDomain, CompanyAgentId } from "@/modules/agent-runtime/governance/types";
import type { OperationRecommendation, OperationsRiskAssessment } from "@/modules/agent-runtime/operations/types";

const highImpactPatterns = ["publish", "spend", "budget", "financial", "delete memory", "external", "governance", "permission", "irreversible"];

export class RiskDetector {
  constructor(private readonly governance = new GovernancePolicyEngine()) {}

  assessRecommendation(input: {
    organizationId: string;
    actorAgentId: CompanyAgentId;
    recommendation: OperationRecommendation;
  }): OperationsRiskAssessment {
    const text = `${input.recommendation.title} ${input.recommendation.summary} ${input.recommendation.recommendedAction}`.toLowerCase();
    const matched = highImpactPatterns.filter((pattern) => text.includes(pattern));
    const highImpact = input.recommendation.impact === "high" || matched.length > 0;
    const approvalDomain = resolveApprovalDomain(input.recommendation, matched);
    const governanceEvaluation = this.governance.evaluate({
      organizationId: input.organizationId,
      actorAgentId: input.actorAgentId,
      actionType: highImpact ? "workflow_execute" : "delegate",
      workflowId: input.recommendation.approvalDomain === "campaign" ? "ads-campaign" : "weekly-business-review",
      approvalDomain,
      summary: input.recommendation.recommendedAction,
      metadata: { recommendation: input.recommendation }
    });

    const approvalRequired = highImpact || input.recommendation.requiresApproval || governanceEvaluation.decision === "requires_approval";

    return {
      riskId: `operations-risk-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: input.organizationId,
      actionSummary: input.recommendation.recommendedAction,
      riskLevel: highImpact ? "high" : input.recommendation.riskLevel,
      highImpact,
      approvalRequired,
      approvalDomain,
      reasons: [...matched.map((pattern) => `High-impact pattern detected: ${pattern}`), ...governanceEvaluation.reasons],
      blockedActions: matched.filter((pattern) => pattern === "governance" || pattern === "permission" || pattern === "delete memory"),
      governanceEvaluation,
      createdAt: new Date().toISOString()
    };
  }
}

function resolveApprovalDomain(recommendation: OperationRecommendation, matched: string[]): ApprovalDomain {
  if (matched.includes("budget") || matched.includes("spend") || matched.includes("financial")) return "budget";
  if (matched.includes("publish") || matched.includes("external")) return "publishing";
  if (matched.includes("governance") || matched.includes("permission")) return "workflow";
  return recommendation.approvalDomain;
}
