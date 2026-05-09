import type { SupabaseClient } from "@supabase/supabase-js";
import { saveCollaborationSnapshot } from "@/modules/agent-runtime/collaboration/CollaborationLogger";
import type { CollaborationExecutionResult, CollaborationMemoryReference, CollaborationSession, CompanyAgentId } from "@/modules/agent-runtime/collaboration/types";

export class AgentCollaborationManager {
  private readonly sessions = new Map<string, CollaborationSession>();

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  createSession(input: {
    organizationId: string;
    title: string;
    objective: string;
    participatingAgents: CompanyAgentId[];
    workflowId?: string;
    campaignName?: string;
    sharedMemory?: CollaborationMemoryReference[];
    metadata?: Record<string, unknown>;
  }) {
    const now = new Date().toISOString();
    const session: CollaborationSession = {
      sessionId: `collab-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: input.organizationId,
      title: input.title,
      objective: input.objective,
      participatingAgents: input.participatingAgents,
      status: "active",
      context: {
        organizationId: input.organizationId,
        workflowId: input.workflowId,
        objective: input.objective,
        campaignName: input.campaignName,
        sharedMemory: input.sharedMemory ?? [],
        artifacts: [],
        metadata: input.metadata
      },
      createdAt: now,
      updatedAt: now
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  addArtifact(sessionId: string, artifact: CollaborationSession["context"]["artifacts"][number]) {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.context.artifacts.push(artifact);
    session.updatedAt = new Date().toISOString();
    return session;
  }

  setStatus(sessionId: string, status: CollaborationSession["status"]) {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.status = status;
    session.updatedAt = new Date().toISOString();
    return session;
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  async save(result: CollaborationExecutionResult) {
    return saveCollaborationSnapshot(this.supabase, result);
  }
}
