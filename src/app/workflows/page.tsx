import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import Link from "next/link";
import { autonomousWorkflowTemplates } from "@/modules/workflows/templates";
import { workflowRegistry } from "@/modules/workflows/registry";

export default function WorkflowsPage() {
  const campaignTemplate = autonomousWorkflowTemplates[0];
  const lanes = [
    { label: "Builder", value: "Objective -> template -> graph" },
    { label: "Execution", value: "Run steps, branch, retry, approve" },
    { label: "Collaboration", value: "Agent inbox, tasks, async handoffs" },
    { label: "Memory", value: "Retrieve context, promote lessons" }
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="blue">Autonomous Workflow Engine</Badge>
          <h2 className="mt-3 text-2xl font-bold">Workflow Control Center</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            AI agents can receive objectives, split work across departments, run multi-step workflows, pause for approvals, recover from failures, and write lessons back to organizational memory.
          </p>
        </div>
        <div className="rounded-md border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground">
          API: <span className="text-primary">POST /api/workflows/autonomous/start</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {lanes.map((lane) => (
          <Panel key={lane.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{lane.label}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{lane.value}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Badge tone="green">Template</Badge>
              <h3 className="mt-3 text-lg font-bold">{campaignTemplate.name}</h3>
            </div>
            <p className="text-sm text-muted">{campaignTemplate.steps.length} steps</p>
          </div>
          <div className="mt-5 space-y-3">
            {campaignTemplate.steps.map((step, index) => (
              <div key={step.key} className="grid gap-3 rounded-md border border-border bg-slate-50 p-3 md:grid-cols-[44px_1fr_150px]">
                <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-white">{index + 1}</div>
                <div>
                  <p className="font-semibold text-foreground">{step.name}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.expectedOutput}</p>
                </div>
                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <Badge tone={step.type === "approval" ? "amber" : step.type === "conditional" ? "blue" : "green"}>{step.type}</Badge>
                  {step.ownerRole ? <Badge>{step.ownerRole}</Badge> : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <Badge tone="amber">Execution Lifecycle</Badge>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {["Objective intake", "Memory retrieval", "Agent delegation", "Parallel execution", "Approval checkpoint", "Retry or escalation", "Final report", "Memory optimization"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <Badge tone="red">Failure Recovery</Badge>
            <p className="mt-4 text-sm leading-6 text-muted">
              Transient and validation failures retry automatically. Business, dependency, safety, and exhausted retry failures create approval checkpoints or escalations to CEO AI, CFO AI, CTO AI, or a human owner.
            </p>
          </Panel>
          <Panel>
            <Badge tone="blue">Realtime Monitoring</Badge>
            <p className="mt-4 text-sm leading-6 text-muted">
              Supabase Realtime should subscribe to workflow run steps, run events, task delegations, approvals, and escalations to power live timelines and agent collaboration views.
            </p>
          </Panel>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel>
          <Badge tone="amber">First Real Workflow</Badge>
          <h3 className="mt-4 font-bold">AI Content Production Pipeline</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Run a content workflow from objective to audience, strategy, scripts, captions, thumbnails, schedule, KPI predictions, approval, and memory learning.</p>
          <Link href="/workflows/content-production" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Open Pipeline
          </Link>
        </Panel>
        {workflowRegistry.map((workflow) => (
          <Panel key={workflow.slug}>
            <Badge tone="green">{workflow.trigger}</Badge>
            <span className="ml-2">
              <Badge tone="blue">{workflow.engine}</Badge>
            </span>
            <h3 className="mt-4 font-bold">{workflow.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{workflow.description}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
