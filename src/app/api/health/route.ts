import { healthCheckService } from "@/infrastructure/HealthCheckService";
import { routeHandler } from "@/server/api/routeHandler";

export async function GET() {
  return routeHandler(async () => {
    const health = healthCheckService.getSystemHealth();
    return {
      ok: true,
      data: health,
      meta: {
        status: health.status
      }
    };
  });
}
