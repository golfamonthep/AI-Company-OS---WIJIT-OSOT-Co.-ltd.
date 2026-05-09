"use client";

import { Activity, Bell, Command, Lock, Radio, Search, ShieldCheck, Users } from "lucide-react";
import { dashboardSections } from "@/dashboard/data";
import { useControlCenterStore } from "@/dashboard/store";
import type { DashboardSection } from "@/dashboard/types";
import { IconButton, StatusPill } from "@/dashboard/components/dashboard-primitives";

type DashboardWorkspaceSession = {
  workspaceName: string;
  role: string;
  userName: string;
  approvalAuthority: string[];
  readOnly: boolean;
  mockedAuth: boolean;
};

export function DashboardLayoutSystem({ children, workspaceSession }: { children: React.ReactNode; workspaceSession?: DashboardWorkspaceSession }) {
  const activeSection = useControlCenterStore((state) => state.activeSection);
  const setActiveSection = useControlCenterStore((state) => state.setActiveSection);
  const session = workspaceSession ?? {
    workspaceName: "Demo AI Company",
    role: "owner",
    userName: "Demo Owner",
    approvalAuthority: ["low", "normal", "high"],
    readOnly: false,
    mockedAuth: true
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 xl:block">
        <div className="flex items-center gap-3 px-1">
          <div className="grid size-10 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
            <Command size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">AI Company OS</p>
            <p className="text-xs text-slate-500">ระบบปฏิบัติการบริษัท</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {dashboardSections.map((item) => {
            const Icon = item.icon;
            const selected = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id as DashboardSection)} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm font-medium transition ${selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"}`}>
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-5 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Current workspace</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{session.workspaceName}</p>
            <button type="button" disabled className="mt-3 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs font-medium text-slate-500">
              เปลี่ยนพื้นที่ทำงาน
            </button>
          </div>
          <StatusPill tone={session.readOnly ? "amber" : "green"}>{session.readOnly ? "โหมดอ่านอย่างเดียว" : "ควบคุมโดยมนุษย์"}</StatusPill>
        </div>
      </aside>
      <section className="relative z-10 xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-[1520px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-md border border-slate-200 bg-blue-50 text-blue-700 xl:hidden">
                <Command size={18} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-950">แดชบอร์ด AI Company OS</h1>
                <p className="text-xs text-slate-500">ภาพรวมงาน AI เวิร์กโฟลว์ และงานที่ต้องอนุมัติ</p>
              </div>
            </div>
            <div className="flex min-h-10 flex-1 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 lg:max-w-xl">
              <Search size={17} className="text-slate-400" />
              <span className="text-sm text-slate-500">ค้นหาทีม AI เวิร์กโฟลว์ ความจำ หรือการอนุมัติ...</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill tone="cyan">
                <Users size={13} className="mr-1" />
                {session.role}
              </StatusPill>
              {session.readOnly && (
                <StatusPill tone="amber">
                  <Lock size={13} className="mr-1" />
                อ่านอย่างเดียว
                </StatusPill>
              )}
              <StatusPill tone="green">
                <Activity size={13} className="mr-1" />
                {session.mockedAuth ? "บัญชีตัวอย่าง" : session.userName}
              </StatusPill>
              <StatusPill tone="amber">
                <Radio size={13} className="mr-1" />
                {session.approvalAuthority.length ? "มีสิทธิ์อนุมัติ" : "ไม่มีสิทธิ์อนุมัติ"}
              </StatusPill>
              <IconButton label="Notifications">
                <Bell size={17} />
              </IconButton>
              <IconButton label="Governance controls">
                <ShieldCheck size={17} />
              </IconButton>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1520px] px-4 py-5 sm:px-5 lg:py-6">{children}</div>
      </section>
    </main>
  );
}
