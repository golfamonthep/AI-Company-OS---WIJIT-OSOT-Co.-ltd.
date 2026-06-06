import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyCeoApprovalDecision,
  createCeoCommandPlanPreview,
  formatCeoCommandPlanReply,
  submitCeoDashboardCommand
} from "@/dashboard/ceo-command-client";
import type { CEOPlan } from "@/modules/orchestration/types";

const plan = {
  id: "ceo-plan-001",
  commandId: "ceo-command-001",
  summary: "CEO AI prepared an approval-gated content workflow plan for: start TikTok campaign",
  status: "waiting_approval",
  recommendedActions: ["Confirm objective", "Review delegated tasks"],
  delegatedTasks: [
    {
      id: "task-001",
      title: "Prepare draft content plan for CEO review",
      ownerAgentId: "content-creator",
      status: "queued",
      expectedOutput: "A short plan that can be reviewed before any external action.",
      approvalRequired: true
    }
  ],
  approvalCheckpoints: [
    {
      id: "approval-001",
      title: "Approve draft campaign work before external use",
      domain: "publishing",
      requiredApprovers: ["human", "ceo"],
      status: "requested",
      riskLevel: "medium",
      summary: "CEO AI can prepare and coordinate work, but execution stays approval-gated."
    }
  ],
  workflowExecutions: [],
  memoryCandidates: []
} satisfies CEOPlan;

