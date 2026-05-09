export type RateLimitScope = "api" | "connector" | "workflow" | "agent";

export type RateLimitDecision = {
  allowed: boolean;
  scope: RateLimitScope;
  key: string;
  limit: number;
  remaining: number;
  resetAt: string;
  retryAfterMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export class RateLimitManager {
  private readonly buckets = new Map<string, RateLimitBucket>();

  check(input: { scope: RateLimitScope; key: string; limit: number; windowMs: number }): RateLimitDecision {
    const now = Date.now();
    const bucketKey = `${input.scope}:${input.key}`;
    const existing = this.buckets.get(bucketKey);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + input.windowMs;
      this.buckets.set(bucketKey, { count: 1, resetAt });
      return {
        allowed: true,
        scope: input.scope,
        key: input.key,
        limit: input.limit,
        remaining: Math.max(input.limit - 1, 0),
        resetAt: new Date(resetAt).toISOString(),
        retryAfterMs: 0
      };
    }

    if (existing.count >= input.limit) {
      return {
        allowed: false,
        scope: input.scope,
        key: input.key,
        limit: input.limit,
        remaining: 0,
        resetAt: new Date(existing.resetAt).toISOString(),
        retryAfterMs: Math.max(existing.resetAt - now, 0)
      };
    }

    existing.count += 1;
    this.buckets.set(bucketKey, existing);
    return {
      allowed: true,
      scope: input.scope,
      key: input.key,
      limit: input.limit,
      remaining: Math.max(input.limit - existing.count, 0),
      resetAt: new Date(existing.resetAt).toISOString(),
      retryAfterMs: 0
    };
  }

  reset(scope?: RateLimitScope, key?: string) {
    if (!scope) {
      this.buckets.clear();
      return;
    }
    const prefix = key ? `${scope}:${key}` : `${scope}:`;
    for (const bucketKey of this.buckets.keys()) {
      if (bucketKey.startsWith(prefix)) this.buckets.delete(bucketKey);
    }
  }
}

export const rateLimitManager = new RateLimitManager();
