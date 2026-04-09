/**
 * Postgres client with lazy dynamic-import so the build tracer bundles pg
 * into the Next.js standalone output and local type-check doesn't need it.
 */

let _pool: any = undefined;

async function getPool(): Promise<any> {
  if (_pool !== undefined) return _pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    _pool = null;
    return null;
  }
  try {
    // @ts-ignore — pg types may not be present locally
    const pgMod = await import("pg");
    const { Pool } = (pgMod as any).default || pgMod;
    _pool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 30_000,
      // Railway's internal network doesn't need ssl; external would.
      ssl: url.includes("railway.internal")
        ? false
        : { rejectUnauthorized: false },
    });
    _pool.on("error", (err: unknown) => {
      console.warn("[db] pool error", err);
    });
    return _pool;
  } catch (err) {
    console.warn("[db] init failed", err);
    _pool = null;
    return null;
  }
}

export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number } | null> {
  const pool = await getPool();
  if (!pool) return null;
  try {
    const res = await pool.query(sql, params);
    return { rows: res.rows, rowCount: res.rowCount ?? 0 };
  } catch (err) {
    console.warn("[db] query failed", err);
    return null;
  }
}

export async function isDbReady(): Promise<boolean> {
  const r = await query("select 1 as ok");
  return !!r && r.rows.length > 0;
}
