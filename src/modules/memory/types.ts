export type MemoryType = "fact" | "decision" | "preference" | "lesson" | "sop_improvement" | "report_summary";

export type MemoryItem = {
  id: string;
  agentId: string;
  type: MemoryType;
  content: string;
  importance: number;
  tags: string[];
  createdAt: string;
};
