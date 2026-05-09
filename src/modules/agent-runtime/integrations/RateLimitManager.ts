import type { ConnectorId, ConnectorRateLimitState } from "@/modules/agent-runtime/integrations/types";

export class RateLimitManager {
  private readonly states = new Map<string, ConnectorRateLimitState>();

  check(input: { connectorId: ConnectorId; actionId: string; maxRequests?: number; windowMs?: number }) {
    const key = `${input.connectorId}:${input.actionId}`;
    const now = Date.now();
    const existing = this.states.get(key);
    const windowMs = input.windowMs ?? 60_000;
    const maxRequests = input.maxRequests ?? 30;

    if (!existing || new Date(existing.resetAt).getTime() <= now) {
      const state: ConnectorRateLimitState = {
        connectorId: input.connectorId,
        actionId: input.actionId,
        windowMs,
        maxRequests,
        currentRequests: 1,
        resetAt: new Date(now + windowMs).toISOString()
      };
      this.states.set(key, state);
      return { allowed: true, state };
    }

    if (existing.currentRequests >= existing.maxRequests) {
      return { allowed: false, state: existing };
    }

    const state = { ...existing, currentRequests: existing.currentRequests + 1 };
    this.states.set(key, state);
    return { allowed: true, state };
  }
}
