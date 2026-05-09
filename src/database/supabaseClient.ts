import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseRuntimeMode = "configured" | "missing_env";

export type SupabaseRuntimeClient = {
  client: SupabaseClient | null;
  mode: SupabaseRuntimeMode;
  reason?: string;
};

export function createSupabaseServiceClient(): SupabaseRuntimeClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return {
      client: null,
      mode: "missing_env",
      reason: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Persistence will use in-memory fallback."
    };
  }

  return {
    client: createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }),
    mode: "configured"
  };
}

export function createSupabaseAnonClient(): SupabaseRuntimeClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      client: null,
      mode: "missing_env",
      reason: "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Persistence will use in-memory fallback."
    };
  }

  return {
    client: createClient(url, anonKey),
    mode: "configured"
  };
}
