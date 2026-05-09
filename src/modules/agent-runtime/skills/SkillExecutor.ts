import { executeJsonGeneration } from "@/modules/agent-runtime/harness-executor";
import { validateSkillOutput } from "@/modules/agent-runtime/skills/SkillValidator";
import type { SkillDefinition, SkillExecutionInput, SkillExecutionResult, SkillExecutorOptions } from "@/modules/agent-runtime/skills/types";

export async function executeSkill<TOutput extends Record<string, unknown>>(
  skill: SkillDefinition,
  input: SkillExecutionInput,
  options: SkillExecutorOptions<TOutput> = {}
): Promise<SkillExecutionResult<TOutput>> {
  const fallbackOutput = options.fallbackOutput ?? (buildGenericFallback(skill, input) as TOutput);
  const generated = await executeJsonGeneration<TOutput>({
    system: [
      `You are executing one AI Company OS skill: ${skill.name}.`,
      `Purpose: ${skill.purpose}`,
      `SOP steps:\n${skill.sopSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}`,
      `Output schema keys: ${skill.outputSchema.map((field) => field.key).join(", ")}`,
      `Guardrails:\n${skill.guardrails.map((item) => `- ${item}`).join("\n")}`,
      "Return JSON only. Do not claim that external tools ran unless the harness reports them."
    ].join("\n\n"),
    user: {
      taskIntent: input.taskIntent,
      inputs: input.inputs,
      memory: input.memory?.injected ?? [],
      memorySummary: input.memory?.injected.map((item) => item.content.slice(0, 240)).join("\n"),
      examples: skill.examples
    },
    fallback: fallbackOutput
  });
  const validation = validateSkillOutput(skill, input, generated.output);

  return {
    skill,
    input,
    output: generated.output,
    validation,
    harness: generated.harness,
    errors: validation.passed ? [] : validation.improvementNotes,
    improvementNotes: validation.improvementNotes
  };
}

function buildGenericFallback(skill: SkillDefinition, input: SkillExecutionInput) {
  return Object.fromEntries(
    skill.outputSchema.map((field) => [
      field.key,
      field.type === "string[]" ? [`Draft ${field.key} for ${input.taskIntent}`] : field.type === "object[]" ? [] : `Draft ${field.key} for ${input.taskIntent}`
    ])
  );
}
