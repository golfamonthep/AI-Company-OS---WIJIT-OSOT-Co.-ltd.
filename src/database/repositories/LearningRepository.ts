import { PersistenceService } from "@/database/PersistenceService";
import type { LearningRecord } from "@/database/types";

export class LearningRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  saveEvent(event: LearningRecord) {
    return this.persistence.create("learning_events", event as LearningRecord & Record<string, unknown>);
  }

  saveProposal(proposal: LearningRecord) {
    return this.persistence.upsert("learning_proposals", proposal as LearningRecord & Record<string, unknown>, "organization_id,proposal_key");
  }

  listEvents(organizationId: string) {
    return this.persistence.list<LearningRecord & Record<string, unknown>>("learning_events", organizationId);
  }

  listProposals(organizationId: string) {
    return this.persistence.list<LearningRecord & Record<string, unknown>>("learning_proposals", organizationId);
  }

  findProposalByKey(organizationId: string, proposalKey: string) {
    return this.persistence.findBy<LearningRecord & Record<string, unknown>>("learning_proposals", "proposal_key", proposalKey, organizationId);
  }
}
