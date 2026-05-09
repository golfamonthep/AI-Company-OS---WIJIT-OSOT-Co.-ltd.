import type { ContentQualityEvaluation, EvaluatedContentOutput, QualityCriterion } from "@/modules/live-mvp/content-quality-evaluation";

export type CuratedMemoryKind =
  | "approved_pattern"
  | "rejected_pattern"
  | "reviewer_insight"
  | "optimization_note";

export type CuratedMemoryItem = {
  kind: CuratedMemoryKind;
  title: string;
  content: string;
  usefulnessScore: number;
  tags: string[];
  sourceOutputIndexes: number[];
  archiveCandidate: boolean;
};

export type SkillImprovementProposalDraft = {
  proposalKey: string;
  title: string;
  summary: string;
  targetSkillId: "hook_generation";
  proposedChange: {
    executionNotes: string[];
    avoidPatterns: string[];
    reusePatterns: string[];
    thaiToneGuidance: string[];
  };
  evidence: unknown[];
  confidenceScore: number;
  approvalRequired: true;
};

export type MemoryCurationResult = {
  approvedPatterns: CuratedMemoryItem[];
  rejectedPatterns: CuratedMemoryItem[];
  reviewerInsights: CuratedMemoryItem[];
  rankedMemories: CuratedMemoryItem[];
  archiveCandidates: CuratedMemoryItem[];
  repeatedIssueAlerts: string[];
  skillImprovementProposal?: SkillImprovementProposalDraft;
};

export function curateContentCreatorMemory(input: {
  evaluation: ContentQualityEvaluation | undefined;
  runKey: string;
  existingMemoryContents?: string[];
}): MemoryCurationResult | undefined {
  if (!input.evaluation) return undefined;

  const approvedOutputs = input.evaluation.reviewedOutputs.filter((output) => output.decision === "approved" && output.weightedScore >= 7);
  const rejectedOutputs = input.evaluation.reviewedOutputs.filter((output) => output.decision === "rejected" || output.weightedScore < 6.5);
  const seen = new Set((input.existingMemoryContents ?? []).map(normalizeForDeduplication));

  const approvedPatterns = dedupeCuratedItems([
    ...approvedOutputs.slice(0, 3).map((output) => buildApprovedPattern(output)),
    ...extractThaiPhrasePatterns(approvedOutputs)
  ], seen);
  const rejectedPatterns = dedupeCuratedItems(rejectedOutputs.map((output) => buildRejectedPattern(output)), seen);
  const reviewerInsights = dedupeCuratedItems(buildReviewerInsights(input.evaluation), seen);
  const rankedMemories = [...approvedPatterns, ...rejectedPatterns, ...reviewerInsights]
    .sort((a, b) => b.usefulnessScore - a.usefulnessScore);
  const repeatedIssueAlerts = detectRepeatedIssues(input.evaluation);
  const archiveCandidates = rankedMemories.filter((memory) => memory.archiveCandidate);
  const skillImprovementProposal = buildSkillImprovementProposal({
    evaluation: input.evaluation,
    runKey: input.runKey,
    approvedPatterns,
    rejectedPatterns,
    reviewerInsights,
    repeatedIssueAlerts
  });

  return {
    approvedPatterns,
    rejectedPatterns,
    reviewerInsights,
    rankedMemories,
    archiveCandidates,
    repeatedIssueAlerts,
    skillImprovementProposal
  };
}

function buildApprovedPattern(output: EvaluatedContentOutput): CuratedMemoryItem {
  const strengths = topCriteria(output, "strong");
  return {
    kind: "approved_pattern",
    title: `Approved ${output.outputType} pattern #${output.outputIndex + 1}`,
    content: output.text,
    usefulnessScore: Math.round(output.weightedScore * 10),
    tags: ["content-creator", "approved-pattern", output.outputType, "thai", "tiktok", ...strengths],
    sourceOutputIndexes: [output.outputIndex],
    archiveCandidate: output.weightedScore < 7.5
  };
}

function buildRejectedPattern(output: EvaluatedContentOutput): CuratedMemoryItem {
  const weaknesses = topCriteria(output, "weak");
  return {
    kind: "rejected_pattern",
    title: `Rejected ${output.outputType} pattern #${output.outputIndex + 1}`,
    content: [output.text, output.feedbackNotes, output.improvementSuggestion].filter(Boolean).join("\n"),
    usefulnessScore: Math.max(50, Math.round((10 - output.weightedScore) * 10)),
    tags: ["content-creator", "rejected-pattern", output.outputType, "thai", "tiktok", ...weaknesses],
    sourceOutputIndexes: [output.outputIndex],
    archiveCandidate: false
  };
}

function extractThaiPhrasePatterns(outputs: EvaluatedContentOutput[]): CuratedMemoryItem[] {
  return outputs
    .filter((output) => output.scores.thaiNaturalness >= 8)
    .slice(0, 3)
    .map((output) => ({
      kind: "approved_pattern",
      title: `Effective Thai phrasing from ${output.outputType} #${output.outputIndex + 1}`,
      content: output.text,
      usefulnessScore: Math.round((output.scores.thaiNaturalness + output.scores.audienceRelevance) * 5),
      tags: ["content-creator", "thai-phrasing", "natural-thai", output.outputType, "mother-baby"],
      sourceOutputIndexes: [output.outputIndex],
      archiveCandidate: false
    }));
}

