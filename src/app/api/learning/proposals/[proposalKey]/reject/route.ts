import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { learningDecisionSchema } from "@/server/api/schemas";
import { auditApiAction } from "@/server/api/audit";
import { LearningRepository } from "@/database/repositories/LearningRepository";

type RouteContext = { params: Promise<{ proposalKey: string }> };

export function POST(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { proposalKey } = await contextParams.params;
    const context = createApiContext(request);
    const body = await parseJsonBody(request, learningDecisionSchema);
    const repo = new LearningRepository(context.persistence);
    const current = await repo.findProposalByKey(context.organizationId, proposalKey);
    const proposal = await repo.saveProposal({
      organization_id: context.organizationId,
      proposal_key: proposalKey,
      proposal_type: current.data?.proposal_type ?? "skill_improvement",
      target_type: current.data?.target_type ?? "skill",
      target_id: current.data?.target_id ?? "unknown",
      title: current.data?.title ?? proposalKey,
      summary: current.data?.summary ?? body.notes,
      proposed_change: current.data?.proposed_change ?? {},
      evidence: current.data?.evidence ?? [],
      status: "rejected",
      metadata: { ...(current.data?.metadata ?? {}), reviewerId: body.reviewerId, notes: body.notes }
    });
    await auditApiAction(context, { eventType: "learning_proposal_rejected", summary: `Learning proposal rejected: ${proposalKey}`, severity: "medium", decision: "denied", metadata: { proposalKey } });
    return { proposal, persistenceMode: context.persistenceMode };
  });
}
