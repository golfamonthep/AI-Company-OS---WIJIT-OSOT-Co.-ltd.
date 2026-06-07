import { describe, expect, it } from "vitest";
import { runMvpStatusDiagnostics } from "@/lib/diagnostics/mvp-status";
import type { CEOBrainPlan } from "@/lib/ai/ceo-brain";

const openAiBrainPlan: CEOBrainPlan = {
  title: "CEO AI live diagnostic",
  summary: "CEO AI generated a live diagnostic plan.",
  recommendedStrategy: "Verify AI runtime and persistence with a harmless command.",
  involvedPlatforms: ["TikTok Office"],
  steps: ["Create diagnostic plan", "Persist diagnostic rows", "Read diagnostic rows"],
  delegatedTasks: [
    {
      agentName: "Content AI",
      department: "Content",
      task: "Prepare diagnostic summary",
      expectedOutput: "A diagnostic summary for CEO AI",
      status: "queued"
    }
  ],
  delegatedPlatformTasks: [],
  risks: ["Diagnostic route must not expose secrets."],
  approvalCheckpoints: [
    {
      label: "Approve diagnostic result",
      description: "Human can review whether the MVP is ready.",
      status: "requested"
    }
  ],
  contentWorkflowSuggestion: {
    campaignAngle: "Diagnostic only",
    postIdeas: ["No publishing"],
    captions: ["Diagnostic run only"],
    creativeDirection: "Plain diagnostic output",
    nextApprovalNeeded: "Human review"
  },
  expectedOutputs: ["MVP status booleans"]
};

describe("runMvpStatusDiagnostics", () => {
  it("verifies OpenAI-backed CEO planning and Supabase write/read persistence", async () => {
    const supabase = createMemorySupabaseClient();

    const result = await runMvpStatusDiagnostics({
      supabase: supabase as never,
      generateCEOBrainPlan: async () => openAiBrainPlan,
      openaiModel: "gpt-4.1",
      now: () => "2026-06-07T00:00:00.000Z",
      createId: (prefix) => `${prefix}-diagnostic`
    });

    expect(result).toEqual({
      openaiLiveVerified: true,
      supabaseWriteVerified: true,
      supabaseReadVerified: true,
      ceoCommandPersistence: true,
      ceoPlanPersistence: true,
      memoryPersistence: true,
      approvalPersistence: true,
      mvpReady: true
    });
  });

  it("keeps diagnostics false when OpenAI or Supabase cannot be verified", async () => {
    const result = await runMvpStatusDiagnostics({
      supabase: null,
      generateCEOBrainPlan: async () => null,
      openaiModel: "gpt-4.1"
    });

    expect(result).toEqual({
      openaiLiveVerified: false,
      supabaseWriteVerified: false,
      supabaseReadVerified: false,
      ceoCommandPersistence: false,
      ceoPlanPersistence: false,
      memoryPersistence: false,
      approvalPersistence: false,
      mvpReady: false
    });
  });
});

function createMemorySupabaseClient() {
  const rows = new Map<string, Array<Record<string, unknown>>>();

  return {
    from(table: string) {
      const filters: Array<{ column: string; value: string }> = [];

      return {
        insert(record: Record<string, unknown>) {
          rows.set(table, [record, ...(rows.get(table) ?? [])]);

          return {
            select() {
              return {
                single: async () => ({ data: record, error: null })
              };
            }
          };
        },
        select() {
          return {
            eq(column: string, value: string) {
              filters.push({ column, value });
              return this;
            },
            maybeSingle: async () => {
              const match = (rows.get(table) ?? []).find((row) => filters.every((filter) => row[filter.column] === filter.value));
              return { data: match ?? null, error: null };
            }
          };
        }
      };
    }
  };
}
