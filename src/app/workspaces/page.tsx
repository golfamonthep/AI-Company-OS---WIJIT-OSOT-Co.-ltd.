import Link from "next/link";
import { Building2, LayoutDashboard, Play } from "lucide-react";
import { getServerAuthContext } from "@/server/auth";
import { WorkspaceService } from "@/auth/WorkspaceService";

export default async function WorkspaceSelectionPage() {
  const context = await getServerAuthContext();
  const workspaces = await new WorkspaceService().listUserWorkspaces(context.user);

  return (
    <main className="min-h-screen bg-[#060914] px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm text-cyan-200">Workspace selection</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Choose your AI company workspace</h1>
          <p className="mt-2 text-sm text-slate-400">Signed in as {context.user.displayName}. Local development uses mocked auth until Supabase Auth is configured.</p>
        </div>
        <div className="grid gap-4">
          {workspaces.map((workspace) => (
            <section key={workspace.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-md border border-cyan-200/30 bg-cyan-200/10 text-cyan-100">
                    <Building2 size={19} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">{workspace.name}</h2>
                    <p className="text-sm text-slate-500">Role: {context.membership.role} / Persistence-ready workspace</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.06]">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link href="/workflows/content-department" className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950">
                    <Play size={16} />
                    Content workflow
                  </Link>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
