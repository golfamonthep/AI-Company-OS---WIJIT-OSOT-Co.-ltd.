import { NextResponse } from "next/server";
import { ApiError } from "@/server/api/errors";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export async function routeHandler<T>(handler: () => Promise<ApiSuccess<T> | T>) {
  try {
    const result = await handler();
    if (isApiSuccess(result)) return NextResponse.json(result);
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ ok: false, error: error.message, details: error.details }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Unknown API error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

function isApiSuccess<T>(value: ApiSuccess<T> | T): value is ApiSuccess<T> {
  return Boolean(value && typeof value === "object" && "ok" in value && (value as { ok?: unknown }).ok === true);
}
