import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module so tests don't make real API calls
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            summary: "ประสิทธิภาพโฆษณาอยู่ในระดับดี",
            strengths: ["CTR สูงกว่าค่าเฉลี่ย"],
            weaknesses: ["ROAS ยังต่ำกว่าเป้าหมาย"],
            recommendations: [
              "เพิ่ม Budget สำหรับ Ad Set ที่ ROAS ดี",
              "ทดสอบ Creative ใหม่",
              "ปรับ Audience Targeting",
              "เพิ่ม Retargeting Campaign",
              "ตรวจสอบ Landing Page",
            ],
            copies: [
              { headline: "สมุนไพรบำรุงกระดูก", body: "ดูแลกระดูกด้วยสมุนไพรธรรมชาติ", cta: "สั่งซื้อเลย" },
              { headline: "ลดปวดข้อเข่า", body: "สูตรพิเศษจากธรรมชาติ 100%", cta: "ดูรายละเอียด" },
              { headline: "บำรุงข้อต่อ", body: "ช่วยให้เคลื่อนไหวได้คล่องตัว", cta: "ลองใช้เลย" },
            ],
          }),
        },
      },
    ],
  }),
}));

// Mock the DB module so tests don't need a real database
vi.mock("./db", () => ({
  saveAdAnalysis: vi.fn().mockResolvedValue(undefined),
  getAdAnalysesByUserId: vi.fn().mockResolvedValue([]),
  deleteAdAnalysis: vi.fn().mockResolvedValue(undefined),
  saveAdCopy: vi.fn().mockResolvedValue(undefined),
  getAdCopiesByUserId: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── adAnalysis.analyze ───────────────────────────────────────────────────────

describe("adAnalysis.analyze", () => {
  it("calculates ROAS, CTR, CPC, and conversionRate correctly", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adAnalysis.analyze({
      budget: 1000,
      impressions: 50000,
      clicks: 1000,
      conversions: 30,
      revenue: 3000,
      productType: "สมุนไพรทั่วไป",
    });

    // ROAS = revenue / budget = 3000 / 1000 = 3.00
    expect(result.roas).toBe(3.0);
    // CPC = budget / clicks = 1000 / 1000 = 1.00
    expect(result.cpc).toBe(1.0);
    // CTR = (clicks / impressions) * 100 = (1000 / 50000) * 100 = 2.00
    expect(result.ctr).toBe(2.0);
    // conversionRate = (conversions / clicks) * 100 = (30 / 1000) * 100 = 3.00
    expect(result.conversionRate).toBe(3.0);
  });

  it("returns a score between 0 and 100", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adAnalysis.analyze({
      budget: 500,
      impressions: 10000,
      clicks: 50,
      conversions: 1,
      revenue: 400,
      productType: "อาหารเสริมลดน้ำหนัก",
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("detects health claim compliance issues in ad content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adAnalysis.analyze({
      budget: 1000,
      impressions: 20000,
      clicks: 400,
      conversions: 10,
      revenue: 1500,
      productType: "สมุนไพรทั่วไป",
      adContent: "สมุนไพรรักษาโรคเบาหวาน ช่วยให้หายจากอาการปวด",
    });

    expect(result.complianceIssues.length).toBeGreaterThan(0);
    expect(result.complianceIssues[0]).toContain("นโยบาย Facebook Ads");
  });

  it("handles zero budget without division errors", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adAnalysis.analyze({
      budget: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      productType: "อื่นๆ",
    });

    expect(result.roas).toBe(0);
    expect(result.cpc).toBe(0);
    expect(result.ctr).toBe(0);
    expect(result.conversionRate).toBe(0);
  });

  it("returns recommendations array", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adAnalysis.analyze({
      budget: 2000,
      impressions: 80000,
      clicks: 1600,
      conversions: 50,
      revenue: 6000,
      productType: "ครีมบำรุงผิว",
      targetAudience: "ผู้หญิง 25-45 ปี",
    });

    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});

// ─── adAnalysis.getHistory ────────────────────────────────────────────────────

describe("adAnalysis.getHistory", () => {
  it("returns an array (empty or populated)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adAnalysis.getHistory();

    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── adAnalysis.deleteHistory ─────────────────────────────────────────────────

describe("adAnalysis.deleteHistory", () => {
  it("returns success: true when deleting a record", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adAnalysis.deleteHistory({ id: 1 });

    expect(result).toEqual({ success: true });
  });
});

// ─── adAnalysis.deleteHistory security ──────────────────────────────────────────────

describe("adAnalysis.deleteHistory - security", () => {
  it("passes userId to deleteAdAnalysis so users cannot delete others' records", async () => {
    const { deleteAdAnalysis } = await import("./db");
    const ctx = createAuthContext(); // user.id = 42
    const caller = appRouter.createCaller(ctx);

    await caller.adAnalysis.deleteHistory({ id: 99 });

    // Verify the DB helper was called with both the record id AND the current user's id
    expect(vi.mocked(deleteAdAnalysis)).toHaveBeenCalledWith(99, 42);
  });
});

// ─── adCopy.generate ──────────────────────────────────────────────────────────

describe("adCopy.generate", () => {

  it("returns copies array with headline, body, and cta fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adCopy.generate({
      productName: "สมุนไพรบำรุงกระดูก",
      productDescription: "สมุนไพรธรรมชาติ 100% ช่วยบำรุงกระดูกและข้อต่อ",
      targetAudience: "ผู้สูงอายุ 50-70 ปี",
      tone: "friendly",
      objective: "sales",
      count: 3,
    });

    expect(Array.isArray(result.copies)).toBe(true);
    expect(result.copies.length).toBeGreaterThan(0);

    const firstCopy = result.copies[0];
    expect(firstCopy).toHaveProperty("headline");
    expect(firstCopy).toHaveProperty("body");
    expect(firstCopy).toHaveProperty("cta");
  });

  it("accepts minimal input with only productName", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adCopy.generate({
      productName: "ชาสมุนไพร",
    });

    expect(Array.isArray(result.copies)).toBe(true);
  });

  it("rejects empty productName", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adCopy.generate({ productName: "" })
    ).rejects.toThrow();
  });

  it("rejects count greater than 5", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adCopy.generate({ productName: "สินค้าทดสอบ", count: 10 })
    ).rejects.toThrow();
  });
});

// ─── adCopy.getHistory ────────────────────────────────────────────────────────

describe("adCopy.getHistory", () => {
  it("returns an array", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adCopy.getHistory();

    expect(Array.isArray(result)).toBe(true);
  });
});
