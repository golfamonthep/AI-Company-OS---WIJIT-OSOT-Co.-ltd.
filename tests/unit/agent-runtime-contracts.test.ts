import { describe, expect, it } from "vitest";
import { getMarkdownList, getMarkdownSection, MarkdownContractError, requireMarkdownSection } from "@/modules/agent-runtime/markdown";
import { loadSkillsFromMarkdown } from "@/modules/agent-runtime/skills/SkillLoader";

describe("agent runtime markdown contracts", () => {
  it("extracts top-level markdown sections without swallowing later headings", () => {
    const markdown = [
      "# Agent",
      "## Mission",
      "Own the work.",
      "",
      "## Responsibilities",
      "- Plan",
      "- Execute",
      "",
      "## Authority",
      "Draft only."
    ].join("\n");

    expect(getMarkdownSection(markdown, "Mission")).toBe("Own the work.");
    expect(getMarkdownList(markdown, "Responsibilities")).toEqual(["Plan", "Execute"]);
  });

  it("throws a readable contract error when required AGENT sections are missing", () => {
    expect(() => requireMarkdownSection("# Agent", "Mission", "demo/AGENT.md")).toThrow(MarkdownContractError);
    expect(() => requireMarkdownSection("# Agent", "Mission", "demo/AGENT.md")).toThrow("Missing required section: Mission");
  });

  it("parses executable SKILLS.md blocks into runtime skill definitions", () => {
    const markdown = [
      "# Demo Skills",
      "## Skill: Hook Generation",
      "### Skill ID",
      "hook_generation",
      "### Purpose",
      "Generate hooks.",
      "### Required Inputs",
      "- content_brief",
      "- channel",
      "### SOP Steps",
      "1. Read the brief.",
      "2. Generate options.",
      "### Output Schema",
      "- hooks: string[] - hook options",
      "- best_hook: string - recommended option",
      "### Guardrails",
      "- Do not overclaim.",
      "### Harness Tools Needed",
      "- openai",
      "- json_parser"
    ].join("\n");

    const result = loadSkillsFromMarkdown("content-creator", markdown);

    expect(result.skills).toHaveLength(1);
    expect(result.skills[0]).toMatchObject({
      skillId: "hook_generation",
      agentId: "content-creator",
      name: "Hook Generation",
      requiredInputs: ["content_brief", "channel"],
      sopSteps: ["Read the brief.", "Generate options."],
      harnessToolsNeeded: ["openai", "json_parser"]
    });
    expect(result.skills[0].outputSchema).toEqual([
      { key: "hooks", type: "string[]", required: true, description: "hook options" },
      { key: "best_hook", type: "string", required: true, description: "recommended option" }
    ]);
  });

  it("supports legacy skill headings while normalizing them into the contract", () => {
    const markdown = [
      "# Demo Skills",
      "## Skill: Executive Synthesis",
      "### Workflow",
      "- Collect outputs",
      "- Produce recommendation",
      "### Inputs",
      "- Business objective",
      "### Outputs",
      "- executive_summary",
      "### Guardrails",
      "- Keep decision audit-ready."
    ].join("\n");

    const result = loadSkillsFromMarkdown("ceo", markdown);

    expect(result.skills[0].purpose).toBe("Operational skill: Executive Synthesis");
    expect(result.skills[0].requiredInputs).toEqual(["Business objective"]);
    expect(result.skills[0].sopSteps).toEqual(["Collect outputs", "Produce recommendation"]);
    expect(result.skills[0].outputSchema[0]).toMatchObject({ key: "executive_summary", type: "unknown", required: true });
  });

  it("rejects SKILLS.md blocks that cannot execute through the runtime contract", () => {
    const markdown = [
      "# Demo Skills",
      "## Skill: Thin Placeholder",
      "### Purpose",
      "Too little structure."
    ].join("\n");

    expect(() => loadSkillsFromMarkdown("demo", markdown)).toThrow(MarkdownContractError);
    expect(() => loadSkillsFromMarkdown("demo", markdown)).toThrow("missing Required Inputs or Inputs");
  });
});
