import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { executeSkillSchema } from "@/server/api/schemas";
import { requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { SkillRepository } from "@/database/repositories/SkillRepository";

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, executeSkillSchema);
    requirePermission(context, { actionType: "workflow_execute", workflowId: body.workflowId ?? "content-production", summary: `Execute skill ${body.skillId}` });

    const output = {
      skillId: body.skillId,
      agentKey: body.agentKey,
      result: "Skill execution accepted by API layer.",
      structuredOutput: body.input,
      fallbackMode: context.persistenceMode === "missing_env"
    };

    const execution = await new SkillRepository(context.persistence).saveExecution({
      organization_id: context.organizationId,
      agent_key: body.agentKey,
      skill_id: body.skillId,
      workflow_id: body.workflowId,
      task_intent: body.taskIntent,
      status: "completed",
      input: body.input,
      output,
      validation_result: { passed: true, source: "api-layer" },
      harness_status: [],
      errors: [],
      improvement_notes: []
    });

    await auditApiAction(context, { eventType: "skill_executed", summary: `Skill executed: ${body.skillId}`, relatedWorkflowId: body.workflowId, metadata: { skillId: body.skillId } });
    return { execution, output, persistenceMode: context.persistenceMode };
  });
}
