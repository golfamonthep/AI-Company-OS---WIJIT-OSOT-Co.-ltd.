import { readFile } from "node:fs/promises";
import path from "node:path";
import { slugify, splitList } from "@/modules/agent-runtime/markdown";
import type { WorkflowDefinition, WorkflowStepDefinition, WorkflowStepType } from "@/modules/agent-runtime/workflows/types";

const workflowRoot = path.join(process.cwd(), "company-os", "workflows");

export class WorkflowRegistry {
  private readonly workflows = new Map<string, WorkflowDefinition>();

  register(definition: WorkflowDefinition) {
    this.workflows.set(definition.workflowId, definition);
  }

  get(workflowId: string) {
    return this.workflows.get(workflowId);
  }

  list() {
    return Array.from(this.workflows.values());
  }
}

export async function loadWorkflowDefinition(workflowId: string) {
  const workflowPath = path.join(workflowRoot, workflowIdToFolder(workflowId), "WORKFLOW.md");
  const markdown = await readFile(workflowPath, "utf8");
  return parseWorkflowMarkdown(markdown);
}

export async function createWorkflowRegistry(workflowIds: string[]) {
  const registry = new WorkflowRegistry();
  const definitions = await Promise.all(workflowIds.map((workflowId) => loadWorkflowDefinition(workflowId)));
  definitions.forEach((definition) => registry.register(definition));
  return registry;
}

export function parseWorkflowMarkdown(markdown: string): WorkflowDefinition {
  const workflowId = getScalar(markdown, "Workflow ID") || "unknown_workflow";
  return {
    workflowId,
    name: getScalar(markdown, "Name") || titleFromMarkdown(markdown),
    purpose: getScalar(markdown, "Purpose") || getScalar(markdown, "Objective") || "",
    participatingAgents: splitList(getSection(markdown, "Participating Agents")),
    inputs: splitList(getSection(markdown, "Inputs")),
    outputs: splitList(getSection(markdown, "Outputs")),
    steps: parseSteps(getSection(markdown, "Steps") || getSection(markdown, "Runtime Steps")),
    approvalPoints: splitList(getSection(markdown, "Approval Points")),
    memoryUpdates: splitList(getSection(markdown, "Memory Updates")),
    successMetrics: splitList(getSection(markdown, "Success Metrics")),
    failureHandling: splitList(getSection(markdown, "Failure Handling")),
    rawMarkdown: markdown
  };
}

function parseSteps(section?: string): WorkflowStepDefinition[] {
  const lines = splitList(section);
  const parsedSteps: WorkflowStepDefinition[] = [];

  lines.forEach((line, index) => {
    const parsed = parseStepLine(line);
    const stepId = parsed.stepId || `step_${index + 1}`;
    parsedSteps.push({
      stepId,
      name: parsed.name || line,
      type: parsed.type,
      agentId: parsed.agentId || "workflow-engine",
      description: parsed.description || line,
      dependsOn: index === 0 ? [] : [parsedSteps[index - 1].stepId],
      approvalRequired: parsed.type === "approval" || line.toLowerCase().includes("approval"),
      maxRetries: 2,
      expectedOutput: parsed.expectedOutput || "Structured step output"
    });
  });

  return parsedSteps;
}

function parseStepLine(line: string) {
  const parts = line.split("|").map((part) => part.trim());
  return {
    stepId: parts[0] ? slugify(parts[0]) : undefined,
    name: parts[1],
    agentId: parts[2],
    type: parseStepType(parts[3]),
    expectedOutput: parts[4],
    description: parts[5]
  };
}

function parseStepType(value?: string): WorkflowStepType {
  if (value === "agent_task" || value === "approval" || value === "memory_update" || value === "handoff" || value === "report") return value;
  return "task";
}

function workflowIdToFolder(workflowId: string) {
  return workflowId.replace(/_/g, "-");
}

function getSection(markdown: string, heading: string) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, "im");
  return markdown.match(pattern)?.[1]?.trim();
}

function getScalar(markdown: string, heading: string) {
  return getSection(markdown, heading)?.split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
}

function titleFromMarkdown(markdown: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Workflow";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
