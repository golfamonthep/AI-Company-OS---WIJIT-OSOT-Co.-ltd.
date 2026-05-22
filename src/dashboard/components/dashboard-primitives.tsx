import { cn } from "@/components/ui/cn";

export function DashboardPanel({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-normal text-slate-950 sm:text-base">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusPill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "cyan" | "green" | "amber" | "rose" | "violet" | "slate" }) {
  const tones = {
    cyan: "border-[#7DD3FC]/25 bg-[#7DD3FC]/10 text-[#7DD3FC]",
    green: "border-[#34D399]/25 bg-[#34D399]/10 text-[#34D399]",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    rose: "border-rose-300/25 bg-rose-300/10 text-rose-200",
    violet: "border-indigo-300/25 bg-indigo-300/10 text-indigo-200",
    slate: "border-white/[0.08] bg-white/[0.04] text-[#9CA3AF]"
  };

  return <span className={cn("inline-flex min-h-8 items-center rounded-md border px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function MiniProgress({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "green" | "amber" | "rose" | "violet" }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const colors = {
    cyan: "bg-cyan-300",
    green: "bg-emerald-300",
    amber: "bg-amber-300",
    rose: "bg-rose-300",
    violet: "bg-violet-300"
  };

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full", colors[tone])} style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function IconButton({ children, label, className = "" }: { children: React.ReactNode; label: string; className?: string }) {
  return (
    <button aria-label={label} title={label} className={cn("grid size-10 place-items-center rounded-md border border-white/[0.08] bg-[#0D111A] text-[#9CA3AF] transition hover:border-[#7DD3FC]/30 hover:bg-[#121826] hover:text-[#7DD3FC]", className)}>
      {children}
    </button>
  );
}
