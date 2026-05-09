import type { RegressionCheckResult } from "@/testing/RegressionTestManager";
import type { WorkflowSimulationResult } from "@/testing/WorkflowSimulationEngine";

export type TestReport = {
  title: string;
  status: "passed" | "failed";
  summary: string;
  metrics: Record<string, number>;
  findings: string[];
  generatedAt: string;
};

export class TestReportGenerator {
  fromSimulation(result: WorkflowSimulationResult): TestReport {
    const failedSteps = result.steps.filter((step) => step.state === "failed");
    const passed = result.state === "completed" && result.approvalRequested && result.approvalApproved && result.auditLogs.length > 0 && result.learningEvents.length > 0;

    return {
      title: "Mother-and-baby TikTok Campaign Simulation",
      status: passed ? "passed" : "failed",
      summary: `Workflow ${result.definition.workflowId} ended as ${result.state}.`,
      metrics: {
        totalSteps: result.analytics.totalSteps,
        completedSteps: result.analytics.completedSteps,
        failedSteps: failedSteps.length,
        auditLogs: result.auditLogs.length,
        learningEvents: result.learningEvents.length
      },
      findings: failedSteps.map((step) => `${step.stepId}: ${step.error ?? "failed"}`),
      generatedAt: new Date().toISOString()
    };
  }

  fromRegression(results: RegressionCheckResult[]): TestReport {
    const failed = results.filter((result) => !result.passed);
    return {
      title: "Architecture Regression Report",
      status: failed.length ? "failed" : "passed",
      summary: `${results.length - failed.length}/${results.length} architecture checks passed.`,
      metrics: {
        totalChecks: results.length,
        passedChecks: results.length - failed.length,
        failedChecks: failed.length
      },
      findings: failed.map((result) => `${result.id} missing ${result.missingFiles.join(", ")}`),
      generatedAt: new Date().toISOString()
    };
  }
}
