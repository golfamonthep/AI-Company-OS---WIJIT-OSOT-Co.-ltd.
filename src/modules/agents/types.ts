export type AgentStatus = "active" | "planning" | "running" | "completed" | "blocked";

export type AgentRole = "ceo" | "cto" | "cfo" | "marketing" | "content" | "support" | "admin" | "rd" | "ads";

export type AgentDefinition = {
  id: string;
  role: AgentRole;
  name: string;
  department: string;
  goals: string[];
  personality: string;
  systemPrompt: string;
  skills: string[];
  status: AgentStatus;
};
