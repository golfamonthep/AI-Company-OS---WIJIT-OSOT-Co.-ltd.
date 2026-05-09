"use client";

import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, CheckCircle2, Clock, RefreshCcw } from "lucide-react";
import { kpiSeries, learningProposals } from "@/dashboard/data";
import { DashboardPanel, MiniProgress, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { LearningProposal, LiveDashboardSnapshot } from "@/dashboard/types";

export function LearningAnalyticsPanel({
  liveSnapshot,
  onSnapshotUpdated
}: {
  liveSnapshot?: LiveDashboardSnapshot | null;
  onSnapshotUpdated?: () => Promise<LiveDashboardSnapshot | null>;
}) {
  const liveLearning = getLiveLearningItems(liveSnapshot);
  const items = liveLearning.length > 0 ? liveLearning : learningProposals;
  const latestFeedback = liveSnapshot?.contentDepartment.learningEvents[0]?.summary ?? "Human reviewer approved 8/10 hooks and rejected 2 claim-heavy patterns.";
  const qualitySummary = liveSnapshot?.contentDepartment.qualityReviewSummary;
  const curationSummary = liveSnapshot?.contentDepartment.memoryCurationSummary;
  const skillProposals = liveSnapshot?.contentDepartment.skillImprovementProposals ?? [];
  const bestOutput = liveSnapshot?.contentDepartment.bestPerformingOutputs?.[0];
  const lowAlert = liveSnapshot?.contentDepartment.lowPerformingOutputAlerts?.[0];
  const [proposalAction, setProposalAction] = useState<string | null>(null);
  const [proposalMessage, setProposalMessage] = useState<string | null>(null);

  async function decideProposal(proposalKey: string, decision: "approve" | "reject") {
    setProposalAction(`${decision}:${proposalKey}`);
    setProposalMessage(null);
    try {
      const response = await fetch(`/api/learning/proposals/${proposalKey}/${decision}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reviewerId: "dashboard-human-reviewer",
          notes: decision === "approve" ? "Approved from dashboard learning panel. Apply in a controlled future skill update." : "Rejected from dashboard learning panel."
        })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Learning proposal decision failed.");
      setProposalMessage(decision === "approve" ? "อนุมัติ proposal แล้ว รอขั้นตอนนำไปใช้แบบควบคุม" : "ปฏิเสธ proposal แล้ว");
      await onSnapshotUpdated?.();
    } catch (caught) {
      setProposalMessage(caught instanceof Error ? caught.message : "ไม่สามารถบันทึกผล proposal ได้");
    } finally {
      setProposalAction(null);
    }
  }

  return (
    <DashboardPanel id="learning">
      <PanelHeader title="การเรียนรู้" description="บทเรียนจาก feedback การอนุมัติ และคุณภาพของผลลัพธ์ เพื่อปรับปรุงงานรอบถัดไป" action={<StatusPill tone="violet">{items.length} เหตุการณ์</StatusPill>} />
      <div className="grid gap-4 p-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <BrainCircuit size={17} className="text-indigo-600" />
            แนวโน้มคุณภาพงาน
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiSeries}>
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis hide domain={[70, 95]} />
                <Tooltip contentStyle={{ background: "#0b1118", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0" }} />
                <Line type="monotone" dataKey="quality" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3, fill: "#a78bfa" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Feedback ล่าสุด</p>
            <p className="mt-1 text-sm text-slate-600">{latestFeedback}</p>
          </div>
          {qualitySummary ? (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-medium text-blue-700">Content Creator quality review</p>
              <p className="mt-1 text-sm leading-5 text-blue-800">
                Overall {qualitySummary.overallScore}/10 ({qualitySummary.qualityCategory}) from {qualitySummary.reviewedOutputCount} reviewed output(s). Approved {qualitySummary.approvedCount}, rejected {qualitySummary.rejectedCount}.
              </p>
              {qualitySummary.learningInsights[0] ? <p className="mt-2 text-xs leading-5 text-blue-700">{qualitySummary.learningInsights[0]}</p> : null}
            </div>
          ) : null}
          {bestOutput ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-700">Best-performing output</p>
              <p className="mt-1 text-sm leading-5 text-emerald-800">{bestOutput.text}</p>
            </div>
          ) : null}
          {lowAlert ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-medium text-rose-700">Low-performing output alert</p>
              <p className="mt-1 text-sm leading-5 text-rose-800">{lowAlert.reason}</p>
            </div>
          ) : null}
          {curationSummary ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-medium text-slate-500">Memory curation</p>
              <p className="mt-1 text-sm leading-5 text-slate-700">
                Approved {curationSummary.approvedPatternCount}, rejected {curationSummary.rejectedPatternCount}, insights {curationSummary.reviewerInsightCount}, archive candidates {curationSummary.archiveCandidateCount}.
              </p>
              {curationSummary.repeatedIssueAlerts[0] ? <p className="mt-2 text-xs leading-5 text-amber-700">{curationSummary.repeatedIssueAlerts[0]}</p> : null}
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          {skillProposals.map((proposal) => (
            <div key={proposal.proposalKey} className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{proposal.title}</h3>
                  <p className="mt-1 text-xs text-indigo-700">Target skill: {proposal.targetSkillId}</p>
                </div>
                <StatusPill tone={proposal.status === "approved" ? "green" : proposal.status === "rejected" ? "rose" : "violet"}>{proposal.status}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-5 text-slate-700">{proposal.summary}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Human approval is required before this changes future skill execution notes. No skill file is rewritten automatically.</p>
              {proposal.status === "proposed" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={Boolean(proposalAction)} onClick={() => void decideProposal(proposal.proposalKey, "approve")} className="rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                    {proposalAction === `approve:${proposal.proposalKey}` ? "กำลังอนุมัติ..." : "อนุมัติ proposal"}
                  </button>
                  <button type="button" disabled={Boolean(proposalAction)} onClick={() => void decideProposal(proposal.proposalKey, "reject")} className="rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                    {proposalAction === `reject:${proposal.proposalKey}` ? "กำลังปฏิเสธ..." : "ปฏิเสธ"}
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          {proposalMessage ? <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">{proposalMessage}</p> : null}
          {items.map((proposal) => (
            <div key={proposal.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{proposal.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">หัวข้อ: {proposal.target}</p>
                </div>
                <StatusPill tone={proposal.status === "approved" ? "green" : proposal.status === "changes_requested" ? "amber" : "violet"}>{proposal.status}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-5 text-slate-600">{proposal.evidence}</p>
              <div className="mt-4 flex items-center gap-3">
                {proposal.status === "approved" ? <CheckCircle2 size={16} className="text-emerald-600" /> : proposal.status === "changes_requested" ? <RefreshCcw size={16} className="text-amber-600" /> : <Clock size={16} className="text-indigo-600" />}
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Confidence</span>
                    <span>{proposal.score}%</span>
                  </div>
                  <MiniProgress value={proposal.score} tone="violet" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}

function getLiveLearningItems(snapshot?: LiveDashboardSnapshot | null): LearningProposal[] {
  if (!snapshot) return [];

  return snapshot.contentDepartment.learningEvents.map((event, index) => ({
    id: `${event.event_type}-${index}`,
    title: readableEventTitle(event.event_type),
    target: "content-department-mvp",
    score: normalizeScore(event.score, event.status),
    status: event.status === "approved" ? "approved" : event.status === "changes_requested" ? "changes_requested" : "proposed",
    evidence: event.summary
  }));
}

function normalizeScore(score: number | undefined, status: string): number {
  const value = score ?? (status === "approved" ? 1 : 0.74);
  return Math.round(value <= 1 ? value * 100 : value);
}

function readableEventTitle(eventType: string): string {
  return eventType
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
