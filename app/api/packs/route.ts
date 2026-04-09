import { NextRequest, NextResponse } from "next/server";
import { allPacksAllKinds } from "@/lib/db/packs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || undefined;
  const packs = await allPacksAllKinds(sessionId);
  return NextResponse.json(packs);
}
