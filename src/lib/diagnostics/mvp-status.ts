import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerateCEOBrainPlan } from "@/lib/ai/ceo-brain";
import { createSupabasePersistenceStore } from "@/lib/persistence/supabase-store";
import { CEOCommandService } from "@/modules/orchestration/ceo-command-service";

const DIAGNOSTIC_ORGANIZATION_ID = "mvp-diagnostics";
const DIAGNOSTIC_COMMAND = "MVP diagnostic: verify CEO AI runtime and Supabase persistence.";

export type MvpStatusDiagnostics = {
  openaiLiveVerified: boolean;
  supabaseWriteVerified: boolean;
  supabaseReadVerified: boolean;
  ceoCommandPersistence: boolean;
  ceoPlanPersistence: boolean;
  memoryPersistence: boolean;
  approvalPersistence: boolean;
  mvpReady: boolean;
};

export type MvpStatusDiagnosticsInput = {
  supabase: SupabaseClient | null;
  generateCEOBrainPlan: GenerateCEOBrainPlan;
  openaiModel?: string;
  now?: () => string;
  createId?: (prefix: string) => string;
};

export async function runMvpStatusDiagnostics(input: MvpStatusDiagnosticsInput): Promise<MvpStatusDiagnostics> {
  if (!input.supabase) {
    return createMvpStatusDiagnostics();
  }

  try {
    let openaiReturnedPlan = false;
    const store = createSupabasePersistenceStore({ supabase: input.supabase });
    const service = new CEOCommandService({
      now: input.now,
      createId: input.createId,
      generateCEOBrainPlan: async (request) => {
        const brainPlan = await input.generateCEOBrainPlan(request);
        openaiReturnedPlan = Boolean(brainPlan);
        return brainPlan;
      },
      savePlan: store.saveCEOPlan
    });

    const plan = await service.createCEOPlanFromCommand({
      organizationId: DIAGNOSTIC_ORGANIZATION_ID,
      command: DIAGNOSTIC_COMMAND
    });
    const writeReport = store.getWriteReport();
    const commandId = plan.commandId;
    const memoryId = plan.memoryCandidates[0]?.id;
    const approvalId = plan.approvalCheckpoints[0]?.id;

    const ceoCommandPersistence = await hasPersistedExternalId(input.supabase, "ceo_commands", commandId);
    const ceoPlanPersistence = await hasPersistedExternalId(input.supabase, "ceo_plans", plan.id);
    const memoryPersistence = memoryId ? await hasPersistedExternalId(input.supabase, "memory_items", memoryId) : false;
    const approvalPersistence = approvalId ? await hasPersistedExternalId(input.supabase, "approval_checkpoints", approvalId) : false;
    const supabaseReadVerified = ceoCommandPersistence && ceoPlanPersistence && memoryPersistence && approvalPersistence;
    const supabaseWriteVerified = writeReport.persistedToSupabase && !writeReport.usedFallback;
    const openaiLiveVerified =
      openaiReturnedPlan && input.openaiModel === "gpt-4.1" && plan.metadata?.integrationMode === "openai_responses_api";

    return createMvpStatusDiagnostics({
      openaiLiveVerified,
      supabaseWriteVerified,
      supabaseReadVerified,
      ceoCommandPersistence,
      ceoPlanPersistence,
      memoryPersistence,
      approvalPersistence
    });
  } catch {
    return createMvpStatusDiagnostics();
  }
}

async function hasPersistedExternalId(supabase: SupabaseClient, table: string, externalId: string) {
  const result = await supabase
    .from(table)
    .select("external_id")
    .eq("organization_id", DIAGNOSTIC_ORGANIZATION_ID)
    .eq("external_id", externalId)
    .maybeSingle();

  return Boolean(result.data && !result.error);
}

function createMvpStatusDiagnostics(input: Partial<Omit<MvpStatusDiagnostics, "mvpReady">> = {}): MvpStatusDiagnostics {
  const result = {
    openaiLiveVerified: input.openaiLiveVerified ?? false,
    supabaseWriteVerified: input.supabaseWriteVerified ?? false,
    supabaseReadVerified: input.supabaseReadVerified ?? false,
    ceoCommandPersistence: input.ceoCommandPersistence ?? false,
    ceoPlanPersistence: input.ceoPlanPersistence ?? false,
    memoryPersistence: input.memoryPersistence ?? false,
    approvalPersistence: input.approvalPersistence ?? false
  };

  return {
    ...result,
    mvpReady: Object.values(result).every(Boolean)
  };
}
