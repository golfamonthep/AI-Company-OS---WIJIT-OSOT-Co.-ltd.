import { describe, expect, it } from "vitest";
import { EmergencyControlManager } from "@/modules/agent-runtime/governance/EmergencyControlManager";
import { GovernanceTestSuite } from "@/testing/GovernanceTestSuite";

describe("governance safety testing", () => {
  it("enforces approval authority and connector write restrictions", () => {
    const result = new GovernanceTestSuite().validateApprovalEnforcement();

    expect(result.viewerCannotApprove).toBe(true);
    expect(result.ownerCanApproveHighImpact).toBe(true);
    expect(result.connectorWriteRequiresApproval).toBe(true);
  });

  it("routes risky claims to governance approval", () => {
    const evaluation = new GovernanceTestSuite().validateRiskyClaimGuardrail();

    expect(evaluation.decision).toBe("requires_approval");
    expect(evaluation.requiredApprovals).toContain("product_claims");
  });

  it("validates emergency stop state", async () => {
    const manager = new EmergencyControlManager(null);
    await manager.emergencyStop({
      organizationId: "test-org",
      actorAgentId: "human",
      reason: "QA emergency stop test",
      workflows: ["content-production"]
    });

    expect(manager.isWorkflowPaused("test-org", "content-production")).toBe(true);
    expect(manager.getState("test-org")?.dangerousExecutionDisabled).toBe(true);
  });
});
