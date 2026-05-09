import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AgentRuntimeProfile } from "@/modules/agent-runtime/contracts";
import { assertMarkdownSections, getMarkdownList, requireMarkdownSection } from "@/modules/agent-runtime/markdown";

const REQUIRED_AGENT_SECTIONS = ["Mission", "Responsibilities", "Authority", "Memory Access", "Collaboration"];

export async function loadAgentRuntimeProfile(agentId: string): Promise<AgentRuntimeProfile> {
  const agentPath = path.join(process.cwd(), "company-os", "agents", agentId);
  const [agentMarkdown, architectureMarkdown] = await Promise.all([
    readFile(path.join(agentPath, "AGENT.md"), "utf8"),
    readFile(path.join(agentPath, "ARCHITECTURE.md"), "utf8").catch(() => undefined)
  ]);
  assertMarkdownSections(agentMarkdown, REQUIRED_AGENT_SECTIONS, `${agentId}/AGENT.md`);

  return {
    agentId,
    agentPath,
    agentMarkdown,
    architectureMarkdown,
    roleMetadata: {
      mission: requireMarkdownSection(agentMarkdown, "Mission", `${agentId}/AGENT.md`),
      authority: requireMarkdownSection(agentMarkdown, "Authority", `${agentId}/AGENT.md`),
      memoryAccess: requireMarkdownSection(agentMarkdown, "Memory Access", `${agentId}/AGENT.md`),
      collaboration: requireMarkdownSection(agentMarkdown, "Collaboration", `${agentId}/AGENT.md`)
    },
    responsibilities: getMarkdownList(agentMarkdown, "Responsibilities"),
    kpis: getMarkdownList(agentMarkdown, "KPIs"),
    behaviorRules: getMarkdownList(agentMarkdown, "Behavior Rules")
  };
}
