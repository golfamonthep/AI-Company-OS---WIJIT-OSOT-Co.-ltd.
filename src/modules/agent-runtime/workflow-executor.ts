import type { AgentRuntimeContext, AgentWorkflowAdapter, AgentWorkflowExecution } from "@/modules/agent-runtime/contracts";

export async function executeAgentWorkflow<TPayload, TOutput>(
  adapter: AgentWorkflowAdapter<TPayload, TOutput>,
  context: AgentRuntimeContext<TPayload>
): Promise<AgentWorkflowExecution<TOutput>> {
  return adapter.execute(context);
}
