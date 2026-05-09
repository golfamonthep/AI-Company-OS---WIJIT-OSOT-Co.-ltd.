export type QualityCriterion =
  | "hookStrength"
  | "emotionalImpact"
  | "thaiNaturalness"
  | "retentionPotential"
  | "ctaEffectiveness"
  | "clarity"
  | "businessUsefulness"
  | "audienceRelevance";

export type OutputReviewDecision = "approved" | "rejected";
export type OutputReviewType = "hook" | "caption" | "script" | "cta" | "thumbnail" | "shooting_note" | "hashtag";
export type QualityCategory = "excellent" | "strong" | "needs_revision" | "reject";

export type QualityScoreMap = Record<QualityCriterion, number>;

export type ContentOutputReviewInput = {
  outputType: OutputReviewType;
  outputIndex: number;
  text: string;
  decision: OutputReviewDecision;
  scores: Partial<QualityScoreMap>;
  feedbackNotes?: string;
  improvementSuggestion?: string;
};

export type EvaluatedContentOutput = ContentOutputReviewInput & {
  scores: QualityScoreMap;
  weightedScore: number;
  qualityCategory: QualityCategory;
};

export type ContentQualityEvaluation = {
  scale: "1-10";
  weights: Record<QualityCriterion, number>;
  reviewedAt: string;
  overallScore: number;
  approvedCount: number;
  rejectedCount: number;
  categoryAverages: QualityScoreMap;
  qualityCategory: QualityCategory;
  reviewedOutputs: EvaluatedContentOutput[];
  bestPerformingOutputs: EvaluatedContentOutput[];
  lowPerformingOutputs: EvaluatedContentOutput[];
  learningInsights: string[];
  memoryInsights: {
    highPerformingHooks: string[];
    successfulThaiPhrasing: string[];
    rejectedPatterns: string[];
    reviewerFeedback: string[];
    optimizationNotes: string[];
  };
};

export const qualityCriteria: Array<{ key: QualityCriterion; label: string; weight: number }> = [
  { key: "hookStrength", label: "Hook strength", weight: 1.25 },
  { key: "emotionalImpact", label: "Emotional impact", weight: 1.15 },
  { key: "thaiNaturalness", label: "Thai naturalness", weight: 1.2 },
  { key: "retentionPotential", label: "Retention potential", weight: 1.15 },
  { key: "ctaEffectiveness", label: "CTA effectiveness", weight: 1 },
  { key: "clarity", label: "Clarity", weight: 1 },
  { key: "businessUsefulness", label: "Business usefulness", weight: 1.1 },
  { key: "audienceRelevance", label: "Audience relevance", weight: 1.15 }
];

const defaultScore = 7;

export function evaluateContentOutputs(reviews: ContentOutputReviewInput[] | undefined, reviewedAt = new Date().toISOString()): ContentQualityEvaluation | undefined {
  if (!reviews?.length) return undefined;

  const reviewedOutputs = reviews.map((review) => {
    const scores = normalizeScores(review.scores);
    const weightedScore = calculateWeightedScore(scores);
    return {
      ...review,
      scores,
      weightedScore,
      qualityCategory: categorizeScore(weightedScore)
    };
  });

  const overallScore = roundScore(reviewedOutputs.reduce((sum, output) => sum + output.weightedScore, 0) / reviewedOutputs.length);
  const categoryAverages = buildCategoryAverages(reviewedOutputs);
  const bestPerformingOutputs = reviewedOutputs
    .filter((output) => output.decision === "approved" && output.weightedScore >= 8)
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 5);
  const lowPerformingOutputs = reviewedOutputs
    .filter((output) => output.decision === "rejected" || output.weightedScore < 6.5)
    .sort((a, b) => a.weightedScore - b.weightedScore)
    .slice(0, 5);

  return {
    scale: "1-10",
    weights: Object.fromEntries(qualityCriteria.map((criterion) => [criterion.key, criterion.weight])) as Record<QualityCriterion, number>,
    reviewedAt,
    overallScore,
    approvedCount: reviewedOutputs.filter((output) => output.decision === "approved").length,
    rejectedCount: reviewedOutputs.filter((output) => output.decision === "rejected").length,
    categoryAverages,
    qualityCategory: categorizeScore(overallScore),
    reviewedOutputs,
    bestPerformingOutputs,
    lowPerformingOutputs,
    learningInsights: buildLearningInsights(reviewedOutputs, categoryAverages, overallScore),
    memoryInsights: buildMemoryInsights(bestPerformingOutputs, lowPerformingOutputs, reviewedOutputs)
  };
}

