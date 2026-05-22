"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Bot, BrainCircuit, CalendarDays, CheckCircle2, FileCheck2, RefreshCw, SendHorizontal, ShieldCheck, UsersRound } from "lucide-react";
import { DashboardLayoutSystem } from "@/dashboard/layout/DashboardLayoutSystem";
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

export function ControlCenterDashboard({ workspaceSession }: { workspaceSession?: DashboardWorkspaceSession }) {
  const [liveSnapshot, setLiveSnapshot] = useState<LiveDashboardSnapshot | null>(null);
  const [snapshotStatus, setSnapshotStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const viewModel = createCeoCommandCenterViewModel(liveSnapshot, snapshotStatus);

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
      <div className="space-y-5 md:space-y-6">
        <CeoCommandArea viewModel={viewModel} snapshotError={snapshotError} lastUpdatedAt={lastUpdatedAt} refreshing={refreshing} onRefresh={refreshLiveSnapshot} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <DailyBriefPanel viewModel={viewModel} />
            <CeoPlanPanel viewModel={viewModel} />
          </div>
          <div className="space-y-5">
            <ApprovalPanel viewModel={viewModel} />
            <SupportPanel viewModel={viewModel} />
          </div>
        </div>
      </div>
    </DashboardLayoutSystem>
  );
}

