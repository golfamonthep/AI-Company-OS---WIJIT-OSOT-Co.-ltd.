"use client";

import { Bot, Lock, MessageSquareText, ShieldCheck } from "lucide-react";

type DashboardWorkspaceSession = {
  workspaceName: string;
  role: string;
  userName: string;
  approvalAuthority: string[];
  readOnly: boolean;
  mockedAuth: boolean;
};

const commandCenterSections = [
  { id: "ceo-command", label: "คุยกับ CEO AI" },
  { id: "daily-brief", label: "สรุปวันนี้" },
  { id: "approval-queue", label: "ต้องตัดสินใจ" },
  { id: "ceo-plan", label: "แผนถัดไป" }
] as const;

export function DashboardLayoutSystem({ children, workspaceSession }: { children: React.ReactNode; workspaceSession?: DashboardWorkspaceSession }) {
  const session = workspaceSession ?? {
    workspaceName: "Demo AI Company",
    role: "owner",
    userName: "Demo Owner",
    approvalAuthority: ["low", "normal", "high"],
    readOnly: false,
    mockedAuth: true
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-700 text-white">
              <Bot size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-950">CEO AI</h1>
              <p className="text-xs leading-5 text-slate-500">ถาม สรุป และตัดสินใจเรื่องสำคัญของบริษัท</p>
            </div>
          </div>

          <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto pb-1 lg:pb-0">
            {commandCenterSections.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="slate">
              <MessageSquareText size={13} />
              {session.workspaceName}
            </StatusChip>
            {session.readOnly ? (
              <StatusChip tone="amber">
                <Lock size={13} />
                อ่านอย่างเดียว
              </StatusChip>
            ) : (
              <StatusChip tone="green">
                <ShieldCheck size={13} />
                อนุมัติก่อนทำจริง
              </StatusChip>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-6">{children}</div>
    </main>
  );
}

function StatusChip({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" | "slate" }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    slate: "border-slate-200 bg-slate-50 text-slate-600"
  };

  return <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
