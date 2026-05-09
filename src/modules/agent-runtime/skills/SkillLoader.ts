import { readFile } from "node:fs/promises";
import path from "node:path";
import type { HarnessToolName } from "@/modules/agent-runtime/contracts";
import { MarkdownContractError, slugify, splitList } from "@/modules/agent-runtime/markdown";
import type { SkillDefinition, SkillOutputField } from "@/modules/agent-runtime/skills/types";

export async function loadSkillsForAgent(agentId: string): Promise<{ rawMarkdown: string; skills: SkillDefinition[] }> {
  const skillsPath = path.join(process.cwd(), "company-os", "agents", agentId, "SKILLS.md");
  const rawMarkdown = await readFile(skillsPath, "utf8");
  return loadSkillsFromMarkdown(agentId, rawMarkdown);
}

export function loadSkillsFromMarkdown(agentId: string, rawMarkdown: string): { rawMarkdown: string; skills: SkillDefinition[] } {
  const blocks = rawMarkdown.split(/^##\s+Skill:\s+/im).slice(1);
  if (!blocks.length) {
    throw new MarkdownContractError(`${agentId}/SKILLS.md`, ["Missing at least one '## Skill:' block"]);
  }

  const skills = blocks.map((block) => parseSkillBlock(agentId, block));
  const violations = skills.flatMap((skill) => validateSkillDefinition(skill));
  if (violations.length) {
    throw new MarkdownContractError(`${agentId}/SKILLS.md`, violations);
  }

  return {
    rawMarkdown,
    skills
  };
}

function parseSkillBlock(agentId: string, block: string): SkillDefinition {
  const [nameLine = "Unnamed Skill", ...rest] = block.split("\n");
  const name = nameLine.trim();
  const body = rest.join("\n").trim();
  const skillId = getScalarSection(body, "Skill ID") || slugify(name);

  return {
    skillId,
    agentId,
    name,
    purpose: getScalarSection(body, "Purpose") || `Operational skill: ${name}`,
    whenToUse: getListSection(body, "When To Use"),
    requiredInputs: getListSection(body, "Required Inputs", "Inputs"),
    optionalInputs: getListSection(body, "Optional Inputs"),
    sopSteps: getListSection(body, "SOP Steps", "SOP", "Workflow"),
    outputSchema: parseOutputSchema(getSection(body, "Output Schema") ?? getSection(body, "Outputs")),
    guardrails: getListSection(body, "Guardrails"),
    qualityChecklist: getListSection(body, "Quality Checklist"),
    failureModes: getListSection(body, "Failure Modes"),
    examples: getListSection(body, "Examples"),
    harnessToolsNeeded: parseHarnessTools(getListSection(body, "Harness Tools Needed")),
    memoryUsage: getListSection(body, "Memory Usage"),
    successMetrics: getListSection(body, "Success Metrics"),
    rawMarkdown: `## Skill: ${name}\n${body}`.trim()
  };
}

function getSection(markdown: string, heading: string) {
  const pattern = new RegExp(`^###\\s+${escapeRegExp(heading)}\\s*$([\\s\\S]*?)(?=^###\\s+|(?![\\s\\S]))`, "im");
  return markdown.match(pattern)?.[1]?.trim();
}

function getScalarSection(markdown: string, heading: string) {
  return getSection(markdown, heading)?.split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
}

function getListSection(markdown: string, heading: string, ...fallbackHeadings: string[]) {
  const section = [heading, ...fallbackHeadings].map((candidate) => getSection(markdown, candidate)).find((candidate) => candidate !== undefined);
  return splitList(section);
}

function parseOutputSchema(section?: string): SkillOutputField[] {
  return splitList(section).map((line) => {
    const match = line.match(/^([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z[\]]+)(?:\s*-\s*(.*))?$/);
    return {
      key: match?.[1] ?? slugify(line),
      type: parseFieldType(match?.[2]),
      required: true,
      description: match?.[3] ?? line
    };
  });
}

function parseFieldType(value?: string): SkillOutputField["type"] {
  if (value === "string" || value === "string[]" || value === "object" || value === "object[]" || value === "number" || value === "boolean") return value;
  return "unknown";
}

function parseHarnessTools(values: string[]): HarnessToolName[] {
  const allowed: HarnessToolName[] = ["openai", "filesystem", "memory", "web_search", "json_parser", "node_runtime", "python_runtime"];
  return values.map((value) => slugify(value) as HarnessToolName).filter((value): value is HarnessToolName => allowed.includes(value));
}

function validateSkillDefinition(skill: SkillDefinition) {
  const prefix = `Skill '${skill.name}'`;
  const violations: string[] = [];
  if (!skill.skillId) violations.push(`${prefix} is missing Skill ID or slug-safe title`);
  if (!skill.purpose) violations.push(`${prefix} is missing Purpose`);
  if (!skill.requiredInputs.length) violations.push(`${prefix} is missing Required Inputs or Inputs`);
  if (!skill.sopSteps.length) violations.push(`${prefix} is missing SOP Steps, SOP, or Workflow`);
  if (!skill.outputSchema.length) violations.push(`${prefix} is missing Output Schema or Outputs`);
  if (!skill.guardrails.length) violations.push(`${prefix} is missing Guardrails`);
  return violations;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
