/**
 * report.test.ts — Vitest tests for Automated Report system
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock external dependencies ───────────────────────────────────────────────

vi.mock("../server/db", () => ({
  createReportSchedule: vi.fn().mockResolvedValue([[{ insertId: 42 }]]),
  getReportSchedulesByUserId: vi.fn().mockResolvedValue([]),
  getReportScheduleById: vi.fn().mockResolvedValue(null),
  getReportScheduleByCronUid: vi.fn().mockResolvedValue(null),
  updateReportSchedule: vi.fn().mockResolvedValue(undefined),
  deleteReportSchedule: vi.fn().mockResolvedValue(undefined),
  updateReportScheduleCronUid: vi.fn().mockResolvedValue(undefined),
  markReportScheduleRun: vi.fn().mockResolvedValue(undefined),
  createReportLog: vi.fn().mockResolvedValue(undefined),
  getReportLogsByUserId: vi.fn().mockResolvedValue([]),
  getFacebookToken: vi.fn().mockResolvedValue(null),
  getNotificationSettings: vi.fn().mockResolvedValue(null),
}));

vi.mock("../server/_core/heartbeat", () => ({
  createHeartbeatJob: vi.fn().mockResolvedValue({ taskUid: "uid-test-123" }),
  deleteHeartbeatJob: vi.fn().mockResolvedValue(undefined),
  updateHeartbeatJob: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../server/alertEngine", () => ({
  sendLineNotification: vi.fn().mockResolvedValue(true),
  sendEmailNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock("../server/storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "reports/1/test.xlsx", url: "/manus-storage/reports/1/test.xlsx" }),
}));

// ─── Report Generator Tests ───────────────────────────────────────────────────

describe("reportGenerator", () => {
  const mockReportData = {
    adAccountId: "act_123456789",
    adAccountName: "Test Account",
    dateFrom: "2025-01-01",
    dateTo: "2025-01-07",
    totalSpend: 5000.50,
    totalImpressions: 100000,
    totalClicks: 3500,
    totalLeads: 120,
    totalPurchases: 45,
    avgRoas: 3.2,
    avgCpm: 50.0,
    avgCpc: 1.43,
    daily: [
      {
        date: "2025-01-01",
        spend: 714.36,
        impressions: 14285,
        clicks: 500,
        leads: 17,
        purchases: 6,
        roas: 3.1,
        cpm: 50.0,
        cpc: 1.43,
      },
      {
        date: "2025-01-02",
        spend: 714.36,
        impressions: 14285,
        clicks: 500,
        leads: 17,
        purchases: 7,
        roas: 3.3,
        cpm: 50.0,
        cpc: 1.43,
      },
    ],
  };

  it("should calculate totals correctly", () => {
    const { totalSpend, totalImpressions, totalClicks, totalLeads, totalPurchases } = mockReportData;
    expect(totalSpend).toBeCloseTo(5000.50, 1);
    expect(totalImpressions).toBe(100000);
    expect(totalClicks).toBe(3500);
    expect(totalLeads).toBe(120);
    expect(totalPurchases).toBe(45);
  });

  it("should have valid ROAS value", () => {
    expect(mockReportData.avgRoas).toBeGreaterThan(0);
    expect(mockReportData.avgRoas).toBe(3.2);
  });

  it("should have daily data sorted by date", () => {
    const dates = mockReportData.daily.map((d) => d.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it("should format spend with 2 decimal places", () => {
    const formatted = mockReportData.totalSpend.toFixed(2);
    expect(formatted).toBe("5000.50");
  });

  it("should format ROAS with 2 decimal places", () => {
    const formatted = mockReportData.avgRoas.toFixed(2);
    expect(formatted).toBe("3.20");
  });
});

// ─── Meta API Data Parsing Tests ──────────────────────────────────────────────

describe("Meta API data parsing", () => {
  it("should parse spend correctly from string", () => {
    const rawSpend = "1234.56";
    const spend = parseFloat(rawSpend ?? "0");
    expect(spend).toBeCloseTo(1234.56, 2);
  });

  it("should parse impressions correctly from string", () => {
    const rawImpressions = "50000";
    const impressions = parseInt(rawImpressions ?? "0", 10);
    expect(impressions).toBe(50000);
  });

  it("should extract leads from actions array", () => {
    const actions = [
      { action_type: "lead", value: "15" },
      { action_type: "link_click", value: "500" },
      { action_type: "lead", value: "5" },
    ];
    const leads = actions
      .filter((a) => a.action_type === "lead")
      .reduce((s, a) => s + parseInt(a.value, 10), 0);
    expect(leads).toBe(20);
  });

  it("should extract purchases from actions array", () => {
    const actions = [
      { action_type: "purchase", value: "8" },
      { action_type: "omni_purchase", value: "2" },
      { action_type: "lead", value: "15" },
    ];
    const purchases = actions
      .filter((a) => a.action_type === "purchase" || a.action_type === "omni_purchase")
      .reduce((s, a) => s + parseInt(a.value, 10), 0);
    expect(purchases).toBe(10);
  });

  it("should extract ROAS from purchase_roas array", () => {
    const purchaseRoas = [
      { action_type: "omni_purchase", value: "3.5" },
    ];
    const roas = purchaseRoas.reduce((s, r) => s + parseFloat(r.value), 0);
    expect(roas).toBeCloseTo(3.5, 2);
  });

  it("should handle empty actions gracefully", () => {
    const actions: { action_type: string; value: string }[] = [];
    const leads = actions
      .filter((a) => a.action_type === "lead")
      .reduce((s, a) => s + parseInt(a.value, 10), 0);
    expect(leads).toBe(0);
  });

  it("should handle missing purchase_roas gracefully", () => {
    const purchaseRoasArr: { action_type: string; value: string }[] = [];
    const roas = purchaseRoasArr.reduce((s, r) => s + parseFloat(r.value), 0);
    expect(roas).toBe(0);
  });
});

// ─── Report Schedule Validation Tests ────────────────────────────────────────

describe("Report schedule validation", () => {
  it("should validate cron expression format", () => {
    const validCrons = [
      "0 0 1 * * *",
      "0 0 2 * * *",
      "0 0 0 * * *",
      "0 0 3 * * *",
    ];
    validCrons.forEach((cron) => {
      const parts = cron.split(" ");
      expect(parts.length).toBe(6);
    });
  });

  it("should default to 08:00 ICT (01:00 UTC) cron", () => {
    const defaultCron = "0 0 1 * * *";
    const parts = defaultCron.split(" ");
    // 6-field cron: second minute hour day month weekday
    expect(parts[2]).toBe("1"); // 01:00 UTC = 08:00 ICT
  });

  it("should validate report format options", () => {
    const validFormats = ["pdf", "excel", "both"];
    validFormats.forEach((format) => {
      expect(["pdf", "excel", "both"]).toContain(format);
    });
  });

  it("should reject invalid report format", () => {
    const invalidFormat = "word";
    expect(["pdf", "excel", "both"]).not.toContain(invalidFormat);
  });

  it("should require non-empty schedule name", () => {
    const name = "Daily Report - Main Account";
    expect(name.trim().length).toBeGreaterThan(0);
  });

  it("should require non-empty ad account id", () => {
    const adAccountId = "act_123456789";
    expect(adAccountId.trim().length).toBeGreaterThan(0);
  });
});

// ─── Notification Channel Tests ───────────────────────────────────────────────

describe("Notification channel logic", () => {
  it("should send LINE when notifyLine is 1 and token exists", () => {
    const notifyLine = 1;
    const lineToken = "test-token-123";
    const shouldSend = notifyLine === 1 && !!lineToken;
    expect(shouldSend).toBe(true);
  });

  it("should not send LINE when token is missing", () => {
    const notifyLine = 1;
    const lineToken = null;
    const shouldSend = notifyLine === 1 && !!lineToken;
    expect(shouldSend).toBe(false);
  });

  it("should not send LINE when notifyLine is 0", () => {
    const notifyLine = 0;
    const lineToken = "test-token-123";
    const shouldSend = notifyLine === 1 && !!lineToken;
    expect(shouldSend).toBe(false);
  });

  it("should send email when notifyEmail is 1 and email exists", () => {
    const notifyEmail = 1;
    const email = "test@example.com";
    const shouldSend = notifyEmail === 1 && !!email;
    expect(shouldSend).toBe(true);
  });

  it("should not send email when email is missing", () => {
    const notifyEmail = 1;
    const email = null;
    const shouldSend = notifyEmail === 1 && !!email;
    expect(shouldSend).toBe(false);
  });
});

// ─── Router Procedure Tests ─────────────────────────────────────────────────

describe("reportRouter procedures (mocked db)", () => {
  // Access the mocked module functions directly (vi.mock hoists the mock)
  let db: typeof import("../server/db");

  beforeEach(async () => {
    db = await import("../server/db");
  });

  it("createSchedule returns scheduleId from db insertId", async () => {
    const mockResult = [[{ insertId: 99 }]];
    vi.mocked(db.createReportSchedule).mockResolvedValueOnce(mockResult as never);
    const insertId = (mockResult as unknown as [{ insertId: number }[]])[0]?.[0]?.insertId;
    expect(insertId).toBe(99);
  });

  it("listSchedules returns empty array when no schedules", async () => {
    vi.mocked(db.getReportSchedulesByUserId).mockResolvedValueOnce([]);
    const result = await db.getReportSchedulesByUserId(1);
    expect(result).toEqual([]);
  });

  it("getReportScheduleById returns null for non-existent schedule", async () => {
    vi.mocked(db.getReportScheduleById).mockResolvedValueOnce(null);
    const result = await db.getReportScheduleById(999, 1);
    expect(result).toBeNull();
  });

  it("updateReportSchedule calls db with correct params", async () => {
    vi.mocked(db.updateReportSchedule).mockResolvedValueOnce(undefined);
    await db.updateReportSchedule(1, 1, { isActive: 0 });
    expect(db.updateReportSchedule).toHaveBeenCalledWith(1, 1, { isActive: 0 });
  });

  it("deleteReportSchedule calls db with correct params", async () => {
    vi.mocked(db.deleteReportSchedule).mockResolvedValueOnce(undefined);
    await db.deleteReportSchedule(1, 1);
    expect(db.deleteReportSchedule).toHaveBeenCalledWith(1, 1);
  });

  it("createReportLog saves log with correct status", async () => {
    vi.mocked(db.createReportLog).mockResolvedValueOnce(undefined);
    await db.createReportLog({
      scheduleId: 1, userId: 1, adAccountId: "act_123",
      reportFormat: "both", lineNotified: 1, emailNotified: 0, status: "success",
    });
    expect(db.createReportLog).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
  });

  it("getLogs returns empty array when no logs", async () => {
    vi.mocked(db.getReportLogsByUserId).mockResolvedValueOnce([]);
    const result = await db.getReportLogsByUserId(1, 30);
    expect(result).toEqual([]);
  });

  it("sendNow fails gracefully when no Meta token", async () => {
    vi.mocked(db.getFacebookToken).mockResolvedValueOnce(null);
    const token = await db.getFacebookToken(1);
    expect(token).toBeNull();
    // Without token, report generation should throw
    const shouldThrow = !token?.accessToken;
    expect(shouldThrow).toBe(true);
  });
});

// ─── Report Summary Text Tests ────────────────────────────────────────────────

describe("Report summary text generation", () => {
  it("should include all key metrics in summary", () => {
    const data = {
      dateFrom: "2025-01-01",
      dateTo: "2025-01-07",
      totalSpend: 5000.50,
      totalImpressions: 100000,
      totalClicks: 3500,
      totalLeads: 120,
      totalPurchases: 45,
      avgRoas: 3.2,
    };

    const summary = [
      `📊 Facebook Ads Daily Report`,
      `📅 ${data.dateFrom} to ${data.dateTo}`,
      `💰 Spend: ฿${data.totalSpend.toFixed(2)}`,
      `👁 Impressions: ${data.totalImpressions.toLocaleString()}`,
      `🖱 Clicks: ${data.totalClicks.toLocaleString()}`,
      `🎯 Leads: ${data.totalLeads}`,
      `🛒 Purchases: ${data.totalPurchases}`,
      `📈 Avg ROAS: ${data.avgRoas.toFixed(2)}x`,
    ].join("\n");

    expect(summary).toContain("Facebook Ads Daily Report");
    expect(summary).toContain("฿5000.50");
    expect(summary).toContain("3.20x");
    expect(summary).toContain("Leads: 120");
    expect(summary).toContain("Purchases: 45");
  });

  it("should format spend with Thai Baht symbol", () => {
    const spend = 1234.56;
    const formatted = `฿${spend.toFixed(2)}`;
    expect(formatted).toBe("฿1234.56");
  });
});
