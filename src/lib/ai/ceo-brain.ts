import { z } from "zod";

export const ceoBrainPlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  recommendedStrategy: z.string().min(1),
  involvedPlatforms: z.array(z.string().min(1)),
  steps: z.array(z.string().min(1)).min(1),
  delegatedTasks: z
    .array(
      z.object({
        agentName: z.string().min(1),
        department: z.string().min(1),
        task: z.string().min(1),
        expectedOutput: z.string().min(1),
        status: z.string().min(1)
      })
    )
    .min(1),
  delegatedPlatformTasks: z.array(
    z.object({
      platform: z.string().min(1),
      task: z.string().min(1),
      expectedOutput: z.string().min(1),
      status: z.string().min(1)
    })
  ),
  risks: z.array(z.string().min(1)),
  approvalCheckpoints: z
    .array(
      z.object({
        label: z.string().min(1),
        description: z.string().min(1),
        status: z.string().min(1)
      })
    )
    .min(1),
  contentWorkflowSuggestion: z.object({
    campaignAngle: z.string().min(1),
    postIdeas: z.array(z.string().min(1)),
    captions: z.array(z.string().min(1)),
    creativeDirection: z.string().min(1),
    nextApprovalNeeded: z.string().min(1)
  }),
  expectedOutputs: z.array(z.string().min(1))
});

export type CEOBrainPlan = z.infer<typeof ceoBrainPlanSchema>;

export type GenerateCEOBrainPlanInput = {
  command: string;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
};

export type GenerateCEOBrainPlan = (input: GenerateCEOBrainPlanInput) => Promise<CEOBrainPlan | null>;

export const ceoBrainPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "summary",
    "recommendedStrategy",
    "involvedPlatforms",
    "steps",
    "delegatedTasks",
    "delegatedPlatformTasks",
    "risks",
    "approvalCheckpoints",
    "contentWorkflowSuggestion",
    "expectedOutputs"
  ],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    recommendedStrategy: { type: "string" },
    involvedPlatforms: { type: "array", items: { type: "string" } },
    steps: { type: "array", items: { type: "string" } },
    delegatedTasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["agentName", "department", "task", "expectedOutput", "status"],
        properties: {
          agentName: { type: "string" },
          department: { type: "string" },
          task: { type: "string" },
          expectedOutput: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    delegatedPlatformTasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["platform", "task", "expectedOutput", "status"],
        properties: {
          platform: { type: "string" },
          task: { type: "string" },
          expectedOutput: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    risks: { type: "array", items: { type: "string" } },
    approvalCheckpoints: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "description", "status"],
        properties: {
          label: { type: "string" },
          description: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    contentWorkflowSuggestion: {
      type: "object",
      additionalProperties: false,
      required: ["campaignAngle", "postIdeas", "captions", "creativeDirection", "nextApprovalNeeded"],
      properties: {
        campaignAngle: { type: "string" },
        postIdeas: { type: "array", items: { type: "string" } },
        captions: { type: "array", items: { type: "string" } },
        creativeDirection: { type: "string" },
        nextApprovalNeeded: { type: "string" }
      }
    },
    expectedOutputs: { type: "array", items: { type: "string" } }
  }
} as const;
