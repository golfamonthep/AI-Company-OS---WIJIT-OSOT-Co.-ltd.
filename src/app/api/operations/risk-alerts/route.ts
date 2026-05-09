import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    return {
      riskAlerts: [
        { id: "risk-external-actions", severity: "high", title: "External write actions remain approval-gated", status: "controlled" },
        { id: "risk-missing-env", severity: context.persistenceMode === "missing_env" ? "medium" : "low", title: "Supabase persistence mode", status: context.persistenceMode }
      ],
      persistenceMode: context.persistenceMode
    };
  });
}
