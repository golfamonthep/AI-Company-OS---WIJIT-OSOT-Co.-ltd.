import type { ConnectorId, OAuthConnectorConfig } from "@/modules/agent-runtime/integrations/types";

const oauthConfigs: Record<ConnectorId, OAuthConnectorConfig> = {
  "google-gmail": googleConfig("google-gmail", ["gmail.readonly", "gmail.compose"]),
  "google-drive": googleConfig("google-drive", ["drive.file", "drive.readonly"]),
  "google-docs": googleConfig("google-docs", ["documents.readonly", "documents"]),
  "google-sheets": googleConfig("google-sheets", ["spreadsheets.readonly", "spreadsheets"]),
  "google-calendar": googleConfig("google-calendar", ["calendar.readonly", "calendar.events"]),
  tiktok: oauthConfig("tiktok", ["video.list", "video.upload"]),
  youtube: oauthConfig("youtube", ["youtube.readonly", "youtube.upload"]),
  facebook: oauthConfig("facebook", ["pages_read_engagement", "pages_manage_posts"]),
  instagram: oauthConfig("instagram", ["instagram_basic", "instagram_content_publish"]),
  "meta-ads": oauthConfig("meta-ads", ["ads_read", "ads_management"]),
  "google-ads": oauthConfig("google-ads", ["adwords"]),
  "tiktok-ads": oauthConfig("tiktok-ads", ["ad.read", "ad.write"]),
  notion: oauthConfig("notion", ["read_content", "insert_content"]),
  slack: oauthConfig("slack", ["channels:history", "chat:write"]),
  shopify: oauthConfig("shopify", ["read_products", "write_products", "read_orders"]),
  stripe: { connectorId: "stripe", authType: "api_key", scopes: ["read", "write"], clientIdEnvKey: "STRIPE_SECRET_KEY", configured: Boolean(process.env.STRIPE_SECRET_KEY) },
  "line-oa": oauthConfig("line-oa", ["profile", "message.write"])
};

export class OAuthConfigManager {
  getConfig(connectorId: ConnectorId) {
    return oauthConfigs[connectorId];
  }

  listConfigs() {
    return Object.values(oauthConfigs);
  }

  buildAuthorizationRequest(connectorId: ConnectorId, state: string) {
    const config = this.getConfig(connectorId);
    if (!config || !config.authorizationUrl) return { available: false, reason: "OAuth authorization URL is not configured for this stub connector." };

    return {
      available: true,
      url: `${config.authorizationUrl}?client_id=${config.clientIdEnvKey ?? "CLIENT_ID"}&redirect_uri=${config.redirectUriEnvKey ?? "REDIRECT_URI"}&response_type=code&scope=${encodeURIComponent(config.scopes.join(" "))}&state=${encodeURIComponent(state)}`
    };
  }
}

function googleConfig(connectorId: ConnectorId, scopes: string[]): OAuthConnectorConfig {
  return {
    connectorId,
    authType: "oauth2",
    scopes,
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    redirectUriEnvKey: "GOOGLE_OAUTH_REDIRECT_URI",
    clientIdEnvKey: "GOOGLE_CLIENT_ID",
    clientSecretEnvKey: "GOOGLE_CLIENT_SECRET",
    configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  };
}

function oauthConfig(connectorId: ConnectorId, scopes: string[]): OAuthConnectorConfig {
  const prefix = connectorId.toUpperCase().replace(/-/g, "_");
  return {
    connectorId,
    authType: "oauth2",
    scopes,
    redirectUriEnvKey: `${prefix}_OAUTH_REDIRECT_URI`,
    clientIdEnvKey: `${prefix}_CLIENT_ID`,
    clientSecretEnvKey: `${prefix}_CLIENT_SECRET`,
    configured: Boolean(process.env[`${prefix}_CLIENT_ID`] && process.env[`${prefix}_CLIENT_SECRET`])
  };
}
