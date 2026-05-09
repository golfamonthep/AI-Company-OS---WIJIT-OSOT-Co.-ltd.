import type { ContentCreatorStructuredOutput } from "@/modules/content-creator-agent/contracts";
import type { MarketingAudienceAnalysis } from "@/modules/live-mvp/content-department";

export type AdsPerformanceReviewInput = {
  campaignName: string;
  marketing: MarketingAudienceAnalysis;
  content: ContentCreatorStructuredOutput;
  productName?: string;
  contentGoal?: "awareness" | "engagement" | "conversion" | "education";
};

export type AdsPerformanceReview = {
  agentKey: "ads-performance";
  ctrPrediction: {
    expectedRange: string;
    confidence: number;
    rationale: string;
  };
  audienceTargeting: {
    primarySegment: string;
    testSegments: string[];
    exclusions: string[];
  };
  creativePerformance: {
    strongestHooks: string[];
    weakSignals: string[];
    contentFeedback: string[];
  };
  optimizationSuggestions: string[];
  budgetEfficiency: {
    recommendation: string;
    riskLevel: "low" | "medium" | "high";
    guardrail: string;
  };
  reportingSummary: string;
  learningSignals: string[];
  governanceNotes: string[];
};

export function analyzeAdsPerformance(input: AdsPerformanceReviewInput): AdsPerformanceReview {
  const hookCount = input.content.hooks.length;
  const scriptCount = input.content.scripts.length;
  const hasChecklistAngle = `${input.marketing.contentAngle} ${input.content.hooks.join(" ")}`.toLowerCase().includes("checklist");
  const confidence = Math.min(0.88, 0.58 + hookCount * 0.03 + scriptCount * 0.02 + (hasChecklistAngle ? 0.08 : 0));
  const lowCtr = hasChecklistAngle ? 1.4 : 1.0;
  const highCtr = hasChecklistAngle ? 2.6 : 1.9;
  const strongestHooks = input.content.hooks.slice(0, 3);

  return {
    agentKey: "ads-performance",
    ctrPrediction: {
      expectedRange: `${lowCtr.toFixed(1)}%-${highCtr.toFixed(1)}%`,
      confidence: Math.round(confidence * 100) / 100,
      rationale: hasChecklistAngle
        ? "Checklist and reassurance framing usually create clearer click intent for parent audiences."
        : "Campaign has usable creative volume, but the click driver should be made more specific before paid testing."
    },
    audienceTargeting: {
      primarySegment: input.marketing.segment,
      testSegments: [
        "New parents researching practical baby-care choices",
        "Thai families comparing safe product options",
        "Mothers who respond to checklist and reassurance content"
      ],
      exclusions: [
        "Users looking for direct medical advice",
        "Audiences outside approved product availability",
        "Low-intent broad parenting interest groups without recent engagement"
      ]
    },
    creativePerformance: {
      strongestHooks,
      weakSignals: [
        "Avoid claim-heavy language that implies guaranteed medical or performance outcomes.",
        "Use one clear message per video to reduce scroll confusion."
      ],
      contentFeedback: [
        "Prioritize the strongest checklist hook for the first ad variant.",
        "Turn objections into short retargeting captions.",
        "Keep CTA low-pressure: message us for details rather than buy now."
      ]
    },
    optimizationSuggestions: [
      "Run 3-hook test with identical CTA to isolate hook performance.",
      "Separate cold audience and warm retargeting ad sets.",
      "Pause variants below 0.8% CTR after enough impressions.",
      "Promote variants with high save/comment rate into the next content batch."
    ],
    budgetEfficiency: {
      recommendation: "Use small validation budget only after human approval; do not spend automatically.",
      riskLevel: "medium",
      guardrail: "Budget changes and live ad launch require human/CFO approval and an approved ads harness."
    },
    reportingSummary: `Ads Performance AI predicts ${lowCtr.toFixed(1)}%-${highCtr.toFixed(1)}% CTR potential for the Mother-and-baby TikTok Campaign if checklist framing remains prominent.`,
    learningSignals: [
      hasChecklistAngle ? "Checklist framing is a positive paid-test signal." : "Campaign needs a sharper paid click trigger.",
      "Parent audience needs trust-building and evidence-sensitive copy.",
      "Creative variants should be evaluated by CTR, saves, comments, and qualified messages."
    ],
    governanceNotes: [
      "No live ad spend executed.",
      "No external platform action performed.",
      "Claims and budget changes require explicit approval before activation."
    ]
  };
}
