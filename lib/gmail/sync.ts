import type { Db } from "@/lib/db/client"
import { getMetaJson, setMetaJson } from "@/lib/db/kv"
import { log } from "@/lib/log"
import { batchGetMessages, getMessage, listHistory, listMessages } from "./client"
import { parseGmailMessage, type ParsedEmail } from "./parser"

export interface SyncProgress {
  phase: "listing" | "fetching" | "storing"
  current: number
  total: number
}

export type SyncProgressCallback = (progress: SyncProgress) => void

const BATCH_SIZE = 20
const DEFAULT_WINDOW_DAYS = 30

export const SYNC_RANGE_PRESETS = [
  { label: "Last month", days: 30 },
  { label: "Last 3 months", days: 90 },
  { label: "Last 6 months", days: 180 },
  { label: "Last year", days: 365 },
] as const

export interface SyncState {
  latestHistoryId?: string
  oldestFetchedDate?: string // ISO string
  totalFetched: number
  lastSyncedAt?: string // ISO string
  initialWindowDays?: number
}

const SYNC_STATE_KEY = "sync_state"

export async function loadSyncState(db: Db): Promise<SyncState> {
  return (await getMetaJson<SyncState>(db, SYNC_STATE_KEY)) ?? { totalFetched: 0 }
}

