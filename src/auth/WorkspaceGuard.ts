import type { WorkspaceContext } from "@/auth/types";

type WorkspaceScopedRecord = {
  workspace_id?: string;
  organization_id?: string;
};

export class WorkspaceGuard {
  ensureInWorkspace(record: WorkspaceScopedRecord, context: WorkspaceContext) {
    const recordWorkspaceId = record.workspace_id ?? record.organization_id;
    if (!recordWorkspaceId) {
      throw new Error("Workspace-scoped record is missing workspace_id.");
    }

    if (recordWorkspaceId !== context.workspace.id) {
      throw new Error("Record does not belong to the current workspace.");
    }
  }

  stamp<TRecord extends Record<string, unknown>>(record: TRecord, context: WorkspaceContext): TRecord & { workspace_id: string; organization_id: string; created_by: string; updated_by: string } {
    return {
      ...record,
      workspace_id: context.workspace.id,
      organization_id: context.workspace.organizationId,
      created_by: (record.created_by as string | undefined) ?? context.user.id,
      updated_by: context.user.id
    };
  }
}
