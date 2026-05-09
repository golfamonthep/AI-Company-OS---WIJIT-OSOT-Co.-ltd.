import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    return {
      recommendations: [
        { id: "rec-weekly-review", title: "Run Weekly AI Company Review", impact: "medium", urgency: "normal", approvalRequired: true },
        { id: "rec-memory-review", title: "Review new memory candidates", impact: "medium", urgency: "low", approvalRequired: false }
      ],
      persistenceMode: context.persistenceMode
    };
  });
}
