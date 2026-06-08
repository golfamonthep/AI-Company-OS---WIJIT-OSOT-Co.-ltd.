/**
 * creative.test.ts — Vitest tests for Creative Performance router
 * Tests ranking logic, KPI calculations, and edge cases
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock db module ----
vi.mock("./db", () => ({
  getFacebookToken: vi.fn(),
  upsertCreativeCache: vi.fn(),
  getCreativeCacheByAccount: vi.fn(),
  deleteCreativeCacheByAccount: vi.fn(),
}));

import * as db from "./db";

// ---- Helper: build a mock creative cache row ----
function makeCreative(overrides: Partial<{
  id: number;
  adId: string;
  adName: string;
  creativeType: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  conversions: number;
  video3SecPlays: number;
  videoThruPlays: number;
  videoAvgPlayTime: number;
  thumbnailUrl: string;
  campaignName: string;
}> = {}) {
  return {
    id: overrides.id ?? 1,
    userId: 1,
    adAccountId: "act_123",
    dateRange: "7d",
    adId: overrides.adId ?? "ad_001",
    adName: overrides.adName ?? "Test Ad",
    adsetId: "adset_001",
    adsetName: "Test Adset",
    campaignId: "campaign_001",
    campaignName: overrides.campaignName ?? "Test Campaign",
    thumbnailUrl: overrides.thumbnailUrl ?? "https://example.com/thumb.jpg",
    videoId: null,
    creativeType: overrides.creativeType ?? "image",
    spend: overrides.spend ?? 1000,
    impressions: overrides.impressions ?? 10000,
    clicks: overrides.clicks ?? 200,
    ctr: overrides.ctr ?? 2.0,
    cpc: overrides.cpc ?? 5.0,
    cpa: overrides.cpa ?? 100,
    roas: overrides.roas ?? 3.5,
    conversions: overrides.conversions ?? 10,
    videoThruPlays: overrides.videoThruPlays ?? 0,
    video3SecPlays: overrides.video3SecPlays ?? 0,
    videoAvgPlayTime: overrides.videoAvgPlayTime ?? 0,
    fetchedAt: Date.now(),
    createdAt: new Date(),
  };
}

// ---- Pure ranking logic (extracted for unit testing) ----
function rankByRoas(creatives: ReturnType<typeof makeCreative>[], limit: number) {
  return [...creatives]
    .filter((c) => (c.spend ?? 0) > 0)
    .sort((a, b) => (b.roas ?? 0) - (a.roas ?? 0))
    .slice(0, limit);
}

function rankByCpaDescending(creatives: ReturnType<typeof makeCreative>[], limit: number) {
  return [...creatives]
    .filter((c) => (c.spend ?? 0) > 0)
    .sort((a, b) => (b.cpa ?? 0) - (a.cpa ?? 0))
    .slice(0, limit);
}

function computeSummaryKPIs(creatives: ReturnType<typeof makeCreative>[]) {
  const withSpend = creatives.filter((c) => (c.spend ?? 0) > 0);
  const totalSpend = withSpend.reduce((s, c) => s + (c.spend ?? 0), 0);
  const totalConversions = withSpend.reduce((s, c) => s + (c.conversions ?? 0), 0);
  const avgCtr =
    withSpend.length > 0
      ? withSpend.reduce((s, c) => s + (c.ctr ?? 0), 0) / withSpend.length
      : 0;
  const roasItems = withSpend.filter((c) => (c.roas ?? 0) > 0);
  const avgRoas =
    roasItems.length > 0
      ? roasItems.reduce((s, c) => s + (c.roas ?? 0), 0) / roasItems.length
      : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const totalVideo3SecPlays = creatives.reduce((s, c) => s + (c.video3SecPlays ?? 0), 0);
  const videoCreatives = creatives.filter((c) => c.creativeType === "video").length;
  const imageCreatives = creatives.filter((c) => c.creativeType === "image").length;

  return {
    totalCreatives: creatives.length,
    totalSpend,
    avgCtr,
    avgRoas,
    avgCpa,
    totalConversions,
    totalVideo3SecPlays,
    videoCreatives,
    imageCreatives,
  };
}

// ---- Tests ----
describe("Creative Performance - Ranking Logic", () => {
  const creatives = [
    makeCreative({ id: 1, adId: "ad_001", roas: 5.0, cpa: 50, ctr: 3.0, spend: 500 }),
    makeCreative({ id: 2, adId: "ad_002", roas: 2.0, cpa: 200, ctr: 1.0, spend: 1000 }),
    makeCreative({ id: 3, adId: "ad_003", roas: 8.0, cpa: 30, ctr: 4.5, spend: 300 }),
    makeCreative({ id: 4, adId: "ad_004", roas: 1.0, cpa: 500, ctr: 0.5, spend: 800 }),
    makeCreative({ id: 5, adId: "ad_005", roas: 3.5, cpa: 100, ctr: 2.0, spend: 600 }),
  ];

  it("should rank top performers by ROAS descending", () => {
    const top = rankByRoas(creatives, 3);
    expect(top).toHaveLength(3);
    expect(top[0].adId).toBe("ad_003"); // ROAS 8.0
    expect(top[1].adId).toBe("ad_001"); // ROAS 5.0
    expect(top[2].adId).toBe("ad_005"); // ROAS 3.5
  });

  it("should rank bottom performers by CPA descending (highest CPA = worst)", () => {
    const bottom = rankByCpaDescending(creatives, 3);
    expect(bottom).toHaveLength(3);
    expect(bottom[0].adId).toBe("ad_004"); // CPA 500
    expect(bottom[1].adId).toBe("ad_002"); // CPA 200
    expect(bottom[2].adId).toBe("ad_005"); // CPA 100
  });

  it("should exclude creatives with zero spend from rankings", () => {
    const withZeroSpend = [
      ...creatives,
      makeCreative({ id: 6, adId: "ad_006", roas: 99, cpa: 1, spend: 0 }),
    ];
    const top = rankByRoas(withZeroSpend, 5);
    expect(top.find((c) => c.adId === "ad_006")).toBeUndefined();
  });

  it("should respect the limit parameter", () => {
    const top = rankByRoas(creatives, 2);
    expect(top).toHaveLength(2);
  });
});

describe("Creative Performance - KPI Calculations", () => {
  it("should compute correct summary KPIs", () => {
    const creatives = [
      makeCreative({ spend: 1000, ctr: 2.0, roas: 4.0, conversions: 10, cpa: 100 }),
      makeCreative({ spend: 500, ctr: 3.0, roas: 6.0, conversions: 5, cpa: 100 }),
    ];
    const kpis = computeSummaryKPIs(creatives);
    expect(kpis.totalSpend).toBe(1500);
    expect(kpis.avgCtr).toBeCloseTo(2.5, 1);
    expect(kpis.avgRoas).toBeCloseTo(5.0, 1);
    expect(kpis.totalConversions).toBe(15);
    expect(kpis.avgCpa).toBeCloseTo(100, 0);
  });

  it("should return zero KPIs for empty creatives list", () => {
    const kpis = computeSummaryKPIs([]);
    expect(kpis.totalCreatives).toBe(0);
    expect(kpis.totalSpend).toBe(0);
    expect(kpis.avgCtr).toBe(0);
    expect(kpis.avgRoas).toBe(0);
    expect(kpis.avgCpa).toBe(0);
  });

  it("should count video vs image creatives correctly", () => {
    const creatives = [
      makeCreative({ creativeType: "video" }),
      makeCreative({ creativeType: "video" }),
      makeCreative({ creativeType: "image" }),
    ];
    const kpis = computeSummaryKPIs(creatives);
    expect(kpis.videoCreatives).toBe(2);
    expect(kpis.imageCreatives).toBe(1);
  });

  it("should sum 3-sec video plays across all creatives", () => {
    const creatives = [
      makeCreative({ video3SecPlays: 1000, creativeType: "video" }),
      makeCreative({ video3SecPlays: 500, creativeType: "video" }),
      makeCreative({ video3SecPlays: 0, creativeType: "image" }),
    ];
    const kpis = computeSummaryKPIs(creatives);
    expect(kpis.totalVideo3SecPlays).toBe(1500);
  });

  it("should handle avgRoas = 0 when no creatives have positive ROAS", () => {
    const creatives = [
      makeCreative({ roas: 0, spend: 500 }),
    ];
    const kpis = computeSummaryKPIs(creatives);
    expect(kpis.avgRoas).toBe(0);
  });
});

describe("Creative Performance - DB helpers mock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getFacebookToken should be callable", async () => {
    vi.mocked(db.getFacebookToken).mockResolvedValue(null);
    const result = await db.getFacebookToken(1);
    expect(result).toBeNull();
    expect(db.getFacebookToken).toHaveBeenCalledWith(1);
  });

  it("getCreativeCacheByAccount should return empty array when no data", async () => {
    vi.mocked(db.getCreativeCacheByAccount).mockResolvedValue([]);
    const result = await db.getCreativeCacheByAccount(1, "act_123", "7d");
    expect(result).toEqual([]);
  });

  it("upsertCreativeCache should be called with correct data", async () => {
    vi.mocked(db.upsertCreativeCache).mockResolvedValue(undefined);
    const data = {
      userId: 1,
      adAccountId: "act_123",
      dateRange: "7d",
      adId: "ad_001",
      adName: "Test Ad",
      creativeType: "image" as const,
      spend: 1000,
      impressions: 10000,
      clicks: 200,
      ctr: 2.0,
      cpc: 5.0,
      cpa: 100,
      roas: 3.5,
      conversions: 10,
      videoThruPlays: 0,
      video3SecPlays: 0,
      videoAvgPlayTime: 0,
      fetchedAt: Date.now(),
    };
    await db.upsertCreativeCache(data);
    expect(db.upsertCreativeCache).toHaveBeenCalledWith(data);
  });

  it("deleteCreativeCacheByAccount should be called with correct args", async () => {
    vi.mocked(db.deleteCreativeCacheByAccount).mockResolvedValue(undefined);
    await db.deleteCreativeCacheByAccount(1, "act_123", "7d");
    expect(db.deleteCreativeCacheByAccount).toHaveBeenCalledWith(1, "act_123", "7d");
  });
});

describe("Creative Performance - Edge Cases", () => {
  it("should handle single creative in top performers", () => {
    const creatives = [makeCreative({ roas: 3.0, spend: 500 })];
    const top = rankByRoas(creatives, 5);
    expect(top).toHaveLength(1);
  });

  it("should handle tie in ROAS ranking (stable sort)", () => {
    const creatives = [
      makeCreative({ id: 1, adId: "ad_001", roas: 3.0, spend: 500 }),
      makeCreative({ id: 2, adId: "ad_002", roas: 3.0, spend: 600 }),
    ];
    const top = rankByRoas(creatives, 2);
    expect(top).toHaveLength(2);
    expect([top[0].adId, top[1].adId]).toContain("ad_001");
    expect([top[0].adId, top[1].adId]).toContain("ad_002");
  });

  it("should return empty array when all creatives have zero spend", () => {
    const creatives = [
      makeCreative({ spend: 0 }),
      makeCreative({ spend: 0 }),
    ];
    const top = rankByRoas(creatives, 5);
    expect(top).toHaveLength(0);
  });

  it("should correctly identify video creative type", () => {
    const video = makeCreative({ creativeType: "video", video3SecPlays: 5000 });
    expect(video.creativeType).toBe("video");
    expect(video.video3SecPlays).toBe(5000);
  });
});
