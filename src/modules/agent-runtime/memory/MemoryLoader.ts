import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/modules/agent-runtime/markdown";
import { MemoryRegistry } from "@/modules/agent-runtime/memory/MemoryRegistry";
import type { RuntimeMemoryCategory, RuntimeMemoryRecord, RuntimeMemorySource } from "@/modules/agent-runtime/memory/types";

const memoryRoot = path.join(process.cwd(), "memory");

export async function loadFileMemoryRegistry(agentId: string) {
  const registry = new MemoryRegistry();
  const sources = await discoverMemorySources(agentId);

  await Promise.all(
    sources.map(async (source) => {
      registry.registerSource(source);
      registry.registerRecords(await loadRecordsFromSource(source));
    })
  );

  return registry;
}

async function discoverMemorySources(agentId: string): Promise<RuntimeMemorySource[]> {
  const staticSources: RuntimeMemorySource[] = [
    { id: "company-memory", category: "company", path: path.join(memoryRoot, "company", "COMPANY_MEMORY.md"), description: "General company memory" },
    { id: "brand-voice", category: "company", path: path.join(memoryRoot, "company", "BRAND_VOICE.md"), description: "Brand voice rules" },
    { id: "business-goals", category: "company", path: path.join(memoryRoot, "company", "BUSINESS_GOALS.md"), description: "Current business goals" },
    { id: `${agentId}-agent-memory`, category: "agent", path: path.join(memoryRoot, "agents", agentId, "AGENT_MEMORY.md"), agentId, description: "Agent-specific memory" },
    { id: `${agentId}-successful-outputs`, category: "agent", path: path.join(memoryRoot, "agents", agentId, "SUCCESSFUL_OUTPUTS.md"), agentId, description: "Agent successful outputs" },
    { id: `${agentId}-failed-outputs`, category: "agent", path: path.join(memoryRoot, "agents", agentId, "FAILED_OUTPUTS.md"), agentId, description: "Agent failed outputs" },
    { id: "task-history", category: "task_history", path: path.join(memoryRoot, "tasks", "TASK_HISTORY.md"), description: "Task history" },
    { id: "decision-log", category: "decision_log", path: path.join(memoryRoot, "decisions", "DECISION_LOG.md"), description: "Decision log" },
    { id: "workflow-history", category: "workflow", path: path.join(memoryRoot, "workflows", "WORKFLOW_HISTORY.md"), description: "Workflow history" }
  ];

  const existing = await Promise.all(staticSources.map(async (source) => ((await fileExists(source.path)) ? source : null)));
  return existing.filter((source): source is RuntimeMemorySource => Boolean(source));
}

async function loadRecordsFromSource(source: RuntimeMemorySource): Promise<RuntimeMemoryRecord[]> {
  const markdown = await readFile(source.path, "utf8").catch(() => "");
  if (!markdown.trim()) return [];
  const sections = splitMarkdownSections(markdown);

  return sections.map((section, index) => ({
    id: `${source.id}-${slugify(section.title || `section-${index}`)}`,
    category: source.category,
    sourceId: source.id,
    sourcePath: source.path,
    title: section.title || source.description,
    content: section.content,
    tags: inferTags(source, section.content),
    importance: inferImportance(source.category, section.content),
    createdAt: new Date(0).toISOString(),
    agentId: source.agentId,
    relatedWorkflowId: source.category === "workflow" ? "content_creator_execution" : undefined
  }));
}

function splitMarkdownSections(markdown: string) {
  const blocks = markdown.split(/^##\s+/m);
  if (blocks.length === 1) return [{ title: firstHeading(markdown), content: markdown.trim() }];
  return blocks.slice(1).map((block) => {
    const [title = "Memory", ...rest] = block.split("\n");
    return { title: title.trim(), content: rest.join("\n").trim() };
  });
}

function firstHeading(markdown: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Memory";
}

function inferTags(source: RuntimeMemorySource, content: string) {
  const text = `${source.id} ${content}`.toLowerCase();
  const tags = new Set<string>([source.category, source.id]);
  ["tiktok", "hook", "mother", "baby", "brand", "content", "cta", "script", "caption", "decision", "workflow"].forEach((tag) => {
    if (text.includes(tag)) tags.add(tag);
  });
  if (source.agentId) tags.add(source.agentId);
  return Array.from(tags);
}

function inferImportance(category: RuntimeMemoryCategory, content: string) {
  const base = category === "company" || category === "decision_log" ? 8 : category === "agent" ? 7 : 6;
  return content.toLowerCase().includes("important") ? Math.min(10, base + 1) : base;
}

async function fileExists(filePath: string) {
  try {
    await readdir(path.dirname(filePath));
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}