describe("CEO command dashboard client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the dashboard command to the CEO command loop API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, plan })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitCeoDashboardCommand({
      command: "ช่วยเริ่มแคมเปญ TikTok สำหรับแม่และเด็ก",
      organizationId: "org-001",
      userId: "user-001"
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/ceo-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: "ช่วยเริ่มแคมเปญ TikTok สำหรับแม่และเด็ก",
        organizationId: "org-001",
        userId: "user-001"
      })
    });
    expect(result.plan).toBe(plan);
    expect(result.reply).toContain("CEO AI เตรียมแผนให้คุณตรวจแล้ว");
    expect(result.reply).toContain("ยืนยันเป้าหมายธุรกิจ");
    expect(result.reply).toContain("ต้องรออนุมัติ");
    expect(result.reply).not.toMatch(/Prepare|Approve|workflow|execution/i);
  });

  it("formats the approval checkpoint from a CEO command plan for a business user", () => {
    const reply = formatCeoCommandPlanReply(plan);

    expect(reply).toContain("CEO AI เตรียมแผนให้คุณตรวจแล้ว");
    expect(reply).toContain("ยืนยันเป้าหมายธุรกิจ");
    expect(reply).toContain("ตรวจและอนุมัติก่อนนำไปใช้จริง");
    expect(reply).not.toMatch(/deterministic_mock|workflow_engine_ready|sourceType|Prepare|Approve|execution/i);
  });

  it("converts a generated CEO plan into dynamic dashboard plan and delegated task panels", () => {
    const preview = createCeoCommandPlanPreview(plan);

    expect(preview.statusLabel).toBe("รอคุณตรวจแผน");
    expect(preview.planPanel.summary).toContain("CEO AI เตรียมแผนให้คุณตรวจแล้ว");
    expect(preview.planPanel.items).toEqual([
      {
        step: "CEO AI สรุปแผนจากคำสั่ง",
        owner: "CEO AI",
        status: "รอคุณตรวจแผน",
        detail: "CEO AI เตรียมแผนให้คุณตรวจแล้ว"
      },
      {
        step: "เตรียมร่างแผนคอนเทนต์ให้ตรวจ",
        owner: "ทีมคอนเทนต์",
        status: "เตรียมงานตามแผน",
        detail: "เตรียมเป็นแผนสั้น ๆ ให้คุณตรวจ ก่อนนำไปใช้จริง"
      },
      {
        step: "ตรวจและอนุมัติก่อนนำไปใช้จริง",
        owner: "คุณ + CEO AI",
        status: "รออนุมัติ",
        detail: "CEO AI ช่วยเตรียมและประสานงานได้ แต่ต้องรอคุณอนุมัติก่อนนำไปใช้จริง"
      }
    ]);
    expect(preview.delegatedAgents).toEqual([
      {
        name: "ทีมคอนเทนต์",
        role: "รับงานที่ CEO AI แยกจากคำสั่ง",
        status: "เตรียมงานตามแผน",
        currentWork: "เตรียมร่างแผนคอนเทนต์ให้ตรวจ"
      }
    ]);
    expect(preview.approvalPanel).toEqual({
      count: 1,
      primaryLabel: "รออนุมัติ",
      summary: "มีแผนจาก CEO AI ที่ต้องให้คุณตรวจและยืนยันก่อนดำเนินการ",
      items: [
        {
          title: "ตรวจและอนุมัติก่อนนำไปใช้จริง",
          requester: "CEO AI",
          risk: "ปานกลาง",
          status: "รออนุมัติ"
        }
      ]
    });
  });

  it("surfaces OpenAI CEO brain risks and content workflow suggestions in the existing plan panel", () => {
    const preview = createCeoCommandPlanPreview({
      ...plan,
      metadata: {
        involvedPlatforms: ["TikTok Office", "Shopee Office"],
        expectedOutputs: ["TikTok launch plan", "Shopee product checklist"],
        risks: ["ข้อความเรื่องสุขภาพต้องตรวจความถูกต้องก่อนเผยแพร่"],
        contentWorkflowSuggestion: {
          campaignAngle: "แม่มั่นใจ เลือกอย่างปลอดภัย",
          postIdeas: ["เช็กลิสต์ก่อนเลือกผลิตภัณฑ์", "คำถามที่แม่มือใหม่ถามบ่อย"],
          captions: ["เริ่มดูแลลูกด้วยข้อมูลที่มั่นใจ"],
          creativeDirection: "ภาพสว่าง อบอุ่น ใช้ภาษาไทยเข้าใจง่าย",
          nextApprovalNeeded: "อนุมัติ angle และ caption ชุดแรก"
        }
      }
    });

    expect(preview.planPanel.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          step: "แพลตฟอร์มที่เกี่ยวข้อง",
          owner: "CEO AI",
          status: "รอประสานงาน",
          detail: "TikTok Office / Shopee Office"
        }),
        expect.objectContaining({
          step: "ผลลัพธ์ที่ควรได้",
          owner: "CEO AI",
          status: "รอตรวจ",
          detail: "TikTok launch plan / Shopee product checklist"
        }),
        expect.objectContaining({
          step: "ความเสี่ยงที่ CEO AI ให้ตรวจ",
          owner: "CEO AI",
          status: "รอตรวจ",
          detail: "ข้อความเรื่องสุขภาพต้องตรวจความถูกต้องก่อนเผยแพร่"
        }),
        expect.objectContaining({
          step: "ข้อเสนอ workflow คอนเทนต์",
          owner: "Content AI",
          status: "รออนุมัติ",
          detail:
            "มุมแคมเปญ: แม่มั่นใจ เลือกอย่างปลอดภัย | ไอเดียโพสต์: เช็กลิสต์ก่อนเลือกผลิตภัณฑ์ / คำถามที่แม่มือใหม่ถามบ่อย | แนวทางภาพ: ภาพสว่าง อบอุ่น ใช้ภาษาไทยเข้าใจง่าย | ต้องอนุมัติต่อ: อนุมัติ angle และ caption ชุดแรก"
        })
      ])
    );
  });

  it("updates approval states without exposing workflow internals", () => {
    const waiting = createCeoCommandPlanPreview(plan);
    const approved = applyCeoApprovalDecision(waiting, "approve");
    const revision = applyCeoApprovalDecision(waiting, "request_revision");
    const condition = applyCeoApprovalDecision(waiting, "add_condition");

    expect(waiting.approvalState).toBe("รออนุมัติ");
    expect(approved).toMatchObject({
      approvalState: "อนุมัติแล้ว",
      statusLabel: "อนุมัติแล้ว",
      feedbackMessage: "คุณอนุมัติแผนแล้ว CEO AI จะส่งต่อให้ทีมเริ่มเตรียมงานตามแผน"
    });
    expect(approved.planPanel.items[0]).toMatchObject({
      status: "อนุมัติแล้ว",
      detail: expect.stringContaining("ทีมเริ่มเตรียมงานตามแผน")
    });
    expect(approved.delegatedAgents[0].status).toBe("เริ่มเตรียมงาน");
    expect(approved.approvalPanel.count).toBe(0);
    expect(approved.approvalPanel.summary).toBe("คุณอนุมัติแผนแล้ว ขั้นตอนถัดไปคือให้ทีมเตรียมงานตามขอบเขตที่ตรวจแล้ว");

    expect(revision).toMatchObject({
      approvalState: "ขอปรับแผน",
      statusLabel: "ขอปรับแผน",
      feedbackMessage: "คุณขอให้ CEO AI ปรับแผนก่อน ยังไม่มีการนำแผนไปใช้จริง"
    });
    expect(revision.planPanel.items[0].status).toBe("ขอปรับแผน");
    expect(revision.delegatedAgents[0].status).toBe("รอแผนปรับปรุง");
    expect(revision.approvalPanel.count).toBe(1);

    expect(condition).toMatchObject({
      approvalState: "เพิ่มเงื่อนไข",
      statusLabel: "เพิ่มเงื่อนไข",
      feedbackMessage: "คุณเพิ่มเงื่อนไขให้ CEO AI ตรวจซ้ำก่อนเริ่มงาน"
    });
    expect(condition.planPanel.items[0].detail).toContain("เพิ่มเงื่อนไข");
    expect(condition.delegatedAgents[0].status).toBe("รอเงื่อนไขเพิ่มเติม");

    for (const preview of [approved, revision, condition]) {
      expect(JSON.stringify(preview)).not.toMatch(/workflowExecution|deterministic|metadata|sourceType|integrationMode/i);
    }
  });

  it("surfaces API errors without creating a fake CEO reply", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "คำสั่งไม่ถูกต้อง" })
      })
    );

    await expect(submitCeoDashboardCommand({ command: "" })).rejects.toThrow("คำสั่งไม่ถูกต้อง");
  });

  it("surfaces a friendly Thai fallback error when the API response is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        }
      })
    );

    await expect(submitCeoDashboardCommand({ command: "ช่วยสรุปงานวันนี้" })).rejects.toThrow(
      "CEO AI ยังรับคำสั่งไม่ได้ชั่วคราว กรุณาลองใหม่อีกครั้ง"
    );
  });
});
