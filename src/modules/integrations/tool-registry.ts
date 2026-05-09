export type ToolDefinition = {
  slug: string;
  name: string;
  description: string;
  permission: "read" | "write" | "external_action";
};

export const toolRegistry: ToolDefinition[] = [
  {
    slug: "create-task",
    name: "สร้างงาน",
    description: "ให้ Agent สร้างงานที่ติดตามสถานะได้",
    permission: "write"
  },
  {
    slug: "write-memory",
    name: "บันทึก Memory",
    description: "บันทึกความรู้หรือบทเรียนที่ใช้ซ้ำได้",
    permission: "write"
  },
  {
    slug: "generate-report",
    name: "สร้างรายงาน",
    description: "สรุปผลการดำเนินงานในรูปแบบรายงานธุรกิจ",
    permission: "write"
  }
];
