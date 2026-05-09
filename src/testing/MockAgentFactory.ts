import type { AgentRuntimeProfile } from "@/modules/agent-runtime/contracts";
import type { SkillDefinition } from "@/modules/agent-runtime/skills/types";

export type MockAgent = AgentRuntimeProfile & {
  displayName: string;
  skills: SkillDefinition[];
};

export class MockAgentFactory {
  createAgent(agentId: string, overrides: Partial<MockAgent> = {}): MockAgent {
    const skills = overrides.skills ?? [this.createSkill(agentId, `${agentId}-default-skill`)];

    return {
      agentId,
      displayName: overrides.displayName ?? this.toDisplayName(agentId),
      agentPath: overrides.agentPath ?? `company-os/agents/${agentId}/AGENT.md`,
      agentMarkdown: overrides.agentMarkdown ?? `# ${this.toDisplayName(agentId)}`,
      architectureMarkdown: overrides.architectureMarkdown,
      roleMetadata: overrides.roleMetadata ?? {
        mission: "Execute deterministic QA fixture work.",
        authority: "Mock-only execution.",
        memoryAccess: "workspace-scoped",
        collaboration: "handoff through simulation engine"
      },
      responsibilities: overrides.responsibilities ?? ["Execute test scenario step"],
      kpis: overrides.kpis ?? ["deterministic output", "auditable handoff"],
      behaviorRules: overrides.behaviorRules ?? ["Do not call external systems"],
      skills
    };
  }

  createContentCreator() {
    return this.createAgent("content-creator", {
      displayName: "Content Creator AI",
      responsibilities: ["Generate scripts", "Apply brand voice", "Respect publishing guardrails"],
      skills: [this.createSkill("content-creator", "tiktok-script-generation")]
    });
  }

  createMotherBabyCampaignTeam() {
    return {
      ceo: this.createAgent("ceo", { displayName: "CEO AI" }),
      marketing: this.createAgent("marketing", { displayName: "Marketing AI" }),
      contentCreator: this.createContentCreator()
    };
  }

  createSkill(agentId: string, skillId: string): SkillDefinition {
    return {
      skillId,
      agentId,
      name: this.toDisplayName(skillId),
      purpose: "Produce deterministic test output for QA scenarios.",
      whenToUse: ["unit tests", "workflow simulations"],
      requiredInputs: ["objective"],
      optionalInputs: ["audience", "channel"],
      sopSteps: ["Read objective", "Inject memory context", "Generate output", "Return audit-ready summary"],
      outputSchema: [{ key: "summary", type: "string", required: true }],
      guardrails: ["No external publishing", "No unsupported health claims"],
      qualityChecklist: ["Output has summary", "Output cites memory when provided"],
      failureModes: ["missing objective"],
      examples: ["Generate TikTok campaign scripts from a campaign brief."],
      harnessToolsNeeded: ["memory", "json_parser"],
      memoryUsage: ["brand voice", "audience insights", "decision logs"],
      successMetrics: ["valid schema", "approval checkpoint generated"],
      rawMarkdown: `## Skill: ${skillId}`
    };
  }

  private toDisplayName(value: string) {
    return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }
}
