"use client";

import { Bot, Database, KeyRound, ListChecks } from "lucide-react";
import { agents } from "@/dashboard/data";
import { useControlCenterStore } from "@/dashboard/store";
import { DashboardPanel, MiniProgress, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";

const statusTone = {
  active: "green",
  waiting: "amber",
  review: "violet",
  idle: "slate"
} as const;

export function AgentMonitoringPanel() {
  const selectedAgentId = useControlCenterStore((state) => state.selectedAgentId);
  const setSelectedAgentId = useControlCenterStore((state) => state.setSelectedAgentId);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];

  return (
    <DashboardPanel id="agents">
      <PanelHeader title="ทีม AI" description="สถานะทีม AI งานที่กำลังทำ สิทธิ์การใช้งาน และขอบเขตความจำ" action={<StatusPill tone="cyan">8 ทีม</StatusPill>} />
      <div className="grid gap-4 p-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {agents.map((agent) => (
            <button key={agent.id} onClick={() => setSelectedAgentId(agent.id)} className={`rounded-lg border p-4 text-left transition ${selectedAgentId === agent.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-blue-600" />
                    <h3 className="truncate text-sm font-semibold text-slate-950">{agent.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{agent.role}</p>
                </div>
                <StatusPill tone={statusTone[agent.status]}>{agent.status}</StatusPill>
              </div>
              <p className="mt-4 min-h-10 text-sm leading-5 text-slate-600">{agent.currentTask}</p>
              <div className="mt-4 grid gap-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>คะแนนทักษะ</span>
                  <span>{agent.skillScore}%</span>
                </div>
                <MiniProgress value={agent.skillScore} tone="cyan" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>ภาระงาน</span>
                  <span>{agent.workload}%</span>
                </div>
                <MiniProgress value={agent.workload} tone={agent.workload > 70 ? "amber" : "violet"} />
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">ทีมที่เลือก</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">{selectedAgent.name}</h3>
            </div>
            <StatusPill tone={statusTone[selectedAgent.status]}>{selectedAgent.status}</StatusPill>
          </div>
          <div className="mt-5 space-y-4">
            <InfoRow icon={ListChecks} label="งานปัจจุบัน" value={selectedAgent.currentTask} />
            <InfoRow icon={KeyRound} label="สิทธิ์" value={selectedAgent.permission} />
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-950">
                <Database size={16} className="text-emerald-600" />
                เข้าถึงความจำ
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.memoryAccess.map((scope) => (
                  <StatusPill key={scope} tone="green">{scope}</StatusPill>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">เหตุการณ์ล่าสุด</p>
              <p className="mt-1 text-sm text-slate-600">{selectedAgent.lastEvent}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon size={15} className="text-blue-600" />
        {label}
      </div>
      <p className="mt-2 text-sm leading-5 text-slate-600">{value}</p>
    </div>
  );
}