function buildReviewerInsights(evaluation: ContentQualityEvaluation): CuratedMemoryItem[] {
  const notes = evaluation.reviewedOutputs.flatMap((output) => [output.feedbackNotes, output.improvementSuggestion]).filter((note): note is string => Boolean(note?.trim()));
  const weakCriteria = Object.entries(evaluation.categoryAverages)
    .filter(([, score]) => score < 7)
    .map(([criterion, score]) => `${readableCriterion(criterion as QualityCriterion)} average is ${score}/10`);
  const strongCriteria = Object.entries(evaluation.categoryAverages)
    .filter(([, score]) => score >= 8)
    .map(([criterion, score]) => `${readableCriterion(criterion as QualityCriterion)} average is ${score}/10`);

  return [
    {
      kind: "reviewer_insight",
      title: "Reviewer insight summary for Thai TikTok hooks",
      content: [...evaluation.learningInsights, ...notes.slice(0, 6), ...weakCriteria, ...strongCriteria].join("\n"),
      usefulnessScore: Math.round(evaluation.overallScore * 10),
      tags: ["content-creator", "reviewer-insight", "thai-content", "quality-loop"],
      sourceOutputIndexes: evaluation.reviewedOutputs.map((output) => output.outputIndex),
      archiveCandidate: notes.length === 0 && weakCriteria.length === 0
    }
  ];
}

function buildSkillImprovementProposal(input: {
  evaluation: ContentQualityEvaluation;
  runKey: string;
  approvedPatterns: CuratedMemoryItem[];
  rejectedPatterns: CuratedMemoryItem[];
  reviewerInsights: CuratedMemoryItem[];
  repeatedIssueAlerts: string[];
}): SkillImprovementProposalDraft | undefined {
  if (!input.approvedPatterns.length && !input.rejectedPatterns.length && !input.repeatedIssueAlerts.length) return undefined;

  const weakestCriteria = Object.entries(input.evaluation.categoryAverages)
    .filter(([, score]) => score < 7)
    .map(([criterion, score]) => `${readableCriterion(criterion as QualityCriterion)} scored ${score}/10`);
  const strongestCriteria = Object.entries(input.evaluation.categoryAverages)
    .filter(([, score]) => score >= 8)
    .map(([criterion, score]) => `${readableCriterion(criterion as QualityCriterion)} scored ${score}/10`);

  return {
    proposalKey: `hook-generation-improvement-${input.runKey}`,
    title: "Improve Hook Generation Skill from human-reviewed Thai TikTok patterns",
    summary: [
      `Human review scored ${input.evaluation.reviewedOutputs.length} output(s) with overall score ${input.evaluation.overallScore}/10.`,
      input.approvedPatterns.length ? `${input.approvedPatterns.length} approved pattern(s) should be reused.` : "",
      input.rejectedPatterns.length ? `${input.rejectedPatterns.length} rejected pattern(s) should be avoided.` : "",
      input.repeatedIssueAlerts.join(" ")
    ].filter(Boolean).join(" "),
    targetSkillId: "hook_generation",
    proposedChange: {
      executionNotes: [
        "Use human-approved Thai hook patterns as examples before generating new hooks.",
        "Favor checklist, reassurance, and decision-support framing for mother-and-baby products.",
        "Keep claims conservative and route medical/product performance claims to human evidence review."
      ],
      avoidPatterns: input.rejectedPatterns.map((pattern) => pattern.content).slice(0, 5),
      reusePatterns: input.approvedPatterns.map((pattern) => pattern.content).slice(0, 5),
      thaiToneGuidance: [
        ...strongestCriteria.map((criterion) => `Preserve strength: ${criterion}.`),
        ...weakestCriteria.map((criterion) => `Improve weakness: ${criterion}.`)
      ]
    },
    evidence: [input.evaluation, input.approvedPatterns, input.rejectedPatterns, input.reviewerInsights],
    confidenceScore: Math.max(60, Math.min(95, Math.round(input.evaluation.overallScore * 10))),
    approvalRequired: true
  };
}

function dedupeCuratedItems(items: CuratedMemoryItem[], seen: Set<string>) {
  const unique: CuratedMemoryItem[] = [];
  for (const item of items) {
    const key = normalizeForDeduplication(item.content);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function detectRepeatedIssues(evaluation: ContentQualityEvaluation) {
  const alerts: string[] = [];
  const weakCriteria = Object.entries(evaluation.categoryAverages).filter(([, score]) => score < 7);
  if (evaluation.rejectedCount >= 2) alerts.push(`${evaluation.rejectedCount} outputs were rejected; review repeated weak structures before generating more hooks.`);
  for (const [criterion, score] of weakCriteria) {
    alerts.push(`${readableCriterion(criterion as QualityCriterion)} is below target at ${score}/10.`);
  }
  return alerts;
}

function topCriteria(output: EvaluatedContentOutput, mode: "strong" | "weak") {
  return Object.entries(output.scores)
    .filter(([, score]) => (mode === "strong" ? score >= 8 : score <= 6))
    .map(([criterion]) => criterion);
}

function normalizeForDeduplication(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 240);
}

function readableCriterion(criterion: QualityCriterion) {
  const labels: Record<QualityCriterion, string> = {
    hookStrength: "hook strength",
    emotionalImpact: "emotional impact",
    thaiNaturalness: "Thai naturalness",
    retentionPotential: "retention potential",
    ctaEffectiveness: "CTA effectiveness",
    clarity: "clarity",
    businessUsefulness: "business usefulness",
    audienceRelevance: "audience relevance"
  };
  return labels[criterion];
}
