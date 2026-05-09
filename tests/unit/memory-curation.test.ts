import { describe, expect, it } from "vitest";
import { evaluateContentOutputs } from "@/modules/live-mvp/content-quality-evaluation";
import { curateContentCreatorMemory } from "@/modules/live-mvp/memory-curation";

describe("Content Creator memory curation", () => {
  it("extracts ranked approved and rejected patterns with a reviewable skill proposal", () => {
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
          ctaEffectiveness: 8,
          clarity: 9,
          businessUsefulness: 8,
          audienceRelevance: 9
        },
        feedbackNotes: "Checklist framing works well."
      },
      {
        outputType: "hook",
        outputIndex: 1,
        text: "ดีที่สุด เห็นผลทันที ต้องซื้อเลย",
        decision: "rejected",
        scores: {
          hookStrength: 4,
          emotionalImpact: 5,
          thaiNaturalness: 4,
          retentionPotential: 4,
          ctaEffectiveness: 3,
          clarity: 5,
          businessUsefulness: 3,
          audienceRelevance: 4
        },
        improvementSuggestion: "Avoid hype, pressure, and unsupported claims."
      }
    ]);

    const curation = curateContentCreatorMemory({
      evaluation,
      runKey: "run-a",
      existingMemoryContents: ["แม่มือใหม่ต้องเช็ก 3 เรื่องนี้ก่อนเลือกของให้ลูก"]
    });

    expect(curation?.approvedPatterns.some((pattern) => pattern.content.includes("แม่มือใหม่"))).toBe(false);
    expect(curation?.rejectedPatterns[0].content).toContain("ดีที่สุด");
    expect(curation?.rankedMemories[0].usefulnessScore).toBeGreaterThanOrEqual(50);
    expect(curation?.skillImprovementProposal?.approvalRequired).toBe(true);
    expect(curation?.skillImprovementProposal?.targetSkillId).toBe("hook_generation");
    expect(curation?.skillImprovementProposal?.proposedChange.avoidPatterns[0]).toContain("ดีที่สุด");
  });
});
