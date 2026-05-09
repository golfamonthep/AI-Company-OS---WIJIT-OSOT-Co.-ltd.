export type LogLevel = "debug" | "info" | "warn" | "error";

export type StructuredLogEntry = {
  id: string;
  timestamp: string;
  level: LogLevel;
  layer: string;
  event: string;
  message: string;
  organizationId?: string;
  workflowId?: string;
  agentId?: string;
  correlationId?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
};

export type StructuredLoggerOptions = {
  minLevel?: LogLevel;
  sink?: (entry: StructuredLogEntry) => void;
};

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export class StructuredLogger {
  private readonly entries: StructuredLogEntry[] = [];
  private readonly minLevel: LogLevel;
  private readonly sink?: (entry: StructuredLogEntry) => void;

  constructor(options: StructuredLoggerOptions = {}) {
    this.minLevel = options.minLevel ?? "info";
    this.sink = options.sink;
  }

  debug(input: Omit<StructuredLogEntry, "id" | "timestamp" | "level">) {
    return this.log("debug", input);
  }

  info(input: Omit<StructuredLogEntry, "id" | "timestamp" | "level">) {
    return this.log("info", input);
  }

  warn(input: Omit<StructuredLogEntry, "id" | "timestamp" | "level">) {
    return this.log("warn", input);
  }

  error(input: Omit<StructuredLogEntry, "id" | "timestamp" | "level">) {
    return this.log("error", input);
  }

  log(level: LogLevel, input: Omit<StructuredLogEntry, "id" | "timestamp" | "level">) {
    const entry: StructuredLogEntry = {
      ...input,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      level
    };

    this.entries.push(entry);
    if (LEVEL_ORDER[level] >= LEVEL_ORDER[this.minLevel]) {
      this.sink?.(entry);
    }
    return entry;
  }

  getRecent(limit = 100) {
    return this.entries.slice(-limit);
  }

  summarize() {
    return this.entries.reduce(
      (summary, entry) => {
        summary.total += 1;
        summary.byLevel[entry.level] += 1;
        return summary;
      },
      { total: 0, byLevel: { debug: 0, info: 0, warn: 0, error: 0 } as Record<LogLevel, number> }
    );
  }
}

export const structuredLogger = new StructuredLogger({
  minLevel: "debug",
  sink: (entry) => {
    if (typeof console === "undefined") return;
    const payload = JSON.stringify(entry);
    if (entry.level === "error") console.error(payload);
    else if (entry.level === "warn") console.warn(payload);
    else console.log(payload);
  }
});
