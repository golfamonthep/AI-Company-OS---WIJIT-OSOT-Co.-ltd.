import { z } from "zod";
import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import { createApiContext } from "@/server/api/auth";
import { badRequest } from "@/server/api/errors";
import { requireApiPermission } from "@/server/api/permissions";
import { routeHandler } from "@/server/api/routeHandler";

const startSchema = z.object({
  campaignBrief: z.string().min(10),
  productName: z.string().optional(),
  targetAudience: z.string().optional(),
  channel: z.enum(["tiktok", "facebook", "instagram", "line", "website"]).default("tiktok"),
  contentGoal: z.enum(["awareness", "engagement", "conversion", "education"]).default("engagement"),
  tone: z.enum(["friendly", "professional", "premium", "educational", "urgent"]).default("friendly"),
  constraints: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    requireApiPermission(context, "workflow:start");

    const body = await request.json();
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid Content Department workflow payload.", parsed.error.flatten());
    const input = parsed.data;
    const result = await new ContentDepartmentLiveMvpService(context).startMotherBabyCampaign(input);

    return {
      ok: true,
      data: result,
      meta: {
        persistenceMode: context.persistenceMode,
        workspaceId: context.workspaceId,
        requiresApproval: true
      }
    };
  });
}
