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
    cyan: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    violet: "border-indigo-200 bg-indigo-50 text-indigo-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700"
  };

  return <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
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
    <button aria-label={label} title={label} className={cn("grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700", className)}>
      {children}
    </button>
  );
}
