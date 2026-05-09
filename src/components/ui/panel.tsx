import { cn } from "@/components/ui/cn";

type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return <section className={cn("rounded-lg border border-border bg-white p-5 shadow-soft", className)}>{children}</section>;
}
