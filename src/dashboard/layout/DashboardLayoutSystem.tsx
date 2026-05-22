"use client";

import { Activity, Bell, Bot, BrainCircuit, CalendarDays, CheckCircle2, Command, Lock, MessageSquareText, Search, ShieldCheck, Users, UsersRound } from "lucide-react";
import { IconButton, StatusPill } from "@/dashboard/components/dashboard-primitives";

type DashboardWorkspaceSession = {
  workspaceName: string;
  role: string;
  userName: string;
  approvalAuthority: string[];
  readOnly: boolean;
  mockedAuth: boolean;
};

const commandCenterSections = [
  { id: "ceo-command", label: "คุยกับ CEO AI", icon: MessageSquareText },
  { id: "ceo-plan", label: "แผนของ CEO AI", icon: CheckCircle2 },
  { id: "delegated-agents", label: "ทีมที่มอบหมาย", icon: UsersRound },
  { id: "approval-queue", label: "รออนุมัติ", icon: ShieldCheck },
  { id: "daily-brief", label: "สรุปวันนี้", icon: CalendarDays },
  { id: "memory", label: "ความจำ", icon: BrainCircuit }
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
    <main className="min-h-screen bg-[#05070B] text-[#F5F7FA]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/[0.07] bg-[#05070B]/95 px-4 py-5 shadow-[18px_0_60px_rgba(0,0,0,0.28)] xl:block">
        <div className="flex items-center gap-3 px-1">
          <div className="grid size-10 place-items-center rounded-lg border border-[#7DD3FC]/20 bg-[#121826] text-[#7DD3FC]">
            <Command size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F5F7FA]">AI Company OS</p>
            <p className="text-xs text-[#9CA3AF]">CEO AI Command Center</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {commandCenterSections.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.id} href={`#${item.id}`} className="flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left text-sm font-medium text-[#9CA3AF] transition hover:border-[#7DD3FC]/20 hover:bg-[#121826] hover:text-[#F5F7FA]">
                <Icon size={17} />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-5 space-y-3">
          <div className="rounded-lg border border-white/[0.08] bg-[#0D111A] p-3">
            <p className="text-xs text-[#9CA3AF]">Current workspace</p>
            <p className="mt-1 text-sm font-semibold text-[#F5F7FA]">{session.workspaceName}</p>
            <button type="button" disabled className="mt-3 w-full rounded-md border border-white/[0.08] bg-[#121826] px-2.5 py-1.5 text-left text-xs font-medium text-[#9CA3AF]">
              พื้นที่ทำงานปัจจุบัน
            </button>
          </div>
          <StatusPill tone={session.readOnly ? "amber" : "green"}>{session.readOnly ? "โหมดอ่านอย่างเดียว" : "มนุษย์อนุมัติก่อนเสมอ"}</StatusPill>
        </div>
      </aside>
      <section className="relative z-10 xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#05070B]/88 px-3 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-4">
          <div className="mx-auto flex max-w-[1520px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-9 place-items-center rounded-md border border-[#7DD3FC]/20 bg-[#121826] text-[#7DD3FC] xl:hidden">
                <Command size={18} />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-[#F5F7FA]">CEO AI Command Center</h1>
                <p className="text-xs text-[#9CA3AF]">คุยกับ CEO AI เพื่อดูแผน งานที่มอบหมาย และสิ่งที่ต้องอนุมัติ</p>
              </div>
            </div>
            <div className="flex min-h-11 w-full min-w-0 flex-1 items-center gap-3 rounded-md border border-white/[0.08] bg-[#0D111A] px-3 lg:min-h-10 lg:max-w-xl">
              <Search size={17} className="shrink-0 text-[#7DD3FC]" />
              <span className="truncate text-sm text-[#9CA3AF]">ถาม CEO AI เช่น วันนี้ฉันต้องตัดสินใจอะไรบ้าง...</span>
            </div>
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              <StatusPill tone="cyan">
                <Users size={13} className="mr-1" />
                {session.role}
              </StatusPill>
              {session.readOnly && (
                <StatusPill tone="amber">
                  <Lock size={13} className="mr-1" />
                อ่านอย่างเดียว
                </StatusPill>
              )}
              <StatusPill tone="green">
                <Activity size={13} className="mr-1" />
                {session.mockedAuth ? "บัญชีตัวอย่าง" : session.userName}
              </StatusPill>
              <StatusPill tone="amber">
                <Bot size={13} className="mr-1" />
                {session.approvalAuthority.length ? "อนุมัติก่อนทำจริง" : "ยังไม่มีสิทธิ์อนุมัติ"}
              </StatusPill>
              <IconButton label="Notifications">
                <Bell size={17} />
              </IconButton>
              <IconButton label="Governance controls">
                <ShieldCheck size={17} />
              </IconButton>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1520px] bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.10),transparent_34%),radial-gradient(circle_at_78%_8%,rgba(52,211,153,0.08),transparent_30%)] px-3 py-4 sm:px-5 md:py-5 lg:px-6 lg:py-6">{children}</div>
      </section>
    </main>
  );
}
