import type { MemoryItem } from "@/modules/memory/types";
import type { CompanyTask } from "@/modules/tasks/types";

export type CEOCommandInput = {
  organizationId?: string;
  userId?: string;
  command: string;
};

export type CEOCommandResult = {
  executiveSummary: string;
  recommendedActions: string[];
  createdTasks: CompanyTask[];
  referencedMemory: MemoryItem[];
  confidence: number;
};

export type AgentGraphState = {
  input: CEOCommandInput;
  intent?: "answer" | "plan" | "create_tasks" | "report";
  memories: MemoryItem[];
  tasks: CompanyTask[];
  result?: CEOCommandResult;
};
