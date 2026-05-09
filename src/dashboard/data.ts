import { Bot, BrainCircuit, CheckCircle2, Clapperboard, LineChart, Megaphone, RadioTower, ShieldCheck, UserRoundCheck, WalletCards } from "lucide-react";
import type { ApprovalItem, CompanyHealth, DashboardAgent, LearningProposal, MemoryItem, OperationItem, TimelineEvent, WorkflowNode } from "@/dashboard/types";

export const companyHealth: CompanyHealth[] = [
  { label: "สุขภาพระบบ", value: "พร้อมใช้งาน", detail: "ระบบตัวอย่างพร้อมสำหรับทดสอบงานจริง", tone: "green" },
  { label: "เวิร์กโฟลว์ที่ทำงาน", value: "1", detail: "แคมเปญแม่และเด็กเป็นงานทดสอบหลัก", tone: "cyan" },
  { label: "ทีม AI", value: "พร้อม", detail: "Marketing, Content Creator, Ads Performance", tone: "violet" },
  { label: "ความเสี่ยง", value: "ปานกลาง", detail: "ต้องอนุมัติก่อนนำผลงานไปใช้ภายนอก", tone: "amber" },
  { label: "การเรียนรู้", value: "รอบันทึก", detail: "จะเกิดหลังจากอนุมัติหรือขอแก้ไข", tone: "rose" }
];

export const kpiSeries = [
  { name: "Mon", content: 8, approval: 3, quality: 78 },
  { name: "Tue", content: 10, approval: 4, quality: 81 },
  { name: "Wed", content: 9, approval: 5, quality: 79 },
  { name: "Thu", content: 12, approval: 4, quality: 85 },
  { name: "Fri", content: 11, approval: 6, quality: 88 }
];

export const agents: DashboardAgent[] = [
  { id: "ceo", name: "CEO AI", role: "Executive orchestration", status: "review", currentTask: "Review Mother-and-baby TikTok campaign report", skillScore: 91, memoryAccess: ["company", "decision", "workflow"], permission: "Final report approval", workload: 64, lastEvent: "Requested human approval" },
  { id: "marketing", name: "Marketing AI", role: "Audience and positioning", status: "active", currentTask: "Campaign CTR analysis", skillScore: 84, memoryAccess: ["company", "campaign", "workflow"], permission: "Strategy approval", workload: 72, lastEvent: "Audience angle completed" },
  { id: "content-creator", name: "Content Creator AI", role: "Hooks, scripts, captions", status: "active", currentTask: "Refine approved hook SOP proposal", skillScore: 88, memoryAccess: ["company", "agent", "task history"], permission: "No publishing authority", workload: 59, lastEvent: "8/10 hooks approved" },
  { id: "video-editor", name: "Video Editor AI", role: "Production notes", status: "waiting", currentTask: "Shot list waiting final script approval", skillScore: 76, memoryAccess: ["workflow", "agent"], permission: "Media harness approval required", workload: 43, lastEvent: "Production notes generated" },
  { id: "ads-performance", name: "Ads Performance AI", role: "Targeting and KPI assumptions", status: "review", currentTask: "Budget-impact recommendation queued", skillScore: 82, memoryAccess: ["campaign", "workflow"], permission: "Cannot spend budget", workload: 51, lastEvent: "Targeting recommendation created" },
  { id: "cfo", name: "CFO AI", role: "Finance review", status: "idle", currentTask: "Weekly financial notes review", skillScore: 86, memoryAccess: ["finance", "decision"], permission: "Budget approval", workload: 35, lastEvent: "No record changes executed" },
  { id: "cto", name: "CTO AI", role: "Runtime and harness safety", status: "idle", currentTask: "Runtime approval policy standby", skillScore: 89, memoryAccess: ["technical", "workflow"], permission: "Harness runtime approval", workload: 29, lastEvent: "No runtime escalation" },
  { id: "rd", name: "R&D AI", role: "Claims and evidence", status: "idle", currentTask: "Monitor product claim risk", skillScore: 80, memoryAccess: ["company", "decision"], permission: "Claims approval", workload: 31, lastEvent: "No unsupported claim approved" }
];

export const workflowNodes: WorkflowNode[] = [
  { id: "ceo-objective", label: "CEO creates campaign", owner: "CEO AI", state: "completed", detail: "Growth objective accepted" },
  { id: "marketing-analysis", label: "Audience analysis", owner: "Marketing AI", state: "completed", detail: "Reassurance/checklist angle" },
  { id: "content-hooks", label: "Hooks and scripts", owner: "Content Creator AI", state: "completed", detail: "8/10 hooks approved" },
  { id: "video-notes", label: "Production notes", owner: "Video Editor AI", state: "completed", detail: "Shot list generated" },
  { id: "governance-approval", label: "Governance approval", owner: "CEO + Human", state: "waiting_approval", detail: "Publishing approval requested" },
  { id: "learning-memory", label: "Learning memory", owner: "Learning System", state: "queued", detail: "Approved SOP note ready" }
];

