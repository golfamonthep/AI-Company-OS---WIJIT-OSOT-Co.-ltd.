export type RegressionCheck = {
  id: string;
  layer: "agent" | "skill" | "memory" | "workflow" | "governance" | "operations" | "integrations" | "persistence" | "api" | "auth" | "testing";
  description: string;
  requiredFiles: string[];
};

export type RegressionCheckResult = RegressionCheck & {
  passed: boolean;
  missingFiles: string[];
};

export class RegressionTestManager {
  readonly architectureChecks: RegressionCheck[] = [
    {
      id: "auth-layer-present",
      layer: "auth",
      description: "Authentication and workspace services remain isolated under src/auth.",
      requiredFiles: ["src/auth/AuthService.ts", "src/auth/WorkspaceService.ts", "src/auth/RolePermissionService.ts", "src/auth/WorkspaceGuard.ts"]
    },
    {
      id: "testing-layer-present",
      layer: "testing",
      description: "Testing layer remains isolated under src/testing.",
      requiredFiles: ["src/testing/TestRunner.ts", "src/testing/WorkflowSimulationEngine.ts", "src/testing/RegressionTestManager.ts"]
    },
    {
      id: "governance-docs-present",
      layer: "governance",
      description: "Governance documentation remains present for safety tests.",
      requiredFiles: ["governance/GOVERNANCE_RULES.md", "governance/APPROVAL_POLICIES.md", "governance/AUDIT_REQUIREMENTS.md"]
    }
  ];

  evaluate(existingFiles: string[]) {
    const normalized = new Set(existingFiles.map((file) => file.replace(/\\/g, "/")));
    return this.architectureChecks.map((check): RegressionCheckResult => {
      const missingFiles = check.requiredFiles.filter((file) => !normalized.has(file));
      return {
        ...check,
        passed: missingFiles.length === 0,
        missingFiles
      };
    });
  }
}
