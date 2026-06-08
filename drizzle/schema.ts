import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, json, bigint, boolean, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
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
  budget: float("budget").notNull(),
  impressions: float("impressions").notNull(),
  clicks: float("clicks").notNull(),
  conversions: float("conversions").notNull(),
  revenue: float("revenue").notNull(),
  productType: varchar("productType", { length: 255 }).notNull(),
  targetAudience: varchar("targetAudience", { length: 500 }),
  adContent: text("adContent"),
  roas: float("roas"),
  cpc: float("cpc"),
  ctr: float("ctr"),
  conversionRate: float("conversionRate"),
  score: int("score"),
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

/**
 * Table for storing Meta (Facebook) access tokens per user
 */
export const facebookTokens = mysqlTable("facebook_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  accessToken: text("accessToken").notNull(),
  selectedAdAccountId: varchar("selectedAdAccountId", { length: 64 }),
  selectedAdAccountName: varchar("selectedAdAccountName", { length: 255 }),
  expiresAt: bigint("expiresAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacebookToken = typeof facebookTokens.$inferSelect;
export type InsertFacebookToken = typeof facebookTokens.$inferInsert;

/**
 * Cache table for Meta Ads Insights API responses (daily breakdown)
 */
export const adInsightsCache = mysqlTable("ad_insights_cache", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adAccountId: varchar("adAccountId", { length: 64 }).notNull(),
  dateRange: varchar("dateRange", { length: 10 }).notNull(),
  data: json("data").notNull(),
  fetchedAt: bigint("fetchedAt", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdInsightsCache = typeof adInsightsCache.$inferSelect;
export type InsertAdInsightsCache = typeof adInsightsCache.$inferInsert;

/**
 * Budget alert rules — one rule per campaign/metric threshold
 * metricType: "budget_spent" | "cpm" | "cost_per_purchase" | "cpc" | "cpa" | "roas_below"
 * condition: "above" | "below"
 * thresholdValue: numeric threshold (e.g. 1000 for budget, 50 for CPM)
 * scheduleCronTaskUid: Heartbeat cron task UID for periodic checks
 */
export const budgetAlerts = mysqlTable("budget_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Campaign info from Meta API
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  adAccountId: varchar("adAccountId", { length: 64 }).notNull(),
  // Alert rule
  metricType: mysqlEnum("metricType", [
    "budget_spent",
    "cpm",
    "cost_per_purchase",
    "cpc",
    "cpa",
    "roas_below",
  ]).notNull(),
  condition: mysqlEnum("condition", ["above", "below"]).notNull(),
  thresholdValue: float("thresholdValue").notNull(),
  // Notification channels
  notifyLine: tinyint("notifyLine").default(0).notNull(),
  notifyEmail: tinyint("notifyEmail").default(0).notNull(),
  // State
  isActive: tinyint("isActive").default(1).notNull(),
  lastTriggeredAt: bigint("lastTriggeredAt", { mode: "number" }),
  // Heartbeat cron task UID for periodic checks
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetAlert = typeof budgetAlerts.$inferSelect;
export type InsertBudgetAlert = typeof budgetAlerts.$inferInsert;

/**
 * Alert notification logs — history of triggered alerts
 */
export const alertLogs = mysqlTable("alert_logs", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull(),
  userId: int("userId").notNull(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  metricType: varchar("metricType", { length: 64 }).notNull(),
  currentValue: float("currentValue").notNull(),
  thresholdValue: float("thresholdValue").notNull(),
  message: text("message").notNull(),
  // Which channels were notified
  lineNotified: tinyint("lineNotified").default(0).notNull(),
  emailNotified: tinyint("emailNotified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertLog = typeof alertLogs.$inferSelect;
export type InsertAlertLog = typeof alertLogs.$inferInsert;

/**
 * Notification settings per user — LINE token + email
 */
export const notificationSettings = mysqlTable("notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  lineToken: text("lineToken"),
  notifyEmail: varchar("notifyEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;
