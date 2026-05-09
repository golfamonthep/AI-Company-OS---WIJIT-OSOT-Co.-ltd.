import { PersistenceService } from "@/database/PersistenceService";
import type { ArtifactRecord, IntegrationRecord } from "@/database/types";

export class IntegrationRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  saveConnectorConfig(config: IntegrationRecord) {
    return this.persistence.upsert("connector_configs", config as IntegrationRecord & Record<string, unknown>, "organization_id,connector_id");
  }

  saveConnectorAuditLog(event: IntegrationRecord) {
    return this.persistence.create("connector_audit_logs", event as IntegrationRecord & Record<string, unknown>);
  }

  saveConnectorExecution(event: IntegrationRecord) {
    return this.persistence.create("connector_execution_logs", event as IntegrationRecord & Record<string, unknown>);
  }

  saveArtifact(artifact: ArtifactRecord) {
    return this.persistence.create("artifact_metadata", artifact as ArtifactRecord & Record<string, unknown>);
  }

  listConnectorConfigs(organizationId: string) {
    return this.persistence.list<IntegrationRecord & Record<string, unknown>>("connector_configs", organizationId);
  }

  listConnectorAuditLogs(organizationId: string) {
    return this.persistence.list<IntegrationRecord & Record<string, unknown>>("connector_audit_logs", organizationId);
  }
}
