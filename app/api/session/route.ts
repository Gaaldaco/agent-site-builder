import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  getSession,
  isRedisBackend,
  updateSession,
} from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    patch?: any;
  };

  const backend = (await isRedisBackend()) ? "redis" : "memory";

  if (body.id && body.patch) {
    const s = await updateSession(body.id, body.patch);
    return NextResponse.json({ session: s, backend });
  }

  if (body.id) {
    const s = await getSession(body.id);
    if (s) return NextResponse.json({ session: s, backend });
  }

  const s = await createSession();
  return NextResponse.json({ session: s, backend });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const backend = (await isRedisBackend()) ? "redis" : "memory";
  if (!id) return NextResponse.json({ backend });
  const s = await getSession(id);
  return NextResponse.json({ session: s, backend });
}
