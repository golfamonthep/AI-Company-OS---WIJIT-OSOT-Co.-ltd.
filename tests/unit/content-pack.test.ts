import { describe, expect, it } from "vitest";
import { buildProductionContentPack } from "@/modules/live-mvp/content-pack";

describe("Production content pack", () => {
  it("builds a complete Thai TikTok content pack with reviewable quality scores", () => {
    const pack = buildProductionContentPack({
      campaignBrief: "10 TikTok hooks for a Thai mother-and-baby product",
      productName: "ผลิตภัณฑ์แม่และเด็ก",
      targetAudience: "คุณแม่มือใหม่",
      marketing: {
        segment: "คุณแม่มือใหม่",
        painPoints: ["ไม่แน่ใจว่าควรเลือกสินค้าแบบไหนให้ลูก"],
        trustTriggers: ["คำแนะนำที่จริงใจและเห็นการใช้งานจริง"],
        objections: ["กลัวซื้อแล้วไม่ได้ใช้จริง"],
        contentAngle: "ช่วยคุณแม่เช็กก่อนซื้อด้วยภาษาง่ายและไม่ขายแรง"
      },
      content: {
        contentConcepts: [],
        hooks: ["แม่มือใหม่ต้องเช็ก 3 เรื่องนี้ก่อนเลือกของให้ลูก"],
        captions: [],
        scripts: [],
        ctas: [],
        assumptions: [],
        guardrailNotes: []
      }
    });

    expect(pack.schemaVersion).toBe("production-content-pack.v1");
    expect(pack.hooks).toHaveLength(10);
    expect(pack.captions).toHaveLength(5);
    expect(pack.scripts).toHaveLength(3);
    expect(pack.ctaOptions.length).toBeGreaterThanOrEqual(5);
    expect(pack.thumbnailTextIdeas.length).toBeGreaterThanOrEqual(5);
    expect(pack.shootingDirection.length).toBeGreaterThanOrEqual(5);
    expect(pack.hashtagSuggestions.length).toBeGreaterThan(0);
    expect(pack.qualityScores.length).toBe(pack.packSummary.totalReviewableItems);
    expect(pack.qualityScores.every((score) => score.score >= 1 && score.score <= 10)).toBe(true);
    expect(pack.packSummary.readyForHumanReview).toBe(true);
    expect(pack.targetAudienceInsight).toContain("คุณแม่มือใหม่");
  });
});
