import { describe, expect, it } from "vitest";
import { RegressionTestManager } from "@/testing/RegressionTestManager";
import { TestReportGenerator } from "@/testing/TestReportGenerator";

describe("architecture regression testing", () => {
  it("detects required testing and governance layer files", () => {
    const files = [
      "src/auth/AuthService.ts",
      "src/auth/WorkspaceService.ts",
      "src/auth/RolePermissionService.ts",
      "src/auth/WorkspaceGuard.ts",
      "src/testing/TestRunner.ts",
      "src/testing/WorkflowSimulationEngine.ts",
      "src/testing/RegressionTestManager.ts",
      "governance/GOVERNANCE_RULES.md",
      "governance/APPROVAL_POLICIES.md",
      "governance/AUDIT_REQUIREMENTS.md"
    ];

    const results = new RegressionTestManager().evaluate(files);
    const report = new TestReportGenerator().fromRegression(results);

    expect(results.every((result) => result.passed)).toBe(true);
    expect(report.status).toBe("passed");
  });

  it("reports architecture drift when required files are missing", () => {
    const results = new RegressionTestManager().evaluate([]);
    const report = new TestReportGenerator().fromRegression(results);

    expect(report.status).toBe("failed");
    expect(report.findings.length).toBeGreaterThan(0);
  });
});
