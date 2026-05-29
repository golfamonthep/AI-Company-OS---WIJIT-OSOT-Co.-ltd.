import { z } from "zod";
import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import { createApiContext } from "@/server/api/auth";
import { badRequest } from "@/server/api/errors";
import { requireApiPermission } from "@/server/api/permissions";
import { routeHandler } from "@/server/api/routeHandler";

const memoryCandidateSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["approved_campaign_style", "tone_of_voice", "preferred_messaging", "rejected_pattern", "workflow_preference"]),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  importance: z.number().min(1).max(10),
  source: z.enum(["content_review", "quality_evaluation", "memory_curation", "workflow_feedback"]),
  editable: z.boolean().default(true),
  save: z.boolean().optional()
});

const confirmSchema = z.object({
  runKey: z.string().min(1),
  confirmedBy: z.string().optional(),
  candidates: z.array(memoryCandidateSchema).min(1)
});

export async function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    requireApiPermission(context, "memory:write");

    const body = await request.json();
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid memory checkpoint payload.", parsed.error.flatten());

    const result = await new ContentDepartmentLiveMvpService(context).confirmMemoryCheckpoint(parsed.data);
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
