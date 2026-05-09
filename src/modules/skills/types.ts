export type SkillCategory = "strategy" | "technical" | "finance" | "marketing" | "content" | "support" | "operations" | "research" | "creative" | "compliance";

export type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: number;
};

export type SkillProgress = {
  agentId: string;
  skillId: string;
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  specializationScore: number;
  successfulRuns: number;
  failedRuns: number;
};

export type PromptModuleType = "instruction" | "style" | "constraint" | "example" | "rubric" | "tool_policy";

export type PromptModule = {
  id: string;
  slug: string;
  name: string;
  moduleType: PromptModuleType;
  content: string;
  version: number;
  isActive: boolean;
};
