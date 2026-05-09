import type { GovernanceApprovalRequest, GovernanceAuditEvent, EmergencyControlState } from "@/modules/agent-runtime/governance/types";

export type OversightDashboardSnapshot = {
  approvals: {
    requested: number;
    approved: number;
    rejected: number;
    changesRequested: number;
  };
  audit: {
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
  };
  emergency: EmergencyControlState | null;
};

export function buildOversightDashboardSnapshot(input: {
  approvals: GovernanceApprovalRequest[];
  auditEvents: GovernanceAuditEvent[];
  emergencyState?: EmergencyControlState;
}): OversightDashboardSnapshot {
  return {
    approvals: {
      requested: input.approvals.filter((approval) => approval.status === "requested").length,
      approved: input.approvals.filter((approval) => approval.status === "approved").length,
      rejected: input.approvals.filter((approval) => approval.status === "rejected").length,
      changesRequested: input.approvals.filter((approval) => approval.status === "changes_requested").length
    },
    audit: {
      totalEvents: input.auditEvents.length,
      criticalEvents: input.auditEvents.filter((event) => event.severity === "critical").length,
      highEvents: input.auditEvents.filter((event) => event.severity === "high").length
    },
    emergency: input.emergencyState ?? null
  };
}
