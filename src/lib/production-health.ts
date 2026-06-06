export type ProductionHealth = {
  openaiConfigured: boolean;
  supabaseUrlConfigured: boolean;
  supabaseAnonConfigured: boolean;
  supabaseServiceConfigured: boolean;
  supabaseConfigured: boolean;
  appMode: "real" | "partial" | "mock";
  openaiModel: string;
  databaseMode: "supabase" | "memory";
  aiMode: "openai" | "fallback";
  timestamp: string;
};

export function getProductionHealth(env: NodeJS.ProcessEnv = process.env): ProductionHealth {
  const openaiConfigured = hasValue(env.OPENAI_API_KEY);
  const supabaseUrlConfigured = hasValue(env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonConfigured = hasValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabaseServiceConfigured = hasValue(env.SUPABASE_SERVICE_ROLE_KEY);
  const supabaseConfigured = supabaseUrlConfigured && supabaseAnonConfigured;
  const allUsedProductionIntegrationsConfigured = openaiConfigured && supabaseConfigured && supabaseServiceConfigured;
  const anyProductionIntegrationConfigured = openaiConfigured || supabaseUrlConfigured || supabaseAnonConfigured || supabaseServiceConfigured;

  return {
    openaiConfigured,
    supabaseUrlConfigured,
    supabaseAnonConfigured,
    supabaseServiceConfigured,
    supabaseConfigured,
    appMode: allUsedProductionIntegrationsConfigured ? "real" : anyProductionIntegrationConfigured ? "partial" : "mock",
    openaiModel: env.OPENAI_MODEL?.trim() || "gpt-4.1",
    databaseMode: supabaseConfigured ? "supabase" : "memory",
    aiMode: openaiConfigured ? "openai" : "fallback",
    timestamp: new Date().toISOString()
  };
}

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}
