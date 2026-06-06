import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/database/supabaseClient";
import { getProductionHealth } from "@/lib/production-health";

export async function GET() {
  const health = getProductionHealth();
  const openaiClientConstructed = constructOpenAIClient();
  const supabaseAnonClientConstructed = constructSupabaseAnonClient();
  const supabaseServiceClientConstructed = constructSupabaseServiceClient();
  const ok = openaiClientConstructed && supabaseAnonClientConstructed;

  return NextResponse.json({
    ok,
    health,
    checks: {
      env: {
        openaiApiKeyPresent: health.openaiApiKeyPresent,
        openaiApiKeyLength: health.openaiApiKeyLength,
        supabaseUrlPresent: health.supabaseUrlPresent,
        supabaseAnonPresent: health.supabaseAnonPresent
      },
      openaiClientConstructed,
      supabaseAnonClientConstructed,
      supabaseServiceClientConstructed
    },
    timestamp: new Date().toISOString()
  });
}

function constructOpenAIClient() {
  if (!process.env.OPENAI_API_KEY?.trim()) return false;

  try {
    new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return true;
  } catch {
    return false;
  }
}

function constructSupabaseAnonClient() {
  try {
    return Boolean(createSupabaseAnonClient().client);
  } catch {
    return false;
  }
}

function constructSupabaseServiceClient() {
  try {
    return Boolean(createSupabaseServiceClient().client);
  } catch {
    return false;
  }
}
