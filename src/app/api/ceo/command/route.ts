import { NextResponse } from "next/server";
import { z } from "zod";
import { runCEOCommand } from "@/modules/orchestration/ceo-workflow";

const commandSchema = z.object({
  command: z.string().min(1),
  organizationId: z.string().optional(),
  userId: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = commandSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  }

  const result = await runCEOCommand(parsed.data);
  return NextResponse.json(result);
}
