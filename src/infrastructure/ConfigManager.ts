export type AppEnvironment = "development" | "staging" | "production" | "test";

export type AppConfig = {
  appName: string;
  environment: AppEnvironment;
  appUrl: string;
  logLevel: "debug" | "info" | "warn" | "error";
  supabase: {
    url?: string;
    anonKey?: string;
    serviceRoleKey?: string;
    projectRef?: string;
    databaseUrl?: string;
    enabled: boolean;
  };
  openai: {
    apiKey?: string;
    enabled: boolean;
  };
  limits: {
    apiWindowMs: number;
    apiMaxRequests: number;
    workflowMaxRetries: number;
    workflowTimeoutMs: number;
    connectorWindowMs: number;
    connectorMaxRequests: number;
  };
  deployment: {
    target: "local" | "vercel" | "docker";
    dockerPort: number;
  };
};

export type ConfigSource = Record<string, string | undefined>;

const DEFAULT_LIMITS = {
  apiWindowMs: 60_000,
  apiMaxRequests: 120,
  workflowMaxRetries: 3,
  workflowTimeoutMs: 120_000,
  connectorWindowMs: 60_000,
  connectorMaxRequests: 30
};

export class ConfigManager {
  constructor(private readonly source: ConfigSource = process.env) {}

  getConfig(): AppConfig {
    const environment = parseEnvironment(this.source.NODE_ENV ?? this.source.APP_ENV);
    const supabaseUrl = optional(this.source.NEXT_PUBLIC_SUPABASE_URL);
    const supabaseAnonKey = optional(this.source.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const serviceRoleKey = optional(this.source.SUPABASE_SERVICE_ROLE_KEY);
    const openaiApiKey = optional(this.source.OPENAI_API_KEY);

    return {
      appName: this.source.APP_NAME || "ai-company-os",
      environment,
      appUrl: this.source.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      logLevel: parseLogLevel(this.source.LOG_LEVEL, environment),
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
        serviceRoleKey,
        projectRef: optional(this.source.SUPABASE_PROJECT_REF),
        databaseUrl: optional(this.source.DATABASE_URL),
        enabled: Boolean(supabaseUrl && supabaseAnonKey)
      },
      openai: {
        apiKey: openaiApiKey,
        enabled: Boolean(openaiApiKey)
      },
      limits: {
        apiWindowMs: numberFromEnv(this.source.API_RATE_LIMIT_WINDOW_MS, DEFAULT_LIMITS.apiWindowMs),
        apiMaxRequests: numberFromEnv(this.source.API_RATE_LIMIT_MAX_REQUESTS, DEFAULT_LIMITS.apiMaxRequests),
        workflowMaxRetries: numberFromEnv(this.source.WORKFLOW_MAX_RETRIES, DEFAULT_LIMITS.workflowMaxRetries),
        workflowTimeoutMs: numberFromEnv(this.source.WORKFLOW_TIMEOUT_MS, DEFAULT_LIMITS.workflowTimeoutMs),
        connectorWindowMs: numberFromEnv(this.source.CONNECTOR_RATE_LIMIT_WINDOW_MS, DEFAULT_LIMITS.connectorWindowMs),
        connectorMaxRequests: numberFromEnv(this.source.CONNECTOR_RATE_LIMIT_MAX_REQUESTS, DEFAULT_LIMITS.connectorMaxRequests)
      },
      deployment: {
        target: parseDeploymentTarget(this.source.DEPLOYMENT_TARGET),
        dockerPort: numberFromEnv(this.source.PORT, 3000)
      }
    };
  }

  isProduction() {
    return this.getConfig().environment === "production";
  }

  getSafePublicConfig() {
    const config = this.getConfig();
    return {
      appName: config.appName,
      environment: config.environment,
      appUrl: config.appUrl,
      supabaseEnabled: config.supabase.enabled,
      openaiEnabled: config.openai.enabled,
      deploymentTarget: config.deployment.target
    };
  }
}

export const configManager = new ConfigManager();

function parseEnvironment(value?: string): AppEnvironment {
  if (value === "production" || value === "staging" || value === "test") return value;
  return "development";
}

function parseLogLevel(value: string | undefined, environment: AppEnvironment): AppConfig["logLevel"] {
  if (value === "debug" || value === "info" || value === "warn" || value === "error") return value;
  return environment === "production" ? "info" : "debug";
}

function parseDeploymentTarget(value?: string): AppConfig["deployment"]["target"] {
  if (value === "vercel" || value === "docker") return value;
  return "local";
}

function numberFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function optional(value?: string) {
  return value && value.trim().length ? value : undefined;
}
