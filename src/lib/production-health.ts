export type ProductionHealth = {
  openaiConfigured: boolean;
  supabaseConfigured: boolean;
  appMode: "real" | "mock";
};

export function getProductionHealth(env: NodeJS.ProcessEnv = process.env): ProductionHealth {
  const openaiConfigured = Boolean(env.OPENAI_API_KEY);
  const supabaseConfigured = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return {
    openaiConfigured,
    supabaseConfigured,
    appMode: openaiConfigured && supabaseConfigured ? "real" : "mock"
  };
}
