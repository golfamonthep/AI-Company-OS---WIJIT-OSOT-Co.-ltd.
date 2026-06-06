export type ProductionHealth = {
  openaiApiKeyPresent: boolean;
  openaiApiKeyLength: number;
  supabaseUrlPresent: boolean;
  supabaseAnonPresent: boolean;
  appMode: "real" | "partial" | "mock";
  databaseMode: "supabase" | "memory";
  aiMode: "openai" | "fallback";
  openaiModel: string;
  timestamp: string;
};

export function getProductionHealth(env: NodeJS.ProcessEnv = process.env): ProductionHealth {
  const openaiApiKeyLength = valueLength(env.OPENAI_API_KEY);
  const openaiApiKeyPresent = openaiApiKeyLength > 0;
  const supabaseUrlPresent = hasValue(env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonPresent = hasValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabaseConfigured = supabaseUrlPresent && supabaseAnonPresent;
  const allUsedProductionIntegrationsConfigured = openaiApiKeyPresent && supabaseConfigured;
  const anyProductionIntegrationConfigured = openaiApiKeyPresent || supabaseUrlPresent || supabaseAnonPresent;

  return {
    openaiApiKeyPresent,
    openaiApiKeyLength,
    supabaseUrlPresent,
    supabaseAnonPresent,
    appMode: allUsedProductionIntegrationsConfigured ? "real" : anyProductionIntegrationConfigured ? "partial" : "mock",
    databaseMode: supabaseConfigured ? "supabase" : "memory",
    aiMode: openaiApiKeyPresent ? "openai" : "fallback",
    openaiModel: env.OPENAI_MODEL?.trim() || "gpt-4.1",
    timestamp: new Date().toISOString()
  };
}

function hasValue(value: string | undefined) {
  return valueLength(value) > 0;
}

function valueLength(value: string | undefined) {
  return value?.trim().length ?? 0;
}
