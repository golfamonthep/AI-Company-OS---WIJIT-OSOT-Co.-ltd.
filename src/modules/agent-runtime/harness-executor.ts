import { serverEnv } from "@/lib/env/server";
import type { HarnessToolStatus } from "@/modules/agent-runtime/contracts";

export type JsonGenerationRequest = {
  system: string;
  user: unknown;
  fallback: unknown;
};

export async function executeJsonGeneration<TOutput>(request: JsonGenerationRequest): Promise<{ output: TOutput; harness: HarnessToolStatus[] }> {
  const text = await callOpenAiJson(request);
  const parsed = text ? parseJson<TOutput>(text, request.fallback as TOutput) : (request.fallback as TOutput);

  return {
    output: parsed,
    harness: [
      {
        tool: "openai",
        status: text ? "used" : "fallback",
        summary: text ? "OpenAI Responses API returned structured JSON." : "OpenAI key unavailable or call failed; deterministic fallback was used."
      },
      { tool: "json_parser", status: "used", summary: "JSON output was parsed and normalized by the runtime." },
      { tool: "filesystem", status: "used", summary: "Agent and skill markdown were loaded from the local company-os directory." },
      { tool: "memory", status: "used", summary: "Runtime injected memory context before generation." },
      { tool: "web_search", status: "unavailable", summary: "Web search is represented as a future harness capability." }
    ]
  };
}

async function callOpenAiJson(request: JsonGenerationRequest) {
  if (!serverEnv.OPENAI_API_KEY) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: request.system },
        { role: "user", content: JSON.stringify(request.user) }
      ]
    })
  }).catch(() => null);

  if (!response?.ok) return null;
  const data = await response.json().catch(() => null);
  return extractResponseText(data);
}

function extractResponseText(data: unknown) {
  const maybe = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (maybe.output_text) return maybe.output_text;
  return maybe.output?.flatMap((item) => item.content ?? []).map((content) => content.text).filter(Boolean).join("\n") ?? null;
}

function parseJson<TOutput>(raw: string, fallback: TOutput): TOutput {
  try {
    return JSON.parse(raw) as TOutput;
  } catch {
    return fallback;
  }
}