async function saveSyncState(db: Db, state: SyncState): Promise<void> {
  await setMetaJson(db, SYNC_STATE_KEY, state)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatGmailDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}/${m}/${d}`
}

/** Filter out message IDs that already exist in _raw_emails. */
async function filterNewIds(db: Db, ids: string[]): Promise<string[]> {
  const existing = new Set<string>()
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200)
    const placeholders = chunk.map(() => "?").join(",")
    const rows = await db.query<{ id: string }>(
      `SELECT id FROM _raw_emails WHERE id IN (${placeholders})`,
      chunk,
    )
    for (const row of rows) existing.add(row.id)
  }
  return ids.filter((id) => !existing.has(id))
}

async function insertEmails(db: Db, emails: ParsedEmail[]): Promise<void> {
  if (emails.length === 0) return
  const placeholders = emails.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(",")
  const params: unknown[] = []
  for (const e of emails) {
    params.push(
      e.id,
      e.threadId,
      e.fromAddr,
      JSON.stringify(e.toAddrs),
      e.subject,
      e.date,
      e.snippet,
      e.bodyText,
      JSON.stringify(e.labels),
    )
  }
  await db.exec(
    `INSERT OR IGNORE INTO _raw_emails
       (id, thread_id, from_addr, to_addrs, subject, date, snippet, body_text, labels)
     VALUES ${placeholders}`,
    params,
  )
}

/** Fetch messages by IDs in batches, parse, and store. Reports progress. */
async function fetchAndStore(
  db: Db,
  token: string,
  messageIds: string[],
  onProgress?: SyncProgressCallback,
): Promise<number> {
  let stored = 0
  const total = messageIds.length

  for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
    const batchIds = messageIds.slice(i, i + BATCH_SIZE)

    onProgress?.({ phase: "fetching", current: i, total })
    const messages = await batchGetMessages(token, batchIds)

    onProgress?.({ phase: "storing", current: i, total })
    await insertEmails(db, messages.map(parseGmailMessage))
    stored += messages.length
  }

  onProgress?.({ phase: "storing", current: total, total })
  return stored
}

/** Get the latest historyId from a single recent message. */
async function fetchLatestHistoryId(token: string): Promise<string | undefined> {
  const { messages } = await listMessages(token, "", undefined, 1)
  if (messages.length === 0) return undefined
  const msg = await getMessage(token, messages[0].id, "minimal")
  return msg.historyId
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Initial sync: fetch the chosen window (e.g. last 30/90/180/365 days). */
export async function initialSync(
  db: Db,
  token: string,
  days: number,
  onProgress?: SyncProgressCallback,
): Promise<void> {
  const since = daysAgo(days)
  const query = `after:${formatGmailDate(since)}`
  log("info", "sync", `Initial sync started (last ${days} days)`)

  try {
    const allIds: string[] = []
    let pageToken: string | undefined

    do {
      onProgress?.({ phase: "listing", current: allIds.length, total: 0 })
      const result = await listMessages(token, query, pageToken)
      allIds.push(...result.messages.map((m) => m.id))
      pageToken = result.nextPageToken
    } while (pageToken)

    const newIds = await filterNewIds(db, allIds)
    const stored = await fetchAndStore(db, token, newIds, onProgress)

    const historyId = await fetchLatestHistoryId(token)
    const state = await loadSyncState(db)
    await saveSyncState(db, {
      ...state,
      latestHistoryId: historyId ?? state.latestHistoryId,
      oldestFetchedDate: since.toISOString(),
      totalFetched: (state.totalFetched || 0) + stored,
      lastSyncedAt: new Date().toISOString(),
      initialWindowDays: days,
    })
    log("info", "sync", `Initial sync finished: ${stored} new emails stored`)
  } catch (err) {
    log("error", "sync", "Initial sync failed", String(err))
    throw err
  }
}

/** Incremental sync: fetch only messages added since the last sync. */
export async function incrementalSync(
  db: Db,
  token: string,
  onProgress?: SyncProgressCallback,
): Promise<void> {
  const state = await loadSyncState(db)

  if (!state.latestHistoryId) {
    return initialSync(db, token, DEFAULT_WINDOW_DAYS, onProgress)
  }

  log("info", "sync", "Refresh started")

  try {
    const allIds: string[] = []
    let pageToken: string | undefined
    let newHistoryId = state.latestHistoryId

    do {
      onProgress?.({ phase: "listing", current: allIds.length, total: 0 })
      const result = await listHistory(token, state.latestHistoryId, pageToken)
      allIds.push(...result.messageIds)
      pageToken = result.nextPageToken
      newHistoryId = result.historyId
    } while (pageToken)

    const uniqueIds = [...new Set(allIds)]
    const newIds = await filterNewIds(db, uniqueIds)

    if (newIds.length === 0) {
      await saveSyncState(db, {
        ...state,
        latestHistoryId: newHistoryId,
        lastSyncedAt: new Date().toISOString(),
      })
      onProgress?.({ phase: "storing", current: 0, total: 0 })
      log("info", "sync", "Refresh finished: no new emails")
      return
    }

    const stored = await fetchAndStore(db, token, newIds, onProgress)

    await saveSyncState(db, {
      ...state,
      latestHistoryId: newHistoryId,
      totalFetched: (state.totalFetched || 0) + stored,
      lastSyncedAt: new Date().toISOString(),
    })
    log("info", "sync", `Refresh finished: ${stored} new emails`)
  } catch (err) {
    log("error", "sync", "Refresh failed", String(err))
    throw err
  }
}

/** Load older emails: extend the window backward by `days` more days. */
export async function loadOlderEmails(
  db: Db,
  token: string,
  days: number = DEFAULT_WINDOW_DAYS,
  onProgress?: SyncProgressCallback,
): Promise<void> {
  const state = await loadSyncState(db)
  const oldestDate = state.oldestFetchedDate
    ? new Date(state.oldestFetchedDate)
    : daysAgo(DEFAULT_WINDOW_DAYS)

  const windowEnd = new Date(oldestDate)
  const windowStart = new Date(oldestDate)
  windowStart.setDate(windowStart.getDate() - days)

  const query = `after:${formatGmailDate(windowStart)} before:${formatGmailDate(windowEnd)}`
  log("info", "sync", `Loading older emails (${days} more days)`)

  try {
    const allIds: string[] = []
    let pageToken: string | undefined

    do {
      onProgress?.({ phase: "listing", current: allIds.length, total: 0 })
      const result = await listMessages(token, query, pageToken)
      allIds.push(...result.messages.map((m) => m.id))
      pageToken = result.nextPageToken
    } while (pageToken)

    const newIds = await filterNewIds(db, allIds)
    const stored = await fetchAndStore(db, token, newIds, onProgress)

    await saveSyncState(db, {
      ...state,
      oldestFetchedDate: windowStart.toISOString(),
      totalFetched: (state.totalFetched || 0) + stored,
      lastSyncedAt: new Date().toISOString(),
    })
    log("info", "sync", `Loaded ${stored} older emails`)
  } catch (err) {
    log("error", "sync", "Loading older emails failed", String(err))
    throw err
  }
}
