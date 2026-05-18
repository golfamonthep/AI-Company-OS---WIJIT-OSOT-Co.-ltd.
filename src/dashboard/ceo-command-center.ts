import type { LiveDashboardSnapshot } from "@/dashboard/types";
import {
  defaultApprovalStates,
  defaultCeoPlans,
  defaultDailyBriefItems,
  defaultDelegatedTasks,
  defaultMemoryItems
} from "@/dashboard/ceo-command-center-structures";

export type CeoCommandCenterViewModel = {
  sections: Array<{
    id: "header" | "ceo-command" | "ceo-plan" | "delegated-agents" | "approval" | "daily-brief" | "memory";
    title: string;
  }>;
  headline: string;
  subheadline: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction: {
    label: string;
    href: string;
  };
  systemBadges: string[];
  guardrail: string;
  teamStatus: string;
  nextSteps: string[];
  commandPrompts: string[];
  planPanel: {
    title: string;
    summary: string;
    items: Array<{
      step: string;
      owner: string;
      status: string;
      detail: string;
    }>;
  };
  delegatedAgents: Array<{
    name: string;
    role: string;
    status: string;
    currentWork: string;
  }>;
  approvalPanel: {
    count: number;
    primaryLabel: string;
    summary: string;
    items: Array<{
      title: string;
      requester: string;
      risk: string;
      status: string;
    }>;
  };
  dailyBrief: {
    summary: string;
    items: string[];
  };
  memoryPanel: {
    summary: string;
    items: Array<{
      title: string;
      detail: string;
      type: string;
    }>;
  };
  priorities: Array<{
    label: string;
    value: string;
    detail: string;
    tone: "cyan" | "green" | "amber" | "rose" | "violet" | "slate";
  }>;
};

export type SnapshotStatus = "loading" | "ready" | "fallback";

