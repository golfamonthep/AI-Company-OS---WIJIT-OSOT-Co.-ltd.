import { z } from "zod";

export const listQuerySchema = z.object({
  organizationId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export const agentConfigSchema = z.object({
  agentKey: z.string().min(1),
  role: z.string().min(1),
  name: z.string().min(1),
  responsibilities: z.array(z.string()).default([]),
  kpis: z.array(z.string()).default([]),
  behaviorRules: z.array(z.string()).default([]),
  status: z.string().default("active"),
  metadata: z.record(z.unknown()).default({})
});

export const executeSkillSchema = z.object({
  agentKey: z.string().default("content-creator"),
  skillId: z.string().min(1),
  taskIntent: z.string().min(1),
  input: z.record(z.unknown()).default({}),
  workflowId: z.string().optional()
});

export const validateSkillOutputSchema = z.object({
  skillId: z.string().min(1),
  output: z.record(z.unknown()).default({}),
  checklist: z.array(z.string()).default([])
});

export const createMemorySchema = z.object({
  scope: z.enum(["company", "agent", "task_history", "decision"]).default("company"),
  agentKey: z.string().optional(),
  workflowId: z.string().optional(),
  title: z.string().min(1),
  content: z.string().optional(),
  taskIntent: z.string().optional(),
  decision: z.string().optional(),
  reasoning: z.string().optional(),
  semanticTags: z.array(z.string()).default([]),
  importance: z.number().int().min(1).max(10).default(5),
  metadata: z.record(z.unknown()).default({})
});

export const searchMemorySchema = z.object({
  query: z.string().min(1),
  scope: z.enum(["all", "company", "agent", "task_history", "decision"]).default("all"),
  agentKey: z.string().optional(),
  limit: z.number().int().positive().max(50).default(10)
});

export const startWorkflowSchema = z.object({
  workflowKey: z.string().default("content-production"),
  objective: z.string().min(1),
  input: z.record(z.unknown()).default({}),
  humanInTheLoop: z.boolean().default(true)
});

export const approvalDecisionSchema = z.object({
  notes: z.string().default(""),
  decisionBy: z.string().default("ceo")
});

export const emergencyStopSchema = z.object({
  reason: z.string().min(1),
  scope: z.enum(["all", "workflow", "agent"]).default("all"),
  targetId: z.string().optional()
});

export const learningDecisionSchema = z.object({
  notes: z.string().default(""),
  reviewerId: z.string().default("human")
});

export const runOperationSchema = z.object({
  triggerKey: z.string().min(1),
  dryRun: z.boolean().default(true)
});

export const executeConnectorSchema = z.object({
  connectorId: z.string().min(1),
  actionId: z.string().min(1),
  actionType: z.enum(["read", "write", "external_action"]).default("read"),
  approved: z.boolean().default(false),
  summary: z.string().min(1),
  input: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({})
});
