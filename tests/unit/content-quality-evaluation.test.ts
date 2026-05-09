import { describe, expect, it } from "vitest";
import { evaluateContentOutputs } from "@/modules/live-mvp/content-quality-evaluation";

describe("Content Creator quality evaluation", () => {
  it("scores reviewed hooks, finds winning patterns, and flags weak outputs", () => {
    const evaluation = evaluateContentOutputs([
      {
        outputType: "hook",
        outputIndex: 0,
        text: "แม่มือใหม่ต้องเช็ก 3 เรื่องนี้ก่อนเลือกของให้ลูก",
        decision: "approved",
        scores: {
          hookStrength: 9,
          emotionalImpact: 8,
          thaiNaturalness: 9,
          retentionPotential: 8,
          ctaEffectiveness: 7,
          clarity: 9,
          businessUsefulness: 8,
          audienceRelevance: 9
        },
        feedbackNotes: "Natural Thai, useful checklist framing."
      },
      {
        outputType: "hook",
        outputIndex: 1,
        text: "ดีที่สุด เห็นผลทันที ลูกต้องชอบแน่นอน",
        decision: "rejected",
        scores: {
          hookStrength: 4,
          emotionalImpact: 5,
          thaiNaturalness: 5,
          retentionPotential: 4,
          ctaEffectiveness: 3,
          clarity: 5,
          businessUsefulness: 3,
          audienceRelevance: 4
        },
        improvementSuggestion: "Avoid unsupported claims and pressure language."
      }
    ]);

    expect(evaluation?.scale).toBe("1-10");
    expect(evaluation?.overallScore).toBeGreaterThan(5);
    expect(evaluation?.approvedCount).toBe(1);
    expect(evaluation?.rejectedCount).toBe(1);
    expect(evaluation?.bestPerformingOutputs[0].text).toContain("แม่มือใหม่");
    expect(evaluation?.lowPerformingOutputs[0].text).toContain("ดีที่สุด");
    expect(evaluation?.memoryInsights.highPerformingHooks).toHaveLength(1);
    expect(evaluation?.memoryInsights.rejectedPatterns).toHaveLength(1);
    expect(evaluation?.learningInsights.join(" ")).toContain("Thai naturalness");
  });
});
