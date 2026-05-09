import type { SkillDefinition, SkillExecutionInput, SkillValidationResult } from "@/modules/agent-runtime/skills/types";

export function validateSkillInput(skill: SkillDefinition, input: SkillExecutionInput) {
  return skill.requiredInputs.filter((key) => input.inputs[toInputKey(key)] === undefined);
}

export function validateSkillOutput(skill: SkillDefinition, input: SkillExecutionInput, output: Record<string, unknown>): SkillValidationResult {
  const missingInputs = validateSkillInput(skill, input);
  const missingOutputFields = skill.outputSchema.filter((field) => field.required && output[field.key] === undefined).map((field) => field.key);
  const guardrailViolations = findGuardrailViolations(skill, output);
  const qualityNotes = skill.qualityChecklist.map((item) => `Check: ${item}`);
  const improvementNotes = [
    ...missingInputs.map((item) => `Provide required input: ${item}`),
    ...missingOutputFields.map((item) => `Output is missing field: ${item}`),
    ...guardrailViolations.map((item) => `Resolve guardrail risk: ${item}`)
  ];
  const passed = missingInputs.length === 0 && missingOutputFields.length === 0 && guardrailViolations.length === 0;

  return {
    passed,
    score: passed ? 1 : Math.max(0, 1 - (missingInputs.length + missingOutputFields.length + guardrailViolations.length) * 0.2),
    missingInputs,
    missingOutputFields,
    guardrailViolations,
    qualityNotes,
    improvementNotes
  };
}

function findGuardrailViolations(skill: SkillDefinition, output: Record<string, unknown>) {
  const serialized = JSON.stringify(output).toLowerCase();
  const riskyTerms = ["guarantee", "100%", "cure", "หายขาด", "รับประกันผล", "รักษา"];
  const genericViolations = riskyTerms.filter((term) => serialized.includes(term.toLowerCase()));
  const publishViolation = skill.guardrails.some((guardrail) => guardrail.toLowerCase().includes("do not publish")) && serialized.includes("published");
  return publishViolation ? [...genericViolations, "Publishing action claimed without publishing harness"] : genericViolations;
}

function toInputKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
