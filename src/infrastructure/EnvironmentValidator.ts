import type { AppConfig, AppEnvironment } from "@/infrastructure/ConfigManager";

export type EnvironmentValidationIssue = {
  key: string;
  severity: "warning" | "error";
  message: string;
};

export type EnvironmentValidationResult = {
  valid: boolean;
  environment: AppEnvironment;
  issues: EnvironmentValidationIssue[];
  fallbackMode: {
    supabase: "configured" | "in_memory";
    openai: "configured" | "deterministic";
  };
};

export class EnvironmentValidator {
  validate(config: AppConfig): EnvironmentValidationResult {
    const issues: EnvironmentValidationIssue[] = [];

    if (!config.appUrl.startsWith("http://") && !config.appUrl.startsWith("https://")) {
      issues.push({ key: "NEXT_PUBLIC_APP_URL", severity: "error", message: "App URL must start with http:// or https://." });
    }

    if (!config.supabase.enabled) {
      issues.push({ key: "NEXT_PUBLIC_SUPABASE_URL", severity: config.environment === "production" ? "error" : "warning", message: "Supabase is not configured; repositories will use fallback storage." });
    }

    if (config.environment === "production" && !config.supabase.serviceRoleKey) {
      issues.push({ key: "SUPABASE_SERVICE_ROLE_KEY", severity: "error", message: "Production jobs and migrations need a service role key in the deployment environment." });
    }

    if (!config.openai.enabled) {
      issues.push({ key: "OPENAI_API_KEY", severity: "warning", message: "OpenAI is not configured; agent execution will use deterministic fallback output." });
    }

    if (config.limits.workflowMaxRetries > 10) {
      issues.push({ key: "WORKFLOW_MAX_RETRIES", severity: "warning", message: "High retry counts can hide persistent failures in MVP deployments." });
    }

    return {
      valid: !issues.some((issue) => issue.severity === "error"),
      environment: config.environment,
      issues,
      fallbackMode: {
        supabase: config.supabase.enabled ? "configured" : "in_memory",
        openai: config.openai.enabled ? "configured" : "deterministic"
      }
    };
  }

  assertValid(config: AppConfig) {
    const result = this.validate(config);
    if (!result.valid) {
      throw new Error(`Environment validation failed: ${result.issues.filter((issue) => issue.severity === "error").map((issue) => `${issue.key}: ${issue.message}`).join("; ")}`);
    }
    return result;
  }
}

export const environmentValidator = new EnvironmentValidator();
