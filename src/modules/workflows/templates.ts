import type { AutonomousWorkflowTemplate } from "@/modules/workflows/types";

export const autonomousWorkflowTemplates: AutonomousWorkflowTemplate[] = [
  {
    slug: "tiktok-campaign-launch",
    name: "TikTok Campaign Launch",
    description: "CEO-led campaign workflow across Marketing, Content, Video, Ads, CFO, and CEO reporting.",
    trigger: "manual",
    objectivePattern: "launch tiktok campaign",
    ownerRole: "ceo",
    steps: [
      {
        key: "objective_intake",
        name: "Clarify campaign objective",
        type: "agent_task",
        ownerRole: "ceo",
        expectedOutput: "Business goal, KPI, deadline, product focus, risk limits.",
        memoryScopes: ["decision", "report_summary", "lesson"]
      },
      {
        key: "audience_strategy",
        name: "Audience analysis and strategy",
        type: "agent_task",
        ownerRole: "marketing",
        dependsOn: ["objective_intake"],
        expectedOutput: "Audience segments, positioning, channels, campaign thesis.",
        memoryScopes: ["preference", "lesson", "report_summary"]
      },
      {
        key: "content_package",
        name: "Hooks, scripts, captions",
        type: "agent_task",
        ownerRole: "content",
        dependsOn: ["audience_strategy"],
        expectedOutput: "Hook options, short scripts, captions, CTA, hashtags.",
        memoryScopes: ["preference", "lesson", "sop_improvement"]
      },
      {
        key: "video_plan",
        name: "Shot planning and editing instructions",
        type: "agent_task",
        ownerRole: "video",
        dependsOn: ["content_package"],
        expectedOutput: "Shot list, production notes, editing sequence, asset needs."
      },
      {
        key: "ads_budget",
        name: "Targeting and budget optimization",
        type: "agent_task",
        ownerRole: "ads",
        dependsOn: ["audience_strategy", "content_package"],
        parallelGroup: "go_to_market",
        expectedOutput: "Targeting, budget split, test matrix, expected KPI ranges."
      },
      {
        key: "budget_guardrail",
        name: "Budget approval checkpoint",
        type: "approval",
        ownerRole: "cfo",
        dependsOn: ["ads_budget"],
        approval: {
          required: true,
          approverRole: "cfo",
          reason: "Ad spend and budget assumptions require finance guardrail review."
        },
        expectedOutput: "Budget approved, rejected, or changes requested."
      },
      {
        key: "technical_feasibility",
        name: "Tracking and automation feasibility",
        type: "agent_task",
        ownerRole: "cto",
        dependsOn: ["ads_budget"],
        parallelGroup: "go_to_market",
        expectedOutput: "Tracking setup, landing page/tooling feasibility, integration risks."
      },
      {
        key: "launch_decision",
        name: "CEO launch decision",
        type: "conditional",
        ownerRole: "ceo",
        dependsOn: ["budget_guardrail", "technical_feasibility", "video_plan"],
        condition: {
          expression: "budget_guardrail.approved && technical_feasibility.feasibility !== 'low'",
          trueStep: "final_report",
          falseStep: "escalation_review"
        },
        expectedOutput: "Decision to launch or route to escalation."
      },
      {
        key: "escalation_review",
        name: "Resolve blocked launch",
        type: "agent_task",
        ownerRole: "ceo",
        dependsOn: ["launch_decision"],
        retry: {
          maxAttempts: 2,
          backoffStrategy: "linear",
          backoffSeconds: 300
        },
        expectedOutput: "Resolution plan for blocked budget, content, or technical risk."
      },
      {
        key: "final_report",
        name: "Final campaign report and KPI plan",
        type: "report_generation",
        ownerRole: "ceo",
        dependsOn: ["launch_decision"],
        expectedOutput: "Executive summary, launch checklist, KPI tracking plan, action items."
      },
      {
        key: "memory_update",
        name: "Promote workflow lessons to memory",
        type: "memory_write",
        ownerRole: "ceo",
        dependsOn: ["final_report"],
        expectedOutput: "Decisions, reusable workflow pattern, and lessons promoted to company memory."
      }
    ]
  }
];

export function findWorkflowTemplate(objective: string) {
  const normalized = objective.toLowerCase();
  return autonomousWorkflowTemplates.find((template) =>
    template.objectivePattern.split(" ").every((term) => normalized.includes(term))
  ) ?? autonomousWorkflowTemplates[0];
}
