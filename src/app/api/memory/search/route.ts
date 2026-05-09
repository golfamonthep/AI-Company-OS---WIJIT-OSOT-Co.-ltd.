import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { searchMemorySchema } from "@/server/api/schemas";
import { MemoryRepository } from "@/database/repositories/MemoryRepository";

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, searchMemorySchema);
    const repo = new MemoryRepository(context.persistence);
    const company = body.scope === "all" || body.scope === "company" ? (await repo.listCompanyMemory(context.organizationId)).data : [];
    const agent = body.scope === "all" || body.scope === "agent" ? (await repo.listAgentMemory(context.organizationId)).data : [];
    const tasks = body.scope === "all" || body.scope === "task_history" ? (await repo.listTaskHistory(context.organizationId)).data : [];
    const query = body.query.toLowerCase();

    const results = [...company, ...agent, ...tasks]
      .filter((item) => !body.agentKey || !item.agent_key || item.agent_key === body.agentKey)
      .map((item) => ({ item, score: scoreText(`${item.title} ${item.content ?? ""} ${item.result_summary ?? ""}`, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, body.limit);

    return { query: body.query, results, persistenceMode: context.persistenceMode };
  });
}

function scoreText(text: string, query: string) {
  const lower = text.toLowerCase();
  return query.split(/\s+/).reduce((score, token) => score + (lower.includes(token) ? 1 : 0), 0);
}
