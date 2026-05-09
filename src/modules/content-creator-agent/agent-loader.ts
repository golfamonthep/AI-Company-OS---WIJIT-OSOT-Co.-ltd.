import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AgentMarkdownProfile } from "@/modules/content-creator-agent/contracts";

const agentDir = path.join(process.cwd(), "company-os", "agents", "content-creator");

export async function loadContentCreatorAgentProfile(): Promise<AgentMarkdownProfile> {
  const [agentMarkdown, skillsMarkdown, architectureMarkdown] = await Promise.all([
    readFile(path.join(agentDir, "AGENT.md"), "utf8"),
    readFile(path.join(agentDir, "SKILLS.md"), "utf8"),
    readFile(path.join(agentDir, "ARCHITECTURE.md"), "utf8").catch(() => undefined)
  ]);

  return {
    agentId: "content-creator",
    agentMarkdown,
    skillsMarkdown,
    architectureMarkdown
  };
}
