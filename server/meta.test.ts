/**
 * Unit tests for the meta tRPC router
 * Uses vi.mock to stub db helpers and fetch so no real DB/network calls are made.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

// ─── Mock db helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  saveFacebookToken: vi.fn().mockResolvedValue(undefined),
  getFacebookToken: vi.fn(),
  deleteFacebookToken: vi.fn().mockResolvedValue(undefined),
  updateAdAccountSelection: vi.fn().mockResolvedValue(undefined),
  getCachedInsights: vi.fn().mockResolvedValue(null),
  saveInsightsCache: vi.fn().mockResolvedValue(undefined),
  // Other db helpers used by other routers
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  saveAdAnalysis: vi.fn().mockResolvedValue(undefined),
  getAdAnalysesByUserId: vi.fn().mockResolvedValue([]),
  deleteAdAnalysis: vi.fn().mockResolvedValue(undefined),
  saveAdCopy: vi.fn().mockResolvedValue(undefined),
  getAdCopiesByUserId: vi.fn().mockResolvedValue([]),
}));

// ─── Mock global fetch ────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockUser: User = {
  id: 99,
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
    req: {} as never,
    res: { clearCookie: vi.fn() } as never,
  };
}

// ─── meta.saveToken ───────────────────────────────────────────────────────────
describe("meta.saveToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves token and returns metaName on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "12345", name: "John Doe" }),
    });

    const { saveFacebookToken } = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.meta.saveToken({ accessToken: "EAAtest123456789" });

    expect(result.success).toBe(true);
    expect(result.metaName).toBe("John Doe");
    expect(vi.mocked(saveFacebookToken)).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 99, accessToken: "EAAtest123456789" })
    );
  });

  it("throws when Meta API returns an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "Invalid OAuth access token" } }),
    });

    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.meta.saveToken({ accessToken: "invalid-token" })).rejects.toThrow(
      "Invalid OAuth access token"
    );
  });
});

// ─── meta.removeToken ─────────────────────────────────────────────────────────
describe("meta.removeToken", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls deleteFacebookToken with the current user id", async () => {
    const { deleteFacebookToken } = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.meta.removeToken();

    expect(result.success).toBe(true);
    expect(vi.mocked(deleteFacebookToken)).toHaveBeenCalledWith(99);
  });
});

// ─── meta.getStatus ───────────────────────────────────────────────────────────
describe("meta.getStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns connected: false when no token stored", async () => {
    const { getFacebookToken } = await import("./db");
    vi.mocked(getFacebookToken).mockResolvedValueOnce(null);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.meta.getStatus();

    expect(result.connected).toBe(false);
  });

  it("returns connected: true with account info when token exists", async () => {
    const { getFacebookToken } = await import("./db");
    vi.mocked(getFacebookToken).mockResolvedValueOnce({
      id: 1,
      userId: 99,
      accessToken: "EAAtest",
      selectedAdAccountId: "act_123",
      selectedAdAccountName: "My Ad Account",
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.meta.getStatus();

    expect(result.connected).toBe(true);
    expect((result as { selectedAdAccountId?: string | null }).selectedAdAccountId).toBe("act_123");
  });
});

// ─── meta.selectAdAccount ─────────────────────────────────────────────────────
describe("meta.selectAdAccount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls updateAdAccountSelection with correct args", async () => {
    const { updateAdAccountSelection } = await import("./db");
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.meta.selectAdAccount({
      adAccountId: "act_456",
      adAccountName: "Test Account",
    });

    expect(result.success).toBe(true);
    expect(vi.mocked(updateAdAccountSelection)).toHaveBeenCalledWith(99, "act_456", "Test Account");
  });
});

// ─── meta.getInsights (cache hit) ─────────────────────────────────────────────
describe("meta.getInsights", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns cached data when cache is fresh", async () => {
    const { getFacebookToken, getCachedInsights } = await import("./db");

    vi.mocked(getFacebookToken).mockResolvedValueOnce({
      id: 1,
      userId: 99,
      accessToken: "EAAtest",
      selectedAdAccountId: "act_123",
      selectedAdAccountName: "My Account",
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const fakeDaily = [
      { date: "2026-06-01", spend: 500, impressions: 10000, clicks: 200, conversions: 10, revenue: 2000, ctr: 2, cpc: 2.5, cpa: 50, roas: 4 },
    ];

    vi.mocked(getCachedInsights).mockResolvedValueOnce({
      id: 1,
      userId: 99,
      adAccountId: "act_123",
      dateRange: "7d",
      data: fakeDaily,
      fetchedAt: Date.now(),
      createdAt: new Date(),
    });

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.meta.getInsights({ dateRange: "7d", forceRefresh: false });

    expect(result.fromCache).toBe(true);
    expect(result.daily).toEqual(fakeDaily);
    expect(result.summary.spend).toBe(500);
    expect(result.summary.roas).toBe(4);
  });

  it("throws when no token is stored", async () => {
    const { getFacebookToken } = await import("./db");
    vi.mocked(getFacebookToken).mockResolvedValueOnce(null);

    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.meta.getInsights({ dateRange: "7d", forceRefresh: false })).rejects.toThrow(
      "ยังไม่ได้เชื่อมต่อ Meta Account"
    );
  });

  it("throws when no ad account is selected", async () => {
    const { getFacebookToken } = await import("./db");
    vi.mocked(getFacebookToken).mockResolvedValueOnce({
      id: 1,
      userId: 99,
      accessToken: "EAAtest",
      selectedAdAccountId: null,
      selectedAdAccountName: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.meta.getInsights({ dateRange: "7d", forceRefresh: false })).rejects.toThrow(
      "กรุณาเลือก Ad Account ก่อน"
    );
  });
});