function CeoCommandArea({
  viewModel,
  snapshotError,
  lastUpdatedAt,
  refreshing,
  onRefresh
}: {
  viewModel: CeoCommandCenterViewModel;
  snapshotError: string | null;
  lastUpdatedAt: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<LiveDashboardSnapshot | null>;
}) {
  const [command, setCommand] = useState("วันนี้ฉันควรตัดสินใจเรื่องอะไรก่อน");
  const [reply, setReply] = useState<string | null>(null);

  function askCeoAi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReply(buildExecutiveReply(viewModel));
  }

  return (
    <section id="ceo-command" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            {viewModel.systemBadges.map((badge) => (
              <span key={badge} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <Bot size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-3xl">{viewModel.headline}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{viewModel.subheadline}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <a href={viewModel.primaryAction.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
              {viewModel.primaryAction.label}
              <ArrowRight size={15} />
            </a>
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-60"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "กำลังอัปเดต" : "อัปเดตสถานะ"}
            </button>
          </div>
        </div>

        <form onSubmit={askCeoAi} className="bg-slate-50/70 p-5 sm:p-6 lg:p-8">
          <label htmlFor="ceo-command-input" className="text-sm font-semibold text-slate-950">
            คุยกับ CEO AI
          </label>
          <textarea
            id="ceo-command-input"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            rows={4}
            placeholder="เช่น สรุปสถานะวันนี้ และบอกว่างานไหนต้องให้ฉันอนุมัติก่อน"
            className="mt-3 min-h-32 w-full resize-none rounded-md border border-slate-200 bg-white px-4 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {viewModel.commandPrompts.slice(0, 2).map((prompt, index) => (
              <button
                key={`${prompt}-${index}`}
                type="button"
                onClick={() => setCommand(prompt)}
                className="inline-flex min-h-9 items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium leading-5 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
              >
                {prompt}
              </button>
            ))}
          </div>
          <button type="submit" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            ส่งให้ CEO AI
            <SendHorizontal size={15} />
          </button>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{reply ? "ข้อเสนอจาก CEO AI" : "CEO AI พร้อมช่วยสรุป"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{reply ?? "พิมพ์คำถามหรือเลือกตัวอย่าง แล้ว CEO AI จะเสนอสิ่งที่ควรดูต่อแบบสั้น ชัดเจน และรอคุณตัดสินใจ"}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {lastUpdatedAt ? <span>อัปเดต {new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
            {snapshotError ? <span className="text-amber-700">ใช้ข้อมูลตัวอย่างชั่วคราว</span> : null}
          </div>
        </form>
      </div>
    </section>
  );
}

function DailyBriefPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="daily-brief" icon={<CalendarDays size={18} />} title="สรุปสำหรับวันนี้" description={viewModel.dailyBrief.summary}>
      <ul className="space-y-3">
        {viewModel.dailyBrief.items.slice(0, 4).map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700">
            <FileCheck2 className="mt-1 shrink-0 text-emerald-600" size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function CeoPlanPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="ceo-plan" icon={<CheckCircle2 size={18} />} title="แผนที่ CEO AI เสนอ" description={viewModel.planPanel.summary}>
      <ol className="divide-y divide-slate-100">
        {viewModel.planPanel.items.map((item, index) => (
          <li key={`${item.owner}-${item.step}`} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2rem_1fr]">
            <div className="grid size-8 place-items-center rounded-md bg-blue-50 text-sm font-semibold text-blue-700">{index + 1}</div>
            <div className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-slate-950">{item.step}</p>
                <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item.status}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function ApprovalPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  const hasApprovals = viewModel.approvalPanel.count > 0;

  return (
    <SectionShell id="approval-queue" icon={<ShieldCheck size={18} />} title="เรื่องที่ต้องตัดสินใจ" description={viewModel.approvalPanel.summary}>
      <div className={hasApprovals ? "rounded-lg border border-amber-200 bg-amber-50 p-4" : "rounded-lg border border-emerald-200 bg-emerald-50 p-4"}>
        <p className={hasApprovals ? "text-2xl font-semibold text-amber-900" : "text-2xl font-semibold text-emerald-900"}>{viewModel.approvalPanel.count}</p>
        <p className={hasApprovals ? "mt-1 text-sm leading-6 text-amber-800" : "mt-1 text-sm leading-6 text-emerald-800"}>
          {hasApprovals ? "รายการรอให้คุณอนุมัติก่อนนำไปใช้จริง" : "ตอนนี้ยังไม่มีงานเร่งด่วนที่ต้องอนุมัติ"}
        </p>
        <a href="/workflows/content-department" className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50">
          {hasApprovals ? "ไปตรวจงาน" : "ดูงานแคมเปญ"}
        </a>
      </div>
      {hasApprovals ? (
        <div className="mt-3 space-y-2">
          {viewModel.approvalPanel.items.slice(0, 2).map((item) => (
            <article key={`${item.requester}-${item.title}`} className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">ความเสี่ยง {item.risk} · {item.status}</p>
            </article>
          ))}
        </div>
      ) : null}
    </SectionShell>
  );
}

function SupportPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="support-context" icon={<UsersRound size={18} />} title="ข้อมูลประกอบการเสนอแผน" description={viewModel.teamStatus}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">ทีมเบื้องหลัง</p>
          <div className="mt-2 space-y-2">
            {viewModel.delegatedAgents.slice(0, 3).map((agent) => (
              <div key={agent.name} className="flex items-start justify-between gap-3 rounded-md bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{agent.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{agent.currentWork}</p>
                </div>
                <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            <BrainCircuit size={14} />
            บทเรียนหลังยืนยัน
          </div>
          <div className="mt-2 space-y-2">
            {viewModel.memoryPanel.items.slice(0, 2).map((item, index) => (
              <article key={`${item.type}-${item.title}-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function SectionShell({
  id,
  icon,
  title,
  description,
  children
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function buildExecutiveReply(viewModel: CeoCommandCenterViewModel) {
  if (viewModel.approvalPanel.count > 0) {
    return `ตอนนี้ควรเริ่มจากงานที่รออนุมัติ ${viewModel.approvalPanel.count} รายการก่อน เพราะต้องให้คุณตัดสินใจก่อนนำไปใช้จริง หลังยืนยันแล้ว CEO AI จึงค่อยบันทึกบทเรียนและเดินงานถัดไป`;
  }

  const firstStep = viewModel.planPanel.items[0]?.step ?? "เริ่มแผนงานถัดไป";
  return `วันนี้ยังไม่มีเรื่องเร่งด่วนที่ต้องอนุมัติ CEO AI เสนอให้เริ่มจาก "${firstStep}" แล้วให้ทีมเบื้องหลังเตรียมงานไว้ตรวจ ก่อนนำไปใช้จริง`;
}
