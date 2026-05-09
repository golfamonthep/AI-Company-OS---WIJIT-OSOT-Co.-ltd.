import { RolePermissionService } from "@/auth/RolePermissionService";
import { GovernancePolicyEngine } from "@/modules/agent-runtime/governance/GovernancePolicyEngine";
import { MockHarnessExecutor } from "@/testing/MockHarnessExecutor";

export class GovernanceTestSuite {
  constructor(
    private readonly roles = new RolePermissionService(),
    private readonly governance = new GovernancePolicyEngine(),
    private readonly harness = new MockHarnessExecutor()
  ) {}

  validateApprovalEnforcement() {
    return {
      viewerCannotApprove: !this.roles.canApprove("viewer", "normal"),
      ownerCanApproveHighImpact: this.roles.canApprove("owner", "high"),
      connectorWriteRequiresApproval: this.harness.execute({
        tool: "connector",
        action: "publish_post",
        connectorActionType: "external_action",
        approved: false,
        input: { channel: "tiktok" }
      }).status === "requires_approval"
    };
  }

  validateRiskyClaimGuardrail() {
    return this.governance.evaluate({
      organizationId: "test-org",
      actorAgentId: "content-creator",
      actionType: "publish",
      approvalDomain: "publishing",
      summary: "Publish TikTok script with 100% cure claim",
      metadata: {}
    });
  }
}
