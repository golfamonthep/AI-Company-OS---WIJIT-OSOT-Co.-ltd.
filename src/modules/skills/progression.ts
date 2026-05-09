export type SkillProgressInput = {
  currentLevel: number;
  currentXp: number;
  successfulRuns: number;
  failedRuns: number;
};

export function calculateSpecializationScore(input: SkillProgressInput) {
  return input.currentLevel * 10 + Math.log(input.currentXp + 1) + input.successfulRuns * 0.25 - input.failedRuns * 0.5;
}

export function calculatePerformanceScore(input: {
  successRate: number;
  averageFeedbackScore: number;
  taskCompletionQuality: number;
  businessMetricScore: number;
  sopComplianceScore: number;
}) {
  return (
    input.successRate * 0.3 +
    input.averageFeedbackScore * 20 * 0.25 +
    input.taskCompletionQuality * 0.2 +
    input.businessMetricScore * 0.15 +
    input.sopComplianceScore * 0.1
  );
}
