"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { BarChart3, Bot, BrainCircuit, BriefcaseBusiness, CheckCircle2, ClipboardCheck, Database, FileText, Megaphone, Mic, Paperclip, RefreshCw, SendHorizontal, ShieldCheck, Sparkles, TrendingUp, Upload, WalletCards } from "lucide-react";
import { DashboardLayoutSystem } from "@/dashboard/layout/DashboardLayoutSystem";
import { applyCeoApprovalDecision, submitCeoDashboardCommand } from "@/dashboard/ceo-command-client";
import type { CeoApprovalDecision, CeoCommandPlanPreview } from "@/dashboard/ceo-command-client";
import { createCeoCommandCenterViewModel, type CeoCommandCenterViewModel } from "@/dashboard/ceo-command-center";
import { createMultiPlatformCommandCenterModel, type PlatformAgent, type PlatformOutput, type PlatformTask, type PlatformWorkflow } from "@/dashboard/multi-platform-command-center";
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
  const platformModel = createMultiPlatformCommandCenterModel();
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
        <PlatformAgentStrip agents={platformModel.platformAgents} commandPlanPreview={commandPlanPreview} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SystemMapSection agents={platformModel.platformAgents} workflows={platformModel.workflows} />
          <PerformanceSummary metrics={platformModel.metrics} />
        </div>
        <OperationRoom workflows={platformModel.workflows} />
        <WorkflowTimeline workflows={platformModel.workflows} />
        <PlanReviewPanel viewModel={displayedViewModel} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
          <ActivePlatformTasks tasks={platformModel.tasks} agents={platformModel.platformAgents} />
          <ApprovalQueue viewModel={displayedViewModel} approvalState={approvalState} onApprove={(id) => setApprovalState((current) => ({ ...current, [id]: "approved" }))} onApprovalDecision={commandPlanPreview ? updateApprovalDecision : undefined} />
        </div>
        <LatestPlatformOutputs outputs={platformModel.outputs} agents={platformModel.platformAgents} />
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

