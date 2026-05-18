"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Bot, BrainCircuit, CalendarDays, CheckCircle2, FileCheck2, RefreshCw, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
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
      <div className="space-y-4">
        <CeoCommandArea
          viewModel={viewModel}
          snapshotError={snapshotError}
          lastUpdatedAt={lastUpdatedAt}
          refreshing={refreshing}
          onRefresh={refreshLiveSnapshot}
        />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-4">
            <CeoPlanPanel viewModel={viewModel} />
            <DelegatedAgentsPanel viewModel={viewModel} />
          </div>
          <div className="space-y-4">
            <ApprovalPanel viewModel={viewModel} />
            <DailyBriefPanel viewModel={viewModel} />
            <MemoryPanel viewModel={viewModel} />
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
  return (
    <section id="ceo-command" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {viewModel.systemBadges.map((badge) => (
              <span key={badge} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
              <Bot size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">CEO AI Command Center</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">{viewModel.headline}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{viewModel.subheadline}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "กำลังโหลด" : "รีเฟรช"}
          </button>
          <a href={viewModel.primaryAction.href} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            {viewModel.primaryAction.label}
            <ArrowRight size={15} />
          </a>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 shrink-0 text-blue-600" size={18} />
          <div className="min-w-0 flex-1">
            <label htmlFor="ceo-command-input" className="text-sm font-semibold text-slate-950">
              พิมพ์สิ่งที่อยากให้ CEO AI ช่วยบริหาร
            </label>
            <textarea
              id="ceo-command-input"
              rows={3}
              placeholder="เช่น ช่วยสรุปสถานะวันนี้ และบอกว่างานไหนต้องให้ฉันอนุมัติก่อน"
              className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {viewModel.commandPrompts.map((prompt) => (
                <button key={prompt} type="button" className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        {lastUpdatedAt ? <span>อัปเดต {new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
        {snapshotError ? <span className="text-amber-700">{snapshotError}</span> : null}
      </div>
    </section>
  );
}

function CeoPlanPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="ceo-plan" icon={<CheckCircle2 size={18} />} title="แผนของ CEO AI" description={viewModel.planPanel.summary}>
      <ol className="space-y-3">
        {viewModel.planPanel.items.map((item, index) => (
          <li key={`${item.owner}-${item.step}`} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[2rem_1fr_auto]">
            <div className="grid size-8 place-items-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">{index + 1}</div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.step}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
              <p className="mt-1 text-xs text-slate-500">ผู้รับผิดชอบ: {item.owner}</p>
            </div>
            <span className="h-fit rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{item.status}</span>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function DelegatedAgentsPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="delegated-agents" icon={<UsersRound size={18} />} title="ทีม AI ที่ CEO AI มอบหมาย" description={viewModel.teamStatus}>
      <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {viewModel.delegatedAgents.map((agent) => (
          <article key={agent.name} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-950">{agent.name}</p>
            <p className="mt-1 text-xs text-slate-500">{agent.role}</p>
            <p className="mt-3 text-sm font-medium text-slate-700">{agent.status}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{agent.currentWork}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function ApprovalPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="approval-queue" icon={<ShieldCheck size={18} />} title="งานที่รออนุมัติ" description={viewModel.approvalPanel.summary}>
      <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-sm font-semibold text-amber-950">{viewModel.approvalPanel.count} รายการต้องตัดสินใจ</p>
        <a href="/workflows/content-department" className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white">
          {viewModel.approvalPanel.primaryLabel}
        </a>
      </div>
      <div className="space-y-2">
        {viewModel.approvalPanel.items.map((item) => (
          <article key={`${item.requester}-${item.title}`} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-950">{item.title}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>ผู้ขอ: {item.requester}</span>
              <span>ความเสี่ยง: {item.risk}</span>
              <span>สถานะ: {item.status}</span>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function DailyBriefPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="daily-brief" icon={<CalendarDays size={18} />} title="สรุปวันนี้" description={viewModel.dailyBrief.summary}>
      <ul className="space-y-2">
        {viewModel.dailyBrief.items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <FileCheck2 className="mt-1 shrink-0 text-blue-600" size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function MemoryPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="memory" icon={<BrainCircuit size={18} />} title="ความจำที่ CEO AI ใช้" description={viewModel.memoryPanel.summary}>
      <div className="space-y-2">
        {viewModel.memoryPanel.items.map((item) => (
          <article key={`${item.type}-${item.title}`} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">{item.type}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </article>
        ))}
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
    <section id={id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-blue-700">{icon}</div>
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
