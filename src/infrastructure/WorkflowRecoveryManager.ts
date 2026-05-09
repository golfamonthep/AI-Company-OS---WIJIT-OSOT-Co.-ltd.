import { globalErrorHandler, ProductionError, type StructuredAppError } from "@/infrastructure/GlobalErrorHandler";
import { retryQueueManager, type RetryQueueManager } from "@/infrastructure/RetryQueueManager";
import { structuredLogger, type StructuredLogger } from "@/infrastructure/StructuredLogger";

export type RecoverableWorkflowState = {
  workflowId: string;
  organizationId: string;
  agentId?: string;
  status: "started" | "failed" | "retrying" | "recovered" | "completed";
  currentStep: string;
  checkpoint: Record<string, unknown>;
  attempts: number;
  lastError?: StructuredAppError;
  updatedAt: string;
};

export class WorkflowRecoveryManager {
  private readonly states = new Map<string, RecoverableWorkflowState>();

  constructor(
    private readonly queue: RetryQueueManager = retryQueueManager,
    private readonly logger: StructuredLogger = structuredLogger
  ) {}

  checkpoint(input: Omit<RecoverableWorkflowState, "status" | "attempts" | "updatedAt"> & { status?: RecoverableWorkflowState["status"]; attempts?: number }) {
    const existing = this.states.get(input.workflowId);
    const state: RecoverableWorkflowState = {
      ...input,
      status: input.status ?? existing?.status ?? "started",
      attempts: input.attempts ?? existing?.attempts ?? 0,
      updatedAt: new Date().toISOString()
    };
    this.states.set(input.workflowId, state);
    this.logger.info({
      layer: "recovery",
      event: "workflow_checkpoint",
      message: `Checkpoint saved for workflow ${input.workflowId}.`,
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      agentId: input.agentId,
      metadata: { currentStep: input.currentStep }
    });
    return state;
  }

  captureFailure(input: { workflowId: string; organizationId: string; agentId?: string; currentStep: string; checkpoint: Record<string, unknown>; error: unknown; maxAttempts?: number }) {
    const appError = globalErrorHandler.capture(
      input.error instanceof Error ? input.error : new ProductionError("WORKFLOW_FAILED", "Workflow failed.", { cause: input.error }),
      { workflowId: input.workflowId, organizationId: input.organizationId, agentId: input.agentId, currentStep: input.currentStep }
    );
    const existing = this.states.get(input.workflowId);
    const state = this.checkpoint({
      workflowId: input.workflowId,
      organizationId: input.organizationId,
      agentId: input.agentId,
      status: "failed",
      currentStep: input.currentStep,
      checkpoint: input.checkpoint,
      attempts: existing?.attempts ?? 0,
      lastError: appError
    });
    const retry = this.queue.enqueue({
      queue: "workflow-recovery",
      payload: { workflowId: input.workflowId },
      maxAttempts: input.maxAttempts ?? 3,
      delayMs: 0,
      lastError: appError
    });
    this.logger.warn({
      layer: "recovery",
      event: "workflow_retry_queued",
      message: `Queued recovery retry for workflow ${input.workflowId}.`,
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      agentId: input.agentId,
      metadata: { retryId: retry.id, errorId: appError.errorId }
    });
    return { state, retry, error: appError };
  }

  async recover<TOutput>(workflowId: string, runner: (state: RecoverableWorkflowState) => Promise<TOutput>) {
    const state = this.states.get(workflowId);
    if (!state) throw new ProductionError("RECOVERY_FAILED", `No recovery checkpoint found for workflow ${workflowId}.`, { retryable: false });

    const retry = this.queue.next("workflow-recovery") ?? this.queue.enqueue({ queue: "workflow-recovery", payload: { workflowId }, maxAttempts: 1 });
    this.queue.markRunning(retry.id);
    const retrying = this.checkpoint({ ...state, status: "retrying", attempts: state.attempts + 1 });

    try {
      const output = await runner(retrying);
      this.queue.markCompleted(retry.id);
      this.checkpoint({ ...retrying, status: "completed", currentStep: "completed" });
      this.logger.info({
        layer: "recovery",
        event: "workflow_recovered",
        message: `Workflow ${workflowId} recovered and completed safely.`,
        organizationId: state.organizationId,
        workflowId,
        agentId: state.agentId
      });
      return output;
    } catch (error) {
      const appError = globalErrorHandler.capture(error, { workflowId, organizationId: state.organizationId, agentId: state.agentId });
      this.queue.markFailed(retry.id, appError, 1000);
      this.checkpoint({ ...retrying, status: "failed", lastError: appError });
      throw error;
    }
  }

  getState(workflowId: string) {
    return this.states.get(workflowId);
  }

  listStates() {
    return [...this.states.values()];
  }
}

export const workflowRecoveryManager = new WorkflowRecoveryManager();
