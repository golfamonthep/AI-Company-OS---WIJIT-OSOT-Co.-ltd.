import { describe, expect, it } from "vitest";
import { createMultiPlatformCommandCenterModel } from "@/dashboard/multi-platform-command-center";

describe("multi-platform command center model", () => {
  it("exposes the seven requested platform offices with tasks, metrics, workflows, and outputs", () => {
    const model = createMultiPlatformCommandCenterModel();

    expect(model.platformAgents.map((agent) => agent.name)).toEqual([
      "TikTok Office",
      "Shopee Office",
      "Lazada Office",
      "Facebook Office",
      "LINE Office",
      "Google SEO Office",
      "Google Shopping Office"
    ]);
    expect(model.platformAgents.every((agent) => agent.responsibility && agent.status)).toBe(true);
    expect(model.tasks.length).toBeGreaterThanOrEqual(7);
    expect(model.metrics.length).toBeGreaterThanOrEqual(4);
    expect(model.workflows.length).toBeGreaterThanOrEqual(4);
    expect(model.outputs.length).toBeGreaterThanOrEqual(4);
  });
});
