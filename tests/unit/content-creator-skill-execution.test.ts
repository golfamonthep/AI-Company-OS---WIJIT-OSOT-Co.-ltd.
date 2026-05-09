import { describe, expect, it } from "vitest";
import { MockAgentFactory } from "@/testing/MockAgentFactory";
import { MockHarnessExecutor } from "@/testing/MockHarnessExecutor";
import { MockMemorySystem } from "@/testing/MockMemorySystem";

describe("Content Creator AI skill execution", () => {
  it("generates schema-valid mock output with memory injection", () => {
    const agent = new MockAgentFactory().createContentCreator();
    const memory = new MockMemorySystem();
    const harness = new MockHarnessExecutor();
    memory.seedMotherBabyCampaign("workspace-a");

    const injectedMemory = memory.retrieve({ workspaceId: "workspace-a", query: "brand tiktok hooks" });
    const result = harness.execute({
      tool: "json_parser",
      action: "execute_skill",
      input: {
        skillId: agent.skills[0].skillId,
        objective: "Generate mother-and-baby TikTok scripts",
        memory: injectedMemory.map((item) => item.title)
      }
    });

    expect(result.status).toBe("success");
    expect(result.output.echoed).toMatchObject({ skillId: "tiktok-script-generation" });
    expect(injectedMemory.map((item) => item.title)).toContain("Successful TikTok Hooks");
  });
});
