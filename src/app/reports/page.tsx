import { AppShell } from "@/components/dashboard/app-shell";
import { Panel } from "@/components/ui/panel";

export default function ReportsPage() {
  return (
    <AppShell>
      <h2 className="text-2xl font-bold">รายงานธุรกิจ</h2>
      <p className="mt-2 text-sm text-muted">พื้นที่สำหรับรายงานที่ CEO AI สร้างจาก task, memory และ SOP</p>
      <Panel className="mt-5">
        <h3 className="font-bold">รายงาน MVP เริ่มต้น</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          ระบบถูกออกแบบให้สร้างรายงานผู้บริหาร เช่น สถานะงาน ความเสี่ยง งานที่ควรมอบหมาย และข้อเสนอแนะการปรับ SOP เมื่อมีข้อมูลจริงจากฐานข้อมูล
        </p>
      </Panel>
    </AppShell>
  );
}
