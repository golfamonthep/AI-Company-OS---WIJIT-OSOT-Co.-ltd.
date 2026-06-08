/**
 * Unit tests for Budget Alert system:
 * - budgetAlert tRPC router
 * - alertEngine threshold checker
 * - LINE Notify and Email notification senders
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isThresholdBreached, sendLineNotification, sendEmailNotification } from "./alertEngine";
import type { BudgetAlert } from "../drizzle/schema";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

// ─── Mock db helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  // Existing mocks
  saveFacebookToken: vi.fn().mockResolvedValue(undefined),
  getFacebookToken: vi.fn().mockResolvedValue(null),
  deleteFacebookToken: vi.fn().mockResolvedValue(undefined),
  updateAdAccountSelection: vi.fn().mockResolvedValue(undefined),
  getCachedInsights: vi.fn().mockResolvedValue(null),
  saveInsightsCache: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  saveAdAnalysis: vi.fn().mockResolvedValue(undefined),
  getAdAnalysesByUserId: vi.fn().mockResolvedValue([]),
  deleteAdAnalysis: vi.fn().mockResolvedValue(undefined),
  saveAdCopy: vi.fn().mockResolvedValue(undefined),
  getAdCopiesByUserId: vi.fn().mockResolvedValue([]),
  // Budget alert mocks
  createBudgetAlert: vi.fn().mockResolvedValue([{ insertId: 42 }]),
  getBudgetAlertsByUserId: vi.fn().mockResolvedValue([]),
  getBudgetAlertById: vi.fn().mockResolvedValue(null),
  getAllActiveBudgetAlerts: vi.fn().mockResolvedValue([]),
  updateBudgetAlert: vi.fn().mockResolvedValue(undefined),
  deleteBudgetAlert: vi.fn().mockResolvedValue(undefined),
  updateBudgetAlertCronUid: vi.fn().mockResolvedValue(undefined),
  markAlertTriggered: vi.fn().mockResolvedValue(undefined),
  createAlertLog: vi.fn().mockResolvedValue(undefined),
  getAlertLogsByUserId: vi.fn().mockResolvedValue([]),
  getNotificationSettings: vi.fn().mockResolvedValue(null),
  upsertNotificationSettings: vi.fn().mockResolvedValue(undefined),
}));

// ─── Mock heartbeat ───────────────────────────────────────────────────────────
vi.mock("./_core/heartbeat", () => ({
  createHeartbeatJob: vi.fn().mockResolvedValue({ taskUid: "task-uid-123" }),
  deleteHeartbeatJob: vi.fn().mockResolvedValue(undefined),
}));

// ─── Mock global fetch ────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockUser: User = {
  id: 1,
  openId: "test-open-id",
  name: "Test User",
  email: "test@example.com",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createAuthContext() {
  return {
    user: mockUser,
    req: { headers: { cookie: "" } } as never,
    res: { clearCookie: vi.fn() } as never,
  };
}

function makeMockAlert(overrides: Partial<BudgetAlert> = {}): BudgetAlert {
  return {
    id: 1,
    userId: 1,
    campaignId: "camp_123",
    campaignName: "Test Campaign",
    adAccountId: "act_456",
    metricType: "budget_spent",
    condition: "above",
    thresholdValue: 1000,
    notifyLine: 1,
    notifyEmail: 0,
    isActive: 1,
    lastTriggeredAt: null,
    scheduleCronTaskUid: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── isThresholdBreached ──────────────────────────────────────────────────────
describe("isThresholdBreached", () => {
  const baseInsight = {
    campaignId: "camp_123",
    campaignName: "Test Campaign",
    spend: 500,
    impressions: 10000,
    clicks: 200,
    cpm: 50,
    cpc: 2.5,
    cpa: 100,
    costPerPurchase: 150,
    roas: 3,
  };

  it("returns breached=true when spend exceeds threshold", () => {
    const alert = makeMockAlert({ metricType: "budget_spent", condition: "above", thresholdValue: 400 });
    const { breached, currentValue } = isThresholdBreached(alert, baseInsight);
    expect(breached).toBe(true);
    expect(currentValue).toBe(500);
  });

  it("returns breached=false when spend is below threshold", () => {
    const alert = makeMockAlert({ metricType: "budget_spent", condition: "above", thresholdValue: 600 });
    const { breached } = isThresholdBreached(alert, baseInsight);
    expect(breached).toBe(false);
  });

  it("returns breached=true when CPM exceeds threshold", () => {
    const alert = makeMockAlert({ metricType: "cpm", condition: "above", thresholdValue: 40 });
    const { breached, currentValue } = isThresholdBreached(alert, baseInsight);
    expect(breached).toBe(true);
    expect(currentValue).toBe(50);
  });

  it("returns breached=true when cost_per_purchase exceeds threshold", () => {
    const alert = makeMockAlert({ metricType: "cost_per_purchase", condition: "above", thresholdValue: 100 });
    const { breached, currentValue } = isThresholdBreached(alert, baseInsight);
    expect(breached).toBe(true);
    expect(currentValue).toBe(150);
  });

  it("returns breached=true when ROAS falls below threshold", () => {
    const alert = makeMockAlert({ metricType: "roas_below", condition: "below", thresholdValue: 4 });
    const { breached, currentValue } = isThresholdBreached(alert, baseInsight);
    expect(breached).toBe(true);
    expect(currentValue).toBe(3);
  });

  it("returns breached=false when ROAS is above threshold", () => {
    const alert = makeMockAlert({ metricType: "roas_below", condition: "below", thresholdValue: 2 });
    const { breached } = isThresholdBreached(alert, baseInsight);
    expect(breached).toBe(false);
  });

  it("returns breached=false when below condition but currentValue is 0 (no data)", () => {
    const alert = makeMockAlert({ metricType: "roas_below", condition: "below", thresholdValue: 4 });
    const { breached } = isThresholdBreached(alert, { ...baseInsight, roas: 0 });
    expect(breached).toBe(false); // no data = no alert
  });
});

// ─── sendLineNotification ─────────────────────────────────────────────────────
describe("sendLineNotification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true when LINE API responds 200", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const result = await sendLineNotification("test-token", "Test message");
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://notify-api.line.me/api/notify",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns false when LINE API responds with error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await sendLineNotification("bad-token", "Test message");
    expect(result).toBe(false);
  });

  it("returns false when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await sendLineNotification("token", "message");
    expect(result).toBe(false);
  });
});

// ─── sendEmailNotification ────────────────────────────────────────────────────
describe("sendEmailNotification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns false when BUILT_IN_FORGE_API_URL is not set", async () => {
    const origUrl = process.env.BUILT_IN_FORGE_API_URL;
    delete process.env.BUILT_IN_FORGE_API_URL;
    const result = await sendEmailNotification("test@example.com", "Subject", "Body");
    expect(result).toBe(false);
    process.env.BUILT_IN_FORGE_API_URL = origUrl;
  });
});

// ─── budgetAlert.list ─────────────────────────────────────────────────────────
describe("budgetAlert.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array when no alerts exist", async () => {
    const { getBudgetAlertsByUserId } = await import("./db");
    vi.mocked(getBudgetAlertsByUserId).mockResolvedValueOnce([]);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.budgetAlert.list();
    expect(result).toEqual([]);
  });

  it("returns alerts for the current user", async () => {
    const { getBudgetAlertsByUserId } = await import("./db");
    const fakeAlerts = [makeMockAlert(), makeMockAlert({ id: 2, campaignName: "Another Campaign" })];
    vi.mocked(getBudgetAlertsByUserId).mockResolvedValueOnce(fakeAlerts);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.budgetAlert.list();
    expect(result).toHaveLength(2);
    expect(vi.mocked(getBudgetAlertsByUserId)).toHaveBeenCalledWith(1);
  });
});

// ─── budgetAlert.create ───────────────────────────────────────────────────────
describe("budgetAlert.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates alert and attempts to schedule heartbeat", async () => {
    const { createBudgetAlert } = await import("./db");
    vi.mocked(createBudgetAlert).mockResolvedValueOnce([{ insertId: 99 }] as never);

    const { createHeartbeatJob } = await import("./_core/heartbeat");

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.budgetAlert.create({
      campaignId: "camp_001",
      campaignName: "My Campaign",
      adAccountId: "act_123",
      metricType: "budget_spent",
      condition: "above",
      thresholdValue: 500,
      notifyLine: true,
      notifyEmail: false,
    });

    expect(result.success).toBe(true);
    expect(result.alertId).toBe(99);
    expect(vi.mocked(createBudgetAlert)).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 1, campaignId: "camp_001", thresholdValue: 500 })
    );
    // Heartbeat scheduling attempted (may fail gracefully if not deployed)
    expect(vi.mocked(createHeartbeatJob)).toHaveBeenCalled();
  });
});

// ─── budgetAlert.delete ───────────────────────────────────────────────────────
describe("budgetAlert.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws NOT_FOUND when alert does not exist for user", async () => {
    const { getBudgetAlertById } = await import("./db");
    vi.mocked(getBudgetAlertById).mockResolvedValueOnce(null);

    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.budgetAlert.delete({ id: 999 })).rejects.toThrow("Alert not found");
  });

  it("deletes alert and cancels heartbeat when cron uid exists", async () => {
    const { getBudgetAlertById, deleteBudgetAlert } = await import("./db");
    vi.mocked(getBudgetAlertById).mockResolvedValueOnce(
      makeMockAlert({ scheduleCronTaskUid: "task-uid-abc" })
    );

    const { deleteHeartbeatJob } = await import("./_core/heartbeat");

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.budgetAlert.delete({ id: 1 });

    expect(result.success).toBe(true);
    expect(vi.mocked(deleteBudgetAlert)).toHaveBeenCalledWith(1, 1);
    expect(vi.mocked(deleteHeartbeatJob)).toHaveBeenCalledWith("task-uid-abc", expect.any(String));
  });
});

// ─── budgetAlert.saveNotificationSettings ────────────────────────────────────
describe("budgetAlert.saveNotificationSettings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves LINE token and email", async () => {
    const { upsertNotificationSettings } = await import("./db");

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.budgetAlert.saveNotificationSettings({
      lineToken: "my-line-token",
      notifyEmail: "user@example.com",
    });

    expect(result.success).toBe(true);
    expect(vi.mocked(upsertNotificationSettings)).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 1, lineToken: "my-line-token", notifyEmail: "user@example.com" })
    );
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.budgetAlert.saveNotificationSettings({ notifyEmail: "not-an-email" })
    ).rejects.toThrow();
  });
});
