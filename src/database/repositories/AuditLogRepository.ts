import { PersistenceService } from "@/database/PersistenceService";
import type { AuditLogRecord } from "@/database/types";

export class AuditLogRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  save(event: AuditLogRecord) {
    return this.persistence.create("audit_logs", {
      action: event.action ?? event.event_type,
      ...event
    } as AuditLogRecord & Record<string, unknown>);
  }

  list(organizationId: string) {
    return this.persistence.list<AuditLogRecord & Record<string, unknown>>("audit_logs", organizationId);
  }
}
