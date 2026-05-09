import type { MemoryItem } from "@/modules/memory/types";

export type ContentCreatorChannel = "tiktok" | "facebook" | "instagram" | "line" | "website";

export type ContentCreatorExecutionInput = {
  organizationId: string;
  brief: string;
  productName?: string;
  targetAudience?: string;
  channel?: ContentCreatorChannel;
  contentGoal?: "awareness" | "engagement" | "conversion" | "education";
  tone?: "friendly" | "professional" | "premium" | "educational" | "urgent";
  constraints?: string[];
};

export type AgentMarkdownProfile = {
  agentId: "content-creator";
  agentMarkdown: string;
  skillsMarkdown: string;
  architectureMarkdown?: string;
};

export type SelectedContentSkill =
  | "hook_generation"
  | "caption_writing"
  | "tiktok_scripting"
  | "storytelling"
  | "viral_content_analysis"
  | "cta_generation";

export type HarnessExecutionStatus = {
  openai: "used" | "fallback";
  fileSystem: "used";
  memoryRetrieval: "used" | "fallback";
  webSearch: "used" | "unavailable";
  jsonParser: "used";
};

export type ContentCreatorStructuredOutput = {
  contentConcepts: Array<{
    title: string;
    angle: string;
    audiencePain: string;
  }>;
  hooks: string[];
  scripts: Array<{
    title: string;
    scenes: string[];
  }>;
  captions: Array<{
    caption: string;
    hashtags: string[];
  }>;
  ctas: string[];
  assumptions: string[];
  guardrailNotes: string[];
};

export type ContentCreatorGuardrailReport = {
  passed: boolean;
  blockedClaims: string[];
  requiredApprovals: string[];
  notes: string[];
};

export type ContentCreatorExecutionResult = {
  agent: AgentMarkdownProfile;
  input: ContentCreatorExecutionInput;
  runtimeFlow: Array<{
    state: string;
    layer: "agent" | "skill" | "harness" | "memory" | "workflow";
    summary: string;
  }>;
  selectedSkills: SelectedContentSkill[];
  memoryContext: MemoryItem[];
  harness: HarnessExecutionStatus;
  output: ContentCreatorStructuredOutput;
  guardrails: ContentCreatorGuardrailReport;
  taskHistorySaved: boolean;
  learningNoteSaved: boolean;
  runtimeRunId?: string;
  runtimeRunSaved?: boolean;
  runtimeEventsSaved?: boolean;
  runtimeOutputSaved?: boolean;
};
