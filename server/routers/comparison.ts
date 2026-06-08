import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getFacebookToken } from "../db";

const META_GRAPH_BASE = "https://graph.facebook.com/v22.0";

/** Helper: call Meta Graph API */
async function metaGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${META_GRAPH_BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || (json as { error?: { message: string } }).error) {
    const errMsg =
      ((json as { error?: { message: string } }).error?.message) ??
      `Meta API error ${res.status}`;
    throw new Error(errMsg);
  }
  return json;
}

/** Date range helper: returns { since, until } strings */
function getDateRange(dateRange: "7d" | "14d" | "30d") {
  const now = new Date();
  const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { since: fmt(since), until: fmt(now) };
}

/** Parse a single Meta insights row into our CampaignMetrics shape */
function parseInsightRow(row: Record<string, unknown>, campaignId: string, campaignName: string) {
  const spend = parseFloat((row.spend as string) || "0");
  const impressions = parseInt((row.impressions as string) || "0", 10);
  const clicks = parseInt((row.clicks as string) || "0", 10);

  // Conversions from actions array
  const actions = (row.actions as { action_type: string; value: string }[]) || [];
  const convAction = actions.find(
    (a) =>
      a.action_type === "purchase" ||
      a.action_type === "offsite_conversion.fb_pixel_purchase" ||
      a.action_type === "omni_purchase" ||
      a.action_type === "lead" ||
      a.action_type === "complete_registration"
  );
  const conversions = convAction ? parseFloat(convAction.value || "0") : 0;

  // Revenue from action_values
  const actionValues = (row.action_values as { action_type: string; value: string }[]) || [];
  const revenueAction = actionValues.find(
    (a) =>
      a.action_type === "purchase" ||
      a.action_type === "offsite_conversion.fb_pixel_purchase" ||
      a.action_type === "omni_purchase"
  );
  const revenue = revenueAction ? parseFloat(revenueAction.value || "0") : 0;

  // Derived metrics
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : 0; // cost per result
  const roas = spend > 0 ? revenue / spend : 0;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;

  return {
    campaignId,
    campaignName,
    spend: parseFloat(spend.toFixed(2)),
    impressions,
    clicks,
    conversions: parseFloat(conversions.toFixed(2)),
    revenue: parseFloat(revenue.toFixed(2)),
    ctr: parseFloat(ctr.toFixed(2)),
    cpc: parseFloat(cpc.toFixed(2)),
    cpa: parseFloat(cpa.toFixed(2)),
    roas: parseFloat(roas.toFixed(2)),
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    cpm: parseFloat(cpm.toFixed(2)),
  };
}

export type CampaignMetrics = ReturnType<typeof parseInsightRow>;

