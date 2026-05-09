import type { CompanyTask } from "@/modules/tasks/types";

export const sampleTasks: CompanyTask[] = [
  {
    id: "task-001",
    title: "สรุปเป้าหมาย MVP ของ AI Company OS",
    description: "แปลง vision ให้เป็น milestone ที่ทีมพัฒนาทำได้จริง",
    ownerAgentId: "ceo-ai",
    priority: "critical",
    status: "in_progress",
    createdAt: "2026-05-07T00:00:00.000Z"
  },
  {
    id: "task-002",
    title: "จัดโครงสร้าง SOP เริ่มต้น",
    description: "สร้างหมวดหมู่ SOP สำหรับฝ่ายบริหาร การตลาด และบริการลูกค้า",
    ownerAgentId: "ceo-ai",
    priority: "high",
    status: "todo",
    createdAt: "2026-05-07T00:00:00.000Z"
  }
];
