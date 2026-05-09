import type { ConnectorActionType } from "@/modules/agent-runtime/integrations/types";

export type MockHarnessRequest = {
  tool: "memory" | "json_parser" | "connector" | "node_runtime" | "python_runtime" | "browser";
  action: string;
  input: Record<string, unknown>;
  approved?: boolean;
  connectorActionType?: ConnectorActionType;
};

export type MockHarnessResult = {
  status: "success" | "denied" | "requires_approval" | "failed";
  output: Record<string, unknown>;
  auditSummary: string;
};

export class MockHarnessExecutor {
  readonly executions: Array<MockHarnessRequest & MockHarnessResult> = [];

  execute(request: MockHarnessRequest): MockHarnessResult {
    const result = this.evaluate(request);
    this.executions.push({ ...request, ...result });
    return result;
  }

  private evaluate(request: MockHarnessRequest): MockHarnessResult {
    if ((request.tool === "node_runtime" || request.tool === "python_runtime" || request.tool === "browser") && !request.approved) {
      return {
        status: "requires_approval",
        output: {},
        auditSummary: `${request.tool} requires approval before execution.`
      };
    }

    if (request.tool === "connector" && request.connectorActionType !== "read" && !request.approved) {
      return {
        status: "requires_approval",
        output: {},
        auditSummary: "Connector write or external action requires approval."
      };
    }

    return {
      status: "success",
      output: { action: request.action, echoed: request.input },
      auditSummary: `${request.tool}:${request.action} executed in mock mode.`
    };
  }
}
