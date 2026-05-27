import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
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

// TODO: add feature queries here as your schema grows.


import { asc, desc } from "drizzle-orm";
import { products, siteSettings, type InsertProduct, type InsertSiteSetting, type Product, type SiteSetting } from "../drizzle/schema";

/* -------------------- Products -------------------- */
export async function listProducts({ activeOnly = false }: { activeOnly?: boolean } = {}): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.sortOrder), desc(products.id));
  }
  return await db.select().from(products).orderBy(asc(products.sortOrder), desc(products.id));
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0];
}

export async function createProduct(data: InsertProduct): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(products).values(data);
  // mysql2 returns { insertId } on first element
  const insertId = Array.isArray(result) ? result[0]?.insertId : result?.insertId;
  return Number(insertId ?? 0);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

/* -------------------- Site Settings -------------------- */
export async function listSiteSettings(): Promise<SiteSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(siteSettings);
}

export async function getSiteSettingsMap(): Promise<Record<string, string>> {
  const list = await listSiteSettings();
  const map: Record<string, string> = {};
  for (const s of list) map[s.settingKey] = s.value ?? "";
  return map;
}

export async function upsertSiteSettings(items: Array<{ settingKey: string; value: string }>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const item of items) {
    const insertData: InsertSiteSetting = { settingKey: item.settingKey, value: item.value };
    await db
      .insert(siteSettings)
      .values(insertData)
      .onDuplicateKeyUpdate({ set: { value: item.value } });
  }
}
