import { db } from '@/lib/db';
import {
  listMessages,
  getMessage,
  batchGetMessages,
  listHistory,
} from './client';
import { parseGmailMessage } from './parser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncProgress {
  phase: 'listing' | 'fetching' | 'storing';
  current: number;
  total: number;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

const BATCH_SIZE = 20;
const DAYS_PER_WINDOW = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatGmailDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

/**
 * Filter out message IDs that already exist in Dexie.
 */
async function filterNewIds(ids: string[]): Promise<string[]> {
  const existing = await db.emails.where('id').anyOf(ids).primaryKeys();
  const existingSet = new Set(existing);
  return ids.filter((id) => !existingSet.has(id));
}

/**
 * Fetch messages by IDs in batches, parse, and store in Dexie.
 * Reports progress via callback.
 */
async function fetchAndStore(
  token: string,
  messageIds: string[],
  onProgress?: SyncProgressCallback,
): Promise<number> {
  let stored = 0;
  const total = messageIds.length;

  for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
    const batchIds = messageIds.slice(i, i + BATCH_SIZE);

    onProgress?.({ phase: 'fetching', current: i, total });
    const messages = await batchGetMessages(token, batchIds);

    onProgress?.({ phase: 'storing', current: i, total });
    const parsed = messages.map(parseGmailMessage);
    await db.emails.bulkPut(parsed);
    stored += parsed.length;
  }

  onProgress?.({ phase: 'storing', current: total, total });
  return stored;
}

/**
 * Get the latest historyId from a single recent message.
 */
async function fetchLatestHistoryId(token: string): Promise<string | undefined> {
  const { messages } = await listMessages(token, '', undefined, 1);
  if (messages.length === 0) return undefined;
  const msg = await getMessage(token, messages[0].id, 'minimal');
  return msg.historyId;
}

// ---------------------------------------------------------------------------
// Sync state persistence (stored in localStorage for simplicity)
// ---------------------------------------------------------------------------

const SYNC_STATE_KEY = 'myinboxreport_sync_state';

interface PersistedSyncState {
  latestHistoryId?: string;
  oldestFetchedDate?: string; // ISO string
  totalFetched: number;
  lastSyncedAt?: string; // ISO string
}

function loadSyncState(): PersistedSyncState {
  try {
    const raw = localStorage.getItem(SYNC_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { totalFetched: 0 };
}

function saveSyncState(state: PersistedSyncState): void {
  localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initial sync: fetch the last 30 days of email.
 * Call this when the user has never synced before.
 */
export async function initialSync(
  token: string,
  onProgress?: SyncProgressCallback,
): Promise<void> {
  const since = daysAgo(DAYS_PER_WINDOW);
  const query = `after:${formatGmailDate(since)}`;

  // Phase 1: List all message IDs
  const allIds: string[] = [];
  let pageToken: string | undefined;

  do {
    onProgress?.({ phase: 'listing', current: allIds.length, total: 0 });
    const result = await listMessages(token, query, pageToken);
    allIds.push(...result.messages.map((m) => m.id));
    pageToken = result.nextPageToken;
  } while (pageToken);

  // Filter out any already stored (e.g. partial previous sync)
  const newIds = await filterNewIds(allIds);

  // Phase 2 & 3: Fetch and store
  const stored = await fetchAndStore(token, newIds, onProgress);

  // Save sync state
  const historyId = await fetchLatestHistoryId(token);
  const state = loadSyncState();
  saveSyncState({
    ...state,
    latestHistoryId: historyId ?? state.latestHistoryId,
    oldestFetchedDate: since.toISOString(),
    totalFetched: (state.totalFetched || 0) + stored,
    lastSyncedAt: new Date().toISOString(),
  });
}

/**
 * Incremental sync: fetch only new messages since the last sync.
 * Uses Gmail history API with startHistoryId.
 */
export async function incrementalSync(
  token: string,
  onProgress?: SyncProgressCallback,
): Promise<void> {
  const state = loadSyncState();

  if (!state.latestHistoryId) {
    // Never synced before — fall back to initial sync
    return initialSync(token, onProgress);
  }

  // Collect all new message IDs from history
  const allIds: string[] = [];
  let pageToken: string | undefined;
  let newHistoryId = state.latestHistoryId;

  do {
    onProgress?.({ phase: 'listing', current: allIds.length, total: 0 });
    const result = await listHistory(token, state.latestHistoryId, pageToken);
    allIds.push(...result.messageIds);
    pageToken = result.nextPageToken;
    newHistoryId = result.historyId;
  } while (pageToken);

  // Deduplicate and filter existing
  const uniqueIds = [...new Set(allIds)];
  const newIds = await filterNewIds(uniqueIds);

  if (newIds.length === 0) {
    saveSyncState({
      ...state,
      latestHistoryId: newHistoryId,
      lastSyncedAt: new Date().toISOString(),
    });
    onProgress?.({ phase: 'storing', current: 0, total: 0 });
    return;
  }

  const stored = await fetchAndStore(token, newIds, onProgress);

  saveSyncState({
    ...state,
    latestHistoryId: newHistoryId,
    totalFetched: (state.totalFetched || 0) + stored,
    lastSyncedAt: new Date().toISOString(),
  });
}

/**
 * Load older emails: extend the sync window by another 30 days.
 * Fetches the 30-day window before the current oldestFetchedDate.
 */
export async function loadOlderEmails(
  token: string,
  onProgress?: SyncProgressCallback,
): Promise<void> {
  const state = loadSyncState();
  const oldestDate = state.oldestFetchedDate
    ? new Date(state.oldestFetchedDate)
    : daysAgo(DAYS_PER_WINDOW);

  const windowEnd = new Date(oldestDate);
  const windowStart = new Date(oldestDate);
  windowStart.setDate(windowStart.getDate() - DAYS_PER_WINDOW);

  const query = `after:${formatGmailDate(windowStart)} before:${formatGmailDate(windowEnd)}`;

  // List message IDs in this window
  const allIds: string[] = [];
  let pageToken: string | undefined;

  do {
    onProgress?.({ phase: 'listing', current: allIds.length, total: 0 });
    const result = await listMessages(token, query, pageToken);
    allIds.push(...result.messages.map((m) => m.id));
    pageToken = result.nextPageToken;
  } while (pageToken);

  const newIds = await filterNewIds(allIds);
  const stored = await fetchAndStore(token, newIds, onProgress);

  saveSyncState({
    ...state,
    oldestFetchedDate: windowStart.toISOString(),
    totalFetched: (state.totalFetched || 0) + stored,
    lastSyncedAt: new Date().toISOString(),
  });
}

/**
 * Check if an initial sync has been completed.
 */
export function hasSyncedBefore(): boolean {
  const state = loadSyncState();
  return !!state.latestHistoryId;
}

/**
 * Get the persisted sync state for display in the UI.
 */
export function getSyncState(): PersistedSyncState {
  return loadSyncState();
}
