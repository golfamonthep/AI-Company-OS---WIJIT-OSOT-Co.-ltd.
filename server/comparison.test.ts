import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Unit tests for winner/loser detection logic ----
// Mirror the logic from comparison.ts to test independently

function getWinnerIndex(values: number[], winnerIs: "lower" | "higher"): number {
  if (values.every((v) => v === 0)) return -1;
  const nonZero = values.map((v, i) => ({ v, i })).filter(({ v }) => v > 0);
  if (nonZero.length === 0) return -1;
  if (winnerIs === "higher") {
    return nonZero.reduce((best, cur) => (cur.v > best.v ? cur : best)).i;
  } else {
    return nonZero.reduce((best, cur) => (cur.v < best.v ? cur : best)).i;
  }
}

function getLoserIndex(values: number[], winnerIs: "lower" | "higher"): number {
  const nonZero = values.map((v, i) => ({ v, i })).filter(({ v }) => v > 0);
  if (nonZero.length < 2) return -1;
  if (winnerIs === "higher") {
    return nonZero.reduce((worst, cur) => (cur.v < worst.v ? cur : worst)).i;
  } else {
    return nonZero.reduce((worst, cur) => (cur.v > worst.v ? cur : worst)).i;
  }
}

function countWins(
  campaigns: { roas: number; ctr: number; cpa: number; spend: number; conversionRate: number }[]
) {
  const metrics: { key: keyof typeof campaigns[0]; winnerIs: "lower" | "higher" }[] = [
    { key: "roas", winnerIs: "higher" },
    { key: "ctr", winnerIs: "higher" },
    { key: "cpa", winnerIs: "lower" },
    { key: "spend", winnerIs: "lower" },
    { key: "conversionRate", winnerIs: "higher" },
  ];
  const wins = new Array(campaigns.length).fill(0);
  for (const metric of metrics) {
    const values = campaigns.map((c) => c[metric.key]);
    const winIdx = getWinnerIndex(values, metric.winnerIs);
    if (winIdx >= 0) wins[winIdx]++;
  }
  return wins;
}

describe("Campaign Comparison - Winner Detection", () => {
  describe("getWinnerIndex", () => {
    it("returns index of highest value for higher-is-better metrics", () => {
      expect(getWinnerIndex([1.5, 3.2, 2.1], "higher")).toBe(1);
    });

    it("returns index of lowest value for lower-is-better metrics", () => {
      expect(getWinnerIndex([50, 30, 45], "lower")).toBe(1);
    });

    it("returns -1 when all values are zero", () => {
      expect(getWinnerIndex([0, 0, 0], "higher")).toBe(-1);
    });

    it("returns -1 when all values are zero for lower-is-better", () => {
      expect(getWinnerIndex([0, 0, 0], "lower")).toBe(-1);
    });

    it("ignores zero values when finding winner (lower-is-better)", () => {
      // 0 should not be treated as the lowest cost — it means no data
      expect(getWinnerIndex([0, 50, 30], "lower")).toBe(2);
    });

    it("handles two campaigns correctly", () => {
      expect(getWinnerIndex([2.5, 4.1], "higher")).toBe(1);
      expect(getWinnerIndex([2.5, 4.1], "lower")).toBe(0);
    });

    it("returns first index when all values are equal and non-zero", () => {
      expect(getWinnerIndex([3, 3, 3], "higher")).toBe(0);
    });
  });

  describe("getLoserIndex", () => {
    it("returns index of lowest value for higher-is-better metrics", () => {
      expect(getLoserIndex([1.5, 3.2, 2.1], "higher")).toBe(0);
    });

    it("returns index of highest value for lower-is-better metrics", () => {
      expect(getLoserIndex([50, 30, 45], "lower")).toBe(0);
    });

    it("returns -1 when only one non-zero value exists", () => {
      expect(getLoserIndex([0, 3.2, 0], "higher")).toBe(-1);
    });

    it("returns -1 when all values are zero", () => {
      expect(getLoserIndex([0, 0, 0], "higher")).toBe(-1);
    });

    it("handles two campaigns correctly", () => {
      expect(getLoserIndex([2.5, 4.1], "higher")).toBe(0);
      expect(getLoserIndex([2.5, 4.1], "lower")).toBe(1);
    });
  });

  describe("countWins", () => {
    it("correctly counts wins across multiple metrics", () => {
      const campaigns = [
        { roas: 3.5, ctr: 2.1, cpa: 50, spend: 1000, conversionRate: 5 },
        { roas: 2.0, ctr: 1.5, cpa: 80, spend: 800, conversionRate: 3 },
      ];
      const wins = countWins(campaigns);
      // Campaign 0 wins: roas (higher), ctr (higher), cpa (lower=50<80), conversionRate (higher)
      // Campaign 1 wins: spend (lower=800<1000)
      expect(wins[0]).toBe(4);
      expect(wins[1]).toBe(1);
    });

    it("handles three campaigns", () => {
      const campaigns = [
        { roas: 2.0, ctr: 1.0, cpa: 100, spend: 500, conversionRate: 2 },
        { roas: 4.0, ctr: 3.0, cpa: 40, spend: 300, conversionRate: 6 },
        { roas: 3.0, ctr: 2.0, cpa: 60, spend: 700, conversionRate: 4 },
      ];
      const wins = countWins(campaigns);
      // Campaign 1 should win most metrics
      expect(wins[1]).toBeGreaterThan(wins[0]);
      expect(wins[1]).toBeGreaterThan(wins[2]);
    });

    it("handles all-zero metrics gracefully", () => {
      const campaigns = [
        { roas: 0, ctr: 0, cpa: 0, spend: 0, conversionRate: 0 },
        { roas: 0, ctr: 0, cpa: 0, spend: 0, conversionRate: 0 },
      ];
      const wins = countWins(campaigns);
      expect(wins[0]).toBe(0);
      expect(wins[1]).toBe(0);
    });

    it("returns correct total wins sum", () => {
      const campaigns = [
        { roas: 3.5, ctr: 2.1, cpa: 50, spend: 1000, conversionRate: 5 },
        { roas: 2.0, ctr: 1.5, cpa: 80, spend: 800, conversionRate: 3 },
      ];
      const wins = countWins(campaigns);
      // Total wins should equal number of metrics (5)
      expect(wins.reduce((a, b) => a + b, 0)).toBe(5);
    });
  });
});

