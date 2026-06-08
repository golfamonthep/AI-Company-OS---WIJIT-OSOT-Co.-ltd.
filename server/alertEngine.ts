/**
 * Alert Engine — checks budget/KPI thresholds against Meta API data
 * and dispatches notifications via LINE Notify and Email.
 */

import {
  getAllActiveBudgetAlerts,
  getFacebookToken,
  getNotificationSettings,
  markAlertTriggered,
  createAlertLog,
} from "./db";
import type { BudgetAlert } from "../drizzle/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpm: number;       // cost per 1000 impressions
  cpc: number;       // cost per click
  cpa: number;       // cost per action (conversion)
  costPerPurchase: number;
  roas: number;
}

// ─── Meta API fetcher ─────────────────────────────────────────────────────────

export async function fetchCampaignInsights(
  accessToken: string,
  adAccountId: string,
  campaignId: string
): Promise<CampaignInsight | null> {
  const today = new Date();
  const since = new Date(today);
  since.setDate(today.getDate() - 1); // yesterday to today
  const sinceStr = since.toISOString().split("T")[0];
  const untilStr = today.toISOString().split("T")[0];

  const fields = "campaign_id,campaign_name,spend,impressions,clicks,cpm,cpc,cost_per_action_type,purchase_roas";
  const url = `https://graph.facebook.com/v22.0/${adAccountId}/insights?fields=${fields}&time_range={"since":"${sinceStr}","until":"${untilStr}"}&level=campaign&filtering=[{"field":"campaign.id","operator":"EQUAL","value":"${campaignId}"}]&access_token=${accessToken}`;

  const res = await fetch(url);
  const json = await res.json() as { data?: unknown[]; error?: { message: string } };

  if (!res.ok || json.error) {
    console.error("[AlertEngine] Meta API error:", json.error?.message);
    return null;
  }

  if (!json.data || json.data.length === 0) return null;

  const row = json.data[0] as Record<string, unknown>;
  const spend = parseFloat((row.spend as string) ?? "0");
  const impressions = parseFloat((row.impressions as string) ?? "0");
  const clicks = parseFloat((row.clicks as string) ?? "0");
  const cpm = parseFloat((row.cpm as string) ?? "0");
  const cpc = parseFloat((row.cpc as string) ?? "0");

  // Extract cost_per_action_type for purchase and general conversion
  let costPerPurchase = 0;
  let cpa = 0;
  const actions = row.cost_per_action_type as { action_type: string; value: string }[] | undefined;
  if (actions) {
    for (const a of actions) {
      if (a.action_type === "offsite_conversion.fb_pixel_purchase" || a.action_type === "purchase") {
        costPerPurchase = parseFloat(a.value ?? "0");
      }
      if (a.action_type === "lead" || a.action_type === "offsite_conversion.fb_pixel_lead") {
        cpa = parseFloat(a.value ?? "0");
      }
    }
    if (cpa === 0 && costPerPurchase > 0) cpa = costPerPurchase;
  }

  // ROAS = revenue / spend (approximated from purchase_roas if available)
  const purchaseRoas = row.purchase_roas as { value: string }[] | undefined;
  let roas = 0;
  if (purchaseRoas && purchaseRoas.length > 0) {
    roas = parseFloat(purchaseRoas[0].value ?? "0");
  }

  return {
    campaignId: row.campaign_id as string,
    campaignName: row.campaign_name as string,
    spend,
    impressions,
    clicks,
    cpm,
    cpc,
    cpa,
    costPerPurchase,
    roas,
  };
}

// ─── Threshold checker ────────────────────────────────────────────────────────

export function isThresholdBreached(alert: BudgetAlert, insight: CampaignInsight): { breached: boolean; currentValue: number } {
  let currentValue = 0;

  switch (alert.metricType) {
    case "budget_spent":
      currentValue = insight.spend;
      break;
    case "cpm":
      currentValue = insight.cpm;
      break;
    case "cost_per_purchase":
      currentValue = insight.costPerPurchase;
      break;
    case "cpc":
      currentValue = insight.cpc;
      break;
    case "cpa":
      currentValue = insight.cpa;
      break;
    case "roas_below":
      currentValue = insight.roas;
      break;
  }

  const threshold = alert.thresholdValue;
  let breached = false;

  if (alert.condition === "above") {
    breached = currentValue > threshold;
  } else if (alert.condition === "below") {
    breached = currentValue < threshold && currentValue > 0; // only alert if metric has data
  }

  return { breached, currentValue };
}

// ─── Notification senders ─────────────────────────────────────────────────────

export async function sendLineNotification(lineToken: string, message: string): Promise<boolean> {
  try {
    const res = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lineToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ message }),
    });
    return res.ok;
  } catch (err) {
    console.error("[AlertEngine] LINE Notify error:", err);
    return false;
  }
}

