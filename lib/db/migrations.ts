import type { Db } from "./client"

const SCHEMA_VERSION = 1

const MIGRATION_1 = `
CREATE TABLE IF NOT EXISTS _raw_emails (
  id TEXT PRIMARY KEY,
  thread_id TEXT,
  from_addr TEXT,
  to_addrs TEXT,
  subject TEXT,
  date INTEGER,
  snippet TEXT,
  body_text TEXT,
  labels TEXT,
  extraction_status TEXT NOT NULL DEFAULT 'pending',
  extraction_error TEXT,
  extracted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_raw_emails_status_date
  ON _raw_emails(extraction_status, date DESC);
CREATE INDEX IF NOT EXISTS idx_raw_emails_date ON _raw_emails(date DESC);

CREATE TABLE IF NOT EXISTS _extraction_specs (
  table_name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  columns_json TEXT NOT NULL,
  prompt_guidance TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS _pins (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  chart_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS _activity_log (
  id INTEGER PRIMARY KEY,
  ts INTEGER NOT NULL,
  level TEXT NOT NULL,
  area TEXT NOT NULL,
  message TEXT NOT NULL,
  detail TEXT
);

CREATE TABLE IF NOT EXISTS _chat_messages (
  id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL,
  message_json TEXT NOT NULL
);
`

/**
 * Apply pending migrations. Versioning is a single integer in _meta —
 * intentionally no framework.
 */
export async function migrate(db: Db): Promise<void> {
  await db.execScript(
    `CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)`,
  )
  const rows = await db.query<{ value: string }>(
    `SELECT value FROM _meta WHERE key = 'schema_version'`,
  )
  const current = rows.length > 0 ? Number(rows[0].value) : 0

  if (current < 1) {
    await db.execScript(MIGRATION_1)
  }

  if (current < SCHEMA_VERSION) {
    await db.exec(
      `INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)`,
      [String(SCHEMA_VERSION)],
    )
  }
}
