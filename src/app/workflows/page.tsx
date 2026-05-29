import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import Link from "next/link";

export default function WorkflowsPage() {
  const focusItems = [
    { label: "สิ่งที่ต้องตัดสินใจ", value: "ตรวจงานก่อนใช้จริง" },
    { label: "งานที่กำลังเตรียม", value: "แคมเปญ TikTok แม่และเด็ก" },
    { label: "บทเรียนหลังอนุมัติ", value: "บันทึกเฉพาะสิ่งที่คุณยืนยัน" }
  ];
  const reviewSteps = [
    {
      title: "CEO AI รับบรีฟและสรุปโจทย์",
      detail: "แปลงคำขอธุรกิจให้เป็นแผนที่ตรวจง่าย ก่อนส่งให้ทีมเบื้องหลังช่วยเตรียมงาน"
    },
    {
      title: "เตรียมชุดคอนเทนต์ให้คุณอ่าน",
      detail: "รวมมุมแคมเปญ ฮุก แคปชัน สคริปต์ และข้อควรระวังไว้ในหน้าเดียว"
    },
    {
      title: "คุณอนุมัติหรือขอแก้ไข",
      detail: "ไม่มีการเผยแพร่ ใช้งบ หรือบันทึกบทเรียนสำคัญจนกว่าคุณจะยืนยัน"
    }
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="blue">CEO AI ดูแลงานให้</Badge>
          <h2 className="mt-3 text-2xl font-bold">งานที่รอคุณตรวจ</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            หน้านี้สรุปงานสำคัญที่ CEO AI เตรียมไว้ให้คุณตัดสินใจ โดยซ่อนรายละเอียดระบบไว้เบื้องหลังและแสดงเฉพาะสิ่งที่เจ้าของธุรกิจต้องรู้
          </p>
        </div>
        <Link href="/dashboard" className="inline-flex rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          กลับไปคุยกับ CEO AI
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {focusItems.map((lane) => (
          <Panel key={lane.label}>
            <p className="text-xs font-semibold text-primary">{lane.label}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{lane.value}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel>
          <Badge tone="green">แคมเปญแรกที่ใช้งานได้จริง</Badge>
          <h3 className="mt-4 text-lg font-bold">TikTok สำหรับธุรกิจแม่และเด็ก</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            CEO AI ช่วยเตรียมคอนเทนต์และเหตุผลประกอบการตัดสินใจ คุณตรวจคุณภาพและอนุมัติก่อนนำไปใช้จริง
          </p>
          <div className="mt-5 space-y-3">
            {reviewSteps.map((step, index) => (
              <div key={step.title} className="grid gap-3 rounded-md border border-border bg-slate-50 p-3 md:grid-cols-[40px_1fr]">
                <div className="grid size-8 place-items-center rounded-md bg-primary text-sm font-bold text-white">{index + 1}</div>
                <div>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/workflows/content-production" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            เปิดหน้าตรวจแคมเปญ
          </Link>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <Badge tone="amber">ขอบเขตความปลอดภัย</Badge>
            <p className="mt-4 text-sm leading-6 text-muted">
              คำแนะนำ การเผยแพร่ การใช้งบ และบทเรียนสำคัญจะหยุดรอคุณอนุมัติ เพื่อให้ CEO AI ช่วยงานได้โดยไม่ข้ามการตัดสินใจของเจ้าของธุรกิจ
            </p>
          </Panel>
          <Panel>
            <Badge tone="blue">ควรเริ่มตรงไหน</Badge>
            <p className="mt-4 text-sm leading-6 text-muted">
              กลับไปที่แดชบอร์ดเพื่อถาม CEO AI ว่าวันนี้ควรตัดสินใจเรื่องอะไรก่อน หรือเปิดหน้าตรวจแคมเปญเพื่อดูคอนเทนต์ที่เตรียมไว้
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
