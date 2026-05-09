import { readFile } from "node:fs/promises";
import path from "node:path";
import { AgentRepository } from "@/database/repositories/AgentRepository";
import { MemoryRepository } from "@/database/repositories/MemoryRepository";
import { SkillRepository } from "@/database/repositories/SkillRepository";
import type { PersistenceService } from "@/database/PersistenceService";

const workspaceRoot = process.cwd();

export class MigrationBridge {
  private readonly agents: AgentRepository;
  private readonly skills: SkillRepository;
  private readonly memory: MemoryRepository;

  constructor(persistence?: PersistenceService) {
    this.agents = new AgentRepository(persistence);
    this.skills = new SkillRepository(persistence);
    this.memory = new MemoryRepository(persistence);
  }

  async migrateContentCreatorMarkdown(organizationId: string) {
    const agentPath = "company-os/agents/content-creator/AGENT.md";
    const skillsPath = "company-os/agents/content-creator/SKILLS.md";
    const agentMarkdown = await safeRead(agentPath);
    const skillsMarkdown = await safeRead(skillsPath);

    const agent = await this.agents.save({
      organization_id: organizationId,
      agent_key: "content-creator",
      role: "content-creator",
      name: "Content Creator AI",
      responsibilities: extractBullets(agentMarkdown, "Responsibilities"),
      kpis: extractBullets(agentMarkdown, "KPIs"),
      behavior_rules: extractBullets(agentMarkdown, "Behavior Rules"),
      memory_scope: { source: "markdown", path: agentPath },
      permission_profile: { canPublish: false, requiresApprovalForExternalActions: true },
      source_path: agentPath,
      status: "active",
      metadata: { migratedFromMarkdown: true }
    });

    const skillIds = ["hook-generation", "caption-writing", "tiktok-script-writing", "storytelling-framework", "cta-generation", "viral-content-analysis"];
    const skillResults = await Promise.all(
      skillIds.map((skillId) =>
        this.skills.saveSkill({
          organization_id: organizationId,
          agent_id: agent.data?.id,
          agent_key: "content-creator",
          skill_id: skillId,
          name: titleFromSkillId(skillId),
          description: `Migrated starter skill from ${skillsPath}.`,
          purpose: "Structured content production skill.",
          input_schema: { source: "SKILLS.md" },
          output_schema: { structured: true },
          guardrails: extractBullets(skillsMarkdown, "Guardrails"),
          quality_checklist: extractBullets(skillsMarkdown, "Quality Checklist"),
          source_path: skillsPath,
          metadata: { migratedFromMarkdown: true }
        })
      )
    );

    return { agent, skillResults };
  }

  async migrateStarterMemory(organizationId: string) {
    const companyFiles = ["memory/company/COMPANY_MEMORY.md", "memory/company/BRAND_VOICE.md", "memory/company/BUSINESS_GOALS.md"];
    const agentFiles = ["memory/agents/content-creator/AGENT_MEMORY.md", "memory/agents/content-creator/SUCCESSFUL_OUTPUTS.md", "memory/agents/content-creator/FAILED_OUTPUTS.md"];

    const companyResults = await Promise.all(
      companyFiles.map(async (filePath) => {
        const content = await safeRead(filePath);
        return this.memory.saveCompanyMemory({
          organization_id: organizationId,
          title: path.basename(filePath, ".md"),
          content,
          memory_type: "company",
          source_type: "markdown",
          source_id: filePath,
          semantic_tags: ["migration", "company-memory"],
          importance: 5,
          metadata: { migratedFromFile: true, filePath }
        });
      })
    );

    const agentResults = await Promise.all(
      agentFiles.map(async (filePath) => {
        const content = await safeRead(filePath);
        return this.memory.saveAgentMemory({
          organization_id: organizationId,
          agent_key: "content-creator",
          title: path.basename(filePath, ".md"),
          content,
          memory_type: "agent",
          source_type: "markdown",
          source_id: filePath,
          semantic_tags: ["migration", "agent-memory", "content-creator"],
          importance: 5,
          metadata: { migratedFromFile: true, filePath }
        });
      })
    );

    return { companyResults, agentResults };
  }
}

async function safeRead(relativePath: string) {
  return readFile(path.join(workspaceRoot, relativePath), "utf8").catch(() => "");
}

function extractBullets(markdown: string, heading: string) {
  const index = markdown.toLowerCase().indexOf(heading.toLowerCase());
  if (index < 0) return [];
  return markdown
    .slice(index)
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .slice(0, 12)
    .map((line) => line.trim().replace(/^- /, ""));
}

function titleFromSkillId(skillId: string) {
  return skillId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
