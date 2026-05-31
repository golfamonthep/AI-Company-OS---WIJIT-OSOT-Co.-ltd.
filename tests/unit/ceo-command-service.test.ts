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

  it("maps a structured CEO brain result into the existing approval-gated plan contract", async () => {
    const aiBackedService = new CEOCommandService({
      now: () => "2026-05-24T00:00:00.000Z",
      createId: (prefix) => `${prefix}-ai`,
      generateCEOBrainPlan: async () => ({
        title: "แผนแคมเปญ TikTok สำหรับแม่และเด็ก",
        summary: "CEO AI สรุปแผนแคมเปญให้ตรวจและอนุมัติก่อนเริ่มงาน",
        recommendedStrategy: "เริ่มจากคอนเทนต์ให้ความรู้ที่สร้างความไว้วางใจ แล้วทดสอบมุมขายแบบนุ่มนวล",
        steps: ["ยืนยันกลุ่มเป้าหมาย", "เตรียมชุดโพสต์ทดลอง", "ตรวจข้อความก่อนเผยแพร่"],
        delegatedTasks: [
          {
            agentName: "Marketing AI",
            department: "Marketing",
            task: "วิเคราะห์กลุ่มแม่มือใหม่",
            expectedOutput: "insight กลุ่มเป้าหมายและ pain point หลัก",
            status: "queued"
          },
          {
            agentName: "Content AI",
            department: "Content",
            task: "ร่างไอเดียโพสต์ TikTok",
            expectedOutput: "โพสต์ตัวอย่าง 3 ชิ้นพร้อม caption",
            status: "queued"
          }
        ],
        risks: ["ข้อความเรื่องสุขภาพต้องตรวจความถูกต้องก่อนเผยแพร่"],
        approvalCheckpoints: [
          {
            label: "อนุมัติข้อความก่อนเผยแพร่",
            description: "เจ้าของธุรกิจตรวจ claim และ tone ก่อนนำไปใช้จริง",
            status: "requested"
          }
        ],
        contentWorkflowSuggestion: {
          campaignAngle: "แม่มั่นใจ เลือกอย่างปลอดภัย",
          postIdeas: ["เช็กลิสต์ก่อนเลือกผลิตภัณฑ์", "คำถามที่แม่มือใหม่ถามบ่อย"],
          captions: ["เริ่มดูแลลูกด้วยข้อมูลที่มั่นใจ"],
          creativeDirection: "ภาพสว่าง อบอุ่น ใช้ภาษาไทยเข้าใจง่าย",
          nextApprovalNeeded: "อนุมัติ angle และ caption ชุดแรก"
        }
      })
    });

    const plan = await aiBackedService.createCEOPlanFromCommand({
      command: "ช่วยเริ่มแคมเปญ TikTok สำหรับแม่และเด็ก"
    });

    expect(plan).toMatchObject({
      id: "ceo-plan-ai",
      status: "waiting_approval",
      summary: "CEO AI สรุปแผนแคมเปญให้ตรวจและอนุมัติก่อนเริ่มงาน",
      recommendedActions: ["ยืนยันกลุ่มเป้าหมาย", "เตรียมชุดโพสต์ทดลอง", "ตรวจข้อความก่อนเผยแพร่"]
    });
    expect(plan.delegatedTasks).toHaveLength(2);
    expect(plan.delegatedTasks[0]).toMatchObject({
      title: "วิเคราะห์กลุ่มแม่มือใหม่",
      ownerAgentId: "marketing-ai",
      expectedOutput: "insight กลุ่มเป้าหมายและ pain point หลัก",
      status: "queued",
      approvalRequired: true
    });
    expect(plan.approvalCheckpoints[0]).toMatchObject({
      title: "อนุมัติข้อความก่อนเผยแพร่",
      status: "requested",
      summary: "เจ้าของธุรกิจตรวจ claim และ tone ก่อนนำไปใช้จริง"
    });
    expect(plan.metadata).toMatchObject({
      integrationMode: "openai_responses_api",
      recommendedStrategy: "เริ่มจากคอนเทนต์ให้ความรู้ที่สร้างความไว้วางใจ แล้วทดสอบมุมขายแบบนุ่มนวล",
      risks: ["ข้อความเรื่องสุขภาพต้องตรวจความถูกต้องก่อนเผยแพร่"],
      contentWorkflowSuggestion: {
        campaignAngle: "แม่มั่นใจ เลือกอย่างปลอดภัย",
        nextApprovalNeeded: "อนุมัติ angle และ caption ชุดแรก"
      }
    });
  });

  it("falls back to deterministic planning when the CEO brain provider cannot return a plan", async () => {
    const fallbackService = new CEOCommandService({
      now: () => "2026-05-24T00:00:00.000Z",
      createId: (prefix) => `${prefix}-fallback`,
      generateCEOBrainPlan: async () => {
        throw new Error("OpenAI response parsing failed");
      }
    });

    const plan = await fallbackService.createCEOPlanFromCommand({
      command: "สรุปแผนงานวันนี้"
    });

    expect(plan.status).toBe("waiting_approval");
    expect(plan.summary).toContain("CEO AI");
    expect(plan.metadata).toMatchObject({
      integrationMode: "deterministic_mock",
      aiFallback: {
        reason: "OpenAI response parsing failed",
        userMessage: "CEO AI ใช้โหมดสำรองชั่วคราว เพราะยังเชื่อมต่อสมอง AI จริงไม่ได้"
      }
    });
  });
});
