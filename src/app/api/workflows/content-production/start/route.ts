import { z } from "zod";
import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import { createApiContext } from "@/server/api/auth";
import { badRequest } from "@/server/api/errors";
import { requireApiPermission } from "@/server/api/permissions";
import { routeHandler } from "@/server/api/routeHandler";

const startSchema = z.object({
  campaignBrief: z.string().min(10).optional(),
  objective: z.string().min(10).optional(),
  productName: z.string().optional(),
  productSummary: z.string().optional(),
  targetAudience: z.string().optional(),
  campaignGoal: z.enum(["awareness", "engagement", "conversion", "education"]).optional(),
  contentGoal: z.enum(["awareness", "engagement", "conversion", "education"]).optional(),
  channel: z.enum(["tiktok", "facebook", "instagram", "line", "website"]).default("tiktok"),
  tone: z.enum(["friendly", "professional", "premium", "educational", "urgent"]).default("friendly"),
  constraints: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    requireApiPermission(context, "workflow:start");

    const body = await request.json();
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid Content Production Workflow payload.", parsed.error.flatten());

    const campaignBrief = parsed.data.campaignBrief ?? parsed.data.objective;
    if (!campaignBrief) throw badRequest("Content Production Workflow requires campaignBrief or objective.");

    const productContext = [parsed.data.productName, parsed.data.productSummary].filter(Boolean).join(" - ");
    const result = await new ContentDepartmentLiveMvpService(context).startMotherBabyCampaign({
      campaignBrief,
      productName: productContext || parsed.data.productName,
      targetAudience: parsed.data.targetAudience,
      channel: parsed.data.channel,
      contentGoal: parsed.data.contentGoal ?? parsed.data.campaignGoal ?? "engagement",
      tone: parsed.data.tone,
      constraints: parsed.data.constraints
    });

    return {
      ok: true,
      status: "waiting_approval",
      data: result,
      meta: {
        workflowName: "Content Production Workflow",
        campaignName: "Mother-and-baby TikTok Campaign",
        persistenceMode: context.persistenceMode,
        workspaceId: context.workspaceId,
        requiresApproval: true
      }
    };
  });
}
