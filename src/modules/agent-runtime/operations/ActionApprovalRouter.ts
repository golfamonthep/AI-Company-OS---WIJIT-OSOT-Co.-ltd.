import type { SupabaseClient } from "@supabase/supabase-js";
import { ApprovalWorkflowManager } from "@/modules/agent-runtime/governance/ApprovalWorkflowManager";
import type { CompanyAgentId } from "@/modules/agent-runtime/governance/types";
import type { OperationRecommendation, OperationsRiskAssessment } from "@/modules/agent-runtime/operations/types";

export class ActionApprovalRouter {
  private readonly approvals: ApprovalWorkflowManager;

  constructor(private readonly supabase: SupabaseClient | null = null) {
    this.approvals = new ApprovalWorkflowManager(supabase);
  }

  async route(input: {
    organizationId: string;
    requesterAgentId: CompanyAgentId;
    recommendation: OperationRecommendation;
    risk: OperationsRiskAssessment;
  }) {
    if (!input.risk.approvalRequired) {
      return {
        routed: false,
        approval: undefined,
        reason: "Recommendation is low-risk and can remain an internal scheduled task."
      };
    }

    const approval = await this.approvals.requestApproval({
      organizationId: input.organizationId,
      requesterAgentId: input.requesterAgentId,
      domain: input.risk.approvalDomain,
      subject: `Approve operation: ${input.recommendation.title}`,
      summary: `${input.recommendation.summary}\n\nRecommended action: ${input.recommendation.recommendedAction}\n\nRisk: ${input.risk.riskLevel}`
    });

    return {
      routed: true,
      approval,
      reason: "High-impact operation routed to governance approval."
    };
  }

  listApprovals() {
    return this.approvals.listApprovals();
  }
}
