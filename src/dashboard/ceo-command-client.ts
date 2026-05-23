import type { CEOPlan } from "@/modules/orchestration/types";

export type SubmitCeoDashboardCommandInput = {
  command: string;
  organizationId?: string;
  userId?: string;
};

export type SubmitCeoDashboardCommandResult = {
  plan: CEOPlan;
  reply: string;
  preview: CeoCommandPlanPreview;
};

export type CeoApprovalState = "รออนุมัติ" | "อนุมัติแล้ว" | "ขอปรับแผน" | "เพิ่มเงื่อนไข";
export type CeoApprovalDecision = "approve" | "request_revision" | "add_condition";

export type CeoCommandPlanPreview = {
  statusLabel: string;
  approvalState: CeoApprovalState;
  feedbackMessage?: string;
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
};

type CEOCommandApiResponse = {
  ok?: boolean;
  plan?: CEOPlan;
  error?: string;
};

export async function submitCeoDashboardCommand(input: SubmitCeoDashboardCommandInput): Promise<SubmitCeoDashboardCommandResult> {
  const response = await fetch("/api/ceo/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command: input.command,
      organizationId: input.organizationId,
      userId: input.userId
    })
  });
  const payload = (await response.json()) as CEOCommandApiResponse;

  if (!response.ok || !payload.ok || !payload.plan) {
    throw new Error(payload.error ?? "CEO AI ยังไม่สามารถรับคำสั่งนี้ได้");
  }

  return {
    plan: payload.plan,
    reply: formatCeoCommandPlanReply(payload.plan),
    preview: createCeoCommandPlanPreview(payload.plan)
  };
}

export function createCeoCommandPlanPreview(plan: CEOPlan): CeoCommandPlanPreview {
  const statusLabel = mapPlanStatus(plan.status);
  const delegatedItems = plan.delegatedTasks.map((task) => ({
    step: toTaskDisplayTitle(task.title),
    owner: toAgentDisplayName(task.ownerAgentId),
    status: mapDelegatedTaskStatus(task.status),
    detail: toBusinessDetail(task.expectedOutput ?? task.description)
  }));
  const approvalItems = plan.approvalCheckpoints.map((checkpoint) => ({
    step: toApprovalDisplayTitle(checkpoint.title),
    owner: checkpoint.requiredApprovers.includes("human") ? "คุณ + CEO AI" : "CEO AI",
    status: mapApprovalStatus(checkpoint.status),
    detail: toBusinessDetail(checkpoint.summary)
  }));
  const requestedApprovals = plan.approvalCheckpoints.filter((checkpoint) => checkpoint.status === "requested");

  return {
    statusLabel,
    approvalState: "รออนุมัติ",
    planPanel: {
      title: "แผนที่ CEO AI เสนอ",
      summary: `${toPlanDisplaySummary(plan)} (${statusLabel})`,
      items: [
        {
          step: "CEO AI สรุปแผนจากคำสั่ง",
          owner: "CEO AI",
          status: statusLabel,
          detail: toPlanDisplaySummary(plan)
        },
        ...delegatedItems,
        ...approvalItems
      ]
    },
    delegatedAgents: plan.delegatedTasks.map((task) => ({
      name: toAgentDisplayName(task.ownerAgentId),
      role: "รับงานที่ CEO AI แยกจากคำสั่ง",
      status: mapDelegatedTaskStatus(task.status),
      currentWork: toTaskDisplayTitle(task.title)
    })),
    approvalPanel: {
      count: requestedApprovals.length,
      primaryLabel: requestedApprovals.length > 0 ? "รออนุมัติ" : "ยังไม่ต้องอนุมัติ",
      summary:
        requestedApprovals.length > 0
          ? "มีแผนจาก CEO AI ที่ต้องให้คุณตรวจและยืนยันก่อนดำเนินการ"
          : "ยังไม่มีจุดตัดสินใจที่ต้องอนุมัติ",
      items: plan.approvalCheckpoints.map((checkpoint) => ({
        title: toApprovalDisplayTitle(checkpoint.title),
        requester: "CEO AI",
        risk: mapRiskLevel(checkpoint.riskLevel),
        status: mapApprovalStatus(checkpoint.status)
      }))
    }
  };
}

