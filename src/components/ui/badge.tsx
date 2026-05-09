import { cn } from "@/components/ui/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "gray";
};

const tones = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  gray: "border-slate-200 bg-slate-50 text-slate-700"
};

export function Badge({ children, tone = "gray" }: BadgeProps) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}
