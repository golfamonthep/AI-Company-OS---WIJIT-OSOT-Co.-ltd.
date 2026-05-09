import type { SupabaseClient } from "@supabase/supabase-js";
import type { BaseRecord, PersistenceListResult, PersistenceResult } from "@/database/types";

const memoryStore = new Map<string, Array<BaseRecord & Record<string, unknown>>>();

export class PersistenceService {
  constructor(private readonly supabase: SupabaseClient | null = null) {}

  isConfigured() {
    return Boolean(this.supabase);
  }

  async create<TRecord extends BaseRecord & Record<string, unknown>>(table: string, record: TRecord): Promise<PersistenceResult<TRecord>> {
    const prepared = this.prepareRecord(record);

    if (!this.supabase) {
      const saved = this.memoryInsert(table, prepared);
      return { status: "mocked", data: saved as TRecord, source: "memory" };
    }

    const result = await this.supabase.from(table).insert(prepared).select("*").single();
    if (result.error) return { status: "failed", data: null, error: result.error.message, source: "supabase" };
    return { status: "success", data: result.data as TRecord, source: "supabase" };
  }

  async upsert<TRecord extends BaseRecord & Record<string, unknown>>(table: string, record: TRecord, onConflict?: string): Promise<PersistenceResult<TRecord>> {
    const prepared = this.prepareRecord(record);

    if (!this.supabase) {
      const saved = this.memoryUpsert(table, prepared, onConflict);
      return { status: "mocked", data: saved as TRecord, source: "memory" };
    }

    const query = onConflict ? this.supabase.from(table).upsert(prepared, { onConflict }) : this.supabase.from(table).upsert(prepared);
    const result = await query.select("*").single();
    if (result.error) return { status: "failed", data: null, error: result.error.message, source: "supabase" };
    return { status: "success", data: result.data as TRecord, source: "supabase" };
  }

  async list<TRecord extends BaseRecord & Record<string, unknown>>(table: string, organizationId: string, limit = 50): Promise<PersistenceListResult<TRecord>> {
    if (!this.supabase) {
      const rows = (memoryStore.get(table) ?? []).filter((row) => row.organization_id === organizationId).slice(0, limit);
      return { status: "mocked", data: rows as TRecord[], source: "memory" };
    }

    const result = await this.supabase.from(table).select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(limit);
    if (result.error) return { status: "failed", data: [], error: result.error.message, source: "supabase" };
    return { status: "success", data: result.data as TRecord[], source: "supabase" };
  }

  async listByWorkspace<TRecord extends BaseRecord & Record<string, unknown>>(table: string, workspaceId: string, organizationId: string, limit = 50): Promise<PersistenceListResult<TRecord>> {
    if (!this.supabase) {
      const rows = (memoryStore.get(table) ?? [])
        .filter((row) => (row.workspace_id ?? row.organization_id) === workspaceId || row.organization_id === organizationId)
        .slice(0, limit);
      return { status: "mocked", data: rows as TRecord[], source: "memory" };
    }

    const result = await this.supabase.from(table).select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(limit);
    if (result.error) return { status: "failed", data: [], error: result.error.message, source: "supabase" };
    return { status: "success", data: result.data as TRecord[], source: "supabase" };
  }

  async findBy<TRecord extends BaseRecord & Record<string, unknown>>(table: string, column: string, value: string, organizationId: string): Promise<PersistenceResult<TRecord>> {
    if (!this.supabase) {
      const row = (memoryStore.get(table) ?? []).find((item) => item.organization_id === organizationId && item[column] === value);
      return { status: row ? "mocked" : "failed", data: (row as TRecord) ?? null, error: row ? undefined : "Record not found in memory fallback.", source: "memory" };
    }

    const result = await this.supabase.from(table).select("*").eq("organization_id", organizationId).eq(column, value).maybeSingle();
    if (result.error) return { status: "failed", data: null, error: result.error.message, source: "supabase" };
    return { status: "success", data: result.data as TRecord | null, source: "supabase" };
  }

  async findByWorkspace<TRecord extends BaseRecord & Record<string, unknown>>(table: string, column: string, value: string, workspaceId: string, organizationId: string): Promise<PersistenceResult<TRecord>> {
    if (!this.supabase) {
      const row = (memoryStore.get(table) ?? []).find((item) => ((item.workspace_id ?? item.organization_id) === workspaceId || item.organization_id === organizationId) && item[column] === value);
      return { status: row ? "mocked" : "failed", data: (row as TRecord) ?? null, error: row ? undefined : "Record not found in memory fallback.", source: "memory" };
    }

    const result = await this.supabase.from(table).select("*").eq("workspace_id", workspaceId).eq(column, value).maybeSingle();
    if (result.error) return { status: "failed", data: null, error: result.error.message, source: "supabase" };
    return { status: "success", data: result.data as TRecord | null, source: "supabase" };
  }

  private prepareRecord<TRecord extends BaseRecord & Record<string, unknown>>(record: TRecord) {
    const now = new Date().toISOString();
    return {
      ...record,
      id: record.id ?? crypto.randomUUID(),
      created_at: record.created_at ?? now,
      updated_at: record.updated_at ?? now,
      metadata: record.metadata ?? {}
    };
  }

  private memoryInsert(table: string, record: BaseRecord & Record<string, unknown>) {
    const current = memoryStore.get(table) ?? [];
    current.unshift(record);
    memoryStore.set(table, current);
    return record;
  }

  private memoryUpsert(table: string, record: BaseRecord & Record<string, unknown>, onConflict?: string) {
    const current = memoryStore.get(table) ?? [];
    const conflictColumns = onConflict?.split(",").map((column) => column.trim()).filter(Boolean) ?? [];
    const existingIndex = current.findIndex((item) => {
      if (conflictColumns.length) return conflictColumns.every((column) => item[column] === record[column]);
      return item.id === record.id;
    });
    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...record };
      memoryStore.set(table, current);
      return current[existingIndex];
    }
    current.unshift(record);
    memoryStore.set(table, current);
    return record;
  }
}
