"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import type { ContentPipelineResult } from "@/modules/workflows/content-production/types";

type ApiResponse = {
  status: "planned" | "started";
  message?: string;
  data?: unknown;
  result: ContentPipelineResult;
};

const defaultObjective = "Launch a TikTok content campaign for a new herbal product";

export function ContentProductionConsole() {
  const [objective, setObjective] = useState(defaultObjective);
  const [productName, setProductName] = useState("Herbal Wellness Set");
  const [targetAudience, setTargetAudience] = useState("Thai working adults who want practical daily wellness support");
  const [channels, setChannels] = useState("tiktok, facebook, instagram");
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const artifactsByType = useMemo(() => {
    const map = new Map<string, ContentPipelineResult["artifacts"][number]>();
    response?.result.artifacts.forEach((artifact) => map.set(artifact.type, artifact));
    return map;
  }, [response]);

  async function startWorkflow() {
    setIsRunning(true);
    setError(null);

    try {
      const result = await fetch("/api/workflows/content-production/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "00000000-0000-0000-0000-000000000001",
          objective,
          productName,
          targetAudience,
          channels: channels.split(",").map((channel) => channel.trim()).filter(Boolean),
          humanApprovalMode: true
        })
      });

      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? "Unable to start workflow");
      setResponse(data);
    } catch (workflowError) {
      setError(workflowError instanceof Error ? workflowError.message : "Unable to start workflow");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <Badge tone="blue">AI Content Production Pipeline</Badge>
            <h2 className="mt-3 text-2xl font-bold">Autonomous Content Workflow</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Marketing, Content Creator, Video Editor, and Ads Performance collaborate to produce strategy, ideas, scripts, captions, thumbnails, schedule, KPI predictions, and memory learning.
            </p>
          </div>
          <div className="rounded-md border border-border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Human checkpoint</p>
            <p className="mt-2 text-sm leading-6 text-muted">The pipeline pauses before publishing or promoting learning into company memory.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">Business objective</span>
            <textarea className="min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm" value={objective} onChange={(event) => setObjective(event.target.value)} />
          </label>
          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Product / offer</span>
              <input className="w-full rounded-md border border-border px-3 py-2 text-sm" value={productName} onChange={(event) => setProductName(event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Target audience</span>
              <input className="w-full rounded-md border border-border px-3 py-2 text-sm" value={targetAudience} onChange={(event) => setTargetAudience(event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Channels</span>
              <input className="w-full rounded-md border border-border px-3 py-2 text-sm" value={channels} onChange={(event) => setChannels(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={startWorkflow} disabled={isRunning}>{isRunning ? "Running..." : "Start Workflow"}</Button>
          {response ? <Badge tone={response.status === "started" ? "green" : "amber"}>{response.status}</Badge> : null}
          {response?.message ? <span className="text-sm text-muted">{response.message}</span> : null}
          {error ? <span className="text-sm font-semibold text-red-600">{error}</span> : null}
        </div>
      </Panel>

      {response ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel>
              <Badge tone="green">Workflow States</Badge>
              <div className="mt-4 space-y-3">
                {response.result.states.map((state, index) => (
                  <div key={state.state} className="grid grid-cols-[36px_1fr] gap-3 rounded-md border border-border bg-slate-50 p-3">
                    <div className="grid size-8 place-items-center rounded-md bg-primary text-xs font-bold text-white">{index + 1}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{state.state}</p>
                        <Badge>{state.ownerAgentRole}</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">{state.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <Badge tone="blue">Agent Collaboration</Badge>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {["CEO: objective and approval", "Marketing: audience, strategy, schedule", "Content Creator: ideas, scripts, captions", "Video Editor: thumbnails", "Ads Performance: KPI predictions", "Memory Layer: learning candidate"].map((item) => (
                  <div key={item} className="rounded-md border border-border bg-white p-3 text-sm font-medium text-foreground">{item}</div>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-800">Approval status: {response.result.approvalStatus}</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">Scripts, captions, posting schedule, publishing, and memory promotion require human approval.</p>
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <ArtifactPanel title="Audience" artifact={artifactsByType.get("audience_analysis")} />
            <ArtifactPanel title="Strategy" artifact={artifactsByType.get("content_strategy")} />
            <ArtifactPanel title="Ideas" artifact={artifactsByType.get("content_ideas")} />
            <ArtifactPanel title="Scripts" artifact={artifactsByType.get("scripts")} />
            <ArtifactPanel title="Captions" artifact={artifactsByType.get("captions")} />
            <ArtifactPanel title="Thumbnails" artifact={artifactsByType.get("thumbnail_ideas")} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel>
              <Badge tone="green">Posting Schedule</Badge>
              <JsonPreview value={artifactsByType.get("posting_schedule")?.body} />
            </Panel>
            <Panel>
              <Badge tone="blue">KPI Predictions</Badge>
              <div className="mt-4 grid gap-3 text-sm">
                <Metric label="Predicted reach" value={response.result.analytics.predictedReach.toLocaleString()} />
                <Metric label="Engagement rate" value={`${response.result.analytics.predictedEngagementRate}%`} />
                <Metric label="Conversion rate" value={`${response.result.analytics.predictedConversionRate}%`} />
                <Metric label="Confidence" value={`${Math.round(response.result.analytics.confidence * 100)}%`} />
              </div>
            </Panel>
            <Panel>
              <Badge tone="amber">Memory Learning</Badge>
              <p className="mt-4 text-sm leading-6 text-muted">{response.result.learning.lesson}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {response.result.learning.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}

function ArtifactPanel({ title, artifact }: { title: string; artifact?: ContentPipelineResult["artifacts"][number] }) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <Badge tone={artifact?.requiresHumanApproval ? "amber" : "green"}>{title}</Badge>
        {artifact ? <Badge>{artifact.ownerAgentRole}</Badge> : null}
      </div>
      <JsonPreview value={artifact?.body} />
    </Panel>
  );
}

function JsonPreview({ value }: { value: unknown }) {
  return <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">{JSON.stringify(value ?? {}, null, 2)}</pre>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-slate-50 px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
