import { ArrowUpRight, Bot, BrainCircuit, Building2, CheckCircle2, CircleDot, MessageSquareText, Plus, Radio, Route, Sparkles, Target, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { agentCommandMatrix, companyOverview, departments, memoryLearning, taskStatus, workflowLanes } from "@/modules/dashboard/control-center-data";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card
      className={`border-white/10 bg-white/[0.052] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </Card>
  );
}

export function DashboardHero() {
  return (
    <GlassCard className="overflow-hidden border-cyan-100/15">
      <div className="relative p-6 md:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.08),transparent_35%,rgba(148,163,184,0.045)_70%,transparent)]" />
        <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">AI Company OS</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-white md:text-6xl">A cinematic command layer for an autonomous company.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Control agents, departments, workflows, institutional memory, skill progression and company intelligence from one minimal executive surface.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="bg-white text-slate-950 hover:bg-cyan-100">Open CEO Command</Button>
              <Button variant="secondary" className="border-white/10 bg-white/[0.06] text-white hover:bg-white/10">Review Agent Fleet</Button>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System pulse</p>
                <p className="mt-1 text-lg font-semibold text-white">Autonomous assist</p>
              </div>
              <Badge tone="green">Live</Badge>
            </div>
            <div className="grid gap-4">
              <div>
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>Reasoning quality</span>
                  <span>84/100</span>
                </div>
                <Progress value={84} />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>Workflow confidence</span>
                  <span>76/100</span>
                </div>
                <Progress value={76} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {["Agents", "Memory", "Skills"].map((label) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-3 text-center">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-cyan-100">Online</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function CompanyOverviewGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {companyOverview.map((metric) => (
        <GlassCard key={metric.label} className="group xl:col-span-1">
          <CardHeader>
            <CardDescription className="text-slate-400">{metric.label}</CardDescription>
            <CardTitle className="text-3xl font-semibold text-white">{metric.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">{metric.detail}</p>
            <p className="mt-4 inline-flex rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-2 py-1 text-xs font-semibold text-cyan-200">{metric.trend}</p>
          </CardContent>
        </GlassCard>
      ))}
    </div>
  );
}

export function AgentCommandMatrix() {
  return (
    <GlassCard className="xl:col-span-7">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bot />
            Agent Management
          </CardTitle>
          <CardDescription className="text-slate-400">Create, assign, monitor, inspect memory, view skills and track performance.</CardDescription>
        </div>
        <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
          <Plus />
          Create Agent
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {agentCommandMatrix.map((agent) => (
          <div key={agent.name} className="rounded-lg border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{agent.name}</h3>
                <p className="text-sm text-slate-400">{agent.role}</p>
              </div>
              <Badge tone="green">{agent.status}</Badge>
            </div>
            <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">{agent.currentTask}</p>
            <div className="mt-4 grid gap-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Memory</span>
                  <span>{agent.memory}%</span>
                </div>
                <Progress value={agent.memory} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Skills</span>
                  <span>{agent.skillScore}%</span>
                </div>
                <Progress value={agent.skillScore} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Performance</span>
                  <span>{agent.performance}%</span>
                </div>
                <Progress value={agent.performance} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </GlassCard>
  );
}

export function DepartmentSystem() {
  return (
    <GlassCard className="xl:col-span-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Building2 />
          Department System
        </CardTitle>
        <CardDescription className="text-slate-400">AI company structure and operational readiness.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {departments.map((department) => {
          const Icon = department.icon;
          return (
            <div key={department.name} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-cyan-200">
                    <Icon />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{department.name}</h3>
                    <p className="text-xs text-slate-400">{department.status}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{department.agents} AI</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </GlassCard>
  );
}

export function WorkflowVisualization() {
  return (
    <GlassCard className="xl:col-span-7">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Workflow />
          Real-time Workflow Visualization
        </CardTitle>
        <CardDescription className="text-slate-400">Task pipelines, collaboration routes and internal AI communication.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {workflowLanes.map((lane) => {
          const Icon = lane.icon;
          return (
            <div key={lane.name} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon />
                  <h3 className="font-semibold text-white">{lane.name}</h3>
                </div>
                <Badge tone="blue">Live</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-5">
                {lane.nodes.map((node, index) => (
                  <div key={node} className={`rounded-lg border px-3 py-3 text-sm transition ${index <= lane.activeNode ? "border-cyan-200/30 bg-cyan-200/[0.08] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.08)]" : "border-white/10 bg-white/[0.03] text-slate-500"}`}>
                    <div className="flex items-center gap-2">
                      {index <= lane.activeNode ? <CheckCircle2 /> : <CircleDot />}
                      <span>{node}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </GlassCard>
  );
}

export function TaskAndCommunicationPanel() {
  return (
    <GlassCard className="xl:col-span-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Route />
          Task Status & Communication
        </CardTitle>
        <CardDescription className="text-slate-400">Current work state and internal AI signals.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3">
          {taskStatus.map((status) => (
            <div key={status.label}>
              <div className="mb-1 flex justify-between text-sm text-slate-300">
                <span>{status.label}</span>
                <span>{status.value}</span>
              </div>
              <Progress value={status.percent} />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <MessageSquareText />
            Internal communication
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <p>CEO AI assigned content strategy review to Content Creator AI.</p>
            <p>Content Creator AI requested brand voice memory and compliance SOP.</p>
            <p>Learning loop queued feedback conversion into Thai Copywriting XP.</p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

export function MemoryLearningPanel() {
  return (
    <GlassCard className="xl:col-span-12">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <BrainCircuit />
            AI Memory & Learning Panel
          </CardTitle>
          <CardDescription className="text-slate-400">Memory retrieval, skill progression, learning history and successful outputs.</CardDescription>
        </div>
        <Badge tone="blue">pgvector ready</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Radio />
            Memory retrieval
          </h3>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            {memoryLearning.retrievals.map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Target />
            Skill progression
          </h3>
          <div className="flex flex-col gap-3">
            {memoryLearning.skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{skill.name} L{skill.level}</span>
                  <span>{skill.xp}% XP</span>
                </div>
                <Progress value={skill.xp} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <h3 className="mb-3 font-semibold text-white">Learning history</h3>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            {memoryLearning.history.map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <h3 className="mb-3 font-semibold text-white">Successful outputs</h3>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            {memoryLearning.outputs.map((item) => (
              <p key={item} className="flex items-center justify-between gap-2">
                <span>{item}</span>
                <ArrowUpRight />
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

export function PerformanceStrip() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles />
            AI Quality Score
          </CardTitle>
          <CardDescription className="text-slate-400">Self-evaluation and feedback weighted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-white">84</div>
          <Progress value={84} className="mt-4" />
        </CardContent>
      </GlassCard>
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-white">Company KPIs</CardTitle>
          <CardDescription className="text-slate-400">MVP operating indicators</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400">Content velocity</p>
            <p className="text-2xl font-bold text-white">12/wk</p>
          </div>
          <div>
            <p className="text-slate-400">Decision latency</p>
            <p className="text-2xl font-bold text-white">4m</p>
          </div>
        </CardContent>
      </GlassCard>
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-white">Autonomy Readiness</CardTitle>
          <CardDescription className="text-slate-400">Tooling, memory and workflow maturity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-white">61%</div>
          <Progress value={61} className="mt-4" />
        </CardContent>
      </GlassCard>
    </div>
  );
}
