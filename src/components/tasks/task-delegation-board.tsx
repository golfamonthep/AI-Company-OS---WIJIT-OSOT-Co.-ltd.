import { CheckCircle2, Clock, GitBranch, History, Send, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { approvalQueue, delegatedTasks, delegationStages, taskHistory } from "@/modules/tasks/delegation-sample";

function DelegationPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Card className={`border-white/10 bg-white/[0.055] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-2xl ${className}`}>{children}</Card>;
}

export function TaskDelegationBoard() {
  return (
    <div className="flex flex-col gap-5">
      <DelegationPanel>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="text-3xl text-white">AI Task Delegation</CardTitle>
            <CardDescription className="mt-2 text-slate-400">Assign, accept, reject, approve and track multi-agent work like a real company operating system.</CardDescription>
          </div>
          <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
            <Send />
            Delegate Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
            {delegationStages.map((stage) => (
              <div key={stage.key} className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-sm font-semibold text-white">{stage.label}</p>
                <p className="mt-2 text-3xl font-bold text-cyan-100">{stage.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </DelegationPanel>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <DelegationPanel>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <GitBranch />
              Delegation Pipeline
            </CardTitle>
            <CardDescription className="text-slate-400">Active assignments with priority, deadline, progress and collaborators.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {delegatedTasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={task.priority === "critical" ? "red" : task.priority === "high" ? "amber" : "blue"}>{task.priority}</Badge>
                      <Badge tone="gray">{task.stage}</Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">Delegator: {task.delegator} &rarr; Owner: {task.owner}</p>
                    <p className="mt-3 text-sm text-slate-300">{task.expectedOutput}</p>
                  </div>
                  <div className="min-w-48 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                      <Clock />
                      {task.deadline}
                    </div>
                    <Progress value={task.progress} />
                    <p className="mt-2 text-xs text-slate-400">{task.progress}% complete</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {task.collaborators.map((agent) => (
                    <span key={agent} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </DelegationPanel>

        <div className="flex flex-col gap-5">
          <DelegationPanel>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck />
                Approval Queue
              </CardTitle>
              <CardDescription className="text-slate-400">Critical tasks waiting for decision.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {approvalQueue.map((approval) => (
                <div key={approval.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{approval.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{approval.requester} &rarr; {approval.approver}</p>
                  <div className="mt-3 flex gap-2">
                    <Button className="min-h-9 bg-emerald-300 text-slate-950 hover:bg-emerald-200">Approve</Button>
                    <Button variant="secondary" className="min-h-9 border-white/10 bg-white/[0.06] text-white hover:bg-white/10">Changes</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </DelegationPanel>

          <DelegationPanel>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <History />
                Task History
              </CardTitle>
              <CardDescription className="text-slate-400">Audit timeline across agents.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {taskHistory.map((item) => (
                <p key={item} className="flex gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 text-cyan-200" />
                  <span>{item}</span>
                </p>
              ))}
            </CardContent>
          </DelegationPanel>
        </div>
      </div>

      <DelegationPanel>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users />
            Multi-Agent Collaboration
          </CardTitle>
          <CardDescription className="text-slate-400">Owners, collaborators, reviewers and approvers can all attach to the same work item.</CardDescription>
        </CardHeader>
      </DelegationPanel>
    </div>
  );
}
