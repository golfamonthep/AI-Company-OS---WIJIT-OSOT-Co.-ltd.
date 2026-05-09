import type { MemoryItem } from "@/modules/memory/types";

export type RuntimeMemoryCategory = "company" | "agent" | "task_history" | "decision_log" | "workflow";

export type RuntimeMemorySource = {
  id: string;
  category: RuntimeMemoryCategory;
  path: string;
  agentId?: string;
  description: string;
};

export type RuntimeMemoryRecord = {
  id: string;
  category: RuntimeMemoryCategory;
  sourceId: string;
  sourcePath: string;
  title: string;
  content: string;
  tags: string[];
  importance: number;
  createdAt: string;
  agentId?: string;
  relatedWorkflowId?: string;
};

export type MemoryRetrievalQuery = {
  organizationId: string;
  agentId: string;
  taskIntent: string;
  workflowId?: string;
  tags?: string[];
  limit?: number;
  maxCharacters?: number;
};

export type RankedMemoryRecord = RuntimeMemoryRecord & {
  relevanceScore: number;
  matchReasons: string[];
};

export type InjectedMemoryContext = {
  company: MemoryItem[];
  agent: MemoryItem[];
  workflowHistory: MemoryItem[];
  decisions: MemoryItem[];
  taskHistory: MemoryItem[];
  injected: MemoryItem[];
  ranked: RankedMemoryRecord[];
  summary: string;
};

export type MemoryWriteInput = {
  organizationId: string;
  agentId: string;
  taskIntent: string;
  outputSummary: string;
  learningNote?: string;
  decision?: {
    owner: string;
    reasoning: string;
    relatedWorkflowId?: string;
  };
  workflowId?: string;
  tags?: string[];
};
