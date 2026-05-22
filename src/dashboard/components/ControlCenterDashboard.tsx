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
      <div className="space-y-5 md:space-y-6">
        <CeoCommandArea
          viewModel={viewModel}
          snapshotError={snapshotError}
          lastUpdatedAt={lastUpdatedAt}
          refreshing={refreshing}
          onRefresh={refreshLiveSnapshot}
        />
        <div className="grid gap-5 md:gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
          <div className="space-y-5 md:space-y-6">
            <CeoPlanPanel viewModel={viewModel} />
            <DelegatedAgentsPanel viewModel={viewModel} />
          </div>
          <div className="space-y-5 md:space-y-6">
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
    <section id="ceo-command" className="overflow-hidden rounded-lg border border-[#7DD3FC]/15 bg-[#0D111A] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
      <div className="border-b border-white/[0.06] bg-[linear-gradient(135deg,rgba(18,24,38,0.96),rgba(13,17,26,0.92)_54%,rgba(125,211,252,0.08))] p-4 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {viewModel.systemBadges.map((badge) => (
              <span key={badge} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#9CA3AF]">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-[#7DD3FC]/20 bg-[#121826] text-[#7DD3FC] shadow-[0_0_40px_rgba(125,211,252,0.08)]">
              <Bot size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#7DD3FC]">CEO AI Command Center</p>
              <h2 className="mt-2 max-w-4xl text-2xl font-semibold leading-tight tracking-normal text-[#F5F7FA] sm:text-3xl lg:text-4xl">{viewModel.headline}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#9CA3AF] sm:text-base">{viewModel.subheadline}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:justify-end">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/[0.10] bg-[#121826] px-3 py-2 text-sm font-semibold text-[#F5F7FA] transition hover:border-[#7DD3FC]/35 hover:bg-[#182033] disabled:opacity-60 sm:min-h-10"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "กำลังโหลด" : "รีเฟรช"}
          </button>
          <a href={viewModel.primaryAction.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#7DD3FC] px-3 py-2 text-sm font-semibold text-[#05070B] shadow-[0_14px_36px_rgba(125,211,252,0.18)] transition hover:bg-[#BAE6FD] sm:min-h-10">
            {viewModel.primaryAction.label}
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-7">
      <div className="rounded-lg border border-[#7DD3FC]/20 bg-[#05070B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_70px_rgba(0,0,0,0.24)] sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-[#7DD3FC]/25 bg-[#121826] text-[#7DD3FC]">
            <Sparkles size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="ceo-command-input" className="text-sm font-semibold text-[#F5F7FA]">
              พิมพ์สิ่งที่อยากให้ CEO AI ช่วยบริหาร
            </label>
            <textarea
              id="ceo-command-input"
              rows={4}
              placeholder="เช่น ช่วยสรุปสถานะวันนี้ และบอกว่างานไหนต้องให้ฉันอนุมัติก่อน"
              className="mt-3 min-h-36 w-full resize-none rounded-md border border-white/[0.09] bg-[#0D111A] px-4 py-3 text-base leading-7 text-[#F5F7FA] outline-none transition placeholder:text-[#6B7280] focus:border-[#7DD3FC]/55 focus:ring-2 focus:ring-[#7DD3FC]/15 sm:min-h-32"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {viewModel.commandPrompts.map((prompt, index) => (
                <button key={`${prompt}-${index}`} type="button" className="inline-flex min-h-10 items-center rounded-md border border-white/[0.08] bg-[#121826] px-3 py-2 text-left text-xs font-medium leading-5 text-[#9CA3AF] transition hover:border-[#7DD3FC]/30 hover:text-[#F5F7FA] sm:min-h-8 sm:px-2.5 sm:py-1.5">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#9CA3AF]">
        {lastUpdatedAt ? <span>อัปเดต {new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
        {snapshotError ? <span className="text-[#FBBF24]">{snapshotError}</span> : null}
      </div>
      </div>
    </section>
  );
}

function CeoPlanPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="ceo-plan" icon={<CheckCircle2 size={18} />} title="แผนของ CEO AI" description={viewModel.planPanel.summary}>
      <ol className="space-y-3">
        {viewModel.planPanel.items.map((item, index) => (
          <li key={`${item.owner}-${item.step}`} className="grid gap-3 rounded-lg border border-white/[0.07] bg-[#0D111A] p-4 sm:grid-cols-[2rem_1fr_auto] sm:p-3">
            <div className="grid size-8 place-items-center rounded-md border border-[#7DD3FC]/20 bg-[#121826] text-sm font-semibold text-[#7DD3FC]">{index + 1}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F5F7FA]">{item.step}</p>
              <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">{item.detail}</p>
              <p className="mt-1 text-xs text-[#6B7280]">ผู้รับผิดชอบ: {item.owner}</p>
            </div>
            <span className="h-fit rounded-md border border-white/[0.08] bg-[#121826] px-2.5 py-1 text-xs font-medium text-[#9CA3AF] sm:justify-self-end">{item.status}</span>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function DelegatedAgentsPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="delegated-agents" icon={<UsersRound size={18} />} title="ทีม AI ที่ CEO AI มอบหมาย" description={viewModel.teamStatus}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
        {viewModel.delegatedAgents.map((agent) => (
          <article key={agent.name} className="rounded-lg border border-white/[0.07] bg-[#0D111A] p-4 sm:p-3">
            <p className="text-sm font-semibold text-[#F5F7FA]">{agent.name}</p>
            <p className="mt-1 text-xs text-[#6B7280]">{agent.role}</p>
            <p className="mt-3 text-sm font-medium text-[#34D399]">{agent.status}</p>
            <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">{agent.currentWork}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function ApprovalPanel({ viewModel }: { viewModel: CeoCommandCenterViewModel }) {
  return (
    <SectionShell id="approval-queue" icon={<ShieldCheck size={18} />} title="งานที่รออนุมัติ" description={viewModel.approvalPanel.summary}>
      <div className="mb-3 flex flex-col gap-3 rounded-lg border border-[#7DD3FC]/15 bg-[#121826] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-3">
        <p className="text-sm font-semibold text-[#F5F7FA]">{viewModel.approvalPanel.count} รายการต้องตัดสินใจ</p>
        <a href="/workflows/content-department" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#7DD3FC] px-4 py-2.5 text-sm font-semibold text-[#05070B] transition hover:bg-[#BAE6FD] sm:min-h-9 sm:w-auto sm:px-3 sm:py-2 sm:text-xs">
          {viewModel.approvalPanel.primaryLabel}
        </a>
      </div>
      <div className="space-y-2">
        {viewModel.approvalPanel.items.map((item) => (
          <article key={`${item.requester}-${item.title}`} className="rounded-lg border border-white/[0.07] bg-[#0D111A] p-4 sm:p-3">
            <p className="text-sm font-semibold text-[#F5F7FA]">{item.title}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#9CA3AF]">
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
        {viewModel.dailyBrief.items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-[#9CA3AF]">
            <FileCheck2 className="mt-1 shrink-0 text-[#34D399]" size={15} />
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
        {viewModel.memoryPanel.items.map((item, index) => (
          <article key={`${item.type}-${item.title}-${index}`} className="rounded-lg border border-white/[0.07] bg-[#0D111A] p-4 sm:p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-semibold text-[#F5F7FA]">{item.title}</p>
              <span className="w-fit rounded-md border border-white/[0.08] bg-[#121826] px-2 py-0.5 text-xs text-[#9CA3AF]">{item.type}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">{item.detail}</p>
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
    <section id={id} className="rounded-lg border border-white/[0.07] bg-[#121826] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-5 xl:p-4">
      <div className="mb-4 flex items-start gap-3 sm:mb-5 xl:mb-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-md border border-[#7DD3FC]/20 bg-[#0D111A] text-[#7DD3FC]">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#F5F7FA]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
