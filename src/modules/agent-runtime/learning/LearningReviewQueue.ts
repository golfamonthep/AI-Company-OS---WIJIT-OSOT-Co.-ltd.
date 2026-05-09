import type { SupabaseClient } from "@supabase/supabase-js";
import { createLearningAuditEvent, saveLearningAuditEvent } from "@/modules/agent-runtime/learning/LearningAuditLogger";
import type { ImprovementProposal, LearningReviewStatus } from "@/modules/agent-runtime/learning/types";

export class LearningReviewQueue {
  private readonly proposals: ImprovementProposal[] = [];

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async enqueue(proposal: ImprovementProposal) {
    const safeProposal = enforceReviewBoundary(proposal);
    this.proposals.push(safeProposal);
    await this.saveProposal(safeProposal);
    await saveLearningAuditEvent(
      this.supabase,
      createLearningAuditEvent({
        organizationId: safeProposal.organizationId,
        actorId: safeProposal.createdByAgentId,
        eventType: "learning_proposal_queued",
        summary: safeProposal.title,
        proposalId: safeProposal.proposalId,
        targetId: safeProposal.targetId,
        status: safeProposal.status,
        metadata: { proposal: safeProposal }
      })
    );
    return safeProposal;
  }

  async review(input: {
    proposalId: string;
    reviewerId: string;
    decision: Exclude<LearningReviewStatus, "proposed" | "archived">;
    notes: string;
  }) {
    const proposal = this.proposals.find((item) => item.proposalId === input.proposalId);
    if (!proposal) return undefined;

    const decision = input.decision === "approved" && input.reviewerId !== "human" ? "changes_requested" : input.decision;
    proposal.status = decision;
    proposal.reviewerId = input.reviewerId;
    proposal.reviewNotes = input.reviewerId !== "human" && input.decision === "approved" ? "Only human reviewers can approve learning proposals. Approval converted to changes_requested." : input.notes;
    proposal.updatedAt = new Date().toISOString();

    await this.saveProposal(proposal);
    await saveLearningAuditEvent(
      this.supabase,
      createLearningAuditEvent({
        organizationId: proposal.organizationId,
        actorId: input.reviewerId === "human" ? "human" : "learning-system",
        eventType: "learning_proposal_reviewed",
        summary: `${proposal.title}: ${proposal.status}`,
        proposalId: proposal.proposalId,
        targetId: proposal.targetId,
        status: proposal.status,
        metadata: { proposal }
      })
    );

    return proposal;
  }

  list(status?: LearningReviewStatus) {
    return status ? this.proposals.filter((proposal) => proposal.status === status) : [...this.proposals];
  }

  get(proposalId: string) {
    return this.proposals.find((proposal) => proposal.proposalId === proposalId);
  }

  private async saveProposal(proposal: ImprovementProposal) {
    if (!this.supabase) return;

    await this.supabase.from("learning_improvement_proposals").upsert(
      {
        organization_id: proposal.organizationId,
        proposal_key: proposal.proposalId,
        improvement_type: proposal.type,
        target_type: proposal.targetType,
        target_id: proposal.targetId,
        title: proposal.title,
        summary: proposal.summary,
        rationale: proposal.rationale,
        proposed_change: proposal.proposedChange,
        expected_benefit: proposal.expectedBenefit,
        created_by_agent_id: proposal.createdByAgentId,
        status: proposal.status,
        risk_level: proposal.riskLevel,
        requires_human_approval: proposal.requiresHumanApproval,
        safeguards: proposal.safeguards,
        evidence: proposal.evidence,
        reviewer_id: proposal.reviewerId,
        review_notes: proposal.reviewNotes,
        created_at: proposal.createdAt,
        updated_at: proposal.updatedAt
      },
      { onConflict: "organization_id,proposal_key" }
    );
  }
}

function enforceReviewBoundary(proposal: ImprovementProposal): ImprovementProposal {
  return {
    ...proposal,
    requiresHumanApproval: true,
    status: proposal.riskLevel === "blocked" ? "rejected" : proposal.status
  };
}
