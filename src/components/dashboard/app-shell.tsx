import Link from "next/link";
import { ChartSpline } from "lucide-react";
import { appNavigation } from "@/config/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="mb-7 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-primary text-white">
            <ChartSpline size={21} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">CEO AI</p>
            <p className="text-xs text-muted">ผู้ช่วยบริหารบริษัทภาษาไทย</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {appNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-border bg-white/90 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-primary">ถาม สรุป และตัดสินใจเรื่องสำคัญ</p>
              <h1 className="text-xl font-bold text-foreground">CEO AI Command Center</h1>
            </div>
            <Link href="/login" className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              เข้าสู่ระบบ
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
      </section>
    </main>
  );
}
