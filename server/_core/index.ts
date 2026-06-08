import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { runAlertChecks } from "../alertEngine";
import { handleSendReportCron } from "../routers/report";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // ─── Scheduled: Budget Alert Check ──────────────────────────────────────────
  app.post("/api/scheduled/check-budget", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }

      // The payload contains { alertId, userId } set when the heartbeat was created
      const payload = req.body as { alertId?: number; userId?: number };
      const targetUserId = payload.userId;

      const results = await runAlertChecks(targetUserId);
      const triggered = results.filter(r => r.triggered).length;

      return res.json({
        ok: true,
        checked: results.length,
        triggered,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[/api/scheduled/check-budget]", message);
      return res.status(500).json({
        error: message,
        context: { url: req.url, taskUid: "unknown" },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ─── Scheduled: Automated Report Send ─────────────────────────────────────
  app.post("/api/scheduled/send-report", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }

      const result = await handleSendReportCron(user.taskUid);
      return res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[/api/scheduled/send-report]", message);
      return res.status(500).json({
        error: message,
        context: { url: req.url, taskUid: "unknown" },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
