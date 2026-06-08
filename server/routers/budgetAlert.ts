/**
 * Budget Alert tRPC router
 * Manages alert rules, notification settings, and alert history.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { parse as parseCookie } from "cookie";
import { protectedProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "../../shared/const";
import { createHeartbeatJob, deleteHeartbeatJob } from "../_core/heartbeat";
import {
  createBudgetAlert,
  getBudgetAlertsByUserId,
  getBudgetAlertById,
  updateBudgetAlert,
  deleteBudgetAlert,
  updateBudgetAlertCronUid,
  getAlertLogsByUserId,
  getNotificationSettings,
  upsertNotificationSettings,
} from "../db";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const metricTypeEnum = z.enum([
  "budget_spent",
  "cpm",
  "cost_per_purchase",
  "cpc",
  "cpa",
  "roas_below",
]);

const createAlertInput = z.object({
  campaignId: z.string().min(1),
  campaignName: z.string().min(1),
  adAccountId: z.string().min(1),
  metricType: metricTypeEnum,
  condition: z.enum(["above", "below"]),
  thresholdValue: z.number().positive(),
  notifyLine: z.boolean().default(false),
  notifyEmail: z.boolean().default(false),
});

const updateAlertInput = z.object({
  id: z.number().int().positive(),
  thresholdValue: z.number().positive().optional(),
  notifyLine: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const budgetAlertRouter = router({
  // Create a new alert rule + schedule hourly heartbeat
  create: protectedProcedure
    .input(createAlertInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Insert the alert rule first
      const result = await createBudgetAlert({
        userId,
        campaignId: input.campaignId,
        campaignName: input.campaignName,
        adAccountId: input.adAccountId,
        metricType: input.metricType,
        condition: input.condition,
        thresholdValue: input.thresholdValue,
        notifyLine: input.notifyLine ? 1 : 0,
        notifyEmail: input.notifyEmail ? 1 : 0,
        isActive: 1,
      });

      // Get the inserted ID — MySQL2 returns [ResultSetHeader, FieldPacket[]]
      const header = (result as unknown as [{ insertId: number }])[0];
      const insertId = header.insertId;

      // Schedule hourly heartbeat for this alert
      try {
        const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        const job = await createHeartbeatJob(
          {
            name: `budget-alert-${insertId}-u${userId}`,
            cron: "0 0 * * * *", // every hour at :00
            path: "/api/scheduled/check-budget",
            payload: { alertId: insertId, userId },
            description: `Budget alert: ${input.campaignName} — ${input.metricType}`,
          },
          sessionToken
        );

        await updateBudgetAlertCronUid(insertId, job.taskUid);
      } catch (err) {
        // Non-fatal: alert is created but cron scheduling failed (e.g. not deployed yet)
        console.warn("[budgetAlert.create] Heartbeat scheduling failed:", err);
      }

      return { success: true, alertId: insertId };
    }),

  // List all alert rules for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return getBudgetAlertsByUserId(ctx.user.id);
  }),

  // Update threshold / channels / active state
  update: protectedProcedure
    .input(updateAlertInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await getBudgetAlertById(input.id, ctx.user.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });

      const patch: Record<string, unknown> = {};
      if (input.thresholdValue !== undefined) patch.thresholdValue = input.thresholdValue;
      if (input.notifyLine !== undefined) patch.notifyLine = input.notifyLine ? 1 : 0;
      if (input.notifyEmail !== undefined) patch.notifyEmail = input.notifyEmail ? 1 : 0;
      if (input.isActive !== undefined) patch.isActive = input.isActive ? 1 : 0;

      await updateBudgetAlert(input.id, ctx.user.id, patch);
      return { success: true };
    }),

  // Delete alert rule + cancel heartbeat
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getBudgetAlertById(input.id, ctx.user.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });

      // Cancel heartbeat if exists
      if (existing.scheduleCronTaskUid) {
        try {
          const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
          await deleteHeartbeatJob(existing.scheduleCronTaskUid, sessionToken);
        } catch (err) {
          console.warn("[budgetAlert.delete] Heartbeat deletion failed:", err);
        }
      }

      await deleteBudgetAlert(input.id, ctx.user.id);
      return { success: true };
    }),

  // Get alert notification history
  getLogs: protectedProcedure
    .input(z.object({ limit: z.number().int().positive().max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      return getAlertLogsByUserId(ctx.user.id, input.limit);
    }),

  // Get/save notification settings (LINE token + email)
  getNotificationSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getNotificationSettings(ctx.user.id);
    return settings ?? { lineToken: null, notifyEmail: null };
  }),

  saveNotificationSettings: protectedProcedure
    .input(z.object({
      lineToken: z.string().optional().nullable(),
      notifyEmail: z.string().email().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      await upsertNotificationSettings({
        userId: ctx.user.id,
        lineToken: input.lineToken ?? null,
        notifyEmail: input.notifyEmail ?? null,
      });
      return { success: true };
    }),
});
