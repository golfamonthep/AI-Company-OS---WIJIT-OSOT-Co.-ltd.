import type { ConnectorAction, ConnectorDefinition, ConnectorId } from "@/modules/agent-runtime/integrations/types";

const read = (actionId: string, name: string, description: string): ConnectorAction => ({
  actionId,
  name,
  type: "read",
  description,
  requiresApproval: false,
  approvalDomain: "none"
});

const write = (actionId: string, name: string, description: string, approvalDomain: ConnectorAction["approvalDomain"] = "workflow"): ConnectorAction => ({
  actionId,
  name,
  type: "write",
  description,
  requiresApproval: true,
  approvalDomain
});

const external = (actionId: string, name: string, description: string, approvalDomain: ConnectorAction["approvalDomain"]): ConnectorAction => ({
  actionId,
  name,
  type: "external_action",
  description,
  requiresApproval: true,
  approvalDomain
});

const connectors: ConnectorDefinition[] = [
  googleConnector("google-gmail", "Gmail", [read("gmail.read_threads", "Read email threads", "Read selected email threads for context."), read("gmail.search", "Search inbox", "Search mailbox metadata and safe excerpts.")], [external("gmail.send_email", "Send email", "Send an email to external recipients.", "workflow"), write("gmail.create_draft", "Create email draft", "Create an unpublished email draft.")]),
  googleConnector("google-drive", "Google Drive", [read("drive.read_files", "Read files", "Read selected file metadata and content.")], [write("drive.create_folder", "Create folder", "Create a Drive folder."), external("drive.delete_file", "Delete file", "Delete a Drive file.", "workflow")]),
  googleConnector("google-docs", "Google Docs", [read("docs.read_document", "Read document", "Read selected Google Docs content.")], [write("docs.create_draft", "Create draft document", "Create an unpublished draft document.")]),
  googleConnector("google-sheets", "Google Sheets", [read("sheets.read_sheet", "Read sheet", "Read selected sheet values.")], [write("sheets.create_sheet", "Create sheet", "Create a new spreadsheet."), write("sheets.update_cells", "Update cells", "Update spreadsheet cells.", "finance")]),
  googleConnector("google-calendar", "Google Calendar", [read("calendar.read_events", "Read events", "Read calendar availability and event metadata.")], [write("calendar.create_draft_event", "Create draft event", "Create a calendar event draft."), external("calendar.invite_guests", "Invite guests", "Send calendar invites.", "workflow")]),
  socialConnector("tiktok", "TikTok"),
  socialConnector("youtube", "YouTube"),
  socialConnector("facebook", "Facebook"),
  socialConnector("instagram", "Instagram"),
  adsConnector("meta-ads", "Meta Ads"),
  adsConnector("google-ads", "Google Ads"),
  adsConnector("tiktok-ads", "TikTok Ads"),
  businessConnector("notion", "Notion", [read("notion.read_pages", "Read pages", "Read selected workspace pages.")], [write("notion.create_page", "Create page", "Create a page draft.")]),
  businessConnector("slack", "Slack", [read("slack.read_channels", "Read channels", "Read selected channel messages.")], [external("slack.send_message", "Send message", "Send a message to a channel.", "workflow")]),
  businessConnector("shopify", "Shopify", [read("shopify.read_orders", "Read orders", "Read order and product analytics.")], [write("shopify.create_product_draft", "Create product draft", "Create an unpublished product draft."), external("shopify.publish_product", "Publish product", "Publish product listing.", "workflow")]),
  businessConnector("stripe", "Stripe", [read("stripe.read_metrics", "Read metrics", "Read payment and revenue metrics.")], [external("stripe.modify_financial_data", "Modify financial data", "Modify payment, customer, or financial records.", "finance")]),
  businessConnector("line-oa", "LINE OA", [read("line.read_insights", "Read insights", "Read LINE OA insights.")], [external("line.send_broadcast", "Send broadcast", "Contact customers through LINE OA.", "publishing")])
];

export class ConnectorRegistry {
  private readonly registry = new Map<ConnectorId, ConnectorDefinition>(connectors.map((connector) => [connector.connectorId, connector]));

  list() {
    return [...this.registry.values()];
  }

  get(connectorId: ConnectorId) {
    return this.registry.get(connectorId);
  }

  register(connector: ConnectorDefinition) {
    this.registry.set(connector.connectorId, connector);
    return connector;
  }

  findAction(connectorId: ConnectorId, actionId: string) {
    const connector = this.get(connectorId);
    if (!connector) return undefined;
    return [...connector.readActions, ...connector.writeActions].find((action) => action.actionId === actionId);
  }
}

function googleConnector(connectorId: ConnectorId, name: string, readActions: ConnectorAction[], writeActions: ConnectorAction[]): ConnectorDefinition {
  return baseConnector({ connectorId, provider: "google_workspace", name, authType: "oauth2", permissions: ["workspace.read", "workspace.draft"], readActions, writeActions });
}

function socialConnector(connectorId: ConnectorId, name: string): ConnectorDefinition {
  return baseConnector({
    connectorId,
    provider: "social_platform",
    name,
    authType: "oauth2",
    permissions: ["analytics.read", "draft.write"],
    readActions: [read(`${connectorId}.read_analytics`, "Read analytics", `Read ${name} analytics and content performance.`)],
    writeActions: [write(`${connectorId}.create_draft`, "Create draft post", `Create an unpublished ${name} draft.`), external(`${connectorId}.publish_post`, "Publish post", `Publish content to ${name}.`, "publishing")]
  });
}

function adsConnector(connectorId: ConnectorId, name: string): ConnectorDefinition {
  return baseConnector({
    connectorId,
    provider: "advertising_platform",
    name,
    authType: "oauth2",
    permissions: ["ads.read", "ads.draft"],
    readActions: [read(`${connectorId}.read_campaigns`, "Read campaigns", `Read ${name} campaign analytics.`)],
    writeActions: [write(`${connectorId}.create_campaign_draft`, "Create campaign draft", `Create an unpublished ${name} campaign draft.`, "campaign"), external(`${connectorId}.change_budget`, "Change ad budget", `Change active ad budget in ${name}.`, "budget")]
  });
}

function businessConnector(connectorId: ConnectorId, name: string, readActions: ConnectorAction[], writeActions: ConnectorAction[]): ConnectorDefinition {
  return baseConnector({ connectorId, provider: "business_tool", name, authType: connectorId === "stripe" ? "api_key" : "oauth2", permissions: ["business.read", "business.draft"], readActions, writeActions });
}

function baseConnector(input: Pick<ConnectorDefinition, "connectorId" | "provider" | "name" | "authType" | "permissions" | "readActions" | "writeActions">): ConnectorDefinition {
  return {
    ...input,
    approvalRequirements: ["Write and external actions require governance approval.", "No publish, send, spend, delete, or customer contact without approval."],
    rateLimitStrategy: "Local per-action window now; provider-specific quota later.",
    errorHandling: ["Return structured errors.", "Retry safe reads only.", "Escalate write failures to human review."],
    auditLogging: ["Log every read/write attempt.", "Log approval status.", "Log connector/action metadata."],
    governancePolicy: "ConnectorPermissionManager must validate all actions before ConnectorExecutor runs.",
    enabled: true,
    stubOnly: true
  };
}
