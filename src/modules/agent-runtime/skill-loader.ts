import type { AgentSkillDefinition } from "@/modules/agent-runtime/contracts";
import { loadSkillsForAgent } from "@/modules/agent-runtime/skills/SkillLoader";

export async function loadAgentRuntimeSkills(agentId: string): Promise<{ rawMarkdown: string; skills: AgentSkillDefinition[] }> {
  return loadSkillsForAgent(agentId);
}
