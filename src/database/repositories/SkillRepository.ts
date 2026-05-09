import { PersistenceService } from "@/database/PersistenceService";
import type { SkillExecutionRecord, SkillRecord } from "@/database/types";

export class SkillRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  saveSkill(skill: SkillRecord) {
    return this.persistence.upsert("agent_skills", skill as SkillRecord & Record<string, unknown>, "organization_id,skill_id");
  }

  saveExecution(execution: SkillExecutionRecord) {
    return this.persistence.create("skill_execution_logs", {
      organization_id: execution.organization_id,
      agent_id: execution.agent_id ?? execution.agent_key ?? "unknown-agent",
      skill_id: execution.skill_id,
      workflow_id: execution.workflow_id,
      task_intent: execution.task_intent ?? execution.metadata?.taskIntent ?? "unspecified",
      input: execution.input,
      output: execution.output,
      validation_result: execution.validation_result ?? {},
      harness_status: execution.harness_status ?? [],
      errors: execution.errors ?? [],
      improvement_notes: execution.improvement_notes ?? [],
      metadata: execution.metadata ?? {}
    } as SkillExecutionRecord & Record<string, unknown>);
  }

  listSkills(organizationId: string) {
    return this.persistence.list<SkillRecord & Record<string, unknown>>("agent_skills", organizationId);
  }

  listExecutions(organizationId: string) {
    return this.persistence.list<SkillExecutionRecord & Record<string, unknown>>("skill_execution_logs", organizationId);
  }
}
