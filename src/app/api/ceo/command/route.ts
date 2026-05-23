import { NextResponse } from "next/server";
import { z } from "zod";
import { CEOCommandService } from "@/modules/orchestration/ceo-command-service";

const commandSchema = z.object({
  command: z.string().min(1),
  organizationId: z.string().optional(),
  workspaceId: z.string().optional(),
  userId: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = commandSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  }

  const service = new CEOCommandService();
  const plan = await service.createCEOPlanFromCommand(parsed.data);
  return NextResponse.json({ ok: true, plan });
}
