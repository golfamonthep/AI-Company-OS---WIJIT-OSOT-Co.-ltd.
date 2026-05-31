"use client";

import { Bell, Bot, BriefcaseBusiness, CheckCircle2, CircleHelp, ClipboardCheck, FolderKanban, Home, MemoryStick, MessageSquareText, Search, Settings, Sparkles, UsersRound } from "lucide-react";

type DashboardWorkspaceSession = {
  workspaceName: string;
  role: string;
  userName: string;
  approvalAuthority: string[];
  readOnly: boolean;
  mockedAuth: boolean;
};

const navItems = [
  { label: "หน้าหลัก", icon: Home, href: "/dashboard", active: true },
  { label: "CEO AI แชท", icon: MessageSquareText, href: "#ceo-command" },
  { label: "งานของฉัน", icon: BriefcaseBusiness, href: "#active-work" },
  { label: "แผนงาน & โครงการ", icon: FolderKanban, href: "#workflow-steps" },
  { label: "เอเจนต์ AI", icon: UsersRound, href: "#agent-room" },
  { label: "อนุมัติ & ตรวจงาน", icon: ClipboardCheck, href: "#approval-queue" },
  { label: "ผลงาน & รายงาน", icon: CheckCircle2, href: "#final-outputs" },
  { label: "ความจำองค์กร", icon: MemoryStick, href: "#company-memory" },
  { label: "การตั้งค่า", icon: Settings, href: "/settings" }
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
    <main className="min-h-screen bg-[#080b18] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(95,111,255,0.22),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.12),transparent_30%),linear-gradient(180deg,#0a1024_0%,#080b18_48%,#050712_100%)]" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-white/[0.06] px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur-xl lg:block">
        <a href="/dashboard" className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
            <Bot size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">CEO AI</p>
            <p className="text-xs leading-5 text-slate-400">AI Company Brain</p>
          </div>
        </a>

        <nav aria-label="Command center navigation" className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.label} href={item.href} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${"active" in item && item.active ? "bg-white/12 text-white shadow-sm ring-1 ring-white/10" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={17} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-5 space-y-3">
          <div className="rounded-3xl border border-violet-300/20 bg-violet-400/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles size={16} />
              แพ็กเกจ Pro
            </div>
            <p className="mt-2 text-xs leading-5 text-violet-100/80">ใช้งาน AI workflow ได้ 82% ของโควตาเดือนนี้</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">{session.workspaceName}</p>
            <p className="mt-1 text-xs text-slate-400">Role: {session.role}</p>
            <p className="mt-2 text-xs text-emerald-300">{session.readOnly ? "อ่านอย่างเดียว" : "อนุมัติก่อนดำเนินการจริง"}</p>
          </div>
        </div>
      </aside>

      <section className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080b18]/80 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xl font-semibold tracking-normal text-white">สวัสดีตอนเช้า, คุณ{session.userName} 👋</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">CEO AI พร้อมช่วยบริหารและขับเคลื่อนธุรกิจของคุณวันนี้</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative min-w-0 flex-1 sm:w-80 sm:flex-none">
                <span className="sr-only">ค้นหาเอกสาร แผนงาน หรืองาน</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input className="h-11 w-full rounded-2xl border border-white/10 bg-white/8 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300/50 focus:ring-2 focus:ring-blue-400/20" placeholder="ค้นหาเอกสาร แผนงาน หรืองาน" />
              </label>
              <HeaderIcon label="แจ้งเตือน">
                <Bell size={17} />
              </HeaderIcon>
              <HeaderIcon label="ช่วยเหลือ">
                <CircleHelp size={17} />
              </HeaderIcon>
              <HeaderIcon label="ตั้งค่า">
                <Settings size={17} />
              </HeaderIcon>
              <div className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold text-white">CEO</div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:py-6">{children}</div>
      </section>
    </main>
  );
}

function HeaderIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/8 text-slate-300 transition hover:border-blue-300/40 hover:bg-white/12 hover:text-white">
      {children}
    </button>
  );
}
