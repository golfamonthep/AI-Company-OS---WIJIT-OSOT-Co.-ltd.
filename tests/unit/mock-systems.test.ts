import { describe, expect, it } from "vitest";
import { MockAgentFactory } from "@/testing/MockAgentFactory";
import { MockHarnessExecutor } from "@/testing/MockHarnessExecutor";
import { MockMemorySystem } from "@/testing/MockMemorySystem";

describe("testing mock systems", () => {
  it("creates a Content Creator AI with deterministic skill metadata", () => {
    const factory = new MockAgentFactory();
    const agent = factory.createContentCreator();

    expect(agent.agentId).toBe("content-creator");
    expect(agent.skills[0].skillId).toBe("tiktok-script-generation");
    expect(agent.skills[0].guardrails).toContain("No external publishing");
  });

  it("retrieves workspace-scoped memory for injection", () => {
    const memory = new MockMemorySystem();
    memory.seedMotherBabyCampaign("workspace-a");
    memory.seedMotherBabyCampaign("workspace-b");

    const results = memory.retrieve({ workspaceId: "workspace-a", query: "tiktok brand approval" });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((record) => record.workspaceId === "workspace-a")).toBe(true);
  });

  it("requires approval for connector write and runtime harness actions", () => {
    const harness = new MockHarnessExecutor();

    expect(
      harness.execute({
        tool: "connector",
        action: "publish_post",
        connectorActionType: "external_action",
        input: {},
        approved: false
      }).status
    ).toBe("requires_approval");

    expect(
      harness.execute({
        tool: "node_runtime",
        action: "execute_script",
        input: {},
        approved: false
      }).status
    ).toBe("requires_approval");
  });
});
