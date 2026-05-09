import { sampleMemories } from "@/modules/memory/sample";
import type { ContentPipelineArtifact, ContentPipelineInput, ContentPipelineResult, ContentPipelineState } from "@/modules/workflows/content-production/types";

const defaultChannels = ["tiktok", "facebook", "instagram"];

export function runContentProductionPipeline(input: ContentPipelineInput): ContentPipelineResult {
  const channels = input.channels?.length ? input.channels : defaultChannels;
  const productName = input.productName?.trim() || "core offer";
  const targetAudience = input.targetAudience?.trim() || "Thai customers who need a clear practical solution";
  const memoryContext = retrievePipelineMemory(input.objective);
  const states = buildStates();

  const audienceAnalysis = {
    primarySegment: targetAudience,
    painPoints: [
      "Need quick clarity before buying",
      "Need proof that the offer fits their real situation",
      "Do not want exaggerated claims"
    ],
    buyingTriggers: ["clear before/after value", "trustworthy explanation", "low-friction next step"],
    objections: ["price uncertainty", "trust", "whether it works for them"]
  };

  const contentStrategy = {
    positioning: `${productName} as a practical, trustworthy solution for ${targetAudience}`,
    pillars: ["problem awareness", "education", "proof", "conversion"],
    tone: "Thai-first, clear, warm, credible",
    channelPlan: channels.map((channel) => ({ channel, role: channel === "tiktok" ? "discovery and hooks" : "trust building and conversion" }))
  };

  const ideas = [
    `3 signs ${targetAudience} should consider ${productName}`,
    `Common mistake before choosing ${productName}`,
    `Simple checklist to know if ${productName} is right for you`,
    `Behind the scenes: how ${productName} solves the real problem`,
    `Customer question answered in 30 seconds`
  ];

  const scripts = ideas.slice(0, 3).map((idea, index) => ({
    title: idea,
    hook: index === 0 ? "If this problem keeps coming back, watch this first." : "Before you decide, check this one thing.",
    scenes: [
      "0-3s: show the pain point in a real situation",
      `4-12s: explain why ${productName} matters`,
      "13-24s: show proof, checklist, or clear example",
      "25-30s: ask viewer to comment or send message"
    ]
  }));

  const captions = scripts.map((script) => ({
    title: script.title,
    caption: `${script.hook}\n\n${productName} is designed for ${targetAudience}. Start with the checklist, then choose the next step that fits you.\n\nMessage us for details.`,
    hashtags: ["#ThaiBusiness", "#ContentMarketing", `#${productName.replace(/\s+/g, "")}`]
  }));

  const thumbnailIdeas = scripts.map((script) => ({
    scriptTitle: script.title,
    textOverlay: script.title.length > 44 ? `${script.title.slice(0, 41)}...` : script.title,
    visualDirection: "close-up product or real usage moment, high contrast text, clean background",
    emotion: "curious and trustworthy"
  }));

  const postingSchedule = channels.flatMap((channel) => [
    { channel, day: "Day 1", contentType: "problem awareness", asset: ideas[0] },
    { channel, day: "Day 3", contentType: "education", asset: ideas[1] },
    { channel, day: "Day 5", contentType: "proof/conversion", asset: ideas[2] }
  ]);

  const analytics = {
    predictedReach: channels.includes("tiktok") ? 18000 : 7000,
    predictedEngagementRate: channels.includes("tiktok") ? 4.8 : 3.2,
    predictedConversionRate: 1.4,
    confidence: 0.68,
    assumptions: [
      "No live analytics connector is configured yet",
      "Prediction uses channel heuristic and content completeness",
      "Actual performance must be written back after publishing"
    ]
  };

  const artifacts: ContentPipelineArtifact[] = [
    { type: "audience_analysis", ownerAgentRole: "marketing", title: "Target Audience Analysis", body: audienceAnalysis },
    { type: "content_strategy", ownerAgentRole: "marketing", title: "Content Strategy", body: contentStrategy },
    { type: "content_ideas", ownerAgentRole: "content-creator", title: "Content Ideas", body: { ideas } },
    { type: "scripts", ownerAgentRole: "content-creator", title: "Short Video Scripts", body: { scripts }, requiresHumanApproval: true },
    { type: "captions", ownerAgentRole: "content-creator", title: "Captions", body: { captions }, requiresHumanApproval: true },
    { type: "thumbnail_ideas", ownerAgentRole: "video-editor", title: "Thumbnail Ideas", body: { thumbnailIdeas } },
    { type: "posting_schedule", ownerAgentRole: "marketing", title: "Posting Schedule", body: { postingSchedule }, requiresHumanApproval: true },
    { type: "kpi_predictions", ownerAgentRole: "ads-performance", title: "KPI Predictions", body: analytics },
    {
      type: "learning_summary",
      ownerAgentRole: "ceo",
      title: "Learning Memory Candidate",
      body: {
        lesson: `A complete content package for "${input.objective}" should combine audience pain points, proof-driven hooks, channel schedule, and KPI assumptions before human approval.`,
        tags: ["content-production", "workflow", "campaign-learning"]
      }
    }
  ];

  return {
    runId: `content-run-${Date.now()}`,
    organizationId: input.organizationId,
    objective: input.objective,
    productName,
    targetAudience,
    channels,
    state: input.humanApprovalMode === false ? "learning_saved" : "waiting_for_human_approval",
    approvalStatus: input.humanApprovalMode === false ? "approved" : "requested",
    memoryContext,
    states,
    artifacts,
    analytics,
    learning: {
      lesson: `Content pipeline created reusable strategy, scripts, captions, thumbnails, schedule, and KPI assumptions for ${productName}.`,
      tags: ["content-production", "workflow-learning", ...channels],
      approvedForMemory: input.humanApprovalMode === false
    }
  };
}

function retrievePipelineMemory(objective: string) {
  const lower = objective.toLowerCase();
  return sampleMemories.filter((memory) =>
    memory.tags.some((tag) => lower.includes(tag)) || ["thai", "localization", "mvp"].some((tag) => memory.tags.includes(tag))
  );
}

function buildStates(): Array<{ state: ContentPipelineState; ownerAgentRole: string; summary: string }> {
  return [
    { state: "objective_received", ownerAgentRole: "ceo", summary: "CEO receives and frames the business objective." },
    { state: "memory_retrieved", ownerAgentRole: "ceo", summary: "Pipeline retrieves company, brand, audience, and content memory." },
    { state: "audience_analyzed", ownerAgentRole: "marketing", summary: "Marketing analyzes target audience and objections." },
    { state: "strategy_generated", ownerAgentRole: "marketing", summary: "Marketing creates content strategy and channel direction." },
    { state: "ideas_generated", ownerAgentRole: "content-creator", summary: "Content Creator generates content ideas." },
    { state: "scripts_generated", ownerAgentRole: "content-creator", summary: "Content Creator writes scripts." },
    { state: "captions_generated", ownerAgentRole: "content-creator", summary: "Content Creator writes captions and CTAs." },
    { state: "thumbnails_generated", ownerAgentRole: "video-editor", summary: "Video Editor generates thumbnail concepts." },
    { state: "schedule_generated", ownerAgentRole: "marketing", summary: "Marketing creates posting schedule." },
    { state: "kpi_predicted", ownerAgentRole: "ads-performance", summary: "Ads Performance predicts KPIs and assumptions." },
    { state: "waiting_for_human_approval", ownerAgentRole: "ceo", summary: "Pipeline pauses before publishing or memory promotion." },
    { state: "learning_saved", ownerAgentRole: "ceo", summary: "Approved learning is saved into memory." }
  ];
}