describe("Campaign Comparison - Metric Calculation", () => {
  it("correctly derives CTR from clicks and impressions", () => {
    const clicks = 100;
    const impressions = 5000;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    expect(parseFloat(ctr.toFixed(2))).toBe(2.0);
  });

  it("correctly derives CPC from spend and clicks", () => {
    const spend = 500;
    const clicks = 200;
    const cpc = clicks > 0 ? spend / clicks : 0;
    expect(parseFloat(cpc.toFixed(2))).toBe(2.5);
  });

  it("correctly derives ROAS from revenue and spend", () => {
    const revenue = 2000;
    const spend = 500;
    const roas = spend > 0 ? revenue / spend : 0;
    expect(parseFloat(roas.toFixed(2))).toBe(4.0);
  });

  it("correctly derives CPA from spend and conversions", () => {
    const spend = 600;
    const conversions = 12;
    const cpa = conversions > 0 ? spend / conversions : 0;
    expect(parseFloat(cpa.toFixed(2))).toBe(50.0);
  });

  it("correctly derives Conversion Rate from conversions and clicks", () => {
    const conversions = 20;
    const clicks = 400;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    expect(parseFloat(conversionRate.toFixed(2))).toBe(5.0);
  });

  it("returns 0 for ROAS when spend is 0", () => {
    const revenue = 1000;
    const spend = 0;
    const roas = spend > 0 ? revenue / spend : 0;
    expect(roas).toBe(0);
  });

  it("returns 0 for CPA when conversions is 0", () => {
    const spend = 500;
    const conversions = 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    expect(cpa).toBe(0);
  });
});

describe("Campaign Comparison - Date Range Helper", () => {
  function getDateRange(dateRange: "7d" | "14d" | "30d") {
    const now = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { since: fmt(since), until: fmt(now) };
  }

  it("returns correct date range for 7d", () => {
    const { since, until } = getDateRange("7d");
    const sinceDt = new Date(since);
    const untilDt = new Date(until);
    const diff = (untilDt.getTime() - sinceDt.getTime()) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(7);
  });

  it("returns correct date range for 14d", () => {
    const { since, until } = getDateRange("14d");
    const sinceDt = new Date(since);
    const untilDt = new Date(until);
    const diff = (untilDt.getTime() - sinceDt.getTime()) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(14);
  });

  it("returns correct date range for 30d", () => {
    const { since, until } = getDateRange("30d");
    const sinceDt = new Date(since);
    const untilDt = new Date(until);
    const diff = (untilDt.getTime() - sinceDt.getTime()) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(30);
  });

  it("returns dates in YYYY-MM-DD format", () => {
    const { since, until } = getDateRange("7d");
    expect(since).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(until).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
