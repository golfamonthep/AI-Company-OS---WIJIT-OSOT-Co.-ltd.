"use client";

import { CheckCircle2, CircleDot, Clock, GitBranch, MessageSquareText } from "lucide-react";
import { collaborationEvents, workflowNodes } from "@/dashboard/data";
import { DashboardPanel, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { LiveDashboardSnapshot, TimelineEvent, WorkflowNode } from "@/dashboard/types";

const stateStyle = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  running: "border-blue-200 bg-blue-50 text-blue-800",
  waiting_approval: "border-amber-200 bg-amber-50 text-amber-800",
  queued: "border-slate-200 bg-slate-50 text-slate-500"
};

export function WorkflowVisualizationPanel({ liveSnapshot }: { liveSnapshot?: LiveDashboardSnapshot | null }) {
  const liveNodes = getLiveWorkflowNodes(liveSnapshot);
  const nodes = liveNodes ?? workflowNodes;
  const events = getLiveTimeline(liveSnapshot) ?? collaborationEvents;
  const latestStatus = liveSnapshot?.contentDepartment.latestRun?.status;
  const generatedOutputs = liveSnapshot?.contentDepartment.generatedOutputs;
  const auditSummary = liveSnapshot?.contentDepartment.auditLogSummary ?? [];
  const memorySummary = liveSnapshot?.contentDepartment.memoryUpdateSummary ?? [];
  const feedbackSummary = liveSnapshot?.contentDepartment.feedbackSummary ?? [];

  return (
    <DashboardPanel id="workflows">
      <PanelHeader title="เวิร์กโฟลว์" description="ติดตามแคมเปญ Mother-and-baby TikTok ตั้งแต่เริ่มงาน สร้างคอนเทนต์ อนุมัติ จนถึงบันทึกความจำ" action={<StatusPill tone={latestStatus === "completed" ? "green" : "amber"}>{toThaiStatus(latestStatus ?? "ready")}</StatusPill>} />
      <div className="grid gap-4 p-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <GitBranch size={17} className="text-blue-600" />
            ขั้นตอนการทำงาน
          </div>
          <div className="grid gap-3 lg:grid-cols-6">
            {nodes.map((node, index) => (
              <div key={node.id} className="relative">
                {index < nodes.length - 1 ? <div className="absolute left-[calc(50%+18px)] top-5 hidden h-px w-[calc(100%-36px)] bg-slate-200 lg:block" /> : null}
                <div className={`relative min-h-[150px] rounded-lg border p-3 ${stateStyle[node.state]}`}>
                  <div className="flex items-center justify-between gap-2">
                    {node.state === "completed" ? <CheckCircle2 size={17} /> : node.state === "waiting_approval" ? <Clock size={17} /> : <CircleDot size={17} />}
                    <span className="text-xs">{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold leading-5">{node.label}</h3>
                  <p className="mt-2 text-xs opacity-75">{node.owner}</p>
                  <p className="mt-3 text-xs leading-5 opacity-85">{node.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <MessageSquareText size={17} className="text-blue-600" />
            เหตุการณ์ล่าสุด
          </div>
          <div className="space-y-3">
            {events.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="grid grid-cols-[44px_1fr] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">{event.time}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon size={15} className="text-blue-600" />
                      <p className="text-sm font-medium text-slate-950">{event.agent}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{event.event}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {liveSnapshot ? (
        <div className="grid gap-4 border-t border-slate-200 p-4 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-950">ผลงานที่สร้างแล้ว</div>
            {generatedOutputs ? (
              <div className="space-y-3">
                <SummaryList title="Hooks" items={generatedOutputs.hooks.slice(0, 3)} />
                <SummaryList title="Captions" items={generatedOutputs.captions.slice(0, 2).map((item) => item.caption)} />
                <SummaryList title="Scripts" items={generatedOutputs.scripts.slice(0, 2).map((item) => item.title)} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">เริ่มเวิร์กโฟลว์เพื่อแสดง hooks, captions และ scripts</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-950">บันทึกตรวจสอบ</div>
            {auditSummary.length ? (
              <div className="space-y-3">
                {auditSummary.slice(0, 4).map((item, index) => (
                  <div key={`${item.eventType}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{item.action ?? item.eventType} / {item.decision ?? "recorded"}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">บันทึกตรวจสอบจะแสดงหลังจากระบบเริ่มทำงาน</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-950">ความจำองค์กร</div>
            {memorySummary.length ? (
              <div className="space-y-3">
                {memorySummary.slice(0, 4).map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{item.type ?? "memory"}</p>
                    <p className="mt-1 text-sm font-medium text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">ความจำจะถูกบันทึกหลังสร้างงานและอนุมัติ</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-950">การเรียนรู้</div>
            {feedbackSummary.length ? (
              <div className="space-y-3">
                {feedbackSummary.slice(0, 3).map((item, index) => (
                  <div key={`${item.eventType ?? "feedback"}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{item.status ?? "recorded"} / {item.score ? `${item.score}/5` : "unscored"}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">คะแนนและหมายเหตุจะแสดงหลังจากอนุมัติหรือขอแก้ไข</p>
            )}
          </div>
        </div>
      ) : null}
    </DashboardPanel>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="text-sm leading-5 text-slate-600">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function getLiveWorkflowNodes(snapshot?: LiveDashboardSnapshot | null): WorkflowNode[] | null {
  const latestRun = snapshot?.contentDepartment.latestRun;
  if (!snapshot || !latestRun) return null;

  const hooksGenerated = Number(latestRun.metrics?.hooksGenerated ?? 0);
  const scriptsGenerated = Number(latestRun.metrics?.scriptsGenerated ?? 0);
  const captionsGenerated = Number(latestRun.metrics?.captionsGenerated ?? 0);
  const approvalRequired = Boolean(latestRun.metrics?.approvalRequired);
  const completed = latestRun.status === "completed";

  return [
    { id: "mvp-brief", label: "รับ brief", owner: "Workflow Engine", state: "completed", detail: latestRun.objective ?? "รับโจทย์แคมเปญแล้ว" },
    { id: "mvp-marketing", label: "วิเคราะห์กลุ่มเป้าหมาย", owner: "Marketing AI", state: "completed", detail: "สร้างกลุ่มเป้าหมาย pain points และมุมคอนเทนต์" },
    { id: "mvp-content", label: "สร้างคอนเทนต์", owner: "Content Creator AI", state: "completed", detail: `${hooksGenerated} hooks, ${scriptsGenerated} scripts, ${captionsGenerated} captions` },
    { id: "mvp-governance", label: "รออนุมัติ", owner: "Human + CEO", state: completed ? "completed" : approvalRequired ? "waiting_approval" : "queued", detail: completed ? "อนุมัติเรียบร้อยแล้ว" : "ยังไม่อนุญาตให้เผยแพร่ภายนอก" },
    { id: "mvp-memory", label: "บันทึกความจำ", owner: "Memory Layer", state: completed ? "completed" : "queued", detail: `${snapshot.contentDepartment.memoryUpdates.length} รายการล่าสุด` },
    { id: "mvp-learning", label: "บันทึกการเรียนรู้", owner: "Learning Layer", state: snapshot.contentDepartment.learningEvents.length > 0 ? "completed" : "queued", detail: `${snapshot.contentDepartment.learningEvents.length} เหตุการณ์ที่ตรวจสอบได้` }
  ];
}

function toThaiStatus(status: string) {
  const map: Record<string, string> = {
    ready: "พร้อม",
    completed: "เสร็จสิ้น",
    waiting_approval: "รออนุมัติ",
    changes_requested: "ขอแก้ไข",
    running: "กำลังทำงาน",
    failed: "ล้มเหลว"
  };
  return map[status] ?? status;
}

function getLiveTimeline(snapshot?: LiveDashboardSnapshot | null): TimelineEvent[] | null {
  if (!snapshot?.contentDepartment.recentAuditLogs.length) return null;

  return snapshot.contentDepartment.recentAuditLogs.slice(0, 6).map((event, index) => ({
    id: `${event.event_type}-${index}`,
    agent: event.action,
    event: event.summary,
    time: event.created_at ? new Date(event.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "latest",
    icon: event.decision === "approved" ? CheckCircle2 : event.decision === "requires_approval" ? Clock : CircleDot
  }));
}
