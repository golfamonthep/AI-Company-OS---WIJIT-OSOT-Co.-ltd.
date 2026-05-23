import { describe, expect, it } from "vitest";
import type {
  ApprovalCheckpoint,
  CEOCommand,
  CEOPlan,
  DelegatedTask,
  MemoryCandidate,
  WorkflowExecution
} from "@/modules/orchestration/types";

describe("CEO command loop shared types", () => {
  it("supports a lightweight CEO command loop contract", () => {
    const command = {
      id: "ceo-command-001",
      organizationId: "org-001",
      workspaceId: "workspace-001",
      command: "ช่วยวางแผนแคมเปญ TikTok สำหรับแม่และเด็ก",
      requestedBy: "human",
      status: "planned",
      createdAt: "2026-05-23T00:00:00.000Z"
    } satisfies CEOCommand;

    const delegatedTask = {
      id: "delegated-task-001",
      title: "เตรียมมุมสื่อสาร",
      ownerAgentId: "marketing",
      status: "queued",
      priority: "high"
    } satisfies DelegatedTask;

    const checkpoint = {
      id: "approval-001",
      title: "ตรวจชุดคอนเทนต์ก่อนใช้จริง",
      domain: "publishing",
      requiredApprovers: ["human", "ceo"],
      status: "requested",
      riskLevel: "medium"
    } satisfies ApprovalCheckpoint;

    const execution = {
      id: "workflow-001",
      workflowKey: "content-production",
      status: "waiting_approval",
      currentStep: "human_approval",
      approvalCheckpoints: [checkpoint]
    } satisfies WorkflowExecution;

    const memoryCandidate = {
      id: "memory-001",
      title: "มุมสื่อสารที่ควรใช้ซ้ำ",
      content: "Checklist framing worked well.",
      scope: "agent",
      sourceType: "ceo_command",
      status: "proposed",
      importance: 7
    } satisfies MemoryCandidate;

    const plan = {
      id: "ceo-plan-001",
      commandId: command.id,
      summary: "CEO AI เสนอให้เริ่มจากมุมสื่อสารและหยุดรออนุมัติก่อนใช้จริง",
      status: "draft",
      delegatedTasks: [delegatedTask],
      approvalCheckpoints: [checkpoint],
      workflowExecutions: [execution],
      memoryCandidates: [memoryCandidate]
    } satisfies CEOPlan;

    expect(plan.delegatedTasks[0].ownerAgentId).toBe("marketing");
    expect(plan.approvalCheckpoints[0].requiredApprovers).toContain("human");
    expect(plan.workflowExecutions[0].status).toBe("waiting_approval");
    expect(plan.memoryCandidates[0].status).toBe("proposed");
  });
});
