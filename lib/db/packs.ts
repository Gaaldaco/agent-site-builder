/**
 * Unified pack repository. Reads from Postgres when available,
 * falls back to the seed library when it isn't.
 */
import { query } from "./client";
import { ensureMigrated } from "./migrate";
import { SEED_PACKS, type SeedPack } from "./seed";

export type PackRecord = SeedPack & {
  source: "curated" | "generated" | "user";
  sessionId?: string | null;
};

const inMemoryGenerated = new Map<string, PackRecord[]>(); // sessionId → packs

export async function allPacks(
  kind: SeedPack["kind"],
  sessionId?: string
): Promise<PackRecord[]> {
  await ensureMigrated();

  const curated: PackRecord[] = [];
  const generated: PackRecord[] = [];

  const dbRes = await query<any>(
    `select id, kind, name, mood, source, session_id, data
     from packs
     where kind = $1
       and (source = 'curated' or ($2::text is not null and session_id = $2))
     order by source, created_at desc`,
    [kind, sessionId ?? null]
  );

  if (dbRes && dbRes.rows.length > 0) {
    for (const r of dbRes.rows) {
      const rec: PackRecord = {
        id: r.id,
        kind: r.kind,
        name: r.name,
        mood: r.mood,
        data: r.data,
        source: r.source,
        sessionId: r.session_id,
      };
      if (rec.source === "curated") curated.push(rec);
      else generated.push(rec);
    }
  } else {
    // DB empty / unavailable → fall back to seed
    for (const p of SEED_PACKS) {
      if (p.kind === kind) {
        curated.push({ ...p, source: "curated", sessionId: null });
      }
    }
    if (sessionId) {
      const mem = inMemoryGenerated.get(sessionId) || [];
      for (const p of mem) {
        if (p.kind === kind) generated.push(p);
      }
    }
  }

  // Return generated first so they surface in the UI
  return [...generated, ...curated];
}

export async function allPacksAllKinds(
  sessionId?: string
): Promise<Record<SeedPack["kind"], PackRecord[]>> {
  const kinds: SeedPack["kind"][] = ["color", "font", "button", "icon", "shape"];
  const results = await Promise.all(kinds.map((k) => allPacks(k, sessionId)));
  return {
    color: results[0],
    font: results[1],
    button: results[2],
    icon: results[3],
    shape: results[4],
  };
}

export async function savePack(pack: PackRecord): Promise<void> {
  await ensureMigrated();
  const res = await query(
    `insert into packs (id, kind, name, mood, source, session_id, data)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (id) do nothing`,
    [
      pack.id,
      pack.kind,
      pack.name,
      pack.mood,
      pack.source,
      pack.sessionId ?? null,
      JSON.stringify(pack.data),
    ]
  );
  if (!res) {
    // DB unavailable → keep in in-memory per-session cache
    if (pack.sessionId) {
      const arr = inMemoryGenerated.get(pack.sessionId) || [];
      arr.push(pack);
      inMemoryGenerated.set(pack.sessionId, arr);
    }
  }
}

export async function packById(id: string): Promise<PackRecord | null> {
  await ensureMigrated();
  const res = await query<any>(
    `select id, kind, name, mood, source, session_id, data
     from packs where id = $1 limit 1`,
    [id]
  );
  if (res && res.rows[0]) {
    const r = res.rows[0];
    return {
      id: r.id,
      kind: r.kind,
      name: r.name,
      mood: r.mood,
      data: r.data,
      source: r.source,
      sessionId: r.session_id,
    };
  }
  // fallback to seed
  const seed = SEED_PACKS.find((p) => p.id === id);
  if (seed) return { ...seed, source: "curated", sessionId: null };
  // in-memory
  for (const [, arr] of inMemoryGenerated) {
    const found = arr.find((p) => p.id === id);
    if (found) return found;
  }
  return null;
}
