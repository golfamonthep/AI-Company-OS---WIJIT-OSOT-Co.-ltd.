import "server-only";

import OpenAI from "openai";
import {
  ceoBrainPlanJsonSchema,
  ceoBrainPlanSchema,
  type CEOBrainPlan,
  type GenerateCEOBrainPlanInput
} from "@/lib/ai/ceo-brain";

const CEO_BRAIN_SYSTEM_PROMPT = `You are CEO AI for AI Company OS, an executive operating system for Thai business owners.
You must respond in Thai.
You propose plans before execution.
You never claim autonomous execution without user approval.
You coordinate internal agents: Marketing AI, Content AI, Design AI, Sales AI, Finance AI, Operations AI, R&D AI.
Return practical business plans with clear next steps, risks, delegated tasks, and approval checkpoints.
Return strict JSON only.`;

export async function createCEOBrainPlanWithOpenAI(input: GenerateCEOBrainPlanInput): Promise<CEOBrainPlan | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1",
    instructions: CEO_BRAIN_SYSTEM_PROMPT,
    input: buildCEOBrainInput(input),
    text: {
      format: {
        type: "json_schema",
        name: "ceo_ai_plan",
        strict: true,
        schema: ceoBrainPlanJsonSchema
      }
    }
  });

  const outputText = response.output_text;
  if (!outputText) {
    throw new Error("OpenAI did not return output text.");
  }

  const parsed = ceoBrainPlanSchema.safeParse(JSON.parse(outputText));
  if (!parsed.success) {
    throw new Error("OpenAI response did not match the CEO plan schema.");
  }

  return parsed.data;
}

function buildCEOBrainInput(input: GenerateCEOBrainPlanInput) {
  return [
    "สร้างแผน CEO AI จากคำสั่งนี้",
    `คำสั่ง: ${input.command}`,
    input.organizationId ? `organizationId: ${input.organizationId}` : undefined,
    input.workspaceId ? `workspaceId: ${input.workspaceId}` : undefined,
    input.userId ? `userId: ${input.userId}` : undefined,
    "ต้องมี delegatedTasks, risks, approvalCheckpoints และ contentWorkflowSuggestion สำหรับ Content Department MVP ถ้าเกี่ยวข้องกับแคมเปญหรือคอนเทนต์"
  ]
    .filter(Boolean)
    .join("\n");
}
