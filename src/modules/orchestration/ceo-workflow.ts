import { ceoAgent } from "@/modules/agents/ceo";
import { sampleMemories } from "@/modules/memory/sample";
import type { CEOCommandInput, CEOCommandResult } from "@/modules/orchestration/types";
import type { CompanyTask } from "@/modules/tasks/types";

function detectIntent(command: string) {
  const lower = command.toLowerCase();
  if (lower.includes("รายงาน") || lower.includes("report")) return "report";
  if (lower.includes("สร้างงาน") || lower.includes("task") || lower.includes("todo")) return "create_tasks";
  if (lower.includes("แผน") || lower.includes("strategy") || lower.includes("roadmap")) return "plan";
  return "answer";
}

function buildTaskFromCommand(command: string): CompanyTask {
  return {
    id: `task-${Date.now()}`,
    title: command.length > 70 ? `${command.slice(0, 67)}...` : command,
    description: `CEO AI สร้างงานจากคำสั่ง: ${command}`,
    ownerAgentId: ceoAgent.id,
    priority: "high",
    status: "todo",
    createdAt: new Date().toISOString()
  };
}

export async function runCEOCommand(input: CEOCommandInput): Promise<CEOCommandResult> {
  const intent = detectIntent(input.command);
  const relevantMemory = sampleMemories.filter((memory) =>
    ["mvp", "architecture", "thai", "localization"].some((tag) => memory.tags.includes(tag))
  );
  const createdTasks = intent === "create_tasks" || intent === "plan" ? [buildTaskFromCommand(input.command)] : [];

  return {
    executiveSummary: [
      "CEO AI วิเคราะห์คำสั่งเรียบร้อยแล้ว",
      `เจตนาหลักของคำสั่งคือ: ${intent}`,
      "ระบบ MVP จะใช้ memory, SOP และ task engine เพื่อเปลี่ยนคำสั่งให้เป็นงานที่ติดตามผลได้"
    ].join(" "),
    recommendedActions: [
      "ยืนยันเป้าหมายธุรกิจและผลลัพธ์ที่ต้องการ",
      "แตกงานเป็น milestone ขนาดเล็กที่วัดผลได้",
      "บันทึกข้อสรุปสำคัญลงหน่วยความจำองค์กร",
      "ทบทวน SOP หลังจบงานเพื่อปรับปรุง workflow"
    ],
    createdTasks,
    referencedMemory: relevantMemory,
    confidence: 0.82
  };
}

export const ceoWorkflowMetadata = {
  engine: "LangGraph TypeScript",
  status: "adapter-ready",
  note: "MVP keeps this workflow behind a stable function so LangGraph nodes/checkpointing can replace the deterministic stub without changing UI/API contracts."
};
