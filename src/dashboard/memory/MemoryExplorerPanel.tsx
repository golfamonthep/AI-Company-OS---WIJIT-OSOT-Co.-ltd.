"use client";

import { Database, Search } from "lucide-react";
import { memoryItems } from "@/dashboard/data";
import { useControlCenterStore } from "@/dashboard/store";
import { DashboardPanel, MiniProgress, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { LiveDashboardSnapshot, MemoryItem } from "@/dashboard/types";

const typeTone = {
  company: "cyan",
  agent: "violet",
  decision: "amber",
  workflow: "green"
} as const;

export function MemoryExplorerPanel({ liveSnapshot }: { liveSnapshot?: LiveDashboardSnapshot | null }) {
  const memoryQuery = useControlCenterStore((state) => state.memoryQuery);
  const setMemoryQuery = useControlCenterStore((state) => state.setMemoryQuery);
  const liveMemory = getLiveMemoryItems(liveSnapshot);
  const items = liveMemory.length > 0 ? liveMemory : memoryItems;
  const filtered = items.filter((item) => `${item.title} ${item.summary} ${item.type}`.toLowerCase().includes(memoryQuery.toLowerCase()));
  const curation = liveSnapshot?.contentDepartment.memoryCurationSummary;

  return (
    <DashboardPanel id="memory">
      <PanelHeader title="ความจำองค์กร" description="ข้อมูลที่ระบบบันทึกจากเวิร์กโฟลว์ การอนุมัติ และบทเรียนที่นำกลับมาใช้ได้" action={<StatusPill tone="cyan">{items.length} รายการ</StatusPill>} />
      <div className="p-4">
        {curation ? (
          <div className="mb-4 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700">Memory curation summary</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <CurationStat label="Approved" value={curation.approvedPatternCount} />
                <CurationStat label="Rejected" value={curation.rejectedPatternCount} />
                <CurationStat label="Insights" value={curation.reviewerInsightCount} />
                <CurationStat label="Archive candidates" value={curation.archiveCandidateCount} />
              </div>
              {curation.repeatedIssueAlerts[0] ? <p className="mt-3 text-xs leading-5 text-amber-800">{curation.repeatedIssueAlerts[0]}</p> : null}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Top ranked memory patterns</p>
              <div className="mt-3 space-y-2">
                {curation.topRankedMemories.slice(0, 3).map((memory) => (
                  <div key={`${memory.title}-${memory.usefulnessScore}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{memory.title}</p>
                      <StatusPill tone={memory.archiveCandidate ? "amber" : memory.kind === "rejected_pattern" ? "rose" : "green"}>{memory.usefulnessScore}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-slate-600">{memory.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <div className="mb-4 flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3">
          <Search size={16} className="text-slate-400" />
          <input value={memoryQuery} onChange={(event) => setMemoryQuery(event.target.value)} placeholder="ค้นหาความจำ การตัดสินใจ หรือประวัติเวิร์กโฟลว์..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((memory) => (
            <div key={memory.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <Database size={17} className="text-blue-600" />
                <StatusPill tone={typeTone[memory.type]}>{memory.type}</StatusPill>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-950">{memory.title}</h3>
              <p className="mt-2 min-h-16 text-sm leading-5 text-slate-600">{memory.summary}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Relevance</span>
                  <span>{memory.relevance}%</span>
                </div>
                <MiniProgress value={memory.relevance} tone={typeTone[memory.type]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}

function CurationStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-blue-100 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function getLiveMemoryItems(snapshot?: LiveDashboardSnapshot | null): MemoryItem[] {
  if (!snapshot) return [];

  return snapshot.contentDepartment.memoryUpdates.map((memory, index) => ({
    id: `${memory.title}-${index}`,
    title: memory.title,
    type: memory.memory_type ? "company" : "workflow",
    relevance: Math.max(50, Math.min(100, (memory.importance ?? 7) * 10)),
    summary: memory.result_summary ?? memory.content ?? "Workflow memory update recorded for the Content Department MVP."
  }));
}
