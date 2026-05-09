import { NextResponse } from "next/server";
import { z } from "zod";
import { runContentCommand } from "@/modules/orchestration/content-workflow";

const contentCommandSchema = z.object({
  brief: z.string().min(1),
  productName: z.string().optional(),
  audience: z.string().optional(),
  channel: z.enum(["facebook", "instagram", "tiktok", "line", "website"]).optional(),
  format: z.enum(["social_post", "short_video_script", "campaign_ideas", "content_calendar"]).optional(),
  tone: z.enum(["professional", "friendly", "premium", "educational", "urgent"]).optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contentCommandSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลสำหรับสร้างคอนเทนต์ไม่ถูกต้อง" }, { status: 400 });
  }

  const result = await runContentCommand(parsed.data);
  return NextResponse.json(result);
}
