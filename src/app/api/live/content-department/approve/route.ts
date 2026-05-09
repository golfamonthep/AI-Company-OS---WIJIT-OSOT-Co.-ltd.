import { z } from "zod";
import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import { createApiContext } from "@/server/api/auth";
import { badRequest } from "@/server/api/errors";
import { requireApiApprovalAuthority, requireApiPermission } from "@/server/api/permissions";
import { routeHandler } from "@/server/api/routeHandler";

const approveSchema = z.object({
  runKey: z.string().min(1),
  decision: z.enum(["approved", "changes_requested"]).default("approved"),
  approvalNotes: z.string().optional(),
  outputScore: z.number().min(1).max(10).optional(),
  thumbs: z.enum(["up", "down"]).optional(),
  workflowSatisfaction: z.number().min(1).max(10).optional(),
  qualityNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  contentReviews: z
    .array(
      z.object({
        outputType: z.enum(["hook", "caption", "script", "cta", "thumbnail", "shooting_note", "hashtag"]),
        outputIndex: z.number().int().min(0),
        text: z.string().min(1),
        decision: z.enum(["approved", "rejected"]),
        scores: z.object({
          hookStrength: z.number().min(1).max(10).optional(),
          emotionalImpact: z.number().min(1).max(10).optional(),
          thaiNaturalness: z.number().min(1).max(10).optional(),
          retentionPotential: z.number().min(1).max(10).optional(),
          ctaEffectiveness: z.number().min(1).max(10).optional(),
          clarity: z.number().min(1).max(10).optional(),
          businessUsefulness: z.number().min(1).max(10).optional(),
          audienceRelevance: z.number().min(1).max(10).optional()
        }),
        feedbackNotes: z.string().optional(),
        improvementSuggestion: z.string().optional()
      })
    )
    .optional()
});

export async function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    requireApiPermission(context, "approval:approve_content");
    requireApiApprovalAuthority(context, "normal");

    const body = await request.json();
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid Content Department approval payload.", parsed.error.flatten());
    const input = parsed.data;
    const result = await new ContentDepartmentLiveMvpService(context).approveMotherBabyCampaign(input);

    return {
      ok: true,
      data: result,
      meta: {
        persistenceMode: context.persistenceMode,
        workspaceId: context.workspaceId
      }
    };
  });
}