function PlatformAgentStrip({ agents, commandPlanPreview }: { agents: PlatformAgent[]; commandPlanPreview: CeoCommandPlanPreview | null }) {
  const involvedPlatformText = commandPlanPreview?.planPanel.items.find((item) => item.step === "แพลตฟอร์มที่เกี่ยวข้อง")?.detail ?? "";

  return (
    <section id="platform-offices" className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle icon={<BriefcaseBusiness size={18} />} title="Platform Agent Offices" description="CEO AI เลือกทีมแพลตฟอร์มที่เกี่ยวข้อง แล้วแตกงานให้แต่ละ office รอคุณตรวจ" />
        <span className="w-fit rounded-full border border-blue-300/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">7 platform offices</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {agents.map((agent) => {
          const highlighted = involvedPlatformText.includes(agent.name);
          return (
            <article key={agent.id} className={`min-w-[245px] rounded-3xl border p-4 transition ${highlighted ? "border-cyan-200/50 bg-cyan-400/12 shadow-lg shadow-cyan-950/30" : "border-white/10 bg-black/18"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className={`grid size-11 place-items-center rounded-2xl ${accentClass(agent.accent, "icon")}`}>
                  {platformIcon(agent.id)}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(agent.status)}`}>{platformStatusLabel(agent.status)}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{agent.name}</h3>
              <p className="mt-2 min-h-12 text-xs leading-5 text-slate-400">{agent.responsibility}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="งาน" value={String(agent.activeTasks)} />
                <MiniStat label="อนุมัติ" value={String(agent.pendingApprovals)} />
                <MiniStat label="Score" value={`${agent.performanceScore}%`} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SystemMapSection({ agents, workflows }: { agents: PlatformAgent[]; workflows: PlatformWorkflow[] }) {
  const cityNodes = agents.slice(0, 7);
  return (
    <section id="system-map" className="overflow-hidden rounded-[28px] border border-blue-300/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.94)),radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.22),transparent_34%)] p-5 shadow-2xl shadow-black/25 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle icon={<Database size={18} />} title="System Map / Platform City" description="แผนที่ระบบแบบ UI-first: CEO AI อยู่ศูนย์กลาง เชื่อมงานไปยังแต่ละ platform office" />
        <p className="text-xs text-slate-500">CSS map panel · no 3D required</p>
      </div>
      <div className="relative mt-6 min-h-[430px] overflow-hidden rounded-[24px] border border-white/10 bg-[#071023]/88 p-5">
        <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
        <div className="absolute left-1/2 top-10 h-[72%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-blue-300/25 to-transparent" />
        <div className="absolute left-1/2 top-1/2 z-20 w-52 -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-blue-200/30 bg-blue-500/20 p-5 text-center shadow-2xl shadow-blue-950/40">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-blue-500 text-white">
            <Bot size={30} />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">CEO AI Core</p>
          <p className="mt-1 text-xs leading-5 text-blue-100/80">Command · Plan · Approval</p>
        </div>
        {cityNodes.map((agent, index) => (
          <div key={agent.id} className={`absolute z-10 w-40 rounded-3xl border border-white/10 bg-white/[0.08] p-3 shadow-xl shadow-black/25 ${systemMapPosition(index)}`}>
            <div className="flex items-center gap-2">
              <div className={`grid size-9 place-items-center rounded-2xl ${accentClass(agent.accent, "icon")}`}>{platformIcon(agent.id, 16)}</div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{agent.name}</p>
                <p className="text-[11px] text-slate-500">{agent.performanceScore}% health</p>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 grid gap-2 md:grid-cols-2">
          {workflows.slice(0, 2).map((workflow) => (
            <div key={workflow.id} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-semibold text-white">{workflow.title}</p>
                <span className="text-xs text-cyan-200">{workflow.progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300" style={{ width: `${workflow.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PerformanceSummary({ metrics }: { metrics: ReturnType<typeof createMultiPlatformCommandCenterModel>["metrics"] }) {
  return (
    <section id="performance-summary" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <SectionTitle icon={<TrendingUp size={18} />} title="Performance Summary" description="ภาพรวมที่ CEO AI ใช้จัดลำดับความสำคัญข้ามแพลตฟอร์ม" />
      <div className="mt-5 space-y-3">
        {metrics.map((metric) => (
          <article key={metric.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${metric.tone === "good" ? "bg-emerald-400/10 text-emerald-200" : metric.tone === "watch" ? "bg-amber-400/10 text-amber-200" : "bg-white/10 text-slate-300"}`}>{metric.change}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OperationRoom({ workflows }: { workflows: PlatformWorkflow[] }) {
  return (
    <section id="operation-room" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <SectionTitle icon={<ClipboardCheck size={18} />} title="Operation Room" description="ห้องทำงานรวมที่แสดง workflow ข้ามแพลตฟอร์ม และจุดที่ต้องให้เจ้าของธุรกิจตัดสินใจ" />
        <span className="w-fit rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">Approval-gated operations</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {workflows.map((workflow) => (
          <article key={workflow.id} className="rounded-3xl border border-white/10 bg-black/18 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-6 text-white">{workflow.title}</h3>
              {workflow.approvalRequired ? <ShieldCheck className="shrink-0 text-amber-200" size={16} /> : <CheckCircle2 className="shrink-0 text-emerald-200" size={16} />}
            </div>
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">{workflow.currentStep}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${workflow.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{workflow.platformIds.length} platform offices involved</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowTimeline({ workflows }: { workflows: PlatformWorkflow[] }) {
  return (
    <section id="workflow-steps" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <SectionTitle icon={<BarChart3 size={18} />} title="Workflow Timeline" description="ลำดับงานจากคำสั่ง CEO AI ไปจนถึงผลลัพธ์ที่ต้องตรวจ" />
      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {workflows.map((workflow, index) => (
          <article key={workflow.id} className="relative rounded-3xl border border-white/10 bg-black/18 p-4">
            <div className="grid size-9 place-items-center rounded-2xl bg-blue-500 text-sm font-semibold text-white">{index + 1}</div>
            <h3 className="mt-4 text-sm font-semibold leading-6 text-white">{workflow.title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{workflow.currentStep}</p>
            {workflow.approvalRequired ? <p className="mt-3 text-xs font-semibold text-amber-200">รอการตรวจอนุมัติ</p> : <p className="mt-3 text-xs font-semibold text-emerald-200">ทำต่อได้ภายในระบบ</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function ActivePlatformTasks({ tasks, agents }: { tasks: PlatformTask[]; agents: PlatformAgent[] }) {
  return (
    <section id="active-work" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <SectionTitle icon={<BriefcaseBusiness size={18} />} title="Active Platform Tasks" description="งานที่ CEO AI แยกให้แต่ละ platform office เตรียมไว้" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {tasks.map((task) => {
          const agent = agents.find((item) => item.id === task.platformId);
          return (
            <article key={task.id} className="rounded-3xl border border-white/10 bg-black/18 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-6 text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{task.owner} · {taskStatusLabel(task.status)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${agent ? accentClass(agent.accent, "badge") : "bg-white/10 text-slate-300"}`}>{task.progress}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300" style={{ width: `${task.progress}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LatestPlatformOutputs({ outputs, agents }: { outputs: PlatformOutput[]; agents: PlatformAgent[] }) {
  return (
    <section id="final-outputs" className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <SectionTitle icon={<CheckCircle2 size={18} />} title="Latest Outputs" description="ผลลัพธ์ล่าสุดจาก platform offices ที่รอเปิดดู ขอแก้ หรืออนุมัติ" />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {outputs.map((output) => {
          const agent = agents.find((item) => item.id === output.platformId);
          return (
            <article key={output.id} className="rounded-3xl border border-white/10 bg-black/18 p-4">
              <div className={`grid aspect-video place-items-center rounded-2xl border border-white/10 ${agent ? accentClass(agent.accent, "soft") : "bg-white/8 text-slate-300"}`}>
                {platformIcon(output.platformId, 28)}
              </div>
              <p className="mt-4 text-sm font-semibold leading-6 text-white">{output.title}</p>
              <p className="mt-1 text-xs text-slate-400">{output.type} · {agent?.name ?? output.platformId}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="rounded-2xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white">ดูผลลัพธ์</button>
                <button type="button" className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200">ขอแก้ไข</button>
              </div>
            </article>
          );
        })}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function platformIcon(platformId: string, size = 18) {
  if (platformId.includes("tiktok")) return <Megaphone size={size} />;
  if (platformId.includes("shopee") || platformId.includes("lazada")) return <BriefcaseBusiness size={size} />;
  if (platformId.includes("facebook")) return <Megaphone size={size} />;
  if (platformId.includes("line")) return <FileText size={size} />;
  if (platformId.includes("seo")) return <BarChart3 size={size} />;
  if (platformId.includes("shopping")) return <WalletCards size={size} />;
  return <Bot size={size} />;
}

function accentClass(accent: PlatformAgent["accent"], variant: "icon" | "badge" | "soft") {
  const classes: Record<PlatformAgent["accent"], Record<"icon" | "badge" | "soft", string>> = {
    cyan: {
      icon: "bg-cyan-400/15 text-cyan-100",
      badge: "bg-cyan-400/10 text-cyan-200",
      soft: "bg-cyan-400/10 text-cyan-100"
    },
    orange: {
      icon: "bg-orange-400/15 text-orange-100",
      badge: "bg-orange-400/10 text-orange-200",
      soft: "bg-orange-400/10 text-orange-100"
    },
    violet: {
      icon: "bg-violet-400/15 text-violet-100",
      badge: "bg-violet-400/10 text-violet-200",
      soft: "bg-violet-400/10 text-violet-100"
    },
    blue: {
      icon: "bg-blue-400/15 text-blue-100",
      badge: "bg-blue-400/10 text-blue-200",
      soft: "bg-blue-400/10 text-blue-100"
    },
    green: {
      icon: "bg-emerald-400/15 text-emerald-100",
      badge: "bg-emerald-400/10 text-emerald-200",
      soft: "bg-emerald-400/10 text-emerald-100"
    },
    amber: {
      icon: "bg-amber-400/15 text-amber-100",
      badge: "bg-amber-400/10 text-amber-200",
      soft: "bg-amber-400/10 text-amber-100"
    },
    sky: {
      icon: "bg-sky-400/15 text-sky-100",
      badge: "bg-sky-400/10 text-sky-200",
      soft: "bg-sky-400/10 text-sky-100"
    }
  };

  return classes[accent][variant];
}

function statusClass(status: PlatformAgent["status"]) {
  const classes: Record<PlatformAgent["status"], string> = {
    active: "bg-emerald-400/10 text-emerald-200",
    watch: "bg-amber-400/10 text-amber-200",
    needs_approval: "bg-blue-400/10 text-blue-200",
    paused: "bg-slate-400/10 text-slate-300"
  };

  return classes[status];
}

function platformStatusLabel(status: PlatformAgent["status"]) {
  const labels: Record<PlatformAgent["status"], string> = {
    active: "ทำงาน",
    watch: "ต้องเฝ้าดู",
    needs_approval: "รออนุมัติ",
    paused: "พักงาน"
  };

  return labels[status];
}

function taskStatusLabel(status: PlatformTask["status"]) {
  const labels: Record<PlatformTask["status"], string> = {
    queued: "รอเริ่ม",
    in_progress: "กำลังทำ",
    waiting_approval: "รออนุมัติ",
    completed: "เสร็จแล้ว"
  };

  return labels[status];
}

function systemMapPosition(index: number) {
  const positions = [
    "left-5 top-8",
    "right-5 top-8",
    "left-8 top-1/2 -translate-y-1/2",
    "right-8 top-1/2 -translate-y-1/2",
    "left-1/2 bottom-20 -translate-x-1/2",
    "left-20 bottom-12",
    "right-20 bottom-12"
  ];

  return positions[index] ?? "left-5 top-8";
}
