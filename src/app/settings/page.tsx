import { AppShell } from "@/components/dashboard/app-shell";
import { Panel } from "@/components/ui/panel";

export default function SettingsPage() {
  return (
    <AppShell>
      <h2 className="text-2xl font-bold">ตั้งค่า</h2>
      <p className="mt-2 text-sm text-muted">พื้นที่สำหรับตั้งค่าองค์กร ภาษา โมเดล AI และ integration ในอนาคต</p>
      <Panel className="mt-5">
        <h3 className="font-bold">ค่าเริ่มต้นของระบบ</h3>
        <p className="mt-2 text-sm leading-6 text-muted">ภาษาเริ่มต้นคือภาษาไทย และ Agent ทุกตัวต้องตอบภาษาไทย ยกเว้นผู้ใช้สั่งเป็นภาษาอื่น</p>
      </Panel>
    </AppShell>
  );
}
