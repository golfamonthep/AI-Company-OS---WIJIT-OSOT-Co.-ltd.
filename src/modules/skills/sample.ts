import type { Skill } from "@/modules/skills/types";

export const sampleSkills: Skill[] = [
  {
    id: "skill-001",
    slug: "strategic-planning",
    name: "Strategic Planning",
    description: "วางแผนธุรกิจ แยก milestone และจัดลำดับความสำคัญ",
    category: "strategy",
    level: 8
  },
  {
    id: "skill-002",
    slug: "sop-reasoning",
    name: "SOP Reasoning",
    description: "ใช้ SOP เป็นบริบทในการตัดสินใจและปรับปรุง workflow",
    category: "operations",
    level: 7
  },
  {
    id: "skill-003",
    slug: "thai-copywriting",
    name: "Thai Copywriting",
    description: "เขียน caption, script และ CTA ภาษาไทยที่ชัดเจนและนำไปใช้ได้จริง",
    category: "content",
    level: 8
  }
];
