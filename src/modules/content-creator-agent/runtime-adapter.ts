import type { AgentRuntimeContext, AgentWorkflowAdapter } from "@/modules/agent-runtime/contracts";
import { executeHarnessTask } from "@/modules/agent-runtime/harness/HarnessExecutor";
import { saveSkillExecutionLog } from "@/modules/agent-runtime/logs/SkillExecutionLogger";
import { executeSkill } from "@/modules/agent-runtime/skills/SkillExecutor";
import { createSkillRegistry } from "@/modules/agent-runtime/skills/SkillRegistry";
import type { SkillDefinition, SkillExecutionResult } from "@/modules/agent-runtime/skills/types";
import type { ContentCreatorExecutionInput, ContentCreatorStructuredOutput, SelectedContentSkill } from "@/modules/content-creator-agent/contracts";
import { evaluateContentGuardrails } from "@/modules/content-creator-agent/guardrails";
import { selectContentCreatorSkills } from "@/modules/content-creator-agent/skill-selector";

export const contentCreatorRuntimeAdapter: AgentWorkflowAdapter<ContentCreatorExecutionInput, ContentCreatorStructuredOutput> = {
  workflowId: "content_creator_execution",
  selectSkills: (context) => {
    const registry = createSkillRegistry(context.input.agentId, context.skills);
    const selected = selectContentCreatorSkills(context.input.payload).filter((skillId) => registry.get(context.input.agentId, skillId));
    return selected.length ? selected : registry.search(context.input.agentId, context.input.objective).slice(0, 3).map((entry) => entry.skill.skillId);
  },
  execute: async (context) => {
    const skillResults = await Promise.all(
      context.selectedSkillIds.map(async (skillId) => {
        const skill = context.skills.find((item) => item.skillId === skillId);
        if (!skill) return null;

        const result = await executeSkill<Record<string, unknown>>(skill, buildSkillExecutionInput(context, skill), {
          supabase: context.supabase,
          fallbackOutput: buildSkillFallback(skill, context.input.payload) as Record<string, unknown>
        });
        await saveSkillExecutionLog(context.supabase, result);
        return result;
      })
    );
    const validResults = skillResults.filter((result): result is SkillExecutionResult<Record<string, unknown>> => result !== null);
    const output = buildContentOutputFromSkills(validResults, context.input.payload);
    const artifact = await saveContentArtifact(context, output);

    return {
      output,
      harness: [
        ...validResults.flatMap((result) => result.harness),
        {
          tool: "filesystem",
          status: artifact.status === "success" ? "used" : "failed",
          summary: artifact.status === "success" ? "Saved generated content output to artifacts." : artifact.error ?? "Filesystem artifact save failed."
        }
      ]
    };
  },
  validateOutput: (output, context) => {
    const contentGuardrails = evaluateContentGuardrails(context.input.payload, output);
    return {
      passed: contentGuardrails.passed,
      blockedReasons: contentGuardrails.blockedClaims,
      requiredApprovals: contentGuardrails.requiredApprovals,
      notes: contentGuardrails.notes
    };
  },
  summarizeTask: (output) => `Generated ${output.hooks.length} hooks, ${output.scripts.length} scripts, and ${output.captions.length} captions.`,
  buildLearningNote: (output, guardrails, context) =>
    [
      `Content Creator generated structured output for brief: ${context.input.payload.brief}`,
      `Selected skills: ${context.selectedSkillIds.join(", ")}`,
      `Guardrail passed: ${guardrails.passed}`,
      `Assumptions: ${output.assumptions.join(" | ")}`
    ].join("\n")
};

async function saveContentArtifact(context: AgentRuntimeContext<ContentCreatorExecutionInput>, output: ContentCreatorStructuredOutput) {
  const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
  return executeHarnessTask(
    {
      organizationId: context.input.organizationId,
      agentId: context.input.agentId,
      moduleId: "filesystem",
      action: "write_file",
      input: {
        path: `artifacts/content-creator/${safeDate}-content-output.json`,
        content: JSON.stringify({ input: context.input.payload, selectedSkills: context.selectedSkillIds, output }, null, 2)
      },
      timeoutMs: 5000,
      retries: 1
    },
    context.supabase
  );
}