export async function sendEmailNotification(toEmail: string, subject: string, body: string): Promise<boolean> {
  // Use Manus built-in notification (owner alert) as the notification channel.
  // toEmail is logged for auditing; the built-in endpoint routes to the project owner.
  // For user-targeted email, integrate Resend/SendGrid and pass toEmail to the API.
  try {
    const forgeUrl = (process.env.BUILT_IN_FORGE_API_URL ?? "").replace(/\/+$/, "");
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!forgeUrl || !forgeKey) return false;

    const contentWithRecipient = toEmail
      ? `[To: ${toEmail}]\n\n${body}`
      : body;

    const res = await fetch(`${forgeUrl}/v1/notification/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${forgeKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: subject, content: contentWithRecipient }),
    });
    return res.ok;
  } catch (err) {
    console.error("[AlertEngine] Email notification error:", err);
    return false;
  }
}

// ─── Metric label helper ──────────────────────────────────────────────────────

function metricLabel(metricType: string): string {
  const labels: Record<string, string> = {
    budget_spent: "งบที่ใช้ (Spend)",
    cpm: "CPM (Cost per 1,000 Impressions)",
    cost_per_purchase: "Cost per Purchase",
    cpc: "CPC (Cost per Click)",
    cpa: "CPA (Cost per Action)",
    roas_below: "ROAS",
  };
  return labels[metricType] ?? metricType;
}

// ─── Main check runner ────────────────────────────────────────────────────────

export interface AlertCheckResult {
  alertId: number;
  campaignName: string;
  triggered: boolean;
  currentValue: number;
  thresholdValue: number;
  metricType: string;
  error?: string;
}

export async function runAlertChecks(targetUserId?: number): Promise<AlertCheckResult[]> {
  const alerts = await getAllActiveBudgetAlerts();
  const results: AlertCheckResult[] = [];

  // Filter by user if specified (for per-user heartbeat)
  const filtered = targetUserId ? alerts.filter(a => a.userId === targetUserId) : alerts;

  // Group by userId to batch token lookups
  const userAlerts = new Map<number, BudgetAlert[]>();
  for (const alert of filtered) {
    const list = userAlerts.get(alert.userId) ?? [];
    list.push(alert);
    userAlerts.set(alert.userId, list);
  }

  for (const [userId, userAlertList] of Array.from(userAlerts.entries())) {
    const tokenRow = await getFacebookToken(userId);
    if (!tokenRow?.accessToken) continue;

    const notifSettings = await getNotificationSettings(userId);

    for (const alert of userAlertList) {
      try {
        const insight = await fetchCampaignInsights(
          tokenRow.accessToken,
          alert.adAccountId,
          alert.campaignId
        );

        if (!insight) {
          results.push({
            alertId: alert.id,
            campaignName: alert.campaignName,
            triggered: false,
            currentValue: 0,
            thresholdValue: alert.thresholdValue,
            metricType: alert.metricType,
            error: "No insight data available",
          });
          continue;
        }

        const { breached, currentValue } = isThresholdBreached(alert, insight);

        results.push({
          alertId: alert.id,
          campaignName: alert.campaignName,
          triggered: breached,
          currentValue,
          thresholdValue: alert.thresholdValue,
          metricType: alert.metricType,
        });

        if (!breached) continue;

        // Build notification message
        const conditionText = alert.condition === "above" ? "สูงกว่า" : "ต่ำกว่า";
        const message = `\n🚨 [AI Ads Guide] แจ้งเตือนงบโฆษณา\n\nแคมเปญ: ${alert.campaignName}\nเมตริก: ${metricLabel(alert.metricType)}\nค่าปัจจุบัน: ${currentValue.toFixed(2)}\nเกณฑ์: ${conditionText} ${alert.thresholdValue}\n\nกรุณาตรวจสอบแคมเปญของคุณ`;

        let lineNotified = 0;
        let emailNotified = 0;

        // Send LINE Notify
        if (alert.notifyLine && notifSettings?.lineToken) {
          const ok = await sendLineNotification(notifSettings.lineToken, message);
          if (ok) lineNotified = 1;
        }

        // Send Email / Manus notification
        if (alert.notifyEmail) {
          const emailTarget = notifSettings?.notifyEmail ?? "";
          const ok = await sendEmailNotification(
            emailTarget,
            `แจ้งเตือน: ${alert.campaignName} — ${metricLabel(alert.metricType)} ${conditionText}เกณฑ์`,
            message
          );
          if (ok) emailNotified = 1;
        }

        // Log the alert
        await createAlertLog({
          alertId: alert.id,
          userId,
          campaignId: alert.campaignId,
          campaignName: alert.campaignName,
          metricType: alert.metricType,
          currentValue,
          thresholdValue: alert.thresholdValue,
          message,
          lineNotified,
          emailNotified,
        });

        // Update last triggered timestamp
        await markAlertTriggered(alert.id);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[AlertEngine] Error checking alert ${alert.id}:`, errMsg);
        results.push({
          alertId: alert.id,
          campaignName: alert.campaignName,
          triggered: false,
          currentValue: 0,
          thresholdValue: alert.thresholdValue,
          metricType: alert.metricType,
          error: errMsg,
        });
      }
    }
  }

  return results;
}
