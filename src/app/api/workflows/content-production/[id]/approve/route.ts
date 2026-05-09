import { z } from "zod";
import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import { createApiContext } from "@/server/api/auth";
import { badRequest } from "@/server/api/errors";
import { requireApiApprovalAuthority, requireApiPermission } from "@/server/api/permissions";
import { routeHandler } from "@/server/api/routeHandler";

const approvalSchema = z.object({
  decision: z.enum(["approved", "changes_requested"]).default("approved"),
  approvalNotes: z.string().optional(),
  outputScore: z.number().min(1).max(5).optional(),
  thumbs: z.enum(["up", "down"]).optional(),
  workflowSatisfaction: z.number().min(1).max(5).optional(),
  qualityNotes: z.string().optional(),
  rejectionReason: z.string().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    requireApiPermission(context, "approval:approve_content");
    requireApiApprovalAuthority(context, "normal");

    const body = await request.json();
    const parsed = approvalSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid Content Production Workflow approval payload.", parsed.error.flatten());

    const { id } = await params;
    const result = await new ContentDepartmentLiveMvpService(context).approveMotherBabyCampaign({
      runKey: id,
      ...parsed.data
    });

    return {
      ok: true,
      status: result.status,
      data: result,
      meta: {
        workflowName: "Content Production Workflow",
        campaignName: "Mother-and-baby TikTok Campaign",
        persistenceMode: context.persistenceMode,
        workspaceId: context.workspaceId
      }
    };
  });
}