function buildSkillExecutionInput(context: AgentRuntimeContext<ContentCreatorExecutionInput>, skill: SkillDefinition) {
  const payload = context.input.payload;
  return {
    organizationId: context.input.organizationId,
    agentId: context.input.agentId,
    skillId: skill.skillId,
    taskIntent: `${skill.name}: ${context.input.objective}`,
    requestedByWorkflowId: context.input.workflowId,
    memory: context.memory,
    inputs: {
      content_brief: payload.brief,
      brief: payload.brief,
      product_name: payload.productName,
      target_audience: payload.targetAudience,
      channel: payload.channel ?? "tiktok",
      content_goal: payload.contentGoal ?? "engagement",
      tone: payload.tone ?? "friendly",
      constraints: payload.constraints ?? []
    }
  };
}

export function mapRuntimeSkillIdsToContentSkills(skillIds: string[]): SelectedContentSkill[] {
  return skillIds.filter((skillId): skillId is SelectedContentSkill =>
    ["hook_generation", "caption_writing", "tiktok_scripting", "storytelling", "viral_content_analysis", "cta_generation"].includes(skillId)
  );
}

function normalizeContentOutput(value: Partial<ContentCreatorStructuredOutput>): ContentCreatorStructuredOutput {
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

function buildContentOutputFromSkills(results: SkillExecutionResult<Record<string, unknown>>[], input: ContentCreatorExecutionInput): ContentCreatorStructuredOutput {
  const fallback = buildDeterministicFallback(input);
  const concepts = collectObjects(results, "content_concepts", "concepts") as ContentCreatorStructuredOutput["contentConcepts"] | undefined;
  const scripts = collectObjects(results, "scripts") as ContentCreatorStructuredOutput["scripts"] | undefined;
  const captions = collectObjects(results, "captions") as ContentCreatorStructuredOutput["captions"] | undefined;

  return normalizeContentOutput({
    contentConcepts: concepts ?? fallback.contentConcepts,
    hooks: collectStrings(results, "hooks") ?? fallback.hooks,
    scripts: scripts ?? fallback.scripts,
    captions: captions ?? fallback.captions,
    ctas: collectStrings(results, "ctas") ?? fallback.ctas,
    assumptions: [
      ...fallback.assumptions,
      ...results.flatMap((result) => result.improvementNotes.map((note) => `${result.skill.name}: ${note}`))
    ],
    guardrailNotes: results.flatMap((result) => result.validation.guardrailViolations).length
      ? results.flatMap((result) => result.validation.guardrailViolations)
      : fallback.guardrailNotes
  });
}

function collectStrings(results: SkillExecutionResult<Record<string, unknown>>[], ...keys: string[]) {
  const values = results.flatMap((result) => keys.flatMap((key) => arrayValue(result.output[key]))).filter((item): item is string => typeof item === "string");
  return values.length ? values : undefined;
}

function collectObjects(results: SkillExecutionResult<Record<string, unknown>>[], ...keys: string[]) {
  const values = results.flatMap((result) => keys.flatMap((key) => arrayValue(result.output[key]))).filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  return values.length ? values : undefined;
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}

function buildSkillFallback(skill: SkillDefinition, input: ContentCreatorExecutionInput) {
  const fallback = buildDeterministicFallback(input);

  if (skill.skillId === "hook_generation") return { hooks: fallback.hooks, hook_rationale: "Fallback hooks based on audience pain and product fit.", best_hook: fallback.hooks[0] };
  if (skill.skillId === "caption_writing") return { captions: fallback.captions, hashtags: fallback.captions[0]?.hashtags ?? [] };
  if (skill.skillId === "tiktok_scripting") return { scripts: fallback.scripts, production_notes: ["Use simple visual cuts and avoid unsupported claims."] };
  if (skill.skillId === "storytelling") return { content_concepts: fallback.contentConcepts, story_arc: "Problem, tension, practical option, low-friction next step." };
  if (skill.skillId === "cta_generation") return { ctas: fallback.ctas, recommended_cta: fallback.ctas[0] };
  if (skill.skillId === "viral_content_analysis") return { pattern_analysis: "Use curiosity gap plus practical checklist.", reusable_principles: ["Clear first 3 seconds", "Specific audience pain"], risk_notes: ["No guaranteed virality."] };

  return { notes: [`No fallback is configured for ${skill.name}.`] };
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
    hooks: ["Before you choose, check this first.", "If this problem keeps coming back, this may be why.", "Most people miss this one simple detail."],
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
