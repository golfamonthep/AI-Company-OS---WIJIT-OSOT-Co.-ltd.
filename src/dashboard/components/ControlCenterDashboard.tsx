"use client";

import { useCallback, useEffect, useState } from "react";
import { ApprovalQueuePanel } from "@/dashboard/governance/ApprovalQueuePanel";
import { AgentMonitoringPanel } from "@/dashboard/agents/AgentMonitoringPanel";
import { CampaignPerformancePanel } from "@/dashboard/ads-performance/CampaignPerformancePanel";
import { CompanyHealthOverview } from "@/dashboard/analytics/CompanyHealthOverview";
import { DashboardLayoutSystem } from "@/dashboard/layout/DashboardLayoutSystem";
import { GovernanceControlPanel } from "@/dashboard/governance/GovernanceControlPanel";
import { LearningAnalyticsPanel } from "@/dashboard/learning/LearningAnalyticsPanel";
import { MemoryExplorerPanel } from "@/dashboard/memory/MemoryExplorerPanel";
import { OperationsMonitorPanel } from "@/dashboard/operations/OperationsMonitorPanel";
import { WorkflowVisualizationPanel } from "@/dashboard/workflows/WorkflowVisualizationPanel";
import { createMockLiveDashboardSnapshot } from "@/dashboard/mock-snapshot";
import { useControlCenterStore } from "@/dashboard/store";
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
  const activeSection = useControlCenterStore((state) => state.activeSection);
  const [liveSnapshot, setLiveSnapshot] = useState<LiveDashboardSnapshot | null>(null);
  const [snapshotStatus, setSnapshotStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    void refreshLiveSnapshot();
    const interval = window.setInterval(() => {
      void refreshLiveSnapshot();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshLiveSnapshot]);

  return (
    <DashboardLayoutSystem workspaceSession={workspaceSession}>
      <div className="space-y-4">
        <DashboardStatusBar
          liveSnapshot={liveSnapshot}
          snapshotStatus={snapshotStatus}
          snapshotError={snapshotError}
          lastUpdatedAt={lastUpdatedAt}
          refreshing={refreshing}
          onRefresh={refreshLiveSnapshot}
        />
        {(activeSection === "overview" || activeSection === "agents") && <CompanyHealthOverview liveSnapshot={liveSnapshot} snapshotStatus={snapshotStatus} />}
        {(activeSection === "overview" || activeSection === "workflows") && <WorkflowVisualizationPanel liveSnapshot={liveSnapshot} />}
        {(activeSection === "overview" || activeSection === "workflows") && <CampaignPerformancePanel liveSnapshot={liveSnapshot} />}
        {(activeSection === "overview" || activeSection === "agents") && <AgentMonitoringPanel />}
        {(activeSection === "overview" || activeSection === "governance") && (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <GovernanceControlPanel liveSnapshot={liveSnapshot} />
            <ApprovalQueuePanel liveSnapshot={liveSnapshot} onSnapshotUpdated={refreshLiveSnapshot} />
          </div>
        )}
        {(activeSection === "overview" || activeSection === "learning") && <LearningAnalyticsPanel liveSnapshot={liveSnapshot} onSnapshotUpdated={refreshLiveSnapshot} />}
        {(activeSection === "overview" || activeSection === "operations") && <OperationsMonitorPanel liveSnapshot={liveSnapshot} />}
        {(activeSection === "overview" || activeSection === "memory") && <MemoryExplorerPanel liveSnapshot={liveSnapshot} />}
      </div>
    </DashboardLayoutSystem>
  );
}

function DashboardStatusBar({
  liveSnapshot,
  snapshotStatus,
  snapshotError,
  lastUpdatedAt,
  refreshing,
  onRefresh
}: {
  liveSnapshot: LiveDashboardSnapshot | null;
  snapshotStatus: "loading" | "ready" | "fallback";
  snapshotError: string | null;
  lastUpdatedAt: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<LiveDashboardSnapshot | null>;
}) {
  const fallbackMode = liveSnapshot?.workspace.persistenceMode !== "configured" && liveSnapshot?.workspace.persistenceMode !== "supabase";
  const latestRun = liveSnapshot?.contentDepartment.latestRun;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
              {snapshotStatus === "ready" ? "เชื่อมต่อข้อมูลล่าสุด" : snapshotStatus === "loading" ? "กำลังโหลดข้อมูล" : "ใช้ข้อมูลตัวอย่าง"}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
              {fallbackMode ? "เก็บข้อมูลชั่วคราว" : "เชื่อมต่อฐานข้อมูล"}
            </span>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
              ยังไม่เผยแพร่ภายนอก
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {latestRun
              ? `เวิร์กโฟลว์ล่าสุด ${latestRun.run_key} อยู่ในสถานะ ${toThaiStatus(latestRun.status)} ข้อมูลในแดชบอร์ดดึงจาก API ของ Content Department`
              : "ยังไม่มีเวิร์กโฟลว์ในรอบการทำงานนี้ เริ่ม Mother-and-baby TikTok Campaign เพื่อเติมข้อมูลในแดชบอร์ด"}
          </p>
          {snapshotError ? <p className="mt-2 text-sm text-rose-700">{snapshotError}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {lastUpdatedAt ? <span className="text-xs text-slate-500">อัปเดต {new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
          <a href="/workflows/content-production" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            เปิดเวิร์กโฟลว์
          </a>
        </div>
      </div>
    </section>
  );
}

function toThaiStatus(status: string) {
  const map: Record<string, string> = {
    completed: "เสร็จสิ้น",
    waiting_approval: "รออนุมัติ",
    changes_requested: "ขอแก้ไข",
    running: "กำลังทำงาน",
    failed: "ล้มเหลว"
  };
  return map[status] ?? status;
}
