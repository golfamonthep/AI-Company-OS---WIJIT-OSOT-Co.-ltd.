import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { createMemorySchema } from "@/server/api/schemas";
import { requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { MemoryRepository } from "@/database/repositories/MemoryRepository";

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, createMemorySchema);
    requirePermission(context, { actionType: "memory_write", summary: `Create ${body.scope} memory: ${body.title}` });

    const repo = new MemoryRepository(context.persistence);
    const record = {
      organization_id: context.organizationId,
      agent_key: body.agentKey,
      workflow_id: body.workflowId,
      title: body.title,
      content: body.content ?? body.title,
      task_intent: body.taskIntent,
      decision: body.decision,
      reasoning: body.reasoning,
      memory_type: body.scope,
      source_type: "api",
      semantic_tags: body.semanticTags,
      importance: body.importance,
      metadata: body.metadata
    };

    const result =
      body.scope === "agent" ? await repo.saveAgentMemory(record) :
      body.scope === "task_history" ? await repo.saveTaskHistory({ ...record, task_intent: body.taskIntent ?? body.title, output: {}, input: {} }) :
      body.scope === "decision" ? await repo.saveDecision({ ...record, decision: body.decision ?? body.title, reasoning: body.reasoning ?? "" }) :
      await repo.saveCompanyMemory(record);

    await auditApiAction(context, { eventType: "memory_created", summary: `Memory created: ${body.title}`, metadata: { scope: body.scope } });
    return { result, persistenceMode: context.persistenceMode };
  });
}
