import type { SupabaseClient } from "@supabase/supabase-js";

export type HarnessModuleId = "python" | "node" | "filesystem" | "api" | "browser" | "media";

export type HarnessExecutionStatus = "success" | "failed" | "denied" | "timeout" | "unsupported";

export type HarnessAction =
  | "run_python"
  | "run_node"
  | "read_file"
  | "write_file"
  | "create_folder"
  | "api_request"
  | "browser_task"
  | "media_task";

export type HarnessCapability = {
  moduleId: HarnessModuleId;
  action: HarnessAction;
  available: boolean;
  requiresApproval: boolean;
  description: string;
};

export type HarnessPermission = {
  allowed: boolean;
  reason: string;
};

export type HarnessTask<TInput = Record<string, unknown>> = {
  organizationId: string;
  agentId: string;
  moduleId: HarnessModuleId;
  action: HarnessAction;
  input: TInput;
  timeoutMs?: number;
  retries?: number;
  requiresApproval?: boolean;
  approved?: boolean;
  metadata?: Record<string, unknown>;
};

export type HarnessResult<TOutput = unknown> = {
  taskId: string;
  moduleId: HarnessModuleId;
  action: HarnessAction;
  status: HarnessExecutionStatus;
  output?: TOutput;
  error?: string;
  attempts: number;
  startedAt: string;
  completedAt: string;
  metadata?: Record<string, unknown>;
};

export type HarnessModule<TInput = Record<string, unknown>, TOutput = unknown> = {
  moduleId: HarnessModuleId;
  capabilities: HarnessCapability[];
  execute: (task: HarnessTask<TInput>, context: HarnessExecutionContext) => Promise<HarnessResult<TOutput>>;
};

export type HarnessExecutionContext = {
  supabase: SupabaseClient | null;
  workspaceRoot: string;
};

export type FileSystemHarnessInput =
  | { path: string; content?: string; encoding?: BufferEncoding }
  | { path: string; recursive?: boolean };

export type ApiHarnessInput = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

export type RuntimeHarnessInput = {
  script: string;
  args?: string[];
  cwd?: string;
};
