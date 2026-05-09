import { describe, expect, it } from "vitest";
import { TestReportGenerator } from "@/testing/TestReportGenerator";
import { WorkflowSimulationEngine } from "@/testing/WorkflowSimulationEngine";

describe("Mother-and-baby TikTok Campaign Simulation", () => {
  it("runs the full governed campaign flow and validates audit logs", () => {
    const result = new WorkflowSimulationEngine().runMotherBabyTikTokCampaign({
      workspaceId: "mother-baby-workspace",
      simulateHumanApproval: true
    });
    const report = new TestReportGenerator().fromSimulation(result);

    expect(result.steps.map((step) => step.agentId)).toEqual(["ceo", "marketing", "content-creator", "ceo", "content-creator"]);
    expect(result.approvalRequested).toBe(true);
    expect(result.approvalApproved).toBe(true);
    expect(result.auditLogs.map((event) => event.eventType)).toContain("approval_requested");
    expect(result.auditLogs.map((event) => event.eventType)).toContain("approval_approved");
    expect(result.learningEvents.map((event) => event.eventType)).toContain("learning_event_generated");
    expect(report.status).toBe("passed");
  });
});
