/**
 * creative.ts — tRPC router for Creative Performance Dashboard
 * Fetches ad-level insights + thumbnails from Meta Marketing API,
 * caches results, and provides ranked Top/Bottom performers.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getFacebookToken,
  upsertCreativeCache,
  getCreativeCacheByAccount,
  deleteCreativeCacheByAccount,
} from "../db";

// Cache TTL: 30 minutes
const CACHE_TTL_MS = 30 * 60 * 1000;

// Date range to Meta API date_preset map
const DATE_PRESET_MAP: Record<string, string> = {
  "7d": "last_7d",
  "14d": "last_14d",
  "30d": "last_30d",
};

interface MetaAdInsight {
  ad_id: string;
  ad_name: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
  purchase_roas?: { action_type: string; value: string }[];
  video_play_actions?: { action_type: string; value: string }[];
  video_thruplay_watched_actions?: { action_type: string; value: string }[];
  video_avg_time_watched_actions?: { action_type: string; value: string }[];
}

interface MetaAdCreative {
  id: string;
  creative?: {
    thumbnail_url?: string;
    video_id?: string;
  };
}

/**
 * Extract a numeric value from an actions array by action_type
 */
function extractAction(
  arr: { action_type: string; value: string }[] | undefined,
  type: string | string[],
): number {
  if (!arr) return 0;
  const types = Array.isArray(type) ? type : [type];
  return arr
    .filter((a) => types.includes(a.action_type))
    .reduce((s, a) => s + parseFloat(a.value || "0"), 0);
}

/**
 * Fetch ad-level insights + creative thumbnails from Meta API
 */
async function fetchCreativeData(
  accessToken: string,
  adAccountId: string,
  dateRange: string,
): Promise<
  {
    adId: string;
    adName: string;
    adsetId?: string;
    adsetName?: string;
    campaignId?: string;
    campaignName?: string;
    thumbnailUrl?: string;
    videoId?: string;
    creativeType: "image" | "video" | "carousel" | "unknown";
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpa: number;
    roas: number;
    conversions: number;
    videoThruPlays: number;
    video3SecPlays: number;
    videoAvgPlayTime: number;
  }[]
> {
  const datePreset = DATE_PRESET_MAP[dateRange] ?? "last_7d";

  // Step 1: Fetch ad-level insights
  const insightsFields = [
    "ad_id",
    "ad_name",
    "adset_id",
    "adset_name",
    "campaign_id",
    "campaign_name",
    "spend",
    "impressions",
    "clicks",
    "ctr",
    "cpc",
    "actions",
    "action_values",
    "purchase_roas",
    "video_play_actions",
    "video_thruplay_watched_actions",
    "video_avg_time_watched_actions",
  ].join(",");

  const insightsUrl = new URL(
    `https://graph.facebook.com/v22.0/${adAccountId}/insights`,
  );
  insightsUrl.searchParams.set("fields", insightsFields);
  insightsUrl.searchParams.set("date_preset", datePreset);
  insightsUrl.searchParams.set("level", "ad");
  insightsUrl.searchParams.set("limit", "100");
  insightsUrl.searchParams.set("access_token", accessToken);

  const insightsResp = await fetch(insightsUrl.toString());
  if (!insightsResp.ok) {
    const err = await insightsResp.json().catch(() => ({}));
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: err?.error?.message ?? "Failed to fetch ad insights from Meta API",
    });
  }
  const insightsData = await insightsResp.json();
  const insights: MetaAdInsight[] = insightsData?.data ?? [];

  if (insights.length === 0) return [];

  // Step 2: Fetch creative thumbnails for all ad IDs
  const adIds = insights.map((i) => i.ad_id).filter(Boolean);
  const thumbnailMap: Record<string, { thumbnailUrl?: string; videoId?: string }> = {};

  // Batch fetch in groups of 50
  for (let i = 0; i < adIds.length; i += 50) {
    const batch = adIds.slice(i, i + 50);
    const adsUrl = new URL(`https://graph.facebook.com/v22.0/`);
    // Use batch request
    const batchRequests = batch.map((adId) => ({
      method: "GET",
      relative_url: `${adId}?fields=creative{thumbnail_url,video_id}`,
    }));

    const batchUrl = new URL("https://graph.facebook.com/v22.0/");
    const batchResp = await fetch(batchUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: accessToken,
        batch: JSON.stringify(batchRequests),
      }),
    });

    if (batchResp.ok) {
      const batchData: { code: number; body: string }[] = await batchResp.json();
      batchData.forEach((item, idx) => {
        if (item.code === 200) {
          try {
            const adData: MetaAdCreative = JSON.parse(item.body);
            thumbnailMap[batch[idx]] = {
              thumbnailUrl: adData?.creative?.thumbnail_url,
              videoId: adData?.creative?.video_id,
            };
          } catch {
            // ignore parse errors
          }
        }
      });
    }
    // Small delay to avoid rate limiting
    if (i + 50 < adIds.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Step 3: Combine insights with creative data
  return insights.map((insight) => {
    const creative = thumbnailMap[insight.ad_id] ?? {};
    const spend = parseFloat(insight.spend ?? "0");
    const impressions = parseInt(insight.impressions ?? "0", 10);
    const clicks = parseInt(insight.clicks ?? "0", 10);
    const ctr = parseFloat(insight.ctr ?? "0");
    const cpc = parseFloat(insight.cpc ?? "0");

    const conversions = extractAction(insight.actions, [
      "purchase",
      "omni_purchase",
      "offsite_conversion.fb_pixel_purchase",
    ]);
    const cpa = conversions > 0 ? spend / conversions : 0;

    const roasArr = insight.purchase_roas ?? [];
    const roas = roasArr.reduce((s, r) => s + parseFloat(r.value || "0"), 0);

    const videoThruPlays = extractAction(
      insight.video_thruplay_watched_actions,
      "video_view",
    );
    const video3SecPlays = extractAction(
      insight.video_play_actions,
      "video_view",
    );
    const videoAvgPlayTime = extractAction(
      insight.video_avg_time_watched_actions,
      "video_view",
    );

    const creativeType: "image" | "video" | "carousel" | "unknown" = creative.videoId
      ? "video"
      : creative.thumbnailUrl
        ? "image"
        : "unknown";

    return {
      adId: insight.ad_id,
      adName: insight.ad_name,
      adsetId: insight.adset_id,
      adsetName: insight.adset_name,
      campaignId: insight.campaign_id,
      campaignName: insight.campaign_name,
      thumbnailUrl: creative.thumbnailUrl,
      videoId: creative.videoId,
      creativeType,
      spend,
      impressions,
      clicks,
      ctr,
      cpc,
      cpa,
      roas,
      conversions,
      videoThruPlays,
      video3SecPlays,
      videoAvgPlayTime,
    };
  });
}

