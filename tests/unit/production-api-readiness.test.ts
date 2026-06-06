import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getProductionHealth } from "@/lib/production-health";
import { POST as postCEOCommand } from "@/app/api/ceo-command/route";
import { GET as getProductionCheck } from "@/app/api/production-check/route";
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

    expect(health).toMatchObject({
      openaiConfigured: true,
      supabaseUrlConfigured: true,
      supabaseAnonConfigured: true,
      supabaseServiceConfigured: false,
      appMode: "partial",
      openaiModel: "gpt-4.1",
      databaseMode: "supabase",
      aiMode: "openai"
    });
    expect(health.timestamp).toEqual(expect.any(String));
    expect(JSON.stringify(health)).not.toContain("sk-secret");
    expect(JSON.stringify(health)).not.toContain("anon-secret");
  });

  it("reports real app mode only when OpenAI and Supabase service persistence are configured", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-secret");
    vi.stubEnv("OPENAI_MODEL", "gpt-4.1-mini");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-secret");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-secret");

    const health = getProductionHealth();

    expect(health).toMatchObject({
      openaiConfigured: true,
      supabaseUrlConfigured: true,
      supabaseAnonConfigured: true,
      supabaseServiceConfigured: true,
      appMode: "real",
      openaiModel: "gpt-4.1-mini",
      databaseMode: "supabase",
      aiMode: "openai"
    });
    expect(JSON.stringify(health)).not.toContain("service-secret");
  });

  it("falls back to mock app mode when all production integrations are missing", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(getProductionHealth()).toMatchObject({
      openaiConfigured: false,
      supabaseUrlConfigured: false,
      supabaseAnonConfigured: false,
      supabaseServiceConfigured: false,
      appMode: "mock",
      databaseMode: "memory",
      aiMode: "fallback"
    });
  });

  it("checks production construction readiness without exposing secrets or making writes", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-secret");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-secret");

    const response = await getProductionCheck();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      health: {
        appMode: "real",
        databaseMode: "supabase",
        aiMode: "openai"
      },
      checks: {
        env: {
          openaiConfigured: true,
          supabaseUrlConfigured: true,
          supabaseAnonConfigured: true,
          supabaseServiceConfigured: true
        },
        openaiClientConstructed: true,
        supabaseAnonClientConstructed: true,
        supabaseServiceClientConstructed: true
      }
    });
    expect(payload.timestamp).toEqual(expect.any(String));
    expect(JSON.stringify(payload)).not.toContain("sk-secret");
    expect(JSON.stringify(payload)).not.toContain("anon-secret");
    expect(JSON.stringify(payload)).not.toContain("service-secret");
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
