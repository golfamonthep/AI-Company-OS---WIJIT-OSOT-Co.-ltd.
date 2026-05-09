import { sampleMemories } from "@/modules/memory/sample";
import { sampleTasks } from "@/modules/tasks/sample";

export const dashboardMetrics = [
  { label: "Agent พร้อมทำงาน", value: "1", detail: "CEO AI พร้อมรับคำสั่ง" },
  { label: "งานที่เปิดอยู่", value: String(sampleTasks.filter((task) => task.status !== "done").length), detail: "ติดตามผ่าน task engine" },
  { label: "Memory สำคัญ", value: String(sampleMemories.length), detail: "ใช้ช่วยตัดสินใจซ้ำ" },
  { label: "Feedback Score", value: "ยังไม่มี", detail: "จะเริ่มวัดหลังใช้งานจริง" }
];
