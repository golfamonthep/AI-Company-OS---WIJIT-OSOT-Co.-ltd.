import { describe, expect, it } from "vitest";
import { createCeoCommandCenterViewModel } from "@/dashboard/ceo-command-center";
import {
  defaultApprovalStates,
  defaultCeoPlans,
  defaultDailyBriefItems,
  defaultDelegatedTasks,
  defaultMemoryItems
} from "@/dashboard/ceo-command-center-structures";
import { createMockLiveDashboardSnapshot } from "@/dashboard/mock-snapshot";

describe("CEO command center view model", () => {
  it("prioritizes approvals and human-readable CEO next action from the live snapshot", () => {
    const snapshot = createMockLiveDashboardSnapshot();
    snapshot.contentDepartment.pendingApprovals = 2;
    snapshot.contentDepartment.activeRuns = 1;
    snapshot.contentDepartment.latestRun = {
      run_key: "run-content-001",
      workflow_key: "content-production",
      objective: "Launch mother-and-baby TikTok campaign",
      status: "waiting_approval"
    };
    snapshot.contentDepartment.recentApprovals = [
      {
        approval_key: "approval-001",
        requester_agent_key: "content-creator",
        domain: "publishing",
        subject: "Approve TikTok content pack",
        status: "requested"
      }
    ];

    const viewModel = createCeoCommandCenterViewModel(snapshot, "ready");

    expect(viewModel.headline).toBe("CEO AI กำลังรอการตัดสินใจจากคุณ");
    expect(viewModel.primaryAction.label).toBe("ตรวจงานที่รออนุมัติ");
    expect(viewModel.priorities[0]).toMatchObject({
      label: "งานที่ต้องตัดสินใจ",
      value: "2 รายการ",
      tone: "amber"
    });
    expect(viewModel.nextSteps[0]).toContain("ตรวจและอนุมัติ");
    expect(viewModel.teamStatus).toContain("Content Department");
  });

  it("explains fallback mode without hiding governance safeguards", () => {
    const snapshot = createMockLiveDashboardSnapshot("offline");

    const viewModel = createCeoCommandCenterViewModel(snapshot, "fallback");

    expect(viewModel.headline).toBe("CEO AI พร้อมช่วยคุณเริ่มงาน");
    expect(viewModel.systemBadges).toContain("ข้อมูลตัวอย่าง");
    expect(viewModel.guardrail).toContain("ยังไม่เผยแพร่ภายนอก");
  });

  it("builds the Step 5 dashboard sections around CEO AI instead of technical panels", () => {
    const snapshot = createMockLiveDashboardSnapshot();
    snapshot.contentDepartment.pendingApprovals = 1;
    snapshot.contentDepartment.memoryUpdates = [
      {
        title: "Successful TikTok Hooks",
        result_summary: "Checklist framing worked well for mother-and-baby content.",
        memory_type: "agent"
      }
    ];
    snapshot.contentDepartment.learningEvents = [
      {
        event_type: "quality_review",
        summary: "Avoid unsupported product claims in hooks.",
        status: "recorded",
        score: 8
      }
    ];

    const viewModel = createCeoCommandCenterViewModel(snapshot, "ready");

    expect(viewModel.sections.map((section) => section.id)).toEqual([
      "header",
      "ceo-command",
      "ceo-plan",
      "delegated-agents",
      "approval",
      "daily-brief",
      "memory"
    ]);
    expect(viewModel.planPanel.items[0].owner).toBe("CEO AI");
    expect(viewModel.delegatedAgents.map((agent) => agent.name)).toContain("Content Creator AI");
    expect(viewModel.approvalPanel.primaryLabel).toBe("รออนุมัติ");
    expect(viewModel.dailyBrief.items.length).toBeGreaterThan(0);
    expect(viewModel.memoryPanel.items[0].title).toBe("Successful TikTok Hooks");
  });

  it("uses realistic reusable Thai business structures for Step 6", () => {
    expect(defaultCeoPlans[0]).toMatchObject({
      label: "เสนอแผน",
      owner: "CEO AI"
    });
    expect(defaultDelegatedTasks[0].status).toBe("พร้อมดำเนินการเมื่อได้รับอนุมัติ");
    expect(defaultApprovalStates.map((state) => state.label)).toContain("รออนุมัติ");
    expect(defaultMemoryItems[0].confirmationNote).toBe("บันทึกเป็นความจำหลังผู้ใช้ยืนยัน");
    expect(defaultDailyBriefItems[0].text).toContain("ยอดขาย");

    const combined = JSON.stringify({
      defaultCeoPlans,
      defaultDelegatedTasks,
      defaultApprovalStates,
      defaultMemoryItems,
      defaultDailyBriefItems
    });

    expect(combined).not.toMatch(/autonomous|service role|temperature|model|vector|token/i);
  });
});
