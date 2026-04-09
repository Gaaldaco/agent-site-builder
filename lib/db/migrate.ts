/**
 * Idempotent migration runner. Safe to call on every boot — ensures the
 * schema exists and seeds the curated pack library if it's empty.
 */
import { query } from "./client";
import { SEED_PACKS } from "./seed";

let _migrated = false;
let _migrationPromise: Promise<void> | null = null;

const SCHEMA_SQL = `
create table if not exists packs (
  id          text primary key,
  kind        text not null,
  name        text not null,
  mood        text not null,
  source      text not null default 'curated',
  session_id  text,
  data        jsonb not null,
  created_at  timestamptz default now(),
  used_count  int default 0
);
create index if not exists packs_kind_source_idx on packs (kind, source);
create index if not exists packs_session_idx on packs (session_id);

create table if not exists curations (
  id           bigserial primary key,
  session_id   text not null,
  intake_hash  text not null,
  reasoning    text,
  created_at   timestamptz default now()
);

create table if not exists curation_packs (
  curation_id  bigint references curations(id) on delete cascade,
  pack_id      text references packs(id) on delete cascade,
  rank         int,
  reason       text,
  primary key (curation_id, pack_id)
);
`;

export async function ensureMigrated(): Promise<void> {
  if (_migrated) return;
  if (_migrationPromise) return _migrationPromise;

  _migrationPromise = (async () => {
    const schemaResult = await query(SCHEMA_SQL);
    if (!schemaResult) {
      // DB not available — silently skip, pack library falls back to in-memory
      return;
    }

    // Seed only if packs table is empty (first boot or after a fresh DB)
    const countRes = await query<{ count: string }>(
      "select count(*)::text as count from packs where source='curated'"
    );
    const curatedCount = Number(countRes?.rows[0]?.count ?? "0");

    if (curatedCount === 0 && SEED_PACKS.length > 0) {
      console.log(`[db] seeding ${SEED_PACKS.length} curated packs…`);
      for (const p of SEED_PACKS) {
        await query(
          `insert into packs (id, kind, name, mood, source, data)
           values ($1, $2, $3, $4, 'curated', $5)
           on conflict (id) do nothing`,
          [p.id, p.kind, p.name, p.mood, JSON.stringify(p.data)]
        );
      }
      console.log("[db] seed complete");
    }

    _migrated = true;
  })();

  return _migrationPromise;
}
