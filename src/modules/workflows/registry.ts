export type WorkflowDefinition = {
  slug: string;
  name: string;
  description: string;
  ownerAgentId: string;
  trigger: "manual" | "scheduled" | "event";
  engine: "deterministic" | "langgraph";
};

export const workflowRegistry: WorkflowDefinition[] = [
  {
    slug: "ai-content-production-pipeline",
    name: "AI Content Production Pipeline",
    description: "First real autonomous workflow: objective, audience, strategy, ideas, scripts, captions, thumbnails, schedule, KPI prediction, approval, and memory learning.",
    ownerAgentId: "ceo-ai",
    trigger: "manual",
    engine: "deterministic"
  },
  {
    slug: "ceo-command-review",
    name: "CEO Command Review",
    description: "Analyze an executive command, retrieve memory/SOP context, and create a structured action plan.",
    ownerAgentId: "ceo-ai",
    trigger: "manual",
    engine: "deterministic"
  },
  {
    slug: "weekly-executive-report",
    name: "Weekly Executive Report",
    description: "Summarize progress, risks, recommendations, and next actions for the executive team.",
    ownerAgentId: "ceo-ai",
    trigger: "scheduled",
    engine: "deterministic"
  },
  {
    slug: "tiktok-campaign-launch",
    name: "TikTok Campaign Launch",
    description: "Autonomous multi-agent campaign workflow: CEO objective, Marketing strategy, Content scripts, Video plan, Ads budget, CFO guardrail, CTO feasibility, CEO report.",
    ownerAgentId: "ceo-ai",
    trigger: "manual",
    engine: "langgraph"
  }
];
