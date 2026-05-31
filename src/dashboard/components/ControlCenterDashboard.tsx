"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { BarChart3, Bot, BrainCircuit, BriefcaseBusiness, CheckCircle2, ClipboardCheck, Database, FileText, ImageIcon, Megaphone, Mic, Palette, Paperclip, RefreshCw, SendHorizontal, ShieldCheck, Sparkles, TrendingUp, Upload, WalletCards } from "lucide-react";
import { DashboardLayoutSystem } from "@/dashboard/layout/DashboardLayoutSystem";
import { applyCeoApprovalDecision, submitCeoDashboardCommand } from "@/dashboard/ceo-command-client";
import type { CeoApprovalDecision, CeoCommandPlanPreview } from "@/dashboard/ceo-command-client";
import { createCeoCommandCenterViewModel, type CeoCommandCenterViewModel } from "@/dashboard/ceo-command-center";
import { createMockLiveDashboardSnapshot } from "@/dashboard/mock-snapshot";
import type { LiveDashboardSnapshot } from "@/dashboard/types";

type DashboardWorkspaceSession = {
  workspaceName: string;
  role: string;
  userName: string;
  approvalAuthority: string[];
  readOnly: boolean;
  mockedAuth: boolean;
};

const quickPrompts = [
  "วางแผนเปิดตัวสินค้าใหม่",
  "วิเคราะห์ยอดขายเดือนนี้",
  "ทำแผนการตลาด Q3",
  "สร้าง SOP ฝ่ายขาย",
  "สรุปรายงานผู้บริหาร"
];

const kpiCards = [
  { label: "งานทั้งหมด", value: "128", trend: "+12% จากสัปดาห์ก่อน", tone: "blue" },
  { label: "กำลังดำเนินการ", value: "36", trend: "+8% จากสัปดาห์ก่อน", tone: "violet" },
  { label: "รออนุมัติ", value: "15", trend: "+3 วันนี้", tone: "amber" },
  { label: "เสร็จสิ้นแล้ว", value: "77", trend: "+18% จากสัปดาห์ก่อน", tone: "green" },
  { label: "อัตราความสำเร็จ", value: "93%", trend: "+5% จากเดือนก่อน", tone: "cyan" }
] as const;

const agentCards = [
  { name: "Marketing AI", role: "วิเคราะห์ตลาดและกลยุทธ์", icon: Megaphone, position: "left-6 top-10" },
  { name: "Content AI", role: "สร้างเนื้อหาและแคปชัน", icon: FileText, position: "left-12 bottom-12" },
  { name: "Design AI", role: "ออกแบบภาพและครีเอทีฟ", icon: Palette, position: "right-12 bottom-12" },
  { name: "Data & Analytics AI", role: "วิเคราะห์ข้อมูลและ Insight", icon: BarChart3, position: "right-6 top-10" },
  { name: "Finance AI", role: "วิเคราะห์การเงินและงบประมาณ", icon: WalletCards, position: "left-1/2 top-6 -translate-x-1/2" }
] as const;

const workflowSteps = ["สั่งงาน CEO AI", "CEO AI วางแผน", "มอบหมายเอเจนต์", "ตรวจสอบ & อนุมัติ", "ดำเนินการ", "ส่งมอบผลลัพธ์"];

const activeWorkItems = [
  { task: "แคมเปญเปิดตัวสินค้าใหม่ Q1", agent: "Content AI", progress: 70 },
  { task: "วิเคราะห์ยอดขายเดือน เม.ย. 67", agent: "Data & Analytics AI", progress: 45 },
  { task: "ออกแบบภาพโปรโมต Facebook", agent: "Design AI", progress: 60 },
  { task: "วางแผนงบประมาณการตลาด Q3", agent: "Finance AI", progress: 30 }
];

