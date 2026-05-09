import { NextResponse } from "next/server";
import { z } from "zod";
import { routeAgentCommunication } from "@/modules/communications/router";
import { createCommunicationEvent } from "@/modules/communications/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const communicationEventSchema = z.object({
  organizationId: z.string().min(1),
  type: z.enum(["direct_message", "task_delegation", "workflow_collaboration", "team_discussion", "status_report", "approval_request", "escalation", "memory_reference"]),
  senderAgentId: z.string().optional(),
  recipientAgentId: z.string().optional(),
  targetRole: z.enum(["ceo", "cto", "marketing", "content", "video", "cfo", "rd", "admin"]).optional(),
  departmentId: z.string().optional(),
  threadId: z.string().optional(),
  workflowRunId: z.string().optional(),
  taskId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  subject: z.string().min(1),
  body: z.string().min(1),
  memoryReferences: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = communicationEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid communication event" }, { status: 400 });
  }

  const routing = routeAgentCommunication(parsed.data);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: "planned",
      message: "Supabase env is not configured; returning communication routing plan only.",
      routing,
      envelope: parsed.data
    });
  }

  try {
    const result = await createCommunicationEvent(supabase, parsed.data, routing);

    if (result.error) {
      return NextResponse.json({ error: result.error.message, routing }, { status: 500 });
    }

    return NextResponse.json({
      status: "queued",
      data: result.data,
      routing,
      envelope: parsed.data
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to persist communication event";
    return NextResponse.json({ error: message, routing }, { status: 500 });
  }
}
