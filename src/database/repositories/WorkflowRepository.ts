import { PersistenceService } from "@/database/PersistenceService";
import type { WorkflowRecord, WorkflowRunRecord } from "@/database/types";

export class WorkflowRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  saveWorkflow(workflow: WorkflowRecord) {
    return this.persistence.upsert("workflows", workflow as WorkflowRecord & Record<string, unknown>, "organization_id,workflow_key");
  }

  saveRun(run: WorkflowRunRecord) {
    return this.persistence.upsert("workflow_runs", run as WorkflowRunRecord & Record<string, unknown>, "organization_id,run_key");
  }

  listWorkflows(organizationId: string) {
    return this.persistence.list<WorkflowRecord & Record<string, unknown>>("workflows", organizationId);
  }

  listRuns(organizationId: string) {
    return this.persistence.list<WorkflowRunRecord & Record<string, unknown>>("workflow_runs", organizationId);
  }

  findRunByKey(organizationId: string, runKey: string) {
    return this.persistence.findBy<WorkflowRunRecord & Record<string, unknown>>("workflow_runs", "run_key", runKey, organizationId);
  }
}
