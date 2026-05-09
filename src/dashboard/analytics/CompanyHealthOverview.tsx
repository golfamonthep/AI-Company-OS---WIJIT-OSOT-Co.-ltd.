"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, ArrowUpRight } from "lucide-react";
import { companyHealth, healthTimeline, kpiSeries } from "@/dashboard/data";
import { DashboardPanel, MiniProgress, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { CompanyHealth, LiveDashboardSnapshot } from "@/dashboard/types";

const toneMap = {
  cyan: "cyan",
  green: "green",
  amber: "amber",
  rose: "rose",
  violet: "violet"
} as const;

export function CompanyHealthOverview({ liveSnapshot, snapshotStatus }: { liveSnapshot?: LiveDashboardSnapshot | null; snapshotStatus?: "loading" | "ready" | "fallback" }) {
  const liveHealth = getLiveCompanyHealth(liveSnapshot);
  const healthItems = liveHealth ?? companyHealth;
  const hasLiveRun = Boolean(liveSnapshot?.contentDepartment.latestRun);
  const statusTone = snapshotStatus === "ready" ? "green" : snapshotStatus === "loading" ? "cyan" : "amber";
  const statusLabel = snapshotStatus === "ready" ? "ข้อมูลล่าสุด" : snapshotStatus === "loading" ? "กำลังโหลด" : "ข้อมูลตัวอย่าง";

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <DashboardPanel className="xl:col-span-8">
        <div className="relative overflow-hidden rounded-lg p-5 sm:p-6">
          <div className="relative grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
                <StatusPill tone="amber">ต้องอนุมัติก่อนใช้งาน</StatusPill>
                <StatusPill tone="slate">{liveSnapshot?.workspace.persistenceMode ?? "memory"}</StatusPill>
              </div>
              <h2 className="mt-5 max-w-4xl text-2xl font-semibold leading-tight text-slate-950 sm:text-4xl">แดชบอร์ดงาน Content Department AI</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                {hasLiveRun
                  ? `งานล่าสุด ${liveSnapshot?.contentDepartment.campaignName} อยู่ในสถานะ ${toThaiStatus(liveSnapshot?.contentDepartment.latestRun?.status ?? "")} ระบบจะแสดงการอนุมัติ ความจำ และการเรียนรู้ก่อนนำผลงานไปใช้จริง`
                  : "ติดตามงาน AI ตั้งแต่การวิเคราะห์กลุ่มเป้าหมาย การสร้างคอนเทนต์ การอนุมัติ ความจำองค์กร และการเรียนรู้"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">สถานะ MVP</p>
                  <p className="text-lg font-semibold text-slate-950">{hasLiveRun ? "มีข้อมูลล่าสุด" : "พร้อมเริ่มงานแรก"}</p>
                </div>
                <Activity className="text-emerald-600" size={18} />
              </div>
              <div className="mt-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpiSeries}>
                    <defs>
                      <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#67e8f9" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis hide domain={[60, 100]} />
                    <Tooltip contentStyle={{ background: "#0b1118", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }} />
                    <Area type="monotone" dataKey="quality" stroke="#67e8f9" strokeWidth={2} fill="url(#qualityGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel className="xl:col-span-4">
        <PanelHeader title="สุขภาพการทำงาน" description="ภาพรวมความพร้อมของระบบสำหรับการใช้งานประจำวัน" action={<ArrowUpRight size={17} className="text-blue-600" />} />
        <div className="space-y-4 p-5">
          {healthTimeline.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <div className="grid gap-4 xl:col-span-12 sm:grid-cols-2 xl:grid-cols-5">
        {healthItems.map((item) => (
          <DashboardPanel key={item.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
              </div>
              {item.tone === "amber" ? <AlertTriangle className="text-amber-600" size={18} /> : <Activity className="text-blue-600" size={18} />}
            </div>
            <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{item.detail}</p>
            <MiniProgress value={item.tone === "amber" ? 62 : 86} tone={toneMap[item.tone]} />
          </DashboardPanel>
        ))}
      </div>

      <DashboardPanel className="xl:col-span-12">
        <PanelHeader title="ตัวชี้วัดงาน" description="จำนวนงานคอนเทนต์ งานที่ต้องอนุมัติ และคะแนนคุณภาพของผลลัพธ์" />
        <div className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiSeries}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={{ background: "#0b1118", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }} />
              <Bar dataKey="content" fill="#67e8f9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approval" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardPanel>
    </div>
  );
}

function getLiveCompanyHealth(snapshot?: LiveDashboardSnapshot | null): CompanyHealth[] | null {
  if (!snapshot) return null;

  const latestStatus = snapshot.contentDepartment.latestRun?.status ?? "no run";
  const pendingApprovals = snapshot.contentDepartment.pendingApprovals;
  const activeRuns = snapshot.contentDepartment.activeRuns;
  const completedRuns = snapshot.contentDepartment.completedRuns;
  const learningCount = snapshot.contentDepartment.learningEvents.length;
  const activeAgent = snapshot.contentDepartment.activeAgent ?? "idle";

  return [
    {
      label: "เวิร์กโฟลว์ MVP",
      value: latestStatus,
      detail: snapshot.contentDepartment.latestRun?.run_key ?? "No Content Department run started yet",
      tone: latestStatus === "completed" ? "green" : latestStatus === "waiting_approval" ? "amber" : "cyan"
    },
    {
      label: "ทีม AI ที่กำลังทำงาน",
      value: activeAgent,
      detail: `${activeRuns} งานกำลังทำงาน, ${completedRuns} งานเสร็จสิ้น`,
      tone: activeRuns > 0 ? "amber" : "green"
    },
    {
      label: "งานที่รออนุมัติ",
      value: String(pendingApprovals),
      detail: "งานคอนเทนต์ที่ต้องให้คนตรวจและอนุมัติ",
      tone: pendingApprovals > 0 ? "amber" : "green"
    },
    {
      label: "การบันทึกข้อมูล",
      value: snapshot.workspace.persistenceMode,
      detail: snapshot.workspace.persistenceReason ?? "Repository-backed dashboard snapshot",
      tone: snapshot.workspace.persistenceMode === "supabase" ? "green" : "violet"
    },
    {
      label: "การเรียนรู้",
      value: String(learningCount),
      detail: "บันทึกการเรียนรู้ที่ตรวจสอบย้อนหลังได้",
      tone: learningCount > 0 ? "violet" : "cyan"
    }
  ];
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
