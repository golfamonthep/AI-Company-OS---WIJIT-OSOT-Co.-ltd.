import { describe, expect, it } from "vitest";
import { createSupabasePersistenceStore } from "@/lib/persistence/supabase-store";
import type { CEOPlan } from "@/modules/orchestration/types";

const basePlan: CEOPlan = {
  id: "ceo-plan-test",
  commandId: "ceo-command-test",
  summary: "Prepare a CEO-visible plan.",
  status: "waiting_approval",
  recommendedActions: ["Review the delegated work."],
  delegatedTasks: [
    {
      id: "delegated-task-test",
      title: "Prepare campaign draft",
      ownerAgentId: "content-creator",
      status: "queued",
      priority: "high",
      expectedOutput: "Draft campaign pack",
      approvalRequired: true,
      workflowExecutionId: "workflow-execution-test",
      metadata: { commandId: "ceo-command-test" }
    }
  ],
  approvalCheckpoints: [
    {
      id: "approval-checkpoint-test",
      title: "Approve content before external use",
      domain: "publishing",
      requiredApprovers: ["human"],
      status: "requested",
      riskLevel: "medium",
      relatedWorkflowExecutionId: "workflow-execution-test",
      summary: "Human approval is required.",
      metadata: { commandId: "ceo-command-test" }
    }
  ],
  workflowExecutions: [
    {
      id: "workflow-execution-test",
      workflowKey: "content-production",
      status: "queued",
      currentStep: "plan_approval",
      objective: "Launch campaign",
      delegatedTaskIds: ["delegated-task-test"],
      metadata: { commandId: "ceo-command-test" }
    }
  ],
  memoryCandidates: [
    {
      id: "memory-candidate-test",
      title: "Campaign learning",
      content: "Keep approvals visible.",
      scope: "task_history",
      sourceType: "ceo_command",
      status: "proposed",
      importance: 6,
      tags: ["ceo-command"],
      relatedCommandId: "ceo-command-test",
      relatedWorkflowExecutionId: "workflow-execution-test"
    }
  ],
  metadata: {
    command: {
      id: "ceo-command-test",
      organizationId: "org-test",
      workspaceId: "workspace-test",
      userId: "user-test",
      command: "Start a campaign",
      intent: "start_workflow",
      requestedBy: "human",
      status: "planned",
      createdAt: "2026-05-31T00:00:00.000Z"
    },
    integrationMode: "deterministic_mock"
  }
};

describe("createSupabasePersistenceStore", () => {
  it("saves CEO command plans to memory fallback when Supabase is not configured", async () => {
    const store = createSupabasePersistenceStore({ supabase: null });

    const savedPlan = await store.saveCEOPlan(basePlan);
    const memoryItems = await store.listMemoryItems("org-test");

    expect(savedPlan).toBe(basePlan);
    expect(memoryItems).toEqual([
      expect.objectContaining({
        id: "memory-candidate-test",
        title: "Campaign learning",
        status: "proposed",
        organization_id: "org-test",
        workspace_id: "workspace-test"
      })
    ]);
  });

  it("saves explicit memory items and lists the newest items first in fallback mode", async () => {
    const store = createSupabasePersistenceStore({ supabase: null });

    await store.saveMemoryItem({
      id: "memory-older",
      organizationId: "org-list",
      title: "Older learning",
      content: "First item",
      scope: "company",
      sourceType: "workflow",
      status: "saved",
      createdAt: "2026-05-30T00:00:00.000Z"
    });
    await store.saveMemoryItem({
      id: "memory-newer",
      organizationId: "org-list",
      title: "Newer learning",
      content: "Second item",
      scope: "company",
      sourceType: "workflow",
      status: "saved",
      createdAt: "2026-05-31T00:00:00.000Z"
    });

    const memoryItems = await store.listMemoryItems("org-list");

    expect(memoryItems.map((item) => item.id)).toEqual(["memory-newer", "memory-older"]);
  });

  it("falls back to memory when a configured Supabase client rejects a write", async () => {
    const rejectingSupabase = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: "permission denied for table memory_items" } })
          })
        }),
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => ({ data: [], error: null })
            })
          })
        })
      })
    };
    const store = createSupabasePersistenceStore({ supabase: rejectingSupabase as never });

    await store.saveMemoryItem({
      id: "memory-rejected-supabase",
      organizationId: "org-rejected",
      title: "Rejected write fallback",
      content: "Keep local mode usable.",
      scope: "company",
      sourceType: "workflow",
      status: "saved",
      createdAt: "2026-05-31T00:00:00.000Z"
    });

    const memoryItems = await store.listMemoryItems("org-rejected");

    expect(memoryItems).toEqual([
      expect.objectContaining({
        id: "memory-rejected-supabase",
        title: "Rejected write fallback",
        organization_id: "org-rejected"
      })
    ]);
  });
});