export function applyCeoApprovalDecision(preview: CeoCommandPlanPreview, decision: CeoApprovalDecision): CeoCommandPlanPreview {
  if (decision === "approve") {
    return updatePreviewApprovalState(preview, {
      approvalState: "อนุมัติแล้ว",
      statusLabel: "อนุมัติแล้ว",
      feedbackMessage: "คุณอนุมัติแผนแล้ว CEO AI จะส่งต่อให้ทีมเริ่มเตรียมงานตามแผน",
      planDetail: "คุณอนุมัติแผนแล้ว ทีมเริ่มเตรียมงานตามแผนที่ตรวจแล้ว",
      delegatedStatus: "เริ่มเตรียมงาน",
      approvalCount: 0,
      approvalSummary: "คุณอนุมัติแผนแล้ว ขั้นตอนถัดไปคือให้ทีมเตรียมงานตามขอบเขตที่ตรวจแล้ว",
      approvalItemStatus: "อนุมัติแล้ว"
    });
  }

  if (decision === "request_revision") {
    return updatePreviewApprovalState(preview, {
      approvalState: "ขอปรับแผน",
      statusLabel: "ขอปรับแผน",
      feedbackMessage: "คุณขอให้ CEO AI ปรับแผนก่อน ยังไม่มีการนำแผนไปใช้จริง",
      planDetail: "คุณขอให้ CEO AI ปรับแผนก่อน ยังไม่มีการนำแผนไปใช้จริง",
      delegatedStatus: "รอแผนปรับปรุง",
      approvalCount: 1,
      approvalSummary: "CEO AI ต้องปรับแผนตาม feedback ก่อนให้คุณตัดสินใจอีกครั้ง",
      approvalItemStatus: "ขอปรับแผน"
    });
  }

  return updatePreviewApprovalState(preview, {
    approvalState: "เพิ่มเงื่อนไข",
    statusLabel: "เพิ่มเงื่อนไข",
    feedbackMessage: "คุณเพิ่มเงื่อนไขให้ CEO AI ตรวจซ้ำก่อนเริ่มงาน",
    planDetail: "คุณเพิ่มเงื่อนไขให้ CEO AI ตรวจซ้ำก่อนเริ่มงาน ยังไม่มีการนำแผนไปใช้จริง",
    delegatedStatus: "รอเงื่อนไขเพิ่มเติม",
    approvalCount: 1,
    approvalSummary: "CEO AI ต้องรวมเงื่อนไขใหม่เข้ากับแผนก่อนเริ่มงาน",
    approvalItemStatus: "เพิ่มเงื่อนไข"
  });
}

export function formatCeoCommandPlanReply(plan: CEOPlan) {
  const actions = plan.recommendedActions?.slice(0, 2) ?? [];
  const checkpoint = plan.approvalCheckpoints.find((item) => item.status === "requested") ?? plan.approvalCheckpoints[0];
  const task = plan.delegatedTasks[0];
  const statusText = plan.status === "waiting_approval" ? "ต้องรออนุมัติจากคุณก่อนดำเนินการต่อ" : mapPlanStatus(plan.status);
  const parts = [toPlanDisplaySummary(plan), statusText];

  if (task) {
    parts.push(`งานถัดไป: ${toTaskDisplayTitle(task.title)}`);
  }

  if (actions.length > 0) {
    parts.push(`ข้อเสนอ: ${actions.map(toActionDisplayText).join(" / ")}`);
  }

  if (checkpoint) {
    parts.push(`จุดตัดสินใจ: ${toApprovalDisplayTitle(checkpoint.title)}`);
  }

  return parts.join(" ");
}

function mapPlanStatus(status: CEOPlan["status"]) {
  const labels: Record<CEOPlan["status"], string> = {
    draft: "รอ CEO AI ปรับแผน",
    ready: "พร้อมเริ่มหลังคุณยืนยัน",
    in_progress: "กำลังดำเนินการ",
    waiting_approval: "รอคุณตรวจแผน",
    completed: "เสร็จแล้ว"
  };

  return labels[status];
}

function updatePreviewApprovalState(
  preview: CeoCommandPlanPreview,
  input: {
    approvalState: CeoApprovalState;
    statusLabel: string;
    feedbackMessage: string;
    planDetail: string;
    delegatedStatus: string;
    approvalCount: number;
    approvalSummary: string;
    approvalItemStatus: string;
  }
): CeoCommandPlanPreview {
  return {
    ...preview,
    approvalState: input.approvalState,
    statusLabel: input.statusLabel,
    feedbackMessage: input.feedbackMessage,
    planPanel: {
      ...preview.planPanel,
      summary: input.feedbackMessage,
      items: preview.planPanel.items.map((item, index) =>
        index === 0
          ? {
              ...item,
              status: input.statusLabel,
              detail: input.planDetail
            }
          : item
      )
    },
    delegatedAgents: preview.delegatedAgents.map((agent) => ({
      ...agent,
      status: input.delegatedStatus
    })),
    approvalPanel: {
      ...preview.approvalPanel,
      count: input.approvalCount,
      primaryLabel: input.approvalState,
      summary: input.approvalSummary,
      items: preview.approvalPanel.items.map((item) => ({
        ...item,
        status: input.approvalItemStatus
      }))
    }
  };
}

