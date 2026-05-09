import { describe, expect, it } from "vitest";
import { ConfigManager } from "@/infrastructure/ConfigManager";
import { EnvironmentValidator } from "@/infrastructure/EnvironmentValidator";
import { GlobalErrorHandler, ProductionError } from "@/infrastructure/GlobalErrorHandler";
import { RateLimitManager } from "@/infrastructure/RateLimitManager";
import { RetryQueueManager } from "@/infrastructure/RetryQueueManager";
import { StructuredLogger } from "@/infrastructure/StructuredLogger";
import { WorkflowRecoveryManager } from "@/infrastructure/WorkflowRecoveryManager";
import { HealthCheckService } from "@/infrastructure/HealthCheckService";

describe("MVP production readiness infrastructure", () => {
  it("loads safe local config with deterministic fallbacks", () => {
    const config = new ConfigManager({ NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "http://localhost:3000" }).getConfig();
    const validation = new EnvironmentValidator().validate(config);

    expect(config.supabase.enabled).toBe(false);
    expect(config.openai.enabled).toBe(false);
    expect(validation.valid).toBe(true);
    expect(validation.fallbackMode).toMatchObject({ supabase: "in_memory", openai: "deterministic" });
  });

  it("normalizes recoverable workflow failures into structured errors", () => {
    const logger = new StructuredLogger({ minLevel: "error" });
    const handler = new GlobalErrorHandler(logger);
    const error = handler.capture(new ProductionError("HARNESS_FAILED", "Harness failed.", { retryable: true }), {
      workflowId: "workflow-a",
      organizationId: "org-a"
    });

    expect(error).toMatchObject({
      ok: false,
      code: "HARNESS_FAILED",
      retryable: true,
      workflowSafe: true
    });
    expect(logger.summarize().byLevel.error).toBe(1);
  });

  it("limits repeated API calls inside a window", () => {
    const limiter = new RateLimitManager();
    expect(limiter.check({ scope: "api", key: "actor-a", limit: 1, windowMs: 60_000 }).allowed).toBe(true);
    expect(limiter.check({ scope: "api", key: "actor-a", limit: 1, windowMs: 60_000 }).allowed).toBe(false);
  });

  it("recovers a failed workflow through the retry queue", async () => {
    const logger = new StructuredLogger({ minLevel: "error" });
    const queue = new RetryQueueManager();
    const recovery = new WorkflowRecoveryManager(queue, logger);

    recovery.checkpoint({
      workflowId: "workflow-a",
      organizationId: "org-a",
      agentId: "content-creator",
      currentStep: "harness",
      checkpoint: { brief: "demo" }
    });
    recovery.captureFailure({
      workflowId: "workflow-a",
      organizationId: "org-a",
      agentId: "content-creator",
      currentStep: "harness",
      checkpoint: { brief: "demo" },
      error: new ProductionError("HARNESS_FAILED", "Simulated failure.")
    });

    const result = await recovery.recover("workflow-a", async () => ({ status: "completed" }));
    const health = new HealthCheckService(new ConfigManager({ NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "http://localhost:3000" }), queue, recovery, logger).getSystemHealth();

    expect(result.status).toBe("completed");
    expect(queue.getStats("workflow-recovery").byStatus.completed).toBe(1);
    expect(health.metrics.workflowSuccessRate).toBe(1);
  });
});
