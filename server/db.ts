import { eq, desc, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, adAnalyses, InsertAdAnalysis, adCopies, InsertAdCopy, facebookTokens, InsertFacebookToken, adInsightsCache, InsertAdInsightsCache } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ---- Ad Analysis helpers ----

export async function saveAdAnalysis(data: InsertAdAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adAnalyses).values(data);
  return result;
}

export async function getAdAnalysesByUserId(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adAnalyses)
    .where(eq(adAnalyses.userId, userId))
    .orderBy(desc(adAnalyses.createdAt))
    .limit(limit);
}

export async function deleteAdAnalysis(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adAnalyses)
    .where(and(eq(adAnalyses.id, id), eq(adAnalyses.userId, userId)));
}

// ---- Ad Copy helpers ----

export async function saveAdCopy(data: InsertAdCopy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adCopies).values(data);
  return result;
}

export async function getAdCopiesByUserId(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adCopies)
    .where(eq(adCopies.userId, userId))
    .orderBy(desc(adCopies.createdAt))
    .limit(limit);
}

// ---- Facebook Token helpers ----

export async function saveFacebookToken(data: InsertFacebookToken) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Upsert: remove existing token for this user then insert fresh
  await db.delete(facebookTokens).where(eq(facebookTokens.userId, data.userId));
  await db.insert(facebookTokens).values(data);
}

export async function getFacebookToken(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(facebookTokens).where(eq(facebookTokens.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function deleteFacebookToken(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(facebookTokens).where(eq(facebookTokens.userId, userId));
}

export async function updateAdAccountSelection(userId: number, adAccountId: string, adAccountName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(facebookTokens)
    .set({ selectedAdAccountId: adAccountId, selectedAdAccountName: adAccountName })
    .where(eq(facebookTokens.userId, userId));
}

// ---- Ad Insights Cache helpers ----

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedInsights(userId: number, adAccountId: string, dateRange: string) {
  const db = await getDb();
  if (!db) return null;
  const minFetchedAt = Date.now() - CACHE_TTL_MS;
  const rows = await db.select().from(adInsightsCache)
    .where(and(
      eq(adInsightsCache.userId, userId),
      eq(adInsightsCache.adAccountId, adAccountId),
      eq(adInsightsCache.dateRange, dateRange),
      gt(adInsightsCache.fetchedAt, minFetchedAt),
    ))
    .orderBy(desc(adInsightsCache.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveInsightsCache(data: InsertAdInsightsCache) {
  const db = await getDb();
  if (!db) return;
  // Remove old cache for same key before inserting
  await db.delete(adInsightsCache).where(and(
    eq(adInsightsCache.userId, data.userId),
    eq(adInsightsCache.adAccountId, data.adAccountId),
    eq(adInsightsCache.dateRange, data.dateRange),
  ));
  await db.insert(adInsightsCache).values(data);
}
