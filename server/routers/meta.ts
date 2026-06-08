import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  saveFacebookToken,
  getFacebookToken,
  deleteFacebookToken,
  updateAdAccountSelection,
  getCachedInsights,
  saveInsightsCache,
} from "../db";

const META_GRAPH_BASE = "https://graph.facebook.com/v22.0";

/** Helper: call Meta Graph API with a user access token */
async function metaGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${META_GRAPH_BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  const json = await res.json() as Record<string, unknown>;
  if (!res.ok || (json as { error?: { message: string } }).error) {
    const errMsg = ((json as { error?: { message: string } }).error?.message) ?? `Meta API error ${res.status}`;
    throw new Error(errMsg);
  }
  return json;
}

/** Compute summary KPIs from daily insights array */
function computeSummary(dailyData: DailyInsight[]) {
  const totals = dailyData.reduce(
    (acc, d) => ({
      spend: acc.spend + d.spend,
      impressions: acc.impressions + d.impressions,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
      revenue: acc.revenue + d.revenue,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;

  return {
    ...totals,
    ctr: parseFloat(ctr.toFixed(2)),
    cpc: parseFloat(cpc.toFixed(2)),
    cpa: parseFloat(cpa.toFixed(2)),
    roas: parseFloat(roas.toFixed(2)),
  };
}

interface DailyInsight {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

/** Parse raw Meta API insight row into our DailyInsight shape */
function parseInsightRow(row: Record<string, unknown>): DailyInsight {
  const spend = parseFloat((row.spend as string) || "0");
  const impressions = parseInt((row.impressions as string) || "0", 10);
  const clicks = parseInt((row.clicks as string) || "0", 10);

  // Conversions come from actions array (purchase / offsite_conversion.fb_pixel_purchase)
  const actions = (row.actions as { action_type: string; value: string }[]) || [];
  const conversionAction = actions.find(
    (a) =>
      a.action_type === "purchase" ||
      a.action_type === "offsite_conversion.fb_pixel_purchase" ||
      a.action_type === "omni_purchase"
  );
  const conversions = conversionAction ? parseFloat(conversionAction.value || "0") : 0;

  // Revenue from action_values
  const actionValues = (row.action_values as { action_type: string; value: string }[]) || [];
  const revenueAction = actionValues.find(
    (a) =>
      a.action_type === "purchase" ||
      a.action_type === "offsite_conversion.fb_pixel_purchase" ||
      a.action_type === "omni_purchase"
  );
  const revenue = revenueAction ? parseFloat(revenueAction.value || "0") : 0;

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  const roas = spend > 0 ? revenue / spend : 0;

  return {
    date: (row.date_start as string) || "",
    spend: parseFloat(spend.toFixed(2)),
    impressions,
    clicks,
    conversions: parseFloat(conversions.toFixed(2)),
    revenue: parseFloat(revenue.toFixed(2)),
    ctr: parseFloat(ctr.toFixed(2)),
    cpc: parseFloat(cpc.toFixed(2)),
    cpa: parseFloat(cpa.toFixed(2)),
    roas: parseFloat(roas.toFixed(2)),
  };
}

export const metaRouter = router({
  /** Save a Meta user access token */
  saveToken: protectedProcedure
    .input(z.object({ accessToken: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      // Verify token by fetching /me
      const me = await metaGet("/me", input.accessToken, { fields: "id,name" });
      await saveFacebookToken({
        userId: ctx.user.id,
        accessToken: input.accessToken,
        expiresAt: null,
      });
      return { success: true, metaName: (me as { name?: string }).name ?? "" };
    }),

  /** Remove saved token (disconnect) */
  removeToken: protectedProcedure
    .mutation(async ({ ctx }) => {
      await deleteFacebookToken(ctx.user.id);
      return { success: true };
    }),

  /** Get current connection status */
  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const token = await getFacebookToken(ctx.user.id);
      if (!token) return { connected: false };
      return {
        connected: true,
        selectedAdAccountId: token.selectedAdAccountId,
        selectedAdAccountName: token.selectedAdAccountName,
      };
    }),

  /** List ad accounts accessible by the stored token */
  getAdAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const token = await getFacebookToken(ctx.user.id);
      if (!token) throw new Error("ยังไม่ได้เชื่อมต่อ Meta Account");

      const data = await metaGet("/me/adaccounts", token.accessToken, {
        fields: "id,name,account_status,currency",
        limit: "50",
      });

      const accounts = ((data as { data?: unknown[] }).data ?? []) as {
        id: string;
        name: string;
        account_status: number;
        currency: string;
      }[];

      return accounts.map((a) => ({
        id: a.id,
        name: a.name,
        status: a.account_status,
        currency: a.currency,
      }));
    }),

  /** Select which ad account to use for insights */
  selectAdAccount: protectedProcedure
    .input(z.object({ adAccountId: z.string(), adAccountName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await updateAdAccountSelection(ctx.user.id, input.adAccountId, input.adAccountName);
      return { success: true };
    }),

  /** Fetch insights (with 5-min cache) */
  getInsights: protectedProcedure
    .input(z.object({
      dateRange: z.enum(["7d", "30d"]),
      forceRefresh: z.boolean().optional().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const token = await getFacebookToken(ctx.user.id);
      if (!token) throw new Error("ยังไม่ได้เชื่อมต่อ Meta Account");
      if (!token.selectedAdAccountId) throw new Error("กรุณาเลือก Ad Account ก่อน");

      const adAccountId = token.selectedAdAccountId;

      // Check cache first
      if (!input.forceRefresh) {
        const cached = await getCachedInsights(ctx.user.id, adAccountId, input.dateRange);
        if (cached) {
          const daily = (cached.data as DailyInsight[]);
          return {
            daily,
            summary: computeSummary(daily),
            fromCache: true,
            fetchedAt: cached.fetchedAt,
          };
        }
      }

      // Fetch from Meta API
      const datePreset = input.dateRange === "7d" ? "last_7d" : "last_30d";
      const fields = [
        "date_start",
        "spend",
        "impressions",
        "clicks",
        "actions",
        "action_values",
      ].join(",");

      const data = await metaGet(`/${adAccountId}/insights`, token.accessToken, {
        fields,
        date_preset: datePreset,
        time_increment: "1",
        level: "account",
      });

      const rawRows = ((data as { data?: unknown[] }).data ?? []) as Record<string, unknown>[];
      const daily = rawRows.map(parseInsightRow).sort((a, b) => a.date.localeCompare(b.date));

      // Save to cache
      await saveInsightsCache({
        userId: ctx.user.id,
        adAccountId,
        dateRange: input.dateRange,
        data: daily,
        fetchedAt: Date.now(),
      });

      return {
        daily,
        summary: computeSummary(daily),
        fromCache: false,
        fetchedAt: Date.now(),
      };
    }),
});
