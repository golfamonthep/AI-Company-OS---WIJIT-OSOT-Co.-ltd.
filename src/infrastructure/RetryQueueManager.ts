import type { StructuredAppError } from "@/infrastructure/GlobalErrorHandler";

export type RetryQueueStatus = "queued" | "running" | "completed" | "failed" | "dead_letter";

export type RetryQueueItem<TPayload = Record<string, unknown>> = {
  id: string;
  queue: string;
  payload: TPayload;
  attempts: number;
  maxAttempts: number;
  status: RetryQueueStatus;
  availableAt: string;
  createdAt: string;
  updatedAt: string;
  lastError?: StructuredAppError;
};

export class RetryQueueManager {
  private readonly items = new Map<string, RetryQueueItem>();

  enqueue<TPayload>(input: { queue: string; payload: TPayload; maxAttempts?: number; delayMs?: number; lastError?: StructuredAppError }) {
    const now = new Date();
    const item: RetryQueueItem<TPayload> = {
      id: `retry-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      queue: input.queue,
      payload: input.payload,
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 3,
      status: "queued",
      availableAt: new Date(now.getTime() + (input.delayMs ?? 0)).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastError: input.lastError
    };
    this.items.set(item.id, item as RetryQueueItem);
    return item;
  }

  next(queue: string, now = new Date()) {
    return [...this.items.values()]
      .filter((item) => item.queue === queue && item.status === "queued" && new Date(item.availableAt).getTime() <= now.getTime())
      .sort((a, b) => new Date(a.availableAt).getTime() - new Date(b.availableAt).getTime())[0];
  }

  markRunning(id: string) {
    return this.update(id, { status: "running", attempts: (this.items.get(id)?.attempts ?? 0) + 1 });
  }

  markCompleted(id: string) {
    return this.update(id, { status: "completed" });
  }

  markFailed(id: string, error: StructuredAppError, delayMs = 1000) {
    const item = this.items.get(id);
    if (!item) return undefined;
    const status: RetryQueueStatus = item.attempts >= item.maxAttempts ? "dead_letter" : "queued";
    return this.update(id, {
      status,
      lastError: error,
      availableAt: new Date(Date.now() + delayMs).toISOString()
    });
  }

  getStats(queue?: string) {
    const items = [...this.items.values()].filter((item) => !queue || item.queue === queue);
    return items.reduce(
      (stats, item) => {
        stats.total += 1;
        stats.byStatus[item.status] += 1;
        return stats;
      },
      { total: 0, byStatus: { queued: 0, running: 0, completed: 0, failed: 0, dead_letter: 0 } as Record<RetryQueueStatus, number> }
    );
  }

  list(queue?: string) {
    return [...this.items.values()].filter((item) => !queue || item.queue === queue);
  }

  private update(id: string, patch: Partial<RetryQueueItem>) {
    const item = this.items.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }
}

export const retryQueueManager = new RetryQueueManager();
