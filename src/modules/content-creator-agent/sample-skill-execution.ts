import type { AgentRuntimeMemoryContext } from "@/modules/agent-runtime/contracts";
import { buildInjectedMemoryContext, toAgentRuntimeMemoryContext } from "@/modules/agent-runtime/memory/ContextInjector";
import { loadFileMemoryRegistry } from "@/modules/agent-runtime/memory/MemoryLoader";
import { retrieveRelevantMemory } from "@/modules/agent-runtime/memory/MemoryRetriever";
import { createSkillRegistry } from "@/modules/agent-runtime/skills/SkillRegistry";
import { executeSkill } from "@/modules/agent-runtime/skills/SkillExecutor";
import { loadSkillsForAgent } from "@/modules/agent-runtime/skills/SkillLoader";

export async function runMotherAndBabyHookSample(memory?: AgentRuntimeMemoryContext) {
  const agentId = "content-creator";
  const loaded = await loadSkillsForAgent(agentId);
  const registry = createSkillRegistry(agentId, loaded.skills);
  const skill = registry.get(agentId, "hook_generation") ?? registry.selectBest(agentId, "Generate 10 TikTok hooks for a mother-and-baby product");

  if (!skill) {
    throw new Error("Hook Generation skill is not registered.");
  }
  const memoryContext = memory ?? (await loadSampleMemory(agentId));

  return executeSkill(skill, {
    organizationId: "sample-organization",
    agentId,
    skillId: skill.skillId,
    taskIntent: "Generate 10 TikTok hooks for a mother-and-baby product",
    requestedByWorkflowId: "content_creator_execution",
    memory: memoryContext,
    inputs: {
      content_brief: "Generate 10 TikTok hooks for a mother-and-baby product",
      product_name: "Mother and baby product",
      target_audience: "New mothers",
      channel: "tiktok",
      content_goal: "engagement",
      tone: "friendly"
    }
  });
}

async function loadSampleMemory(agentId: string): Promise<AgentRuntimeMemoryContext> {
  const registry = await loadFileMemoryRegistry(agentId);
  const ranked = retrieveRelevantMemory(registry, {
    organizationId: "sample-organization",
    agentId,
    workflowId: "content_creator_execution",
    taskIntent: "Generate 10 TikTok hooks for a mother-and-baby product",
    limit: 8
  });
  return toAgentRuntimeMemoryContext(buildInjectedMemoryContext(ranked, 3000));
}
