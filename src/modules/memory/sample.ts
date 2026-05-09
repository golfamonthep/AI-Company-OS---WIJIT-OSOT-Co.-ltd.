import type { MemoryItem } from "@/modules/memory/types";

export const sampleMemories: MemoryItem[] = [
  {
    id: "mem-001",
    agentId: "ceo-ai",
    type: "decision",
    content: "MVP จะเริ่มจาก CEO AI เพียงตัวเดียวก่อน แล้วค่อยขยายเป็นแผนก",
    importance: 9,
    tags: ["mvp", "architecture", "ceo-ai"],
    createdAt: "2026-05-07T00:00:00.000Z"
  },
  {
    id: "mem-002",
    agentId: "ceo-ai",
    type: "preference",
    content: "ผู้ใช้หลักเป็นคนไทย UI และ Agent response ต้องใช้ภาษาไทยเป็นค่าเริ่มต้น",
    importance: 10,
    tags: ["thai", "localization"],
    createdAt: "2026-05-07T00:00:00.000Z"
  }
];
