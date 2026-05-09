import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { MemoryWriteInput } from "@/modules/agent-runtime/memory/types";

const memoryRoot = path.join(process.cwd(), "memory");

export async function saveTaskMemory(input: MemoryWriteInput) {
  const now = new Date().toISOString();
  await appendMarkdown(path.join(memoryRoot, "tasks", "TASK_HISTORY.md"), [
    `## ${now} - ${input.taskIntent}`,
    "",
    `- Agent: ${input.agentId}`,
    `- Workflow: ${input.workflowId ?? "none"}`,
    `- Output: ${input.outputSummary}`,
    `- Tags: ${(input.tags ?? []).join(", ") || "none"}`,
    ""
  ].join("\n"));
}

export async function saveAgentLearningMemory(input: MemoryWriteInput) {
  if (!input.learningNote) return;
  const now = new Date().toISOString();
  await appendMarkdown(path.join(memoryRoot, "agents", input.agentId, "AGENT_MEMORY.md"), [
    `## ${now} - Learning`,
    "",
    `- Task: ${input.taskIntent}`,
    `- Learning: ${input.learningNote}`,
    `- Workflow: ${input.workflowId ?? "none"}`,
    ""
  ].join("\n"));
}

export async function saveDecisionMemory(input: MemoryWriteInput) {
  if (!input.decision) return;
  const now = new Date().toISOString();
  await appendMarkdown(path.join(memoryRoot, "decisions", "DECISION_LOG.md"), [
    `## ${now} - ${input.taskIntent}`,
    "",
    `- Owner: ${input.decision.owner}`,
    `- Reasoning: ${input.decision.reasoning}`,
    `- Related workflow: ${input.decision.relatedWorkflowId ?? input.workflowId ?? "none"}`,
    ""
  ].join("\n"));
}

export async function saveWorkflowMemory(input: MemoryWriteInput) {
  if (!input.workflowId) return;
  const now = new Date().toISOString();
  await appendMarkdown(path.join(memoryRoot, "workflows", "WORKFLOW_HISTORY.md"), [
    `## ${now} - ${input.workflowId}`,
    "",
    `- Task: ${input.taskIntent}`,
    `- Result: ${input.outputSummary}`,
    ""
  ].join("\n"));
}

export async function saveRuntimeMemory(input: MemoryWriteInput) {
  await Promise.all([saveTaskMemory(input), saveAgentLearningMemory(input), saveDecisionMemory(input), saveWorkflowMemory(input)]);
}

async function appendMarkdown(filePath: string, content: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `\n${content}`, "utf8");
}