function toPlanDisplaySummary(plan: CEOPlan) {
  if (plan.workflowExecutions.some((execution) => execution.workflowKey === "content-production")) {
    return "CEO AI เตรียมแผนคอนเทนต์ให้คุณตรวจแล้ว";
  }

  return "CEO AI เตรียมแผนให้คุณตรวจแล้ว";
}

function toTaskDisplayTitle(title: string) {
  const labels: Record<string, string> = {
    "Prepare draft content plan for CEO review": "เตรียมร่างแผนคอนเทนต์ให้ตรวจ",
    "Prepare CEO command review": "เตรียมสรุปแผนให้ CEO AI ตรวจ"
  };

  return labels[title] ?? title;
}

function toApprovalDisplayTitle(title: string) {
  const labels: Record<string, string> = {
    "Approve draft campaign work before external use": "ตรวจและอนุมัติก่อนนำไปใช้จริง",
    "Approve CEO AI plan before execution": "ตรวจแผนก่อนเริ่มงาน"
  };

  return labels[title] ?? title;
}

function toActionDisplayText(action: string) {
  const labels: Record<string, string> = {
    "Confirm objective": "ยืนยันเป้าหมายธุรกิจ",
    "Review delegated tasks": "ตรวจงานที่ CEO AI แยกให้ทีม",
    "Confirm the business objective before work starts.": "ยืนยันเป้าหมายธุรกิจ",
    "Review the delegated tasks and approval checkpoint.": "ตรวจงานที่ CEO AI แยกให้ทีม",
    "Approve the plan before any external use or memory promotion.": "อนุมัติแผนก่อนนำไปใช้จริง"
  };

  return labels[action] ?? action;
}

function toBusinessDetail(detail: string | undefined) {
  if (!detail) return "ทีมเบื้องหลังเตรียมงานให้ CEO AI ตรวจ ก่อนนำไปใช้จริง";
  if (detail === "A short plan that can be reviewed before any external action.") {
    return "เตรียมเป็นแผนสั้น ๆ ให้คุณตรวจ ก่อนนำไปใช้จริง";
  }
  if (detail === "CEO AI can prepare and coordinate work, but execution stays approval-gated.") {
    return "CEO AI ช่วยเตรียมและประสานงานได้ แต่ต้องรอคุณอนุมัติก่อนนำไปใช้จริง";
  }

  return detail;
}

function mapDelegatedTaskStatus(status: CEOPlan["delegatedTasks"][number]["status"]) {
  const labels: Record<CEOPlan["delegatedTasks"][number]["status"], string> = {
    queued: "เตรียมงานตามแผน",
    assigned: "มอบหมายแล้ว",
    in_progress: "กำลังเตรียมงาน",
    waiting_approval: "รออนุมัติ",
    completed: "เสร็จแล้ว",
    blocked: "รอข้อมูลเพิ่ม"
  };

  return labels[status];
}

function mapApprovalStatus(status: CEOPlan["approvalCheckpoints"][number]["status"]) {
  const labels: Record<CEOPlan["approvalCheckpoints"][number]["status"], string> = {
    not_required: "ยังไม่ต้องอนุมัติ",
    requested: "รออนุมัติ",
    approved: "อนุมัติแล้ว",
    rejected: "ไม่อนุมัติ",
    changes_requested: "ขอแก้ไข"
  };

  return labels[status];
}

function toAgentDisplayName(agentId: string) {
  const labels: Record<string, string> = {
    ceo: "CEO AI",
    "ceo-ai": "CEO AI",
    "content-creator": "ทีมคอนเทนต์",
    "content-creator-ai": "ทีมคอนเทนต์",
    marketing: "ทีมวิเคราะห์ลูกค้า",
    "marketing-ai": "ทีมวิเคราะห์ลูกค้า",
    "ads-performance": "ทีมประเมินโฆษณา",
    "ads-performance-ai": "ทีมประเมินโฆษณา"
  };

  return labels[agentId] ?? agentId;
}

function mapRiskLevel(riskLevel: CEOPlan["approvalCheckpoints"][number]["riskLevel"]) {
  const labels: Record<CEOPlan["approvalCheckpoints"][number]["riskLevel"], string> = {
    low: "ต่ำ",
    medium: "ปานกลาง",
    high: "สูง"
  };

  return labels[riskLevel];
}
