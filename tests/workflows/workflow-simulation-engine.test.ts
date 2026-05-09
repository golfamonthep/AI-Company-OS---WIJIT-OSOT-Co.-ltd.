import { describe, expect, it } from "vitest";
import { MockWorkflowFactory } from "@/testing/MockWorkflowFactory";
import { WorkflowSimulationEngine } from "@/testing/WorkflowSimulationEngine";

describe("WorkflowSimulationEngine", () => {
  it("uses approval checkpoints from workflow definitions", () => {
    const workflow = new MockWorkflowFactory().createContentProductionWorkflow();
    const result = new WorkflowSimulationEngine().run({
      organizationId: "test-org",
      workspaceId: "test-workspace",
      workflow,
      objective: "Create a TikTok campaign",
      simulateHumanApproval: false
    });

    expect(result.state).toBe("waiting_approval");
    expect(result.approvalRequested).toBe(true);
    expect(result.approvalApproved).toBe(false);
  });
});
