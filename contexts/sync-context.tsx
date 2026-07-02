"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useAuth } from "./auth-context"
import { useDb } from "./db-context"
import {
  incrementalSync,
  initialSync,
  loadOlderEmails,
  loadSyncState,
  type SyncProgress,
  type SyncState,
} from "@/lib/gmail/sync"

interface SyncContextState {
  /** Emails currently stored (refreshed after each sync and on a slow poll). */
  emailCount: number
  hasSynced: boolean
  syncState: SyncState | null
  syncing: boolean
  progress: SyncProgress | null
  error: string | null
  startInitial: (days: number) => Promise<void>
  refresh: () => Promise<void>
  loadOlder: (days?: number) => Promise<void>
  /** Re-read counts/state from the database (e.g. after clearing data). */
  reload: () => Promise<void>
}

const SyncContext = createContext<SyncContextState | null>(null)

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const db = useDb()
  const { ensureToken } = useAuth()

  const [emailCount, setEmailCount] = useState(0)
  const [syncState, setSyncState] = useState<SyncState | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const rows = await db.query<{ n: number }>(
      `SELECT COUNT(*) AS n FROM _raw_emails`,
    )
    setEmailCount(rows[0]?.n ?? 0)
    setSyncState(await loadSyncState(db))
  }, [db])

  useEffect(() => {
    // Initial async data load — setState happens after awaits, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
  }, [reload])

  const run = useCallback(
    async (action: (token: string) => Promise<void>) => {
      setSyncing(true)
      setError(null)
      try {
        const token = await ensureToken()
        await action(token)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sync failed")
      } finally {
        setSyncing(false)
        setProgress(null)
        await reload()
      }
    },
    [ensureToken, reload],
  )

  const startInitial = useCallback(
    (days: number) => run((token) => initialSync(db, token, days, setProgress)),
    [run, db],
  )

  const refresh = useCallback(
    () => run((token) => incrementalSync(db, token, setProgress)),
    [run, db],
  )

  const loadOlder = useCallback(
    (days?: number) =>
      run((token) => loadOlderEmails(db, token, days, setProgress)),
    [run, db],
  )

  const value = useMemo<SyncContextState>(
    () => ({
      emailCount,
      hasSynced: !!syncState?.latestHistoryId,
      syncState,
      syncing,
      progress,
      error,
      startInitial,
      refresh,
      loadOlder,
      reload,
    }),
    [emailCount, syncState, syncing, progress, error, startInitial, refresh, loadOlder, reload],
  )

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

export function useSync(): SyncContextState {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider")
  }
  return context
}
