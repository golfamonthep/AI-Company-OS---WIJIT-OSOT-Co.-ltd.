import type { z } from "zod";
import { badRequest } from "@/server/api/errors";

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(request: Request, schema: TSchema): Promise<z.infer<TSchema>> {
  const body = await request.json().catch(() => undefined);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw badRequest("Invalid request payload.", parsed.error.flatten());
  return parsed.data;
}

export function parseSearchParams<TSchema extends z.ZodTypeAny>(request: Request, schema: TSchema): z.infer<TSchema> {
  const url = new URL(request.url);
  const values = Object.fromEntries(url.searchParams.entries());
  const parsed = schema.safeParse(values);
  if (!parsed.success) throw badRequest("Invalid query parameters.", parsed.error.flatten());
  return parsed.data;
}