export function createCeoCommandCenterViewModel(
  liveSnapshot: LiveDashboardSnapshot | null,
  snapshotStatus: SnapshotStatus
): CeoCommandCenterViewModel {
  const department = liveSnapshot?.contentDepartment;
  const latestRun = department?.latestRun;
  const pendingApprovals = department?.pendingApprovals ?? 0;
  const activeRuns = department?.activeRuns ?? 0;
  const completedRuns = department?.completedRuns ?? 0;
  const generatedCount = department?.generatedOutputs
    ? department.generatedOutputs.hooks.length + department.generatedOutputs.captions.length + department.generatedOutputs.scripts.length
    : department?.contentPack?.packSummary.totalReviewableItems ?? 0;
  const qualityScore = department?.qualityReviewSummary?.overallScore ?? department?.contentPack?.packSummary.averageQualityScore;
  const mainAlert = department?.operationalAlerts?.find((alert) => alert.level !== "info");
  const fallbackMode = snapshotStatus === "fallback";
  const approvalRequired = pendingApprovals > 0 || latestRun?.status === "waiting_approval";
  const approvalItems = department?.recentApprovals.length
    ? department.recentApprovals.map((approval) => ({
        title: approval.subject,
        requester: approval.requester_agent_key,
        risk: toThaiRisk(approval.metadata?.risk),
        status: toThaiStatus(approval.status)
      }))
    : [
        {
          title: defaultApprovalStates[0].summary,
          requester: "CEO AI",
          risk: defaultApprovalStates[0].risk,
          status: defaultApprovalStates[0].label
        }
      ];
  const memoryItems = department?.memoryUpdates.length
    ? department.memoryUpdates.slice(0, 3).map((item) => ({
        title: item.title,
        detail: item.result_summary ?? item.content ?? defaultMemoryItems[0].detail,
        type: item.memory_type ?? "company"
      }))
    : defaultMemoryItems.map((item) => ({
        title: item.title,
        detail: `${item.detail} (${item.confirmationNote})`,
        type: item.type
      }));
  const learningItems = department?.learningEvents.length
    ? department.learningEvents.slice(0, 2).map((event) => event.summary)
    : [defaultDailyBriefItems[2].text];

  const headline = approvalRequired
    ? "CEO AI กำลังรอการตัดสินใจจากคุณ"
    : activeRuns > 0
      ? "CEO AI กำลังพาทีมทำงานให้คุณ"
      : "CEO AI พร้อมช่วยคุณเริ่มงาน";

  const primaryAction = approvalRequired
    ? { label: "ตรวจงานที่รออนุมัติ", href: "#approval-queue" }
    : { label: "เริ่ม Content Department", href: "/workflows/content-production" };

  const systemBadges = [
    snapshotStatus === "loading" ? "กำลังโหลดข้อมูล" : fallbackMode ? "ข้อมูลตัวอย่าง" : "ข้อมูลล่าสุด",
    liveSnapshot?.workspace.persistenceMode === "supabase" ? "เชื่อมต่อ Supabase" : "โหมดสำรอง",
    "Human approval required"
  ];

  const nextSteps = approvalRequired
    ? [
        "ตรวจและอนุมัติผลงานก่อนนำไปใช้ภายนอก",
        "อ่านเหตุผลและความเสี่ยงจาก Governance Queue",
        "ให้ CEO AI บันทึกบทเรียนหลังอนุมัติหรือขอแก้ไข"
      ]
    : activeRuns > 0
      ? [
          "รอทีม AI สรุปผลงานจาก workflow ที่กำลังรัน",
          "ตรวจคุณภาพ hooks, captions และ scripts เมื่อสร้างเสร็จ",
          "ตัดสินใจอนุมัติหรือขอแก้ไขก่อนเผยแพร่"
        ]
      : [
          "เริ่ม Mother-and-baby TikTok Campaign workflow",
          "ให้ CEO AI สรุปเป้าหมาย กลุ่มลูกค้า และข้อจำกัด",
          "ตรวจผลงานผ่านระบบอนุมัติก่อนใช้งานจริง"
        ];

  return {
    sections: [
      { id: "header", title: "Header" },
      { id: "ceo-command", title: "CEO AI command area" },
      { id: "ceo-plan", title: "CEO AI plan panel" },
      { id: "delegated-agents", title: "Delegated agents panel" },
      { id: "approval", title: "Approval panel" },
      { id: "daily-brief", title: "Daily brief panel" },
      { id: "memory", title: "Memory panel" }
    ],
    headline,
    subheadline: latestRun
      ? `${department?.campaignName ?? "Content Department"} อยู่ในสถานะ ${toThaiStatus(latestRun.status)}`
      : "สั่งงาน CEO AI แล้วให้ทีมเบื้องหลังช่วยทำ content, ads, approval, memory และ learning อย่างเป็นระบบ",
    primaryAction,
    secondaryAction: { label: "ดู workflow", href: "/workflows/content-department" },
    systemBadges,
    guardrail: mainAlert
      ? `ยังไม่เผยแพร่ภายนอก: ${mainAlert.detail}`
      : fallbackMode
        ? "ยังไม่เผยแพร่ภายนอก และยังต้องผ่านการอนุมัติจากมนุษย์ก่อน action สำคัญ"
        : "ยังไม่เผยแพร่ภายนอก การ publish, spending และ external writes ต้องผ่าน approval เสมอ",
    teamStatus:
      activeRuns > 0
        ? `Content Department กำลังทำงาน ${activeRuns} งาน`
        : approvalRequired
          ? "Content Department ส่งงานให้ CEO AI รอคุณตรวจ"
          : "Content Department พร้อมเริ่มงานถัดไป",
    nextSteps,
    commandPrompts: [
      "ช่วยเสนอแผนสำหรับยอดขายเดือนนี้",
      "ดูงานที่รออนุมัติและสรุปความเสี่ยงให้เข้าใจง่าย",
      "เตรียมงานที่พร้อมดำเนินการเมื่อได้รับอนุมัติ"
    ],
    planPanel: {
      title: "แผนที่ CEO AI เสนอ",
      summary: latestRun
        ? `แผนล่าสุดของ ${department?.campaignName ?? "Content Department"} อยู่ในสถานะ ${toThaiStatus(latestRun.status)}`
        : "CEO AI เสนอแผนเป็นลำดับ และทุกงานภายนอกต้องรออนุมัติก่อนดำเนินการ",
      items: defaultCeoPlans.map((plan, index) => ({
        step: index === 0 && latestRun?.objective ? latestRun.objective : plan.step,
        owner: plan.owner,
        status:
          index === 0 && latestRun
            ? "เสนอแผน"
            : index === 1 && department?.marketingAnalysis
              ? "เสนอแผน"
              : index === 2 && generatedCount > 0
                ? "รออนุมัติ"
                : index === 3 && approvalRequired
                  ? "รออนุมัติ"
                  : plan.status,
        detail: index === 1 && department?.marketingAnalysis?.contentAngle ? department.marketingAnalysis.contentAngle : plan.detail
      }))
    },
    delegatedAgents: defaultDelegatedTasks.map((task) => ({
      name: task.name,
      role: task.role,
      status:
        task.name === "Marketing AI" && department?.marketingAnalysis
          ? "เสนอแผน"
          : task.name === "Content Creator AI" && generatedCount > 0
            ? "รออนุมัติ"
            : task.status,
      currentWork:
        task.name === "Marketing AI" && department?.marketingAnalysis?.segment
          ? department.marketingAnalysis.segment
          : task.name === "Content Creator AI" && generatedCount > 0
            ? `${generatedCount} ชิ้นรออนุมัติจากผู้ใช้`
            : task.name === "Ads Performance AI" && department?.adsPerformance?.reportingSummary
              ? department.adsPerformance.reportingSummary
              : task.currentWork
    })),
    approvalPanel: {
      count: pendingApprovals,
      primaryLabel: approvalRequired ? "รออนุมัติ" : "พร้อมดำเนินการเมื่อได้รับอนุมัติ",
      summary: approvalRequired
        ? "มีงานที่ต้องให้คุณตัดสินใจก่อนนำไปใช้ภายนอก"
        : "CEO AI จะแสดงงานที่เสนอแผนและรออนุมัติก่อนนำไปใช้จริง",
      items: approvalItems
    },
    dailyBrief: {
      summary: mainAlert
        ? mainAlert.detail
        : approvalRequired
          ? "วันนี้ควรเริ่มจากงานที่รออนุมัติ แล้วให้ CEO AI บันทึกบทเรียนหลังตัดสินใจ"
          : "วันนี้ยังไม่มีเรื่องเร่งด่วน เริ่ม Content Department workflow ได้เมื่อพร้อม",
      items: [
        ...defaultDailyBriefItems.map((item) => item.text),
        `งานรออนุมัติ ${pendingApprovals} รายการ`,
        `workflow กำลังทำงาน ${activeRuns} งาน`,
        `ผลงานพร้อมตรวจ ${generatedCount} ชิ้น`,
        ...learningItems
      ]
    },
    memoryPanel: {
      summary: "ความจำที่ CEO AI ใช้ช่วยตัดสินใจในบริบทธุรกิจ",
      items: memoryItems
    },
    priorities: [
      {
        label: "งานที่ต้องตัดสินใจ",
        value: `${pendingApprovals} รายการ`,
        detail: pendingApprovals > 0 ? "มีงานรออนุมัติก่อนใช้ภายนอก" : "ยังไม่มีงานค้างอนุมัติ",
        tone: pendingApprovals > 0 ? "amber" : "green"
      },
      {
        label: "งานที่กำลังเดิน",
        value: `${activeRuns} งาน`,
        detail: latestRun?.run_key ?? "พร้อมเริ่ม workflow ใหม่",
        tone: activeRuns > 0 ? "cyan" : "slate"
      },
      {
        label: "ผลงานล่าสุด",
        value: generatedCount > 0 ? `${generatedCount} ชิ้น` : "ยังไม่มี",
        detail: generatedCount > 0 ? "มี content pack ให้ตรวจ" : `${completedRuns} workflow เสร็จแล้ว`,
        tone: generatedCount > 0 ? "green" : "slate"
      },
      {
        label: "คุณภาพ/บทเรียน",
        value: qualityScore ? `${qualityScore}/10` : `${department?.learningEvents.length ?? 0} บันทึก`,
        detail: qualityScore ? "คะแนน review ล่าสุด" : "ระบบจะเรียนรู้หลังมี feedback",
        tone: qualityScore && qualityScore < 7 ? "amber" : qualityScore ? "violet" : "slate"
      }
    ]
  };
}

function toThaiRisk(value: unknown) {
  if (value === "high") return "สูง";
  if (value === "medium") return "ปานกลาง";
  return "ต่ำ";
}

export function toThaiStatus(status: string) {
  const map: Record<string, string> = {
    completed: "เสร็จสิ้น",
    waiting_approval: "รออนุมัติ",
    changes_requested: "ขอแก้ไข",
    running: "กำลังทำงาน",
    failed: "ล้มเหลว"
  };
  return map[status] ?? status;
}
