import { describe, expect, it } from "vitest";
import { CEOCommandService } from "@/modules/orchestration/ceo-command-service";

describe("CEOCommandService", () => {
  const service = new CEOCommandService({
    now: () => "2026-05-24T00:00:00.000Z",
    createId: (prefix) => `${prefix}-test`
  });

  it("creates a deterministic approval-gated CEO plan from a command", async () => {
    const plan = await service.createCEOPlanFromCommand({
      organizationId: "org-001",
      workspaceId: "workspace-001",
      userId: "user-001",
      command: "ช่วยเริ่มแคมเปญ TikTok สำหรับแม่และเด็ก"
    });

    expect(plan).toMatchObject({
      id: "ceo-plan-test",
      commandId: "ceo-command-test",
      status: "waiting_approval"
    });
    expect(plan.summary).toContain("CEO AI");
    expect(plan.delegatedTasks[0]).toMatchObject({
      ownerAgentId: "content-creator",
      status: "queued",
      approvalRequired: true
    });
    expect(plan.approvalCheckpoints[0]).toMatchObject({
      domain: "publishing",
      status: "requested",
      requiredApprovers: ["human", "ceo"]
    });
    expect(plan.workflowExecutions[0]).toMatchObject({
      workflowKey: "content-production",
      status: "queued"
    });
    expect(plan.memoryCandidates[0]).toMatchObject({
      scope: "task_history",
      sourceType: "ceo_command",
      status: "proposed"
    });
  });

  it("approves, requests revision, executes, and saves memory candidates without external side effects", async () => {
    const plan = await service.createCEOPlanFromCommand({ command: "สรุปงานที่ควรทำต่อ" });
    const approved = await service.approveCEOPlan(plan, { approvedBy: "human", notes: "ตรวจแล้วเริ่มได้" });
    const executed = await service.executeApprovedWorkflow(approved);
    const revision = await service.requestPlanRevision(plan, { requestedBy: "human", reason: "ขอให้ระบุเป้าหมายให้ชัดขึ้น" });
    const savedMemory = await service.saveMemoryCandidate(
      service.createMemoryCandidate({
        title: "CEO command learning",
        content: "Keep approval checkpoints visible.",
        scope: "company",
        relatedCommandId: plan.commandId
      })
    );

    expect(approved.status).toBe("ready");
    expect(approved.approvalCheckpoints[0].status).toBe("approved");
    expect(executed.status).toBe("completed");
    expect(executed.workflowExecutions[0].status).toBe("completed");
    expect(revision.status).toBe("draft");
    expect(revision.approvalCheckpoints[0].status).toBe("changes_requested");
    expect(savedMemory.status).toBe("saved");
  });
});
