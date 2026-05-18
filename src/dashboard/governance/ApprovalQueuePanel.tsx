"use client";

import { useState } from "react";
import { Check, FileWarning, ShieldCheck, X } from "lucide-react";
import { approvals } from "@/dashboard/data";
import { useControlCenterStore } from "@/dashboard/store";
import { DashboardPanel, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { ApprovalItem, LiveDashboardSnapshot } from "@/dashboard/types";

const riskTone = {
  low: "green",
  medium: "amber",
  high: "rose"
} as const;

const approvalStatusLabels: Record<ApprovalItem["status"], string> = {
  requested: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  changes_requested: "ขอแก้ไข"
};

export function ApprovalQueuePanel({
  liveSnapshot,
  onSnapshotUpdated
}: {
  liveSnapshot?: LiveDashboardSnapshot | null;
  onSnapshotUpdated?: () => Promise<LiveDashboardSnapshot | null>;
}) {
  const focusId = useControlCenterStore((state) => state.approvalFocusId);
  const setFocusId = useControlCenterStore((state) => state.setApprovalFocusId);
  const [actionState, setActionState] = useState<"idle" | "approving" | "requesting_changes">("idle");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [revisionReason, setRevisionReason] = useState("");
  const liveApprovals = getLiveApprovals(liveSnapshot);
  const approvalItems = liveApprovals.length > 0 ? liveApprovals : approvals;
  const focus = approvalItems.find((approval) => approval.id === focusId) ?? approvalItems[0];
  const focusRunKey = getRunKeyForApproval(liveSnapshot, focus);
  const canActOnLiveApproval = Boolean(liveSnapshot && focusRunKey && focus.status === "requested" && liveApprovals.some((approval) => approval.id === focus.id));

  async function decide(decision: "approved" | "changes_requested") {
    if (!focusRunKey) return;
    setActionState(decision === "approved" ? "approving" : "requesting_changes");
    setMessage(null);

    try {
      const response = await fetch("/api/live/content-department/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runKey: focusRunKey,
          decision,
          approvalNotes: decision === "approved" ? "Approved from dashboard Approval Queue." : "Changes requested from dashboard Approval Queue.",
          outputScore: decision === "approved" ? 4 : 3,
          workflowSatisfaction: decision === "approved" ? 4 : 3,
          thumbs: decision === "approved" ? "up" : "down",
          qualityNotes: decision === "approved" ? "Dashboard reviewer approved this MVP output for internal use." : revisionReason.trim(),
          rejectionReason: decision === "changes_requested" ? revisionReason.trim() : undefined
        })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Approval action failed.");
      setMessage({ tone: "success", text: decision === "approved" ? "อนุมัติเรียบร้อยแล้ว และรีเฟรชแดชบอร์ดแล้ว" : "บันทึกคำขอแก้ไขแล้ว และรีเฟรชแดชบอร์ดแล้ว" });
      if (decision === "approved") setRevisionReason("");
      await onSnapshotUpdated?.();
    } catch (caught) {
      setMessage({ tone: "error", text: caught instanceof Error ? caught.message : "ไม่สามารถบันทึกการอนุมัติได้" });
    } finally {
      setActionState("idle");
    }
  }

  return (
    <DashboardPanel id="approval-queue">
      <PanelHeader title="งานที่รออนุมัติ" description="รายการที่ต้องให้คนตรวจสอบก่อนนำผลลัพธ์ไปใช้ในงานจริง" action={<StatusPill tone="amber">{approvalItems.filter((item) => item.status === "requested").length} รออนุมัติ</StatusPill>} />
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {approvalItems.map((approval) => (
            <button key={approval.id} onClick={() => setFocusId(approval.id)} className={`w-full rounded-lg border p-4 text-left transition ${focusId === approval.id ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{approval.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">ผู้ขออนุมัติ: {approval.requester} / หมวดงาน: {approval.domain}</p>
                </div>
                <div className="flex gap-2">
                  <StatusPill tone={riskTone[approval.risk]}>{toThaiRisk(approval.risk)}</StatusPill>
                  <StatusPill tone={approval.status === "approved" ? "green" : "amber"}>{approvalStatusLabels[approval.status]}</StatusPill>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <ShieldCheck size={17} className="text-amber-600" />
            รายละเอียดการอนุมัติ
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">{focus.title}</p>
          <div className="mt-4 grid gap-2 text-sm">
            <p className="text-slate-500">ผู้ขอ <span className="float-right text-slate-800">{focus.requester}</span></p>
            <p className="text-slate-500">หมวดงาน <span className="float-right text-slate-800">{focus.domain}</span></p>
            <p className="text-slate-500">ความเสี่ยง <span className="float-right text-slate-800">{toThaiRisk(focus.risk)}</span></p>
            <p className="text-slate-500">เวิร์กโฟลว์ <span className="float-right max-w-40 truncate text-slate-800">{focusRunKey ?? "ข้อมูลตัวอย่าง"}</span></p>
          </div>
          {message ? (
            <p className={`mt-4 rounded-md border p-3 text-sm ${message.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {message.text}
            </p>
          ) : null}
          <label className="mt-4 grid gap-2 text-xs font-medium text-slate-500">
            เหตุผลเมื่อต้องการขอแก้ไข
            <textarea
              value={revisionReason}
              onChange={(event) => setRevisionReason(event.target.value)}
              rows={3}
              placeholder="เช่น ขอปรับข้อความให้ชัดขึ้น หรือหลีกเลี่ยงคำกล่าวอ้างที่ยังไม่มีหลักฐาน"
              className="resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
            <ActionButton disabled={!canActOnLiveApproval || actionState !== "idle"} tone="green" onClick={() => void decide("approved")}>
              <Check size={16} />
              {actionState === "approving" ? "กำลังอนุมัติ" : "อนุมัติ"}
            </ActionButton>
            <ActionButton disabled={!canActOnLiveApproval || actionState !== "idle" || !revisionReason.trim()} tone="amber" onClick={() => void decide("changes_requested")}>
              <FileWarning size={16} />
              {actionState === "requesting_changes" ? "กำลังบันทึก" : "ขอแก้ไข"}
            </ActionButton>
            <ActionButton disabled tone="rose" title="MVP ยังไม่เปิดใช้การปฏิเสธถาวร กรุณาใช้ขอแก้ไขเพื่อให้ตรวจสอบย้อนหลังได้">
              <X size={16} />
              ปฏิเสธ
            </ActionButton>
          </div>
          {!canActOnLiveApproval ? <p className="mt-3 text-xs leading-5 text-slate-500">ปุ่มอนุมัติจะใช้งานได้เมื่อมีงาน Content Production จริงที่อยู่ในสถานะรออนุมัติ ข้อมูลตัวอย่างเป็นแบบอ่านอย่างเดียว</p> : null}
        </div>
      </div>
    </DashboardPanel>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  title,
  tone
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  tone: "green" | "amber" | "rose";
}) {
  const colors = {
    green: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    amber: "border-amber-200 text-amber-800 hover:bg-amber-50",
    rose: "border-rose-200 text-rose-700 hover:bg-rose-50"
  };

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${colors[tone]}`}
    >
      {children}
    </button>
  );
}

function toThaiRisk(risk: ApprovalItem["risk"]) {
  const map = { low: "ต่ำ", medium: "ปานกลาง", high: "สูง" };
  return map[risk];
}

function getLiveApprovals(snapshot?: LiveDashboardSnapshot | null): ApprovalItem[] {
  if (!snapshot) return [];

  return snapshot.contentDepartment.recentApprovals.map((approval) => ({
    id: approval.approval_key,
    title: approval.subject,
    requester: approval.requester_agent_key,
    domain: approval.domain,
    risk: toApprovalRisk(approval.metadata?.risk),
    status: approval.status === "approved" ? "approved" : approval.status === "changes_requested" ? "changes_requested" : "requested"
  }));
}

function getRunKeyForApproval(snapshot: LiveDashboardSnapshot | null | undefined, approval: ApprovalItem | undefined) {
  if (!snapshot || !approval) return undefined;

  const source = snapshot.contentDepartment.recentApprovals.find((item) => item.approval_key === approval.id);
  const workflowRunKey = source?.metadata?.workflowRunKey;
  if (typeof workflowRunKey === "string") return workflowRunKey;
  return snapshot.contentDepartment.latestRun?.run_key;
}

function toApprovalRisk(value: unknown): ApprovalItem["risk"] {
  if (value === "low" || value === "medium" || value === "high") return value;
  return "medium";
}
