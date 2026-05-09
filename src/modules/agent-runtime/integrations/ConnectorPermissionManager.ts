import { GovernancePolicyEngine } from "@/modules/agent-runtime/governance/GovernancePolicyEngine";
import { ConnectorRegistry } from "@/modules/agent-runtime/integrations/ConnectorRegistry";
import type { ConnectorPermissionRequest, ConnectorPermissionResult } from "@/modules/agent-runtime/integrations/types";

const forbiddenWithoutApproval = ["send", "publish", "budget", "financial", "delete", "settings", "customer", "broadcast", "invite"];

export class ConnectorPermissionManager {
  constructor(private readonly registry = new ConnectorRegistry(), private readonly governance = new GovernancePolicyEngine()) {}

  validate(request: ConnectorPermissionRequest): ConnectorPermissionResult {
    const connector = this.registry.get(request.connectorId);
    if (!connector || !connector.enabled) {
      return { allowed: false, status: "unsupported", reason: "Connector is not registered or enabled.", requiresApproval: false, approvalDomain: "none" };
    }

    const action = this.registry.findAction(request.connectorId, request.actionId);
    if (!action) {
      return { allowed: false, status: "unsupported", reason: "Connector action is not registered.", requiresApproval: false, approvalDomain: "none" };
    }

    const highImpact = action.type === "external_action" || forbiddenWithoutApproval.some((pattern) => `${action.actionId} ${action.description} ${request.summary}`.toLowerCase().includes(pattern));
    const requiresApproval = action.requiresApproval || highImpact;

    const governanceEvaluation = this.governance.evaluate({
      organizationId: request.organizationId,
      actorAgentId: request.agentId,
      actionType: action.type === "read" ? "delegate" : "workflow_execute",
      workflowId: "content-production",
      approvalDomain: action.approvalDomain,
      summary: request.summary,
      metadata: { connectorId: request.connectorId, actionId: request.actionId, actionType: action.type, connectorPolicy: connector.governancePolicy }
    });

    if (requiresApproval && !request.approved) {
      return {
        allowed: false,
        status: "requires_approval",
        reason: "Connector write or external action requires governance approval before execution.",
        requiresApproval: true,
        approvalDomain: action.approvalDomain,
        governanceEvaluation
      };
    }

    if (governanceEvaluation.decision === "denied") {
      return {
        allowed: false,
        status: "denied",
        reason: governanceEvaluation.reasons.join(" "),
        requiresApproval,
        approvalDomain: action.approvalDomain,
        governanceEvaluation
      };
    }

    return {
      allowed: true,
      status: "success",
      reason: connector.stubOnly ? "Allowed in stub mode; no real external account will be changed." : "Connector action allowed.",
      requiresApproval,
      approvalDomain: action.approvalDomain,
      governanceEvaluation
    };
  }
}
