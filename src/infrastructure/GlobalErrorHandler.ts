import { structuredLogger, type StructuredLogger } from "@/infrastructure/StructuredLogger";

export type AppErrorCode =
  | "CONFIG_INVALID"
  | "RATE_LIMITED"
  | "WORKFLOW_FAILED"
  | "HARNESS_FAILED"
  | "CONNECTOR_FAILED"
  | "GOVERNANCE_BLOCKED"
  | "RECOVERY_FAILED"
  | "UNKNOWN";

export type AppErrorSeverity = "info" | "warning" | "recoverable" | "fatal";

export type StructuredAppError = {
  ok: false;
  errorId: string;
  code: AppErrorCode;
  severity: AppErrorSeverity;
  message: string;
  retryable: boolean;
  workflowSafe: boolean;
  createdAt: string;
  context?: Record<string, unknown>;
  cause?: {
    name: string;
    message: string;
  };
};

export class ProductionError extends Error {
  constructor(
    readonly code: AppErrorCode,
    message: string,
    readonly options: {
      severity?: AppErrorSeverity;
      retryable?: boolean;
      workflowSafe?: boolean;
      context?: Record<string, unknown>;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "ProductionError";
  }
}

export class GlobalErrorHandler {
  constructor(private readonly logger: StructuredLogger = structuredLogger) {}

  normalize(error: unknown, context: Record<string, unknown> = {}): StructuredAppError {
    if (error instanceof ProductionError) {
      return {
        ok: false,
        errorId: `err-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        code: error.code,
        severity: error.options.severity ?? "recoverable",
        message: error.message,
        retryable: error.options.retryable ?? true,
        workflowSafe: error.options.workflowSafe ?? true,
        createdAt: new Date().toISOString(),
        context: { ...context, ...error.options.context },
        cause: normalizeCause(error.options.cause)
      };
    }

    const message = error instanceof Error ? error.message : "Unknown error.";
    return {
      ok: false,
      errorId: `err-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      code: "UNKNOWN",
      severity: "recoverable",
      message,
      retryable: true,
      workflowSafe: true,
      createdAt: new Date().toISOString(),
      context,
      cause: normalizeCause(error)
    };
  }

  capture(error: unknown, context: Record<string, unknown> = {}) {
    const normalized = this.normalize(error, context);
    this.logger.error({
      layer: "error",
      event: normalized.code,
      message: normalized.message,
      organizationId: stringValue(context.organizationId),
      workflowId: stringValue(context.workflowId),
      agentId: stringValue(context.agentId),
      correlationId: stringValue(context.correlationId),
      metadata: normalized,
      error: normalized.cause ? { name: normalized.cause.name, message: normalized.cause.message } : undefined
    });
    return normalized;
  }

  toWorkflowFailure(error: unknown, context: Record<string, unknown> = {}) {
    const normalized = this.capture(error, context);
    return {
      status: normalized.retryable ? "retry_scheduled" : "failed",
      error: normalized,
      safeToPersist: normalized.workflowSafe
    };
  }
}

export const globalErrorHandler = new GlobalErrorHandler();

function normalizeCause(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { name: "UnknownCause", message: String(error) };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