export function summarizeQualityEvaluation(evaluation: ContentQualityEvaluation | undefined) {
  if (!evaluation) return "No detailed output quality review was submitted.";
  return `Reviewed ${evaluation.reviewedOutputs.length} output(s). Overall quality ${evaluation.overallScore}/10 (${evaluation.qualityCategory}). Approved ${evaluation.approvedCount}, rejected ${evaluation.rejectedCount}.`;
}

function normalizeScores(scores: Partial<QualityScoreMap>): QualityScoreMap {
  return Object.fromEntries(
    qualityCriteria.map((criterion) => [criterion.key, clampTenPointScore(scores[criterion.key] ?? defaultScore)])
  ) as QualityScoreMap;
}

function calculateWeightedScore(scores: QualityScoreMap) {
  const totalWeight = qualityCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  const total = qualityCriteria.reduce((sum, criterion) => sum + scores[criterion.key] * criterion.weight, 0);
  return roundScore(total / totalWeight);
}

function buildCategoryAverages(outputs: EvaluatedContentOutput[]): QualityScoreMap {
  return Object.fromEntries(
    qualityCriteria.map((criterion) => [
      criterion.key,
      roundScore(outputs.reduce((sum, output) => sum + output.scores[criterion.key], 0) / outputs.length)
    ])
  ) as QualityScoreMap;
}

function clampTenPointScore(score: number) {
  if (!Number.isFinite(score)) return defaultScore;
  return Math.max(1, Math.min(10, Math.round(score)));
}

function roundScore(score: number) {
  return Math.round(score * 10) / 10;
}

function categorizeScore(score: number): QualityCategory {
  if (score >= 8.5) return "excellent";
  if (score >= 7) return "strong";
  if (score >= 5) return "needs_revision";
  return "reject";
}

function buildLearningInsights(outputs: EvaluatedContentOutput[], averages: QualityScoreMap, overallScore: number) {
  const insights: string[] = [`Overall Content Creator quality score is ${overallScore}/10.`];
  const strongest = qualityCriteria.reduce((best, criterion) => (averages[criterion.key] > averages[best.key] ? criterion : best), qualityCriteria[0]);
  const weakest = qualityCriteria.reduce((weakestSoFar, criterion) => (averages[criterion.key] < averages[weakestSoFar.key] ? criterion : weakestSoFar), qualityCriteria[0]);

  insights.push(`Strongest quality dimension: ${strongest.label} (${averages[strongest.key]}/10).`);
  insights.push(`Weakest quality dimension: ${weakest.label} (${averages[weakest.key]}/10).`);

  const rejected = outputs.filter((output) => output.decision === "rejected");
  if (rejected.length) insights.push(`${rejected.length} output(s) were rejected; inspect notes before repeating similar hook patterns.`);

  const highThaiTone = outputs.filter((output) => output.scores.thaiNaturalness >= 8 && output.decision === "approved");
  if (highThaiTone.length) insights.push("Approved outputs with high Thai naturalness should be reused as tone references.");

  return insights;
}

function buildMemoryInsights(best: EvaluatedContentOutput[], low: EvaluatedContentOutput[], all: EvaluatedContentOutput[]): ContentQualityEvaluation["memoryInsights"] {
  return {
    highPerformingHooks: best.filter((output) => output.outputType === "hook").map((output) => output.text),
    successfulThaiPhrasing: best.filter((output) => output.scores.thaiNaturalness >= 8).map((output) => output.text),
    rejectedPatterns: low.map((output) => output.text),
    reviewerFeedback: all.flatMap((output) => [output.feedbackNotes, output.improvementSuggestion]).filter((note): note is string => Boolean(note?.trim())),
    optimizationNotes: all
      .filter((output) => output.decision === "rejected" || output.weightedScore < 7)
      .map((output) => output.improvementSuggestion || output.feedbackNotes || `Improve ${output.outputType} #${output.outputIndex + 1}.`)
  };
}
