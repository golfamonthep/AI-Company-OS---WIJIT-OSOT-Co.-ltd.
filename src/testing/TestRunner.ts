import { RegressionTestManager } from "@/testing/RegressionTestManager";
import { TestReportGenerator, type TestReport } from "@/testing/TestReportGenerator";
import { WorkflowSimulationEngine } from "@/testing/WorkflowSimulationEngine";

export type TestRunnerInput = {
  existingFiles?: string[];
  runSimulation?: boolean;
  runRegression?: boolean;
};

export class TestRunner {
  constructor(
    private readonly simulations = new WorkflowSimulationEngine(),
    private readonly regression = new RegressionTestManager(),
    private readonly reports = new TestReportGenerator()
  ) {}

  run(input: TestRunnerInput = {}): TestReport[] {
    const output: TestReport[] = [];

    if (input.runSimulation ?? true) {
      output.push(this.reports.fromSimulation(this.simulations.runMotherBabyTikTokCampaign()));
    }

    if (input.runRegression ?? Boolean(input.existingFiles?.length)) {
      output.push(this.reports.fromRegression(this.regression.evaluate(input.existingFiles ?? [])));
    }

    return output;
  }
}