export const comparisonRouter = router({
  /** List all campaigns for the selected ad account */
  listCampaigns: protectedProcedure
    .input(
      z.object({
        adAccountId: z.string().min(1),
        dateRange: z.enum(["7d", "14d", "30d"]).default("7d"),
      })
    )
    .query(async ({ ctx, input }) => {
      const token = await getFacebookToken(ctx.user.id);
      if (!token) throw new Error("ยังไม่ได้เชื่อมต่อ Meta Account");

      const adAccountId = input.adAccountId.startsWith("act_")
        ? input.adAccountId
        : `act_${input.adAccountId}`;

      const { since, until } = getDateRange(input.dateRange);

      // Fetch campaigns with basic insights
      const data = await metaGet(`/${adAccountId}/campaigns`, token.accessToken, {
        fields: "id,name,status,objective",
        limit: "100",
        effective_status: '["ACTIVE","PAUSED","ARCHIVED"]',
      });

      const campaigns = ((data as { data?: unknown[] }).data ?? []) as {
        id: string;
        name: string;
        status: string;
        objective: string;
      }[];

      return campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective ?? "",
      }));
    }),

  /** Fetch insights for a single campaign */
  getCampaignInsights: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
        campaignName: z.string(),
        dateRange: z.enum(["7d", "14d", "30d"]).default("7d"),
      })
    )
    .query(async ({ ctx, input }) => {
      const token = await getFacebookToken(ctx.user.id);
      if (!token) throw new Error("ยังไม่ได้เชื่อมต่อ Meta Account");

      const { since, until } = getDateRange(input.dateRange);

      const data = await metaGet(`/${input.campaignId}/insights`, token.accessToken, {
        fields:
          "spend,impressions,clicks,actions,action_values,ctr,cpc,cpm",
        time_range: JSON.stringify({ since, until }),
        level: "campaign",
      });

      const rows = ((data as { data?: unknown[] }).data ?? []) as Record<string, unknown>[];

      if (rows.length === 0) {
        // Return zero metrics if no data
        return parseInsightRow({}, input.campaignId, input.campaignName);
      }

      // Aggregate all rows (usually 1 row for campaign-level)
      type Totals = { spend: number; impressions: number; clicks: number; conversions: number; revenue: number };
      const aggregated = rows.reduce<Totals>(
        (acc, row) => {
          const parsed = parseInsightRow(row, input.campaignId, input.campaignName);
          return {
            spend: acc.spend + parsed.spend,
            impressions: acc.impressions + parsed.impressions,
            clicks: acc.clicks + parsed.clicks,
            conversions: acc.conversions + parsed.conversions,
            revenue: acc.revenue + parsed.revenue,
          };
        },
        { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      );

      // Re-derive metrics from aggregated totals
      const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0;
      const cpc = aggregated.clicks > 0 ? aggregated.spend / aggregated.clicks : 0;
      const cpa = aggregated.conversions > 0 ? aggregated.spend / aggregated.conversions : 0;
      const roas = aggregated.spend > 0 ? aggregated.revenue / aggregated.spend : 0;
      const conversionRate = aggregated.clicks > 0 ? (aggregated.conversions / aggregated.clicks) * 100 : 0;
      const cpm = aggregated.impressions > 0 ? (aggregated.spend / aggregated.impressions) * 1000 : 0;

      return {
        campaignId: input.campaignId,
        campaignName: input.campaignName,
        spend: parseFloat(aggregated.spend.toFixed(2)),
        impressions: aggregated.impressions,
        clicks: aggregated.clicks,
        conversions: parseFloat(aggregated.conversions.toFixed(2)),
        revenue: parseFloat(aggregated.revenue.toFixed(2)),
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        cpa: parseFloat(cpa.toFixed(2)),
        roas: parseFloat(roas.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        cpm: parseFloat(cpm.toFixed(2)),
      };
    }),

  /** Fetch and compare metrics for 2-3 campaigns in parallel */
  compareMultiple: protectedProcedure
    .input(
      z.object({
        campaigns: z
          .array(
            z.object({
              id: z.string().min(1),
              name: z.string(),
            })
          )
          .min(2)
          .max(3),
        dateRange: z.enum(["7d", "14d", "30d"]).default("7d"),
      })
    )
    .query(async ({ ctx, input }) => {
      const token = await getFacebookToken(ctx.user.id);
      if (!token) throw new Error("ยังไม่ได้เชื่อมต่อ Meta Account");

      const { since, until } = getDateRange(input.dateRange);

      // Fetch all campaigns in parallel
      const results = await Promise.all(
        input.campaigns.map(async (campaign) => {
          try {
            const data = await metaGet(`/${campaign.id}/insights`, token.accessToken, {
              fields: "spend,impressions,clicks,actions,action_values,ctr,cpc,cpm",
              time_range: JSON.stringify({ since, until }),
              level: "campaign",
            });

            const rows = ((data as { data?: unknown[] }).data ?? []) as Record<string, unknown>[];

            if (rows.length === 0) {
              return parseInsightRow({}, campaign.id, campaign.name);
            }

            // Aggregate rows
            type Totals = { spend: number; impressions: number; clicks: number; conversions: number; revenue: number };
            const aggregated = rows.reduce<Totals>(
              (acc, row) => {
                const parsed = parseInsightRow(row, campaign.id, campaign.name);
                return {
                  spend: acc.spend + parsed.spend,
                  impressions: acc.impressions + parsed.impressions,
                  clicks: acc.clicks + parsed.clicks,
                  conversions: acc.conversions + parsed.conversions,
                  revenue: acc.revenue + parsed.revenue,
                };
              },
              { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
            );

            const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0;
            const cpc = aggregated.clicks > 0 ? aggregated.spend / aggregated.clicks : 0;
            const cpa = aggregated.conversions > 0 ? aggregated.spend / aggregated.conversions : 0;
            const roas = aggregated.spend > 0 ? aggregated.revenue / aggregated.spend : 0;
            const conversionRate = aggregated.clicks > 0 ? (aggregated.conversions / aggregated.clicks) * 100 : 0;
            const cpm = aggregated.impressions > 0 ? (aggregated.spend / aggregated.impressions) * 1000 : 0;

            return {
              campaignId: campaign.id,
              campaignName: campaign.name,
              spend: parseFloat(aggregated.spend.toFixed(2)),
              impressions: aggregated.impressions,
              clicks: aggregated.clicks,
              conversions: parseFloat(aggregated.conversions.toFixed(2)),
              revenue: parseFloat(aggregated.revenue.toFixed(2)),
              ctr: parseFloat(ctr.toFixed(2)),
              cpc: parseFloat(cpc.toFixed(2)),
              cpa: parseFloat(cpa.toFixed(2)),
              roas: parseFloat(roas.toFixed(2)),
              conversionRate: parseFloat(conversionRate.toFixed(2)),
              cpm: parseFloat(cpm.toFixed(2)),
            };
          } catch (err) {
            // Return zero metrics on error so comparison still works
            return parseInsightRow({}, campaign.id, campaign.name);
          }
        })
      );

      return { campaigns: results };
    }),
});
