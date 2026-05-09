import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { sampleSops } from "@/modules/sop/sample";

export default function SOPPage() {
  return (
    <AppShell>
      <h2 className="text-2xl font-bold">คลังความรู้ / SOP</h2>
      <p className="mt-2 text-sm text-muted">SOP คือฐานปฏิบัติการที่ Agent ใช้อ้างอิงและปรับปรุงจาก feedback</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {sampleSops.map((sop) => (
          <Panel key={sop.id}>
            <Badge tone="green">{sop.owner}</Badge>
            <h3 className="mt-4 font-bold">{sop.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{sop.summary}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