export const approvals: ApprovalItem[] = [
  { id: "approval-publish-001", title: "Approve Mother-and-baby TikTok campaign before publication", requester: "Content Creator AI", domain: "publishing", risk: "high", status: "requested" },
  { id: "approval-weekly-001", title: "Approve Weekly AI Company Review report", requester: "CEO AI", domain: "workflow", risk: "medium", status: "requested" },
  { id: "approval-learning-001", title: "Apply Hook Generation SOP refinement", requester: "Learning System", domain: "workflow", risk: "low", status: "approved" }
];

export const learningProposals: LearningProposal[] = [
  { id: "learn-001", title: "Refine Hook Generation SOP", target: "hook-generation", score: 88, status: "approved", evidence: "8/10 hooks approved; checklist framing performed best" },
  { id: "learn-002", title: "Retag generic hook patterns", target: "agent memory", score: 61, status: "proposed", evidence: "Generic hooks appeared in rejected examples" },
  { id: "learn-003", title: "Add pre-submit claim checklist", target: "content-production", score: 74, status: "proposed", evidence: "Rejected hooks implied unsupported outcomes" }
];

export const operations: OperationItem[] = [
  { id: "op-weekly-review", name: "Weekly AI Company Review", type: "scheduled", status: "waiting_approval", risk: "medium", nextStep: "Human approval for final report" },
  { id: "op-kpi-drop", name: "Campaign CTR drop detected", type: "event", status: "active", risk: "high", nextStep: "Route corrective action to CEO approval" },
  { id: "op-memory-quality", name: "Memory quality review", type: "monitoring", status: "active", risk: "low", nextStep: "Queue memory retag suggestions" },
  { id: "op-content-delay", name: "Content backlog triage", type: "recommendation", status: "completed", risk: "low", nextStep: "Internal task created" }
];

export const memoryItems: MemoryItem[] = [
  { id: "mem-brand", title: "Brand Voice", type: "company", relevance: 96, summary: "Warm, practical, low-pressure Thai-first communication." },
  { id: "mem-hooks", title: "Successful TikTok Hooks", type: "agent", relevance: 91, summary: "Reassurance framing and checklist angles outperform generic hooks." },
  { id: "mem-decision", title: "File-based Memory Decision", type: "decision", relevance: 78, summary: "Memory updates must remain explicit, auditable, and reviewable." },
  { id: "mem-workflow", title: "Content Production History", type: "workflow", relevance: 84, summary: "Campaign workflow succeeds when governance approval happens before publishing." }
];

export const collaborationEvents: TimelineEvent[] = [
  { id: "event-1", agent: "CEO AI", event: "Created campaign objective", time: "09:00", icon: UserRoundCheck },
  { id: "event-2", agent: "Marketing AI", event: "Completed audience analysis", time: "09:06", icon: Megaphone },
  { id: "event-3", agent: "Content Creator AI", event: "Generated hooks and scripts", time: "09:14", icon: Bot },
  { id: "event-4", agent: "Video Editor AI", event: "Generated production notes", time: "09:21", icon: Clapperboard },
  { id: "event-5", agent: "Governance", event: "Approval requested", time: "09:25", icon: ShieldCheck },
  { id: "event-6", agent: "Human", event: "Approved learning proposal", time: "09:33", icon: CheckCircle2 },
  { id: "event-7", agent: "Learning System", event: "Stored improvement note", time: "09:36", icon: BrainCircuit }
];

export const healthTimeline = [
  { label: "Agents", value: 98, color: "#67e8f9" },
  { label: "Workflows", value: 82, color: "#a78bfa" },
  { label: "Governance", value: 76, color: "#fbbf24" },
  { label: "Learning", value: 88, color: "#34d399" },
  { label: "Operations", value: 79, color: "#fb7185" }
];

export const dashboardSections = [
  { id: "overview", label: "ภาพรวม", icon: RadioTower },
  { id: "agents", label: "ทีม AI", icon: Bot },
  { id: "workflows", label: "เวิร์กโฟลว์", icon: LineChart },
  { id: "governance", label: "งานที่รออนุมัติ", icon: ShieldCheck },
  { id: "learning", label: "การเรียนรู้", icon: BrainCircuit },
  { id: "operations", label: "การดำเนินงาน", icon: RadioTower },
  { id: "memory", label: "ความจำองค์กร", icon: WalletCards }
] as const;
