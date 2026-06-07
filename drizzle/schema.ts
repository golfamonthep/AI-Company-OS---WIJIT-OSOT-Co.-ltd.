import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Table for storing ad analysis results
 */
export const adAnalyses = mysqlTable("ad_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Input metrics
  budget: float("budget").notNull(),
  impressions: float("impressions").notNull(),
  clicks: float("clicks").notNull(),
  conversions: float("conversions").notNull(),
  revenue: float("revenue").notNull(),
  productType: varchar("productType", { length: 255 }).notNull(),
  targetAudience: varchar("targetAudience", { length: 500 }),
  adContent: text("adContent"),
  // Computed metrics
  roas: float("roas"),
  cpc: float("cpc"),
  ctr: float("ctr"),
  conversionRate: float("conversionRate"),
  score: int("score"),
  // AI analysis results stored as JSON
  complianceIssues: json("complianceIssues").$type<string[]>(),
  recommendations: json("recommendations").$type<string[]>(),
  aiAnalysis: text("aiAnalysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdAnalysis = typeof adAnalyses.$inferSelect;
export type InsertAdAnalysis = typeof adAnalyses.$inferInsert;

/**
 * Table for storing generated ad copies
 */
export const adCopies = mysqlTable("ad_copies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productDescription: text("productDescription"),
  targetAudience: varchar("targetAudience", { length: 500 }),
  tone: varchar("tone", { length: 100 }),
  objective: varchar("objective", { length: 100 }),
  generatedCopies: json("generatedCopies").$type<{ headline: string; body: string; cta: string }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdCopy = typeof adCopies.$inferSelect;
export type InsertAdCopy = typeof adCopies.$inferInsert;
