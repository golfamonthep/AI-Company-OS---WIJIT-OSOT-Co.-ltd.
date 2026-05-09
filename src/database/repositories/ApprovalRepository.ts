import { PersistenceService } from "@/database/PersistenceService";
import type { ApprovalRecord } from "@/database/types";

export class ApprovalRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  saveApproval(approval: ApprovalRecord) {
    return this.persistence.upsert("approvals", approval as ApprovalRecord & Record<string, unknown>, "organization_id,approval_key");
  }

  findByKey(organizationId: string, approvalKey: string) {
    return this.persistence.findBy<ApprovalRecord & Record<string, unknown>>("approvals", "approval_key", approvalKey, organizationId);
  }

  list(organizationId: string) {
    return this.persistence.list<ApprovalRecord & Record<string, unknown>>("approvals", organizationId);
  }
}
