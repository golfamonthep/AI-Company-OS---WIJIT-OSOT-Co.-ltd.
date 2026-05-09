import Link from "next/link";
import { Activity, Bell, Command, Cpu, Search, ShieldCheck } from "lucide-react";
import { appNavigation } from "@/config/navigation";

export function ControlCenterShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#04070d] text-slate-100">
      <div className="fixed inset-0 bg-[linear-gradient(115deg,#04070d_0%,#08111c_42%,#050912_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-[#07101a]/75 px-4 py-5 shadow-2xl shadow-black/40 backdrop-blur-2xl xl:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-1">
          <div className="grid size-10 place-items-center rounded-lg border border-cyan-200/30 bg-white/[0.06] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
            <Command />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">AI Company OS</p>
            <p className="text-xs text-slate-500">Autonomous company layer</p>
          </div>
        </Link>
        <nav className="mt-9 flex flex-col gap-1">
          {appNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:border-white/10 hover:bg-white/[0.065] hover:text-white">
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-5 grid gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.055] p-3">
            <p className="text-xs text-slate-500">Active workspace</p>
            <p className="mt-1 text-sm font-semibold text-white">AI Company</p>
          </div>
          <div className="rounded-lg border border-cyan-200/15 bg-cyan-200/[0.055] p-3 text-sm font-medium text-cyan-100">Enterprise Intelligence</div>
        </div>
      </aside>
      <section className="relative z-10 xl:pl-72">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#04070d]/80 px-5 py-3 backdrop-blur-2xl">
          <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1fr_minmax(360px,620px)_1fr] lg:items-center">
            <div className="hidden items-center gap-3 lg:flex">
              <div className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-cyan-100">
                <Cpu />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Neural operations</p>
                <p className="text-sm text-slate-400">Command Center</p>
              </div>
            </div>
            <div className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.055] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Search className="text-cyan-200" />
              <span className="text-sm text-slate-400">Ask AI Company OS anything...</span>
              <span className="ml-auto rounded-md border border-white/10 px-2 py-1 text-xs text-slate-500">⌘ K</span>
            </div>
            <div className="flex items-center justify-start gap-3 lg:justify-end">
              <span className="hidden items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100 sm:inline-flex">
                <Activity />
                All systems operational
              </span>
              <button className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-slate-300">
                <Bell />
              </button>
              <button className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-slate-300">
                <ShieldCheck />
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-6">{children}</div>
      </section>
    </main>
  );
}
