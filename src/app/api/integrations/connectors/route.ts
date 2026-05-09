import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { ConnectorRegistry } from "@/modules/agent-runtime/integrations/ConnectorRegistry";
import { OAuthConfigManager } from "@/modules/agent-runtime/integrations/OAuthConfigManager";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const oauth = new OAuthConfigManager();
    const connectors = new ConnectorRegistry().list().map((connector) => ({
      ...connector,
      oauth: oauth.getConfig(connector.connectorId)
    }));
    return { connectors, persistenceMode: context.persistenceMode };
  });
}
