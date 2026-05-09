import { PersistenceService } from "@/database/PersistenceService";
import type { OperationsRecord } from "@/database/types";

export class OperationsRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  saveTrigger(trigger: OperationsRecord) {
    return this.persistence.upsert("operations_triggers", trigger as OperationsRecord & Record<string, unknown>, "organization_id,trigger_key");
  }

  listTriggers(organizationId: string) {
    return this.persistence.list<OperationsRecord & Record<string, unknown>>("operations_triggers", organizationId);
  }
}
