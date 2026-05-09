import type { AppConfig } from "@/infrastructure/ConfigManager";

export class DeploymentConfigGenerator {
  generateEnvTemplate(config: AppConfig) {
    return [
      `APP_NAME=${config.appName}`,
      `APP_ENV=${config.environment}`,
      `NEXT_PUBLIC_APP_URL=${config.appUrl}`,
      "NEXT_PUBLIC_SUPABASE_URL=",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
      "SUPABASE_SERVICE_ROLE_KEY=",
      "SUPABASE_PROJECT_REF=",
      "DATABASE_URL=",
      "OPENAI_API_KEY=",
      `LOG_LEVEL=${config.logLevel}`,
      `API_RATE_LIMIT_WINDOW_MS=${config.limits.apiWindowMs}`,
      `API_RATE_LIMIT_MAX_REQUESTS=${config.limits.apiMaxRequests}`,
      `WORKFLOW_MAX_RETRIES=${config.limits.workflowMaxRetries}`,
      `WORKFLOW_TIMEOUT_MS=${config.limits.workflowTimeoutMs}`,
      `CONNECTOR_RATE_LIMIT_WINDOW_MS=${config.limits.connectorWindowMs}`,
      `CONNECTOR_RATE_LIMIT_MAX_REQUESTS=${config.limits.connectorMaxRequests}`,
      `DEPLOYMENT_TARGET=${config.deployment.target}`,
      `PORT=${config.deployment.dockerPort}`
    ].join("\n");
  }

  generateVercelChecklist() {
    return [
      "Set NEXT_PUBLIC_APP_URL to the deployed Vercel URL.",
      "Set Supabase public keys in Vercel project environment variables.",
      "Keep SUPABASE_SERVICE_ROLE_KEY server-only.",
      "Run migrations against Supabase before enabling live workspace data.",
      "Keep external connector write actions disabled until governance approval APIs are verified."
    ];
  }
}

export const deploymentConfigGenerator = new DeploymentConfigGenerator();
