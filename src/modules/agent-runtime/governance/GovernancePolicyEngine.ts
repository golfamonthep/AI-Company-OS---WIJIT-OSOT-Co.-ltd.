import { PermissionManager } from "@/modules/agent-runtime/governance/PermissionManager";
import type { GovernanceActionRequest, GovernanceEvaluation } from "@/modules/agent-runtime/governance/types";

const riskyClaimPatterns = ["guarantee", "100%", "cure", "หายขาด", "รับประกันผล", "รักษา"];

export class GovernancePolicyEngine {
  constructor(private readonly permissions = new PermissionManager()) {}

  evaluate(request: GovernanceActionRequest): GovernanceEvaluation {
    const permission = this.permissions.validateAction(request);
    if (permission.decision === "denied") return permission;

    const text = `${request.summary} ${JSON.stringify(request.metadata ?? {})}`.toLowerCase();
    const riskyClaims = riskyClaimPatterns.filter((pattern) => text.includes(pattern.toLowerCase()));
    if (riskyClaims.length) {
      return {
        decision: "requires_approval",
        severity: "high",
        reasons: [`Risky claim patterns detected: ${riskyClaims.join(", ")}`],
        requiredApprovals: ["product_claims", "evidence"],
        restrictions: ["Do not publish until R&D approves claim evidence."]
      };
    }

    if (request.harnessTool === "python" || request.harnessTool === "node" || request.harnessTool === "browser" || request.harnessTool === "media") {
      return {
        decision: "requires_approval",
        severity: "medium",
        reasons: [`${request.harnessTool} harness requires runtime approval.`],
        requiredApprovals: ["harness_runtime"],
        restrictions: ["Runtime execution remains disabled until approved."]
      };
    }

    return permission;
  }
}
