/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const requiredPaths = [
  "PROJECT_STATUS.md",
  "SYSTEM_ARCHITECTURE.md",
  "COMPANY_STRUCTURE.md",
  "ROADMAP.md",
  "governance/GOVERNANCE_RULES.md",
  "docs/MVP_LAUNCH_READINESS_CHECKLIST.md",
  "docs/DAILY_OPERATIONS_CHECKLIST.md",
  "docs/FIRST_WORKFLOW_GUIDE.md",
  "src/modules/live-mvp/content-department.ts",
  "src/modules/live-mvp/ads-performance.ts",
  "src/app/api/live/content-department/start/route.ts",
  "src/app/api/live/content-department/approve/route.ts",
  "src/app/api/live/content-department/dashboard/route.ts",
  "src/app/api/workflows/content-production/start/route.ts",
  "src/app/api/workflows/content-production/[id]/approve/route.ts",
  "src/app/api/health/route.ts",
  "src/app/api/auth/session/route.ts",
  "src/app/api/workspaces/route.ts",
  "src/app/workflows/content-production/page.tsx",
  "src/components/live-mvp/content-department-console.tsx",
  "src/dashboard/ads-performance/CampaignPerformancePanel.tsx",
  "src/dashboard/operations/OperationsMonitorPanel.tsx",
  "supabase/migrations/202605080012_live_content_workflow_hardening.sql",
  "vercel.json",
  "config/development.env.example",
  "config/production.env.example",
];

const requiredPackageScripts = [
  "typecheck",
  "test:unit",
  "build",
  "dev",
];

const expectedText = [
  {
    file: "PROJECT_STATUS.md",
    text: "Current development phase:",
    label: "project phase is documented",
  },
  {
    file: "PROJECT_STATUS.md",
    text: "Make the Content Department AI operational end-to-end",
    label: "Content Department MVP goal is documented",
  },
  {
    file: "PROJECT_STATUS.md",
    text: "External publishing",
    label: "external publishing boundary is documented",
  },
  {
    file: "governance/GOVERNANCE_RULES.md",
    text: "External publishing requires human or CEO approval",
    label: "publishing approval rule is present",
  },
  {
    file: "governance/GOVERNANCE_RULES.md",
    text: "Emergency stop overrides workflow",
    label: "emergency stop rule is present",
  },
  {
    file: "src/modules/live-mvp/content-department.ts",
    text: "ApprovalRepository",
    label: "live MVP uses approval persistence",
  },
  {
    file: "src/modules/live-mvp/content-department.ts",
    text: "AuditLogRepository",
    label: "live MVP uses audit persistence",
  },
  {
    file: "src/modules/live-mvp/content-department.ts",
    text: "LearningRepository",
    label: "live MVP uses learning persistence",
  },
  {
    file: "src/modules/live-mvp/content-department.ts",
    text: "analyzeAdsPerformance",
    label: "Ads Performance review is integrated",
  },
];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function result(ok, label, detail) {
  return { ok, label, detail };
}

const checks = [];

for (const requiredPath of requiredPaths) {
  checks.push(result(exists(requiredPath), `required file: ${requiredPath}`));
}

const packageJsonPath = path.join(root, "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  for (const scriptName of requiredPackageScripts) {
    checks.push(
      result(
        Boolean(packageJson.scripts && packageJson.scripts[scriptName]),
        `package script: ${scriptName}`,
      ),
    );
  }
} else {
  checks.push(result(false, "package.json exists"));
}

for (const expectation of expectedText) {
  if (!exists(expectation.file)) {
    checks.push(result(false, expectation.label, `${expectation.file} is missing`));
    continue;
  }

  checks.push(
    result(
      read(expectation.file).includes(expectation.text),
      expectation.label,
      expectation.file,
    ),
  );
}

const failed = checks.filter((check) => !check.ok);

console.log("AI Company OS MVP preflight");
console.log(`Checked ${checks.length} items.`);

if (failed.length > 0) {
  console.log("");
  console.log("Failed checks:");
  for (const failure of failed) {
    console.log(`- ${failure.label}${failure.detail ? ` (${failure.detail})` : ""}`);
  }
  process.exitCode = 1;
} else {
  console.log("All required MVP preflight checks passed.");
}
