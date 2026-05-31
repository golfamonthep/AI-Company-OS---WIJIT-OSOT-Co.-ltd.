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
  const businessAlert = mainAlert ? toBusinessAlert(mainAlert.detail) : null;
  const fallbackMode = snapshotStatus === "fallback";
  const approvalRequired = pendingApprovals > 0 || latestRun?.status === "waiting_approval";
  const approvalItems = department?.recentApprovals.length
    ? department.recentApprovals.map((approval) => ({
        title: approval.subject,
        requester: toTeamDisplayName(approval.requester_agent_key),
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
        type: toMemoryTypeLabel(item.memory_type)
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
      ? "CEO AI กำลังประสานงานให้คุณ"
      : "CEO AI พร้อมช่วยคุณเริ่มงาน";

  const primaryAction = approvalRequired
    ? { label: "ตรวจงานที่รออนุมัติ", href: "#approval-queue" }
    : { label: "ให้ CEO AI เสนอแผนแคมเปญ", href: "/workflows/content-production" };

  const systemBadges = [
    snapshotStatus === "loading" ? "กำลังอัปเดต" : fallbackMode ? "ข้อมูลตัวอย่าง" : "ข้อมูลล่าสุด",
    "CEO AI เสนอแผนก่อน",
    "คุณอนุมัติก่อนใช้จริง"
  ];

  const nextSteps = approvalRequired
      ? [
          "ตรวจและอนุมัติผลงานก่อนนำไปใช้จริง",
        "อ่านเหตุผลและความเสี่ยงแบบสั้นก่อนตัดสินใจ",
          "ให้ CEO AI บันทึกบทเรียนหลังคุณยืนยัน"
        ]
    : activeRuns > 0
      ? [
          "รอทีมเบื้องหลังสรุปผลงานที่กำลังทำ",
          "ตรวจคุณภาพฮุก แคปชัน และสคริปต์เมื่อพร้อม",
          "ตัดสินใจอนุมัติหรือขอแก้ไขก่อนใช้จริง"
        ]
      : [
          "เริ่มแคมเปญ TikTok สำหรับแม่และเด็ก",
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
      ? `${toCampaignName(department?.campaignName)} อยู่ในสถานะ ${toThaiStatus(latestRun.status)}`
      : "CEO AI จะเสนอแผนก่อน ทีมเบื้องหลังช่วยเตรียมงาน และทุกคำแนะนำจะรอคุณอนุมัติก่อนใช้จริง",
    primaryAction,
    secondaryAction: { label: "ดูงานแคมเปญ", href: "/workflows/content-department" },
    systemBadges,
    guardrail: mainAlert
      ? `ยังไม่เผยแพร่ภายนอก และยังไม่ถูกนำไปใช้จริง: ${businessAlert}`
      : fallbackMode
        ? "ยังไม่เผยแพร่ภายนอก และงานสำคัญต้องรอคุณอนุมัติก่อน"
        : "คำแนะนำ การใช้งบ และการติดต่อลูกค้าต้องรอคุณอนุมัติเสมอ",
    teamStatus:
      activeRuns > 0
        ? `Content Department กำลังทำงาน ${activeRuns} งาน`
        : approvalRequired
          ? "Content Department ส่งงานให้ CEO AI รอคุณตรวจ"
          : "Content Department พร้อมเริ่มงานถัดไป",
    nextSteps,
    commandPrompts: [
      "วันนี้ฉันควรตัดสินใจเรื่องอะไรก่อน",
      "สรุปงานที่รออนุมัติให้เข้าใจง่าย",
      "ช่วยเริ่มแคมเปญ TikTok สำหรับแม่และเด็ก"
    ],
    planPanel: {
      title: "แผนที่ CEO AI เสนอ",
      summary: latestRun
        ? `แผนล่าสุดของ ${toCampaignName(department?.campaignName)} อยู่ในสถานะ ${toThaiStatus(latestRun.status)}`
        : "CEO AI เสนอแผนเป็นลำดับ และหยุดรอคุณก่อนนำไปใช้จริง",
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
        task.key === "marketing-angle" && department?.marketingAnalysis
          ? "เสนอแผน"
          : task.key === "content-pack" && generatedCount > 0
            ? "รออนุมัติ"
            : task.status,
      currentWork:
        task.key === "marketing-angle" && department?.marketingAnalysis?.segment
          ? department.marketingAnalysis.segment
          : task.key === "content-pack" && generatedCount > 0
            ? `${generatedCount} ชิ้นรอคุณอนุมัติ`
            : task.key === "ads-readiness" && department?.adsPerformance?.reportingSummary
              ? department.adsPerformance.reportingSummary
              : task.currentWork
    })),
    approvalPanel: {
      count: pendingApprovals,
      primaryLabel: approvalRequired ? "รออนุมัติ" : "พร้อมดำเนินการเมื่อได้รับอนุมัติ",
      summary: approvalRequired
        ? "มีงานที่ต้องให้คุณตัดสินใจก่อนใช้จริง"
        : "ตอนนี้ยังไม่มีเรื่องเร่งด่วนที่ต้องอนุมัติ",
      items: approvalItems
    },
    dailyBrief: {
      summary: businessAlert
        ? businessAlert
        : approvalRequired
          ? "วันนี้ควรเริ่มจากงานที่รออนุมัติ แล้วให้ CEO AI บันทึกบทเรียนหลังคุณยืนยัน"
          : "วันนี้ยังไม่มีเรื่องเร่งด่วน เริ่มแคมเปญแรกได้เมื่อพร้อม",
      items: [
        ...defaultDailyBriefItems.map((item) => item.text),
        `งานรออนุมัติ ${pendingApprovals} รายการ`,
        `งานที่กำลังเดินอยู่ ${activeRuns} งาน`,
        `ผลงานพร้อมตรวจ ${generatedCount} ชิ้น`,
        ...learningItems
      ]
    },
    memoryPanel: {
      summary: "บทเรียนที่ CEO AI จะใช้หลังคุณยืนยันแล้วเท่านั้น",
      items: memoryItems
    },
    priorities: [
      {
        label: "งานที่ต้องตัดสินใจ",
        value: `${pendingApprovals} รายการ`,
        detail: pendingApprovals > 0 ? "มีงานรออนุมัติก่อนใช้จริง" : "ยังไม่มีงานค้างอนุมัติ",
        tone: pendingApprovals > 0 ? "amber" : "green"
      },
      {
        label: "งานที่กำลังเดิน",
        value: `${activeRuns} งาน`,
        detail: latestRun?.run_key ?? "พร้อมเริ่มงานใหม่",
        tone: activeRuns > 0 ? "cyan" : "slate"
      },
      {
        label: "ผลงานล่าสุด",
        value: generatedCount > 0 ? `${generatedCount} ชิ้น` : "ยังไม่มี",
        detail: generatedCount > 0 ? "มีชุดคอนเทนต์ให้ตรวจ" : `${completedRuns} งานเสร็จแล้ว`,
        tone: generatedCount > 0 ? "green" : "slate"
      },
      {
        label: "คุณภาพ/บทเรียน",
        value: qualityScore ? `${qualityScore}/10` : `${department?.learningEvents.length ?? 0} บันทึก`,
        detail: qualityScore ? "คะแนนตรวจล่าสุด" : "บันทึกบทเรียนหลังคุณยืนยัน",
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
    revision_requested: "ขอแก้ไข",
    rejected: "ไม่อนุมัติ",
    running: "กำลังทำงาน",
    failed: "ล้มเหลว"
  };
  return map[status] ?? status;
}

function toTeamDisplayName(value: string) {
  const map: Record<string, string> = {
    ceo: "CEO AI",
    "ceo-ai": "CEO AI",
    "marketing": "ทีมวิเคราะห์ลูกค้า",
    "marketing-ai": "ทีมวิเคราะห์ลูกค้า",
    "content-creator": "ทีมคอนเทนต์",
    "content-creator-ai": "ทีมคอนเทนต์",
    "ads-performance": "ทีมประเมินโฆษณา",
    "ads-performance-ai": "ทีมประเมินโฆษณา",
    "learning-system": "ระบบบันทึกบทเรียน"
  };

  return map[value] ?? value;
}

function toMemoryTypeLabel(value: string | undefined) {
  const map: Record<string, string> = {
    brand: "แบรนด์",
    company: "บริษัท",
    campaign: "แคมเปญ",
    governance: "การอนุมัติ",
    workflow: "งาน",
    agent: "ทีม",
    decision: "การตัดสินใจ"
  };

  return value ? map[value] ?? "บทเรียน" : "บทเรียน";
}

function toCampaignName(value: string | undefined) {
  if (!value || value === "Content Department") return "แคมเปญคอนเทนต์";
  if (value === "Mother-and-baby TikTok Campaign") return "แคมเปญ TikTok แม่และเด็ก";
  return value;
}

function toBusinessAlert(detail: string) {
  const technicalSignals = ["NEXT_PUBLIC_", "SUPABASE_", "env", "environment", "in-memory", "fallback", "service role"];
  if (technicalSignals.some((signal) => detail.toLowerCase().includes(signal.toLowerCase()))) {
    return "ตอนนี้ใช้ข้อมูลตัวอย่างสำหรับทดลอง ระบบจริงยังไม่ถูกเชื่อมต่อ";
  }

  return detail;
}
