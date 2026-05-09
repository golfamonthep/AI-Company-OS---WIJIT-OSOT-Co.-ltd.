"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Gauge, Radar, Route } from "lucide-react";
import { operations } from "@/dashboard/data";
import { DashboardPanel, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { LiveDashboardSnapshot } from "@/dashboard/types";

const riskTone = {
  low: "green",
  medium: "amber",
  high: "rose"
} as const;

const healthTone = {
  healthy: "green",
  watch: "amber",
  degraded: "rose"
} as const;

export function OperationsMonitorPanel({ liveSnapshot }: { liveSnapshot?: LiveDashboardSnapshot | null }) {
  const metrics = liveSnapshot?.contentDepartment.operationalMetrics;
  const alerts = liveSnapshot?.contentDepartment.operationalAlerts ?? [];
  const health = liveSnapshot?.contentDepartment.workflowHealthIndicators ?? [];
  const recentWorkflows = liveSnapshot?.contentDepartment.recentWorkflows ?? [];

  return (
    <DashboardPanel id="operations">
      <PanelHeader title="การดำเนินงาน" description="สรุปการใช้งานรายวัน งานที่ต้องอนุมัติ ความเสี่ยง และความพร้อมของระบบ" action={<StatusPill tone={metrics ? "green" : "cyan"}>{metrics ? "ข้อมูลล่าสุด" : "พร้อมรับข้อมูล"}</StatusPill>} />
      <div className="grid gap-4 p-4 lg:grid-cols-[330px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <CalendarClock size={17} className="text-blue-600" />
            งานประจำวัน
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <ScheduleRow label="สร้างแคมเปญคอนเทนต์" value="ทุกวัน" />
            <ScheduleRow label="ตรวจงานที่รออนุมัติ" value="ทุกวัน" />
            <ScheduleRow label="ตรวจ feedback และการเรียนรู้" value="ทุกวัน" />
          </div>
        </div>
        {metrics ? <MetricsGrid metrics={metrics} /> : <FallbackOperations />}
      </div>
      {liveSnapshot ? (
        <div className="grid gap-4 border-t border-slate-200 p-4 xl:grid-cols-[1fr_1fr_1.2fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Gauge size={17} className="text-emerald-600" />
              สุขภาพเวิร์กโฟลว์
            </div>
            <div className="space-y-3">
              {health.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <StatusPill tone={healthTone[item.status]}>{item.value}</StatusPill>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <AlertTriangle size={17} className="text-amber-600" />
              สิ่งที่ต้องระวัง
            </div>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={`${alert.title}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <StatusPill tone={alert.level === "critical" ? "rose" : alert.level === "warning" ? "amber" : "cyan"}>{alert.level}</StatusPill>
                  <p className="mt-2 text-sm font-medium text-slate-950">{alert.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Clock size={17} className="text-blue-600" />
              เวิร์กโฟลว์ล่าสุด
            </div>
            <div className="space-y-3">
              {recentWorkflows.length ? recentWorkflows.map((workflow) => (
                <div key={workflow.runKey} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-950">{workflow.runKey}</p>
                    <StatusPill tone={workflow.status === "completed" ? "green" : workflow.status === "changes_requested" ? "amber" : "cyan"}>{workflow.status}</StatusPill>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{workflow.objective}</p>
                  <p className="mt-2 text-xs text-slate-500">ทีม AI: {workflow.activeAgent} / การอนุมัติ: {workflow.approvalStatus}</p>
                </div>
              )) : <p className="text-sm text-slate-500">ยังไม่มีเวิร์กโฟลว์ เริ่มแคมเปญเพื่อเติมข้อมูลการดำเนินงาน</p>}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPanel>
  );
}

function MetricsGrid({ metrics }: { metrics: NonNullable<LiveDashboardSnapshot["contentDepartment"]["operationalMetrics"]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="จำนวนเวิร์กโฟลว์" value={String(metrics.workflowFrequency)} detail="จำนวนแคมเปญใน snapshot ปัจจุบัน" />
      <MetricCard label="การอนุมัติ" value={String(metrics.approvalFrequency)} detail={`${metrics.approvalRate}% อัตราอนุมัติ`} />
      <MetricCard label="ขอแก้ไข" value={String(metrics.rejectionFrequency)} detail="จำนวนงานที่ถูกส่งกลับก่อนอนุมัติ" />
      <MetricCard label="เวลาเฉลี่ย" value={formatMs(metrics.averageExecutionTimeMs)} detail="เวลาสร้างงานเมื่อมีข้อมูล" />
      <MetricCard label="งานเสร็จสิ้น" value={`${metrics.workflowCompletionRate}%`} detail="งานที่เสร็จเทียบกับทั้งหมด" />
      <MetricCard label="ความพึงพอใจ" value={metrics.userSatisfactionAverage ? `${metrics.userSatisfactionAverage}/5` : "ยังไม่มีคะแนน"} detail="คะแนนจากผู้ตรวจงาน" />
      <MetricCard label="คุณภาพผลลัพธ์" value={metrics.outputScoreAverage ? `${metrics.outputScoreAverage}/5` : "ยังไม่มีคะแนน"} detail="คะแนนคุณภาพล่าสุด" />
      <MetricCard label="แนวโน้มคะแนน" value={metrics.skillPerformanceTrend.length ? metrics.skillPerformanceTrend.join(", ") : "ยังไม่มี"} detail="คะแนนผลงานล่าสุด" />
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <CheckCircle2 size={17} className="text-emerald-600" />
        <p className="text-lg font-semibold text-slate-950">{value}</p>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-950">{label}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p>
    </div>
  );
}

function FallbackOperations() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {operations.map((operation) => (
        <div key={operation.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {operation.risk === "high" ? <AlertTriangle size={17} className="text-rose-600" /> : operation.type === "scheduled" ? <CalendarClock size={17} className="text-blue-600" /> : <Radar size={17} className="text-indigo-600" />}
              <h3 className="text-sm font-semibold text-slate-950">{operation.name}</h3>
            </div>
            <StatusPill tone={riskTone[operation.risk]}>{operation.risk}</StatusPill>
          </div>
          <p className="mt-3 text-xs text-slate-500">Type: {operation.type} / Status: {operation.status}</p>
          <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{operation.nextStep}</p>
        </div>
      ))}
    </div>
  );
}

function formatMs(value?: number) {
  if (!value) return "n/a";
  if (value < 1000) return `${value}ms`;
  return `${Math.round(value / 100) / 10}s`;
}

function ScheduleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <span className="flex items-center gap-2 text-slate-700"><Route size={14} className="text-blue-600" />{label}</span>
      <span className="text-xs text-slate-500">{value}</span>
    </div>
  );
}
