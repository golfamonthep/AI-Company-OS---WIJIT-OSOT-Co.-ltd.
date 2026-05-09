import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { ConnectorRegistry } from "@/modules/agent-runtime/integrations/ConnectorRegistry";
import { OAuthConfigManager } from "@/modules/agent-runtime/integrations/OAuthConfigManager";
import type { ConnectorId } from "@/modules/agent-runtime/integrations/types";

type RouteContext = { params: Promise<{ connectorId: string }> };

export function GET(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { connectorId } = await contextParams.params;
    const context = createApiContext(request);
    const connector = new ConnectorRegistry().get(connectorId as ConnectorId);
    const oauth = connector ? new OAuthConfigManager().getConfig(connector.connectorId) : undefined;
    return {
      connectorId,
      registered: Boolean(connector),
      enabled: connector?.enabled ?? false,
      stubOnly: connector?.stubOnly ?? true,
      oauthConfigured: oauth?.configured ?? false,
      persistenceMode: context.persistenceMode
    };
  });
}
