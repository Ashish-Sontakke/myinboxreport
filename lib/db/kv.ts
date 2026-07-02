import type { Db } from "./client"

/** Read a value from the _meta key-value table. */
export async function getMeta(db: Db, key: string): Promise<string | null> {
  const rows = await db.query<{ value: string }>(
    `SELECT value FROM _meta WHERE key = ?`,
    [key],
  )
  return rows.length > 0 ? rows[0].value : null
}

export async function getMetaJson<T>(db: Db, key: string): Promise<T | null> {
  const raw = await getMeta(db, key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function setMeta(db: Db, key: string, value: string): Promise<void> {
  await db.exec(`INSERT OR REPLACE INTO _meta (key, value) VALUES (?, ?)`, [
    key,
    value,
  ])
}

export async function setMetaJson(db: Db, key: string, value: unknown): Promise<void> {
  await setMeta(db, key, JSON.stringify(value))
}

export async function deleteMeta(db: Db, key: string): Promise<void> {
  await db.exec(`DELETE FROM _meta WHERE key = ?`, [key])
}
