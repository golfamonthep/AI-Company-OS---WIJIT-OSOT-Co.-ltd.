import type { SkillDefinition } from "@/modules/agent-runtime/skills/types";

export class SkillRegistry {
  private readonly skillsByAgent = new Map<string, SkillDefinition[]>();

  register(agentId: string, skills: SkillDefinition[]) {
    this.skillsByAgent.set(agentId, skills);
  }

  list(agentId: string) {
    return this.skillsByAgent.get(agentId) ?? [];
  }

  get(agentId: string, skillId: string) {
    return this.list(agentId).find((skill) => skill.skillId === skillId);
  }

  search(agentId: string, intent: string) {
    const terms = tokenize(intent);
    return this.list(agentId)
      .map((skill) => ({ skill, score: scoreSkill(skill, terms) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  selectBest(agentId: string, intent: string) {
    return this.search(agentId, intent)[0]?.skill;
  }
}

export function createSkillRegistry(agentId: string, skills: SkillDefinition[]) {
  const registry = new SkillRegistry();
  registry.register(agentId, skills);
  return registry;
}

function scoreSkill(skill: SkillDefinition, terms: string[]) {
  const haystack = [
    skill.skillId,
    skill.name,
    skill.purpose,
    skill.whenToUse.join(" "),
    skill.successMetrics.join(" "),
    skill.outputSchema.map((field) => field.key).join(" ")
  ]
    .join(" ")
    .toLowerCase();

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9ก-๙]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
}
