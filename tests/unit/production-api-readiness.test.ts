import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getProductionHealth } from "@/lib/production-health";
import { POST as postCEOCommand } from "@/app/api/ceo-command/route";
import type { CEOPlan } from "@/modules/orchestration/types";

describe("production API readiness", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports OpenAI and Supabase configuration without exposing secrets", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-secret");

    const health = getProductionHealth();

    expect(health).toEqual({
      openaiConfigured: true,
      supabaseConfigured: true,
      appMode: "real"
    });
    expect(JSON.stringify(health)).not.toContain("sk-secret");
    expect(JSON.stringify(health)).not.toContain("anon-secret");
  });

  it("falls back to mock app mode when a required production integration is missing", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-secret");

    expect(getProductionHealth()).toEqual({
      openaiConfigured: false,
      supabaseConfigured: true,
      appMode: "mock"
    });
  });

  it("returns a structured CEO plan response from /api/ceo-command", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const response = await postCEOCommand(
      new Request("http://localhost/api/ceo-command", {
        method: "POST",
        body: JSON.stringify({ command: "ช่วยวางแผนงานวันนี้" })
      })
    );
    const payload = (await response.json()) as {
      ok: boolean;
      plan: CEOPlan;
      persistence: {
        mode: string;
        supabaseConfigured: boolean;
        savedToSupabase: boolean;
        usedFallback: boolean;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.plan.status).toBe("waiting_approval");
    expect(payload.plan.recommendedActions ?? []).not.toHaveLength(0);
    expect(payload.persistence).toMatchObject({
      mode: "memory_fallback",
      supabaseConfigured: false,
      savedToSupabase: false,
      usedFallback: true
    });
  });
});
