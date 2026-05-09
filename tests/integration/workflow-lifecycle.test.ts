import { describe, expect, it } from "vitest";
import { WorkflowSimulationEngine } from "@/testing/WorkflowSimulationEngine";

describe("workflow execution lifecycle", () => {
  it("moves through start, handoff, approval, learning, and completion", () => {
    const result = new WorkflowSimulationEngine().runMotherBabyTikTokCampaign({
      workspaceId: "workspace-lifecycle",
      simulateHumanApproval: true
    });

    expect(result.state).toBe("completed");
    expect(result.analytics.completedSteps).toBe(result.analytics.totalSteps);
    expect(result.steps.map((step) => step.stepId)).toContain("governance-approval");
    expect(result.learningEvents).toHaveLength(1);
  });

  it("supports simulated retry for recoverable agent step failures", () => {
    const result = new WorkflowSimulationEngine().runMotherBabyTikTokCampaign({
      workspaceId: "workspace-retry",
      failStepIds: ["marketing-audience-analysis"]
    });

    const retried = result.steps.find((step) => step.stepId === "marketing-audience-analysis");
    expect(retried?.attempts).toBe(2);
    expect(retried?.state).toBe("completed");
  });
});
