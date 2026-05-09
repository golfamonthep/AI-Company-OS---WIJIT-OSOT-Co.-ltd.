import { cn } from "@/components/ui/cn";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/10", className)}>
      <div className="h-full rounded-full bg-cyan-300" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
