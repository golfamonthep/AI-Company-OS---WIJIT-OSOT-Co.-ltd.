import { AppShell } from "@/components/dashboard/app-shell";
import { Panel } from "@/components/ui/panel";
import { defaultDepartments } from "@/modules/departments/seed";

export default function DepartmentsPage() {
  return (
    <AppShell>
      <h2 className="text-2xl font-bold">แผนก</h2>
      <p className="mt-2 text-sm text-muted">โครงสร้างองค์กรสำหรับ multi-agent workforce</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {defaultDepartments.map((department) => (
          <Panel key={department.slug}>
            <h3 className="font-bold">{department.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{department.description}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