export const creativeRouter = router({
  /**
   * Fetch and cache creative performance data for an ad account
   * Returns all creatives sorted by spend descending
   */
  getCreativePerformance: protectedProcedure
    .input(
      z.object({
        adAccountId: z.string().min(1),
        dateRange: z.enum(["7d", "14d", "30d"]).default("7d"),
        forceRefresh: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check cache first (unless force refresh)
      if (!input.forceRefresh) {
        const cached = await getCreativeCacheByAccount(
          userId,
          input.adAccountId,
          input.dateRange,
        );
        if (cached.length > 0) {
          const firstItem = cached[0];
          const cacheAge = Date.now() - (firstItem.fetchedAt ?? 0);
          if (cacheAge < CACHE_TTL_MS) {
            return { creatives: cached, fromCache: true, cachedAt: firstItem.fetchedAt };
          }
        }
      }

      // Get Meta access token
      const tokenRow = await getFacebookToken(userId);
      if (!tokenRow?.accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ยังไม่ได้เชื่อมต่อ Meta API กรุณาเชื่อมต่อที่หน้า Dashboard ก่อน",
        });
      }

      // Fetch fresh data from Meta API
      const creatives = await fetchCreativeData(
        tokenRow.accessToken,
        input.adAccountId,
        input.dateRange,
      );

      // Clear old cache and store fresh data
      await deleteCreativeCacheByAccount(userId, input.adAccountId, input.dateRange);
      const fetchedAt = Date.now();

      for (const c of creatives) {
        await upsertCreativeCache({
          userId,
          adAccountId: input.adAccountId,
          dateRange: input.dateRange,
          adId: c.adId,
          adName: c.adName,
          adsetId: c.adsetId,
          adsetName: c.adsetName,
          campaignId: c.campaignId,
          campaignName: c.campaignName,
          thumbnailUrl: c.thumbnailUrl,
          videoId: c.videoId,
          creativeType: c.creativeType,
          spend: c.spend,
          impressions: c.impressions,
          clicks: c.clicks,
          ctr: c.ctr,
          cpc: c.cpc,
          cpa: c.cpa,
          roas: c.roas,
          conversions: c.conversions,
          videoThruPlays: c.videoThruPlays,
          video3SecPlays: c.video3SecPlays,
          videoAvgPlayTime: c.videoAvgPlayTime,
          fetchedAt,
        });
      }

      // Return fresh data from DB (sorted by spend)
      const freshCached = await getCreativeCacheByAccount(
        userId,
        input.adAccountId,
        input.dateRange,
      );

      return { creatives: freshCached, fromCache: false, cachedAt: fetchedAt };
    }),

  /**
   * Get top N performers sorted by a given metric
   */
  getTopPerformers: protectedProcedure
    .input(
      z.object({
        adAccountId: z.string().min(1),
        dateRange: z.enum(["7d", "14d", "30d"]).default("7d"),
        sortBy: z.enum(["roas", "ctr", "conversions", "spend"]).default("roas"),
        limit: z.number().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cached = await getCreativeCacheByAccount(
        ctx.user.id,
        input.adAccountId,
        input.dateRange,
      );

      if (cached.length === 0) return { topPerformers: [] };

      // Filter out creatives with no spend
      const withSpend = cached.filter((c) => (c.spend ?? 0) > 0);

      const sorted = [...withSpend].sort((a, b) => {
        const aVal = (a[input.sortBy] as number) ?? 0;
        const bVal = (b[input.sortBy] as number) ?? 0;
        return bVal - aVal; // descending
      });

      return { topPerformers: sorted.slice(0, input.limit) };
    }),

  /**
   * Get bottom N performers (losers) — high CPA or low CTR
   */
  getBottomPerformers: protectedProcedure
    .input(
      z.object({
        adAccountId: z.string().min(1),
        dateRange: z.enum(["7d", "14d", "30d"]).default("7d"),
        sortBy: z.enum(["cpa", "ctr", "roas", "spend"]).default("cpa"),
        limit: z.number().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cached = await getCreativeCacheByAccount(
        ctx.user.id,
        input.adAccountId,
        input.dateRange,
      );

      if (cached.length === 0) return { bottomPerformers: [] };

      // Filter out creatives with no spend
      const withSpend = cached.filter((c) => (c.spend ?? 0) > 0);

      const sorted = [...withSpend].sort((a, b) => {
        const aVal = (a[input.sortBy] as number) ?? 0;
        const bVal = (b[input.sortBy] as number) ?? 0;
        // For CPA: higher is worse → descending
        // For CTR/ROAS: lower is worse → ascending
        if (input.sortBy === "cpa") return bVal - aVal;
        return aVal - bVal;
      });

      return { bottomPerformers: sorted.slice(0, input.limit) };
    }),

  /**
   * Get summary KPIs across all creatives
   */
  getSummaryKPIs: protectedProcedure
    .input(
      z.object({
        adAccountId: z.string().min(1),
        dateRange: z.enum(["7d", "14d", "30d"]).default("7d"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cached = await getCreativeCacheByAccount(
        ctx.user.id,
        input.adAccountId,
        input.dateRange,
      );

      if (cached.length === 0) {
        return {
          totalCreatives: 0,
          totalSpend: 0,
          avgCtr: 0,
          avgRoas: 0,
          avgCpa: 0,
          totalConversions: 0,
          totalVideo3SecPlays: 0,
          videoCreatives: 0,
          imageCreatives: 0,
        };
      }

      const withSpend = cached.filter((c) => (c.spend ?? 0) > 0);
      const totalSpend = withSpend.reduce((s, c) => s + (c.spend ?? 0), 0);
      const totalConversions = withSpend.reduce((s, c) => s + (c.conversions ?? 0), 0);
      const totalVideo3SecPlays = cached.reduce((s, c) => s + (c.video3SecPlays ?? 0), 0);

      const avgCtr =
        withSpend.length > 0
          ? withSpend.reduce((s, c) => s + (c.ctr ?? 0), 0) / withSpend.length
          : 0;

      const roasItems = withSpend.filter((c) => (c.roas ?? 0) > 0);
      const avgRoas =
        roasItems.length > 0
          ? roasItems.reduce((s, c) => s + (c.roas ?? 0), 0) / roasItems.length
          : 0;

      const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

      const videoCreatives = cached.filter((c) => c.creativeType === "video").length;
      const imageCreatives = cached.filter((c) => c.creativeType === "image").length;

      return {
        totalCreatives: cached.length,
        totalSpend,
        avgCtr,
        avgRoas,
        avgCpa,
        totalConversions,
        totalVideo3SecPlays,
        videoCreatives,
        imageCreatives,
      };
    }),
});