const outputCards = [
  { title: "แผนเปิดตัวสินค้าใหม่", type: "เอกสาร", agent: "Content AI", icon: FileText },
  { title: "วิเคราะห์ยอดขาย เม.ย. 67", type: "รายงาน", agent: "Data & Analytics AI", icon: BarChart3 },
  { title: "ภาพโปรโมต Facebook", type: "งานออกแบบ", agent: "Design AI", icon: ImageIcon },
  { title: "SOP ฝ่ายขาย", type: "เอกสาร", agent: "Operations AI", icon: ClipboardCheck },
  { title: "คอนเทนต์ 12 โพสต์", type: "แคมเปญ", agent: "Content AI", icon: Megaphone }
];

const systemStatus = [
  { label: "AI Services", status: "ออนไลน์" },
  { label: "Database", status: "พร้อมใช้งาน" },
  { label: "Storage", status: "ปกติ" },
  { label: "Memory System", status: "ทำงาน" },
  { label: "Notification", status: "ออนไลน์" }
];

export function ControlCenterDashboard({ workspaceSession }: { workspaceSession?: DashboardWorkspaceSession }) {
  const [liveSnapshot, setLiveSnapshot] = useState<LiveDashboardSnapshot | null>(null);
  const [snapshotStatus, setSnapshotStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [commandPlanPreview, setCommandPlanPreview] = useState<CeoCommandPlanPreview | null>(null);
  const [approvalState, setApprovalState] = useState<Record<string, "pending" | "approved">>({});
  const viewModel = createCeoCommandCenterViewModel(liveSnapshot, snapshotStatus);
  const displayedViewModel = commandPlanPreview
    ? {
        ...viewModel,
        headline: "CEO AI เสนอแผนให้คุณตรวจ",
        subheadline: commandPlanPreview.feedbackMessage ?? "แผนนี้ยังไม่ถูกนำไปใช้จริง ทีมเบื้องหลังจะเริ่มหลังคุณตรวจและยืนยัน",
        systemBadges: ["แผนจากคำสั่งล่าสุด", commandPlanPreview.statusLabel, "รออนุมัติก่อนทำจริง"],
        teamStatus: "CEO AI แยกงานให้ทีมเบื้องหลังแล้ว รอคุณตรวจแผนก่อนดำเนินการ",
        planPanel: commandPlanPreview.planPanel,
        delegatedAgents: commandPlanPreview.delegatedAgents,
        approvalPanel: commandPlanPreview.approvalPanel
      }
    : viewModel;

  const updateApprovalDecision = useCallback((decision: CeoApprovalDecision) => {
    setCommandPlanPreview((current) => (current ? applyCeoApprovalDecision(current, decision) : current));
  }, []);

  const refreshLiveSnapshot = useCallback(async () => {
    setRefreshing(true);
    setSnapshotError(null);
    try {
      const response = await fetch("/api/live/content-department/dashboard", { cache: "no-store" });
      if (!response.ok) throw new Error(`Dashboard snapshot failed with ${response.status}`);
      const payload = (await response.json()) as { ok?: boolean; data?: LiveDashboardSnapshot; error?: string };
      if (!payload.ok || !payload.data) throw new Error(payload.error ?? "Dashboard snapshot did not return data.");
      setLiveSnapshot(payload.data);
      setSnapshotStatus("ready");
      setLastUpdatedAt(new Date().toISOString());
      return payload.data;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Dashboard snapshot failed.";
      setSnapshotStatus("fallback");
      setSnapshotError(message);
      const fallback = createMockLiveDashboardSnapshot(message);
      setLiveSnapshot(fallback);
      setLastUpdatedAt(new Date().toISOString());
      return fallback;
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => {
      void refreshLiveSnapshot();
    }, 0);
    const interval = window.setInterval(() => {
      void refreshLiveSnapshot();
    }, 15000);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, [refreshLiveSnapshot]);

  return (
    <DashboardLayoutSystem workspaceSession={workspaceSession}>
      <div className="space-y-6">
        <CeoCommandComposer viewModel={displayedViewModel} snapshotError={snapshotError} lastUpdatedAt={lastUpdatedAt} refreshing={refreshing} onRefresh={refreshLiveSnapshot} onPlanGenerated={setCommandPlanPreview} />
        <KpiCardGrid viewModel={displayedViewModel} />
        <AgentCommandRoom />
        <WorkflowStepper />
        <PlanReviewPanel viewModel={displayedViewModel} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <ActiveWorkList />
          <ApprovalQueue viewModel={displayedViewModel} approvalState={approvalState} onApprove={(id) => setApprovalState((current) => ({ ...current, [id]: "approved" }))} onApprovalDecision={commandPlanPreview ? updateApprovalDecision : undefined} />
        </div>
        <FinalOutputsGallery />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px_360px]">
          <CompanyMemoryPanel viewModel={displayedViewModel} />
          <SystemStatusPanel />
          <DailyBriefPanel viewModel={displayedViewModel} />
        </div>
      </div>
    </DashboardLayoutSystem>
  );
}

function CeoCommandComposer({
  viewModel,
  snapshotError,
  lastUpdatedAt,
  refreshing,
  onRefresh,
  onPlanGenerated
}: {
  viewModel: CeoCommandCenterViewModel;
  snapshotError: string | null;
  lastUpdatedAt: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<LiveDashboardSnapshot | null>;
  onPlanGenerated: (preview: CeoCommandPlanPreview) => void;
}) {
  const [command, setCommand] = useState("วันนี้ฉันควรตัดสินใจเรื่องอะไรก่อน");
  const [reply, setReply] = useState<string | null>(null);
  const [commandStatus, setCommandStatus] = useState<"idle" | "sending" | "ready" | "error">("idle");
  const [commandError, setCommandError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function askCeoAi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCommand = command.trim();
    if (!trimmedCommand || commandStatus === "sending") return;

    setCommandStatus("sending");
    setCommandError(null);
    try {
      const result = await submitCeoDashboardCommand({ command: trimmedCommand });
      setReply(result.reply);
      onPlanGenerated(result.preview);
      setCommandStatus("ready");
    } catch (caught) {
      setCommandStatus("error");
      setCommandError(caught instanceof Error ? caught.message : "CEO AI ยังไม่สามารถรับคำสั่งนี้ได้");
    }
  }

  return (
    <section id="ceo-command" className="overflow-hidden rounded-[28px] border border-blue-300/20 bg-white/[0.08] shadow-2xl shadow-blue-950/30 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_390px]">
        <form onSubmit={askCeoAi} className="p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <span className="size-2 rounded-full bg-emerald-300" />
                  พร้อมรับคำสั่ง
                </span>
                {viewModel.systemBadges.slice(0, 2).map((badge) => (
                  <span key={badge} className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-slate-300">
                    {badge}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-white sm:text-4xl">สั่งงาน CEO AI</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{viewModel.subheadline}</p>
            </div>
            <button type="button" onClick={() => void onRefresh()} disabled={refreshing} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12 disabled:opacity-60">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "กำลังอัปเดต" : "อัปเดตสถานะ"}
            </button>
          </div>

          <label htmlFor="ceo-command-input" className="sr-only">พิมพ์คำสั่งถึง CEO AI</label>
          <textarea
            id="ceo-command-input"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            rows={5}
            placeholder="พิมพ์สิ่งที่คุณต้องการให้ CEO AI ช่วยบริหารงาน เช่น วิเคราะห์ยอดขายเดือนนี้, วางแผนเปิดตัวสินค้าใหม่, หรืออัปโหลดไฟล์เพื่อให้ CEO AI สรุปรายงาน"
            className="min-h-40 w-full resize-none rounded-3xl border border-blue-200/20 bg-[#0c1328]/90 px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300/60 focus:ring-4 focus:ring-blue-400/15"
          />

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.05] p-3">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-white">แนบข้อมูลให้ CEO AI วิเคราะห์</p>
              <p className="text-xs text-slate-400">รองรับไฟล์ เอกสาร รูปภาพ และรายงาน</p>
            </div>
            <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                // TODO: Connect selected files to the real document upload pipeline when storage is ready.
                setAttachedFiles(Array.from(event.target.files ?? []).map((file) => file.name));
              }}
            />
            <CommandToolButton type="button" onClick={() => fileInputRef.current?.click()} icon={<Upload size={16} />}>อัปโหลดไฟล์</CommandToolButton>
            <CommandToolButton type="button" onClick={() => setCommand(quickPrompts[0])} icon={<Sparkles size={16} />}>ตัวอย่างคำสั่ง</CommandToolButton>
            <CommandToolButton type="button" onClick={() => setReply("บันทึกเสียงยังเป็นตัวอย่าง UI: จะเชื่อมต่อภายหลังเมื่อระบบรับเสียงพร้อมใช้งาน")} icon={<Mic size={16} />}>บันทึกเสียง</CommandToolButton>
            </div>
          </div>

          {attachedFiles.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <span key={file} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-slate-300">
                  <Paperclip size={13} />
                  {file}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => setCommand(prompt)} className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-300/35 hover:bg-blue-400/10 hover:text-white">
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-400">AI จะแนะนำแผนให้คุณตรวจก่อนเสมอ — คุณอนุมัติแล้วจึงดำเนินการ</p>
            <button type="submit" disabled={commandStatus === "sending" || command.trim().length === 0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60">
              {commandStatus === "sending" ? "CEO AI กำลังวิเคราะห์" : "ส่งคำสั่ง"}
              <SendHorizontal size={16} />
            </button>
          </div>
        </form>

        <div className="border-t border-white/10 bg-black/20 p-5 sm:p-7 xl:border-l xl:border-t-0">
          <div className="rounded-3xl border border-white/10 bg-white/8 p-5">
            <p className="text-xs font-semibold text-blue-200">{reply ? "ข้อเสนอจาก CEO AI" : "CEO AI พร้อมเริ่มงาน"}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{viewModel.headline}</h3>
            <p className={commandError ? "mt-3 text-sm leading-6 text-rose-200" : "mt-3 text-sm leading-6 text-slate-300"}>{commandError ?? reply ?? "เริ่มจากพิมพ์คำสั่งหรืออัปโหลดไฟล์ แล้ว CEO AI จะสรุปแผน สิ่งที่ต้องอนุมัติ และผลลัพธ์ที่คาดว่าจะได้รับ"}</p>
            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                <ShieldCheck size={16} />
                Approval-first
              </div>
              <p className="mt-2 text-xs leading-5 text-amber-100/80">การเผยแพร่ ใช้งบ และบันทึกความจำสำคัญต้องรอคุณอนุมัติ</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {lastUpdatedAt ? <span>อัปเดต {new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
              {snapshotError ? <span className="text-amber-300">ใช้ข้อมูลตัวอย่างชั่วคราว</span> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommandToolButton({ children, icon, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode }) {
  return (
    <button {...props} className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-300/35 hover:bg-white/12">
      {icon}
      {children}
    </button>
  );
}

function KpiCardGrid({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  const dynamicCards = kpiCards.map((card) => {
    if (card.label === "รออนุมัติ") return { ...card, value: `${viewModel.approvalPanel.count}`, trend: viewModel.approvalPanel.summary };
    return card;
  });

  return (
    <section aria-label="Business KPI summary" className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {dynamicCards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10">
          <p className="text-xs font-medium text-slate-400">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-white">{card.value}</p>
          <p className={`mt-2 text-xs leading-5 ${card.tone === "amber" ? "text-amber-200" : "text-emerald-200"}`}>{card.trend}</p>
        </div>
      ))}
    </section>
  );
}

function AgentCommandRoom() {
  return (
    <section id="agent-room" className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-200">AI Command Room</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white">ทีม AI กำลังทำงานให้ธุรกิจของคุณ</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">CEO AI อยู่ตรงกลาง ทำหน้าที่วางกลยุทธ์ ประสานงาน และรอคุณอนุมัติก่อนดำเนินการจริง</p>
        </div>
        <span className="w-fit rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">กำลังดำเนินการ</span>
      </div>

      <div className="relative mt-6 min-h-[420px] overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.65),rgba(3,7,18,0.96)),radial-gradient(circle_at_50%_8%,rgba(96,165,250,0.28),transparent_32%)] p-5">
        <div className="absolute inset-x-8 top-8 h-24 rounded-b-[42px] border border-blue-200/10 bg-blue-300/10 blur-sm" />
        <div className="absolute left-1/2 top-10 h-36 w-72 -translate-x-1/2 rounded-b-[70px] border border-white/10 bg-white/8" />
        <div className="absolute bottom-8 left-1/2 h-32 w-[76%] -translate-x-1/2 rounded-t-[80px] border border-white/10 bg-white/10 shadow-2xl shadow-black/30" />

        <div className="absolute left-1/2 top-1/2 z-10 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-blue-200/25 bg-blue-500/20 p-5 text-center shadow-2xl shadow-blue-950/40">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-blue-400 text-white shadow-lg shadow-blue-400/30">
            <Bot size={30} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">CEO AI (Operation AI)</h3>
          <p className="mt-2 text-xs leading-5 text-blue-100">วางกลยุทธ์ · วิเคราะห์ · อนุมัติ</p>
        </div>

        {agentCards.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.name} className={`absolute z-10 w-44 rounded-3xl border border-white/10 bg-[#111a33]/90 p-4 shadow-xl shadow-black/25 ${agent.position}`}>
              <div className="grid size-10 place-items-center rounded-2xl bg-white/10 text-blue-200">
                <Icon size={18} />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{agent.name}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{agent.role}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WorkflowStepper() {
  return (
    <section id="workflow-steps" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">CEO AI ทำงานให้คุณอย่างไร</h2>
          <p className="mt-1 text-sm text-slate-400">ทุกงานผ่านแผนและจุดอนุมัติก่อนดำเนินการจริง</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {workflowSteps.map((step, index) => (
          <div key={step} className="relative rounded-3xl border border-white/10 bg-black/18 p-4">
            <div className={`grid size-9 place-items-center rounded-2xl text-sm font-semibold ${index <= 2 ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"}`}>{index + 1}</div>
            <p className="mt-4 text-sm font-semibold leading-6 text-white">{step}</p>
            {index === 3 ? <p className="mt-2 text-xs text-amber-200">รอคุณอนุมัติ</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanReviewPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <section id="ceo-plan" className="rounded-[28px] border border-blue-300/20 bg-blue-400/[0.07] p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <SectionTitle icon={<ClipboardCheck size={18} />} title="แผนที่ CEO AI เสนอให้ตรวจ" description={viewModel.planPanel.summary} />
        <div className="flex flex-wrap gap-2">
          <a href="#approval-queue" className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400">ไปตรวจอนุมัติ</a>
          <button type="button" className="rounded-2xl border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12">เพิ่มเงื่อนไข</button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {viewModel.planPanel.items.slice(0, 4).map((item, index) => (
          <article key={`${item.owner}-${item.step}-${index}`} className="rounded-3xl border border-white/10 bg-black/18 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-2xl bg-blue-500 text-sm font-semibold text-white">{index + 1}</span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-blue-100">{item.status}</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold leading-6 text-white">{item.step}</h3>
            <p className="mt-2 text-xs font-medium text-slate-400">{item.owner}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActiveWorkList() {
  return (
    <section id="active-work" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <SectionTitle icon={<BriefcaseBusiness size={18} />} title="งานที่กำลังดำเนินการ" description="งานที่ CEO AI มอบหมายให้ทีมเบื้องหลังแล้ว" />
      <div className="mt-5 space-y-3">
        {activeWorkItems.map((item) => (
          <article key={item.task} className="rounded-3xl border border-white/10 bg-black/18 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{item.task}</h3>
                <p className="mt-1 text-xs text-slate-400">{item.agent}</p>
              </div>
              <span className="text-sm font-semibold text-blue-200">{item.progress}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${item.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ApprovalQueue({
  viewModel,
  approvalState,
  onApprove,
  onApprovalDecision
}: {
  viewModel: CeoCommandCenterViewModel;
  approvalState: Record<string, "pending" | "approved">;
  onApprove: (id: string) => void;
  onApprovalDecision?: (decision: CeoApprovalDecision) => void;
}) {
  const items = viewModel.approvalPanel.items.length
    ? viewModel.approvalPanel.items.slice(0, 3)
    : [
        { title: "แผนการตลาดเปิดตัวสินค้าใหม่", requester: "Marketing AI", risk: "ปานกลาง", status: "รออนุมัติ" },
        { title: "งบประมาณการตลาด Q3", requester: "Finance AI", risk: "สูง", status: "รออนุมัติ" },
        { title: "คอนเทนต์แคมเปญ 12 โพสต์", requester: "Content AI", risk: "ต่ำ", status: "รออนุมัติ" }
      ];

  return (
    <section id="approval-queue" className="rounded-[28px] border border-amber-300/20 bg-amber-400/[0.07] p-5 sm:p-6">
      <SectionTitle icon={<ShieldCheck size={18} />} title="รอการอนุมัติ" description="AI จะไม่ดำเนินการภายนอกจนกว่าคุณจะอนุมัติ" />
      <div className="mt-5 space-y-3">
        {items.map((item, index) => {
          const id = `${item.requester}-${item.title}`;
          const approved = approvalState[id] === "approved";
          return (
            <article key={id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{item.requester} · ความเสี่ยง {item.risk}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${approved ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>{approved ? "อนุมัติแล้ว" : item.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="/workflows/content-department" className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/12">ดูรายละเอียด</a>
                <button type="button" onClick={() => { onApprove(id); if (index === 0) onApprovalDecision?.("approve"); }} className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400" disabled={approved}>
                  อนุมัติ
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FinalOutputsGallery() {
  return (
    <section id="final-outputs" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <SectionTitle icon={<CheckCircle2 size={18} />} title="ผลงานล่าสุด" description="งานที่เสร็จแล้วและพร้อมให้คุณเปิดดู ขอแก้ หรือบันทึกเป็นความจำองค์กร" />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {outputCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-3xl border border-white/10 bg-black/18 p-4">
              <div className="grid aspect-video place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/20 to-violet-400/10 text-blue-100">
                <Icon size={28} />
              </div>
              <p className="mt-4 text-sm font-semibold leading-6 text-white">{card.title}</p>
              <p className="mt-1 text-xs text-slate-400">{card.type} · {card.agent}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="rounded-2xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white">ดูผลลัพธ์</button>
                <button type="button" className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200">ขอแก้ไข</button>
              </div>
              <button type="button" className="mt-2 w-full rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">บันทึกเป็นความจำองค์กร</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CompanyMemoryPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <section id="company-memory" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
      <SectionTitle icon={<BrainCircuit size={18} />} title="ความจำองค์กร" description={viewModel.memoryPanel.summary} />
      <div className="mt-4 space-y-3">
        {viewModel.memoryPanel.items.slice(0, 3).map((item, index) => (
          <article key={`${item.title}-${index}`} className="rounded-3xl border border-white/10 bg-black/18 p-4">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SystemStatusPanel() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
      <SectionTitle icon={<Database size={18} />} title="สถานะระบบ" description="บริการหลักพร้อมช่วย CEO AI ทำงาน" />
      <div className="mt-4 space-y-3">
        {systemStatus.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/18 px-3 py-2">
            <span className="text-sm text-slate-300">{item.label}</span>
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">{item.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DailyBriefPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <section id="daily-brief" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
      <SectionTitle icon={<TrendingUp size={18} />} title="สรุปวันนี้" description={viewModel.dailyBrief.summary} />
      <ul className="mt-4 space-y-3">
        {viewModel.dailyBrief.items.slice(0, 4).map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-300">
            <CheckCircle2 className="mt-1 shrink-0 text-emerald-300" size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-blue-200">{icon}</div>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
