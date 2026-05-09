import type { AgentCommunicationEnvelope, AgentRoleTarget, AgentRoutingDecision } from "@/modules/communications/types";

const keywordRoutes: Array<{ role: AgentRoleTarget; keywords: string[]; reason: string }> = [
  { role: "cto", keywords: ["api", "database", "automation", "architecture", "technical", "bug", "integration"], reason: "Technical or system architecture request" },
  { role: "marketing", keywords: ["campaign", "growth", "audience", "positioning", "ads", "market"], reason: "Marketing and growth request" },
  { role: "content", keywords: ["content", "caption", "post", "script", "calendar", "copy"], reason: "Content production request" },
  { role: "video", keywords: ["video", "edit", "reel", "short", "production"], reason: "Video production request" },
  { role: "cfo", keywords: ["budget", "finance", "cost", "revenue", "pricing", "cashflow"], reason: "Financial decision request" },
  { role: "rd", keywords: ["research", "product", "experiment", "claim", "formula", "innovation"], reason: "Research and development request" },
  { role: "admin", keywords: ["document", "schedule", "file", "admin", "operation", "coordinate"], reason: "Administrative operation request" }
];

export function routeAgentCommunication(envelope: AgentCommunicationEnvelope): AgentRoutingDecision {
  if (envelope.targetRole) {
    return buildDecision(envelope.targetRole, "Explicit target role requested", envelope);
  }

  if (envelope.recipientAgentId) {
    return buildDecision("ceo", "Explicit recipient agent provided; role lookup should happen in repository layer", envelope);
  }

  const searchable = `${envelope.subject} ${envelope.body}`.toLowerCase();
  const match = keywordRoutes.find((route) => route.keywords.some((keyword) => searchable.includes(keyword)));

  return buildDecision(match?.role ?? "ceo", match?.reason ?? "Default strategic routing to CEO AI", envelope);
}

function buildDecision(targetRole: AgentRoleTarget, reason: string, envelope: AgentCommunicationEnvelope): AgentRoutingDecision {
  const shouldEscalate = envelope.type === "escalation" || envelope.priority === "critical";
  const requiresApproval = envelope.type === "approval_request" || envelope.priority === "critical";

  return {
    targetRole,
    reason,
    requiresApproval,
    shouldEscalate,
    notificationPriority: shouldEscalate ? "critical" : envelope.priority
  };
}
