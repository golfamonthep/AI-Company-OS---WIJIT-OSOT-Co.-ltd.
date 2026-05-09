import { configManager, type ConfigManager } from "@/infrastructure/ConfigManager";
import { environmentValidator } from "@/infrastructure/EnvironmentValidator";
import { retryQueueManager, type RetryQueueManager } from "@/infrastructure/RetryQueueManager";
import { structuredLogger, type StructuredLogger } from "@/infrastructure/StructuredLogger";
import { workflowRecoveryManager, type WorkflowRecoveryManager } from "@/infrastructure/WorkflowRecoveryManager";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export type HealthCheck = {
  name: string;
  status: HealthStatus;
  summary: string;
  metadata?: Record<string, unknown>;
};

export type SystemHealthReport = {
  status: HealthStatus;
  generatedAt: string;
  checks: HealthCheck[];
  metrics: {
    workflowSuccessRate: number;
    workflowFailureRate: number;
    retryBacklog: number;
    deadLetterCount: number;
    logErrorCount: number;
    learningQueueBacklog: number;
    approvalBottlenecks: number;
  };
};

export class HealthCheckService {
  constructor(
    private readonly config: ConfigManager = configManager,
    private readonly queue: RetryQueueManager = retryQueueManager,
    private readonly recovery: WorkflowRecoveryManager = workflowRecoveryManager,
    private readonly logger: StructuredLogger = structuredLogger
  ) {}

  getSystemHealth(): SystemHealthReport {
    const appConfig = this.config.getConfig();
    const env = environmentValidator.validate(appConfig);
    const queueStats = this.queue.getStats();
    const logs = this.logger.summarize();
    const workflowStates = this.recovery.listStates();
    const completed = workflowStates.filter((state) => state.status === "completed").length;
    const failed = workflowStates.filter((state) => state.status === "failed").length;
    const totalTerminal = completed + failed;
    const workflowSuccessRate = totalTerminal ? completed / totalTerminal : 1;
    const workflowFailureRate = totalTerminal ? failed / totalTerminal : 0;

    const checks: HealthCheck[] = [
      {
        name: "environment",
        status: env.valid ? (env.issues.length ? "degraded" : "healthy") : "unhealthy",
        summary: env.valid ? "Environment is deployable with configured fallbacks." : "Environment has blocking deployment issues.",
        metadata: env
      },
      {
        name: "retry_queue",
        status: queueStats.byStatus.dead_letter > 0 ? "unhealthy" : queueStats.byStatus.queued > 0 ? "degraded" : "healthy",
        summary: `${queueStats.byStatus.queued} queued retry items and ${queueStats.byStatus.dead_letter} dead-letter items.`,
        metadata: queueStats
      },
      {
        name: "workflow_recovery",
        status: failed > 0 ? "degraded" : "healthy",
        summary: `${workflowStates.length} workflow recovery checkpoints tracked.`,
        metadata: { completed, failed, total: workflowStates.length }
      },
      {
        name: "api",
        status: "healthy",
        summary: "API health is ready for route-level checks.",
        metadata: { latencyMs: 0 }
      }
    ];

    return {
      status: summarizeStatus(checks),
      generatedAt: new Date().toISOString(),
      checks,
      metrics: {
        workflowSuccessRate,
        workflowFailureRate,
        retryBacklog: queueStats.byStatus.queued,
        deadLetterCount: queueStats.byStatus.dead_letter,
        logErrorCount: logs.byLevel.error,
        learningQueueBacklog: 0,
        approvalBottlenecks: 0
      }
    };
  }
}

export const healthCheckService = new HealthCheckService();

function summarizeStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === "unhealthy")) return "unhealthy";
  if (checks.some((check) => check.status === "degraded")) return "degraded";
  return "healthy";
}
