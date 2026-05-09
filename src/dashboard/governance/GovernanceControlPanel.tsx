import { AlertOctagon, FileText, LockKeyhole, ShieldAlert } from "lucide-react";
import { DashboardPanel, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { LiveDashboardSnapshot } from "@/dashboard/types";

export function GovernanceControlPanel({ liveSnapshot }: { liveSnapshot?: LiveDashboardSnapshot | null }) {
  const pendingApprovals = liveSnapshot?.contentDepartment.pendingApprovals ?? 2;
  const auditCount = liveSnapshot?.contentDepartment.recentAuditLogs.length;
  const persistenceMode = liveSnapshot?.workspace.persistenceMode ?? "ready";
  const approvalStatus = liveSnapshot?.contentDepartment.approvalStatus ?? "pending";

  return (
    <DashboardPanel id="governance">
      <PanelHeader title="การควบคุมและตรวจสอบ" description="สิทธิ์การใช้งาน บันทึกตรวจสอบ และสถานะงานที่ต้องอนุมัติ" action={<StatusPill tone="green">บันทึกตรวจสอบพร้อม</StatusPill>} />
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <GovernanceTile icon={LockKeyhole} title="สิทธิ์การใช้งาน" value={persistenceMode} detail="ตรวจสิทธิ์ก่อนเริ่มงานหรือใช้งานเครื่องมือสำคัญ" tone="cyan" />
        <GovernanceTile icon={FileText} title="บันทึกตรวจสอบ" value={auditCount === undefined ? "พร้อม" : String(auditCount)} detail="บันทึกการอนุมัติ ความจำ และเหตุการณ์สำคัญ" tone="green" />
        <GovernanceTile icon={ShieldAlert} title="สถานะอนุมัติ" value={approvalStatus} detail={`${pendingApprovals} งานรออนุมัติ การเผยแพร่ภายนอกยังถูกปิดไว้`} tone="amber" />
        <GovernanceTile icon={AlertOctagon} title="หยุดฉุกเฉิน" value="พร้อม" detail="หยุดเวิร์กโฟลว์หรือการทำงานที่มีความเสี่ยงได้" tone="rose" />
      </div>
    </DashboardPanel>
  );
}

function GovernanceTile({ icon: Icon, title, value, detail, tone }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; value: string; detail: string; tone: "cyan" | "green" | "amber" | "rose" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <Icon size={18} className={tone === "rose" ? "text-rose-600" : tone === "amber" ? "text-amber-600" : tone === "green" ? "text-emerald-600" : "text-blue-600"} />
        <StatusPill tone={tone}>{value}</StatusPill>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p>
    </div>
  );
}
