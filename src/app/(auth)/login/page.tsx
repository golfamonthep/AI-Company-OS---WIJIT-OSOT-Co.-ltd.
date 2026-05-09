import Link from "next/link";
import { Bot, Building2, LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#060914] px-5 text-slate-100">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-black/30 p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md border border-cyan-200/30 bg-cyan-200/10 text-cyan-100">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Company OS</h1>
            <p className="text-sm text-slate-400">MVP login uses Supabase Auth when configured and a safe demo session locally.</p>
          </div>
        </div>
        <div className="space-y-3">
          <input className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/50" placeholder="Email" />
          <input className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-200/50" placeholder="Password" type="password" />
          <Link href="/workspaces" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950">
            <LogIn size={16} />
            Continue to workspace
          </Link>
          <Link href="/workflows/content-department" className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/[0.06]">
            <Building2 size={16} />
            Open Content Department MVP
          </Link>
        </div>
      </section>
    </main>
  );
}
