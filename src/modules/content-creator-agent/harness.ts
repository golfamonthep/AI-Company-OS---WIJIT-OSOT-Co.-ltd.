import { serverEnv } from "@/lib/env/server";
import type { AgentMarkdownProfile, ContentCreatorExecutionInput, ContentCreatorStructuredOutput, HarnessExecutionStatus, SelectedContentSkill } from "@/modules/content-creator-agent/contracts";
import type { MemoryItem } from "@/modules/memory/types";

export async function generateWithContentHarness(input: {
  profile: AgentMarkdownProfile;
  executionInput: ContentCreatorExecutionInput;
  selectedSkills: SelectedContentSkill[];
  memoryContext: MemoryItem[];
}): Promise<{ output: ContentCreatorStructuredOutput; harness: HarnessExecutionStatus }> {
  const openAiOutput = await tryOpenAiJsonGeneration(input);

  if (openAiOutput) {
    return {
      output: parseJsonOutput(openAiOutput),
      harness: {
        openai: "used",
        fileSystem: "used",
        memoryRetrieval: input.memoryContext.length ? "used" : "fallback",
        webSearch: "unavailable",
        jsonParser: "used"
      }
    };
  }

  return {
    output: buildDeterministicFallback(input.executionInput),
    harness: {
      openai: "fallback",
      fileSystem: "used",
      memoryRetrieval: input.memoryContext.length ? "used" : "fallback",
      webSearch: "unavailable",
      jsonParser: "used"
    }
  };
}

async function tryOpenAiJsonGeneration(input: {
  profile: AgentMarkdownProfile;
  executionInput: ContentCreatorExecutionInput;
  selectedSkills: SelectedContentSkill[];
  memoryContext: MemoryItem[];
}) {
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
        {
          role: "system",
          content: [
            input.profile.agentMarkdown,
            input.profile.skillsMarkdown,
            "Return JSON only with keys: contentConcepts, hooks, scripts, captions, ctas, assumptions, guardrailNotes."
          ].join("\n\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            brief: input.executionInput.brief,
            productName: input.executionInput.productName,
            targetAudience: input.executionInput.targetAudience,
            channel: input.executionInput.channel,
            selectedSkills: input.selectedSkills,
            memoryContext: input.memoryContext
          })
        }
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

function parseJsonOutput(raw: string): ContentCreatorStructuredOutput {
  try {
    return normalizeOutput(JSON.parse(raw));
  } catch {
    return buildDeterministicFallback({ organizationId: "", brief: raw.slice(0, 120) });
  }
}

function normalizeOutput(value: Partial<ContentCreatorStructuredOutput>): ContentCreatorStructuredOutput {
  return {
    contentConcepts: value.contentConcepts ?? [],
    hooks: value.hooks ?? [],
    scripts: value.scripts ?? [],
    captions: value.captions ?? [],
    ctas: value.ctas ?? [],
    assumptions: value.assumptions ?? [],
    guardrailNotes: value.guardrailNotes ?? []
  };
}

function buildDeterministicFallback(input: ContentCreatorExecutionInput): ContentCreatorStructuredOutput {
  const product = input.productName || "the offer";
  const audience = input.targetAudience || "the target audience";

  return {
    contentConcepts: [
      { title: "Problem to solution", angle: `Show the real problem before introducing ${product}.`, audiencePain: "Audience needs clarity before taking action." },
      { title: "Checklist content", angle: `Give ${audience} a simple way to decide if ${product} is relevant.`, audiencePain: "Audience is unsure what criteria matter." },
      { title: "Story proof", angle: "Use a simple before/after story without unsupported performance claims.", audiencePain: "Audience wants proof but dislikes hype." }
    ],
    hooks: [
      "Before you choose, check this first.",
      "If this problem keeps coming back, this may be why.",
      "Most people miss this one simple detail."
    ],
    scripts: [
      {
        title: "30-second TikTok script",
        scenes: [
          "0-3s: show the pain point clearly",
          `4-10s: introduce ${product} as a practical option`,
          "11-22s: explain the checklist or key insight",
          "23-30s: invite viewer to message or comment"
        ]
      }
    ],
    captions: [
      {
        caption: `${input.brief}\n\nStart with the problem, check the fit, then choose the next step that makes sense for you.`,
        hashtags: ["#ContentMarketing", "#ThaiBusiness", `#${product.replace(/\s+/g, "")}`]
      }
    ],
    ctas: ["Comment for the checklist", "Message us for details", "Save this before you decide"],
    assumptions: ["No real analytics data was provided.", "Product facts need human/R&D confirmation before publishing."],
    guardrailNotes: ["Draft only. Not published.", "No guaranteed performance claims included."]
  };
}
