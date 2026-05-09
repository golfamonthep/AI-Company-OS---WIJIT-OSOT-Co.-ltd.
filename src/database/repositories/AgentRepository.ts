import { PersistenceService } from "@/database/PersistenceService";
import type { AgentRecord } from "@/database/types";

export class AgentRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  save(agent: AgentRecord) {
    return this.persistence.upsert("agents", agent as AgentRecord & Record<string, unknown>, "organization_id,agent_key");
  }

  findByKey(organizationId: string, agentKey: string) {
    return this.persistence.findBy<AgentRecord & Record<string, unknown>>("agents", "agent_key", agentKey, organizationId);
  }

  list(organizationId: string) {
    return this.persistence.list<AgentRecord & Record<string, unknown>>("agents", organizationId);
  }
}
