/**
 * Session store with a Redis backend (when REDIS_URL is set) and an in-memory
 * fallback for local dev. Stores full ProjectState + agent conversation
 * history under a session ID so the agent has memory across calls.
 */
import type { IntakeAnswers, ThemeSelection, ThemeRecommendation, Draft } from "./types";

type MessageRecord = {
  role: "user" | "assistant" | "system";
  at: number;
  stage: string;
  text: string;
};

export type Session = {
  id: string;
  createdAt: number;
  updatedAt: number;
  intake?: IntakeAnswers;
  theme?: Partial<ThemeSelection>;
  themeRecommendation?: ThemeRecommendation;
  drafts?: Draft[];
  chosenDraftId?: string | null;
  finalHtml?: string | null;
  history: MessageRecord[];
};

const KEY_PREFIX = "asb:session:";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// In-memory fallback map for local dev when REDIS_URL isn't set.
const memory = new Map<string, Session>();

// Untyped — ioredis is only present at runtime inside the Docker image and
// may not be installed locally. Avoids needing @types/ioredis during type-check.
let _redis: any = undefined;

async function getRedis(): Promise<any> {
  if (_redis !== undefined) return _redis;
  const url = process.env.REDIS_URL;
  if (!url) {
    _redis = null;
    return null;
  }
  try {
    // Real dynamic import of a literal specifier so Next.js's standalone
    // build statically traces and bundles ioredis into the output.
    // @ts-ignore — ioredis types are only present when node_modules has the pkg
    const mod = await import("ioredis");
    const Ctor = (mod as any).default || (mod as any).Redis || mod;
    const client = new Ctor(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
      enableReadyCheck: true,
    });
    client.on("error", (err: unknown) => {
      console.warn("[session] redis error", err);
    });
    _redis = client;
    return client;
  } catch (err) {
    console.warn("[session] redis init failed, falling back to memory", err);
    _redis = null;
    return null;
  }
}

function newId() {
  return (
    "s_" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
}

export async function createSession(): Promise<Session> {
  const now = Date.now();
  const s: Session = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    history: [],
  };
  await writeSession(s);
  return s;
}

export async function getSession(id: string): Promise<Session | null> {
  if (!id) return null;
  const redis = await getRedis();
  if (redis) {
    try {
      const raw = await redis.get(KEY_PREFIX + id);
      if (!raw) return null;
      return JSON.parse(raw) as Session;
    } catch (err) {
      console.warn("[session] get failed, falling back", err);
    }
  }
  return memory.get(id) ?? null;
}

export async function writeSession(s: Session): Promise<void> {
  s.updatedAt = Date.now();
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(KEY_PREFIX + s.id, JSON.stringify(s), "EX", TTL_SECONDS);
      return;
    } catch (err) {
      console.warn("[session] write failed, falling back", err);
    }
  }
  memory.set(s.id, s);
}

export async function updateSession(
  id: string,
  patch: Partial<Session>
): Promise<Session> {
  const current = (await getSession(id)) || {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  };
  const next: Session = { ...current, ...patch, id, history: current.history };
  if (patch.history) next.history = patch.history;
  await writeSession(next);
  return next;
}

export async function appendHistory(
  id: string,
  record: Omit<MessageRecord, "at">
): Promise<void> {
  const s = (await getSession(id)) || {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  };
  s.history.push({ ...record, at: Date.now() });
  // Keep at most 40 recent records to bound Redis value size
  if (s.history.length > 40) s.history = s.history.slice(-40);
  await writeSession(s);
}

/** Short recent-history summary the agent can use for continuity. */
export function historyDigest(s: Session | null, limit = 8): string {
  if (!s || !s.history?.length) return "(no prior history)";
  return s.history
    .slice(-limit)
    .map(
      (r) =>
        `[${new Date(r.at).toISOString()}] (${r.stage}) ${r.role}: ${r.text.slice(0, 240)}`
    )
    .join("\n");
}

/** True when Redis is reachable — used by diagnostic endpoints. */
export async function isRedisBackend(): Promise<boolean> {
  const r = await getRedis();
  return r != null;
}
