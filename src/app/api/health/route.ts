import { NextResponse } from "next/server";
import { getProductionHealth } from "@/lib/production-health";

export async function GET() {
  return NextResponse.json(getProductionHealth());
}
