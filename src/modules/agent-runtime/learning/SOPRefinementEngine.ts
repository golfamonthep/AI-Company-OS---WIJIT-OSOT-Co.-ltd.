import type { ImprovementProposal, LearningInsight } from "@/modules/agent-runtime/learning/types";

const protectedTargets = ["governance", "permission", "audit", "core-runtime", "agent-runtime"];

export class SOPRefinementEngine {
  createImprovementProposal(input: {
    organizationId: string;
    insight: LearningInsight;
    targetId: string;
    proposedChange?: string;
  }): ImprovementProposal {
    const blocked = isProtectedTarget(input.targetId);

    return {
      proposalId: `learning-proposal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: input.organizationId,
      type: input.insight.type,
      targetType: resolveTargetType(input.insight),
      targetId: input.targetId,
      title: blocked ? `Blocked improvement proposal for protected target ${input.targetId}` : `Improve ${input.targetId}`,
      summary: input.insight.summary,
      rationale: input.insight.evidence.length ? input.insight.evidence.join("; ") : input.insight.recommendedAction,
      proposedChange: blocked ? "No change allowed. Protected governance/core targets cannot be modified by learning." : input.proposedChange ?? input.insight.recommendedAction,
      expectedBenefit: blocked ? "None. Proposal is blocked for safety." : "Improve future output quality and reduce repeated correction patterns.",
      createdByAgentId: input.insight.targetAgentId ?? "learning-system",
      status: blocked ? "rejected" : "proposed",
      riskLevel: blocked ? "blocked" : input.insight.riskLevel,
      requiresHumanApproval: true,
      safeguards: [
        "Proposal only; do not mutate source files automatically.",
        "Human approval required before any SOP or workflow document is changed.",
        "Governance, permissions, audit systems, and core runtime architecture are protected."
      ],
      evidence: input.insight.evidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  createHookSOPProposal(input: {
    organizationId: string;
    targetSkillId: string;
    highPerformingPatterns: string[];
    rejectedPatterns: string[];
  }): ImprovementProposal {
    const proposedChange = [
      "Suggested SOP refinement:",
      ...input.highPerformingPatterns.map((pattern) => `- Prefer: ${pattern}`),
      ...input.rejectedPatterns.map((pattern) => `- Avoid: ${pattern}`)
    ].join("\n");

    return {
      proposalId: `learning-proposal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: input.organizationId,
      type: "skill_improvement",
      targetType: "skill",
      targetId: input.targetSkillId,
      title: "Refine Hook Generation SOP from reviewer feedback",
      summary: "Reviewer approved most hooks and rejected patterns that felt too generic or claim-heavy.",
      rationale: "Approved hooks used reassurance and practical checklist framing; rejected hooks were too broad or implied unsupported outcomes.",
      proposedChange,
      expectedBenefit: "Future hooks should better match brand voice and approval standards.",
      createdByAgentId: "content-creator",
      status: "proposed",
      riskLevel: "low",
      requiresHumanApproval: true,
      safeguards: [
        "Apply only after human review.",
        "Do not change governance or permission rules.",
        "Store as SOP refinement note before editing SKILLS.md."
      ],
      evidence: [...input.highPerformingPatterns, ...input.rejectedPatterns],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

function resolveTargetType(insight: LearningInsight): ImprovementProposal["targetType"] {
  if (insight.targetSkillId) return "skill";
  if (insight.targetWorkflowId) return "workflow";
  if (insight.type === "memory_optimization") return "memory";
  if (insight.type === "collaboration_optimization") return "collaboration";
  if (insight.type === "prompt_refinement") return "prompt";
  return "decision";
}

function isProtectedTarget(targetId: string) {
  const normalized = targetId.toLowerCase();
  return protectedTargets.some((target) => normalized.includes(target));
}
