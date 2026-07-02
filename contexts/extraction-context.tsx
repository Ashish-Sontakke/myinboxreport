"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { getModel } from "@/lib/ai/provider"
import { loadAIConfig } from "@/lib/ai/settings"
import {
  retryFailed as retryFailedEmails,
  runExtractionPass,
  type ExtractProgress,
} from "@/lib/extract/run"
import { log } from "@/lib/log"
import { useAIStatus } from "./ai-status-context"
import { useDb } from "./db-context"

interface ExtractionCounts {
  pending: number
  done: number
  failed: number
  specCount: number
}

interface ExtractionState extends ExtractionCounts {
  running: boolean
  autoExtract: boolean
  setAutoExtract: (value: boolean) => void
  progress: ExtractProgress | null
  startNow: () => void
  stop: () => void
  retryFailed: () => Promise<void>
  /** Re-read counts (e.g. after the agent defines a new spec). */
  reloadCounts: () => Promise<void>
}

const ExtractionContext = createContext<ExtractionState | null>(null)

const AUTOEXTRACT_KEY = "myinboxreport_autoextract"
const COUNT_POLL_MS = 10_000

function loadAutoExtract(): boolean {
  try {
    return localStorage.getItem(AUTOEXTRACT_KEY) !== "false"
  } catch {
    return true
  }
}

export function ExtractionProvider({ children }: { children: React.ReactNode }) {
  const db = useDb()
  const aiStatus = useAIStatus()

  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<ExtractProgress | null>(null)
  const [autoExtract, setAutoExtractState] = useState<boolean>(() => loadAutoExtract())
  const [counts, setCounts] = useState<ExtractionCounts>({
    pending: 0,
    done: 0,
    failed: 0,
    specCount: 0,
  })

  const runningRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const reloadCounts = useCallback(async () => {
    const [status] = await db.query<{ pending: number; done: number; failed: number }>(
      `SELECT
         SUM(CASE WHEN extraction_status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN extraction_status = 'done' THEN 1 ELSE 0 END) AS done,
         SUM(CASE WHEN extraction_status = 'failed' THEN 1 ELSE 0 END) AS failed
       FROM _raw_emails`,
    )
    const [specs] = await db.query<{ n: number }>(
      `SELECT COUNT(*) AS n FROM _extraction_specs`,
    )
    setCounts({
      pending: status?.pending ?? 0,
      done: status?.done ?? 0,
      failed: status?.failed ?? 0,
      specCount: specs?.n ?? 0,
    })
  }, [db])

  useEffect(() => {
    // Initial async count load — setState happens after awaits, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reloadCounts()
    const interval = setInterval(() => void reloadCounts(), COUNT_POLL_MS)
    return () => clearInterval(interval)
  }, [reloadCounts])

  const setAutoExtract = useCallback((value: boolean) => {
    setAutoExtractState(value)
    try {
      localStorage.setItem(AUTOEXTRACT_KEY, String(value))
    } catch {
      /* ignore */
    }
  }, [])

  const startNow = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    setRunning(true)

    const controller = new AbortController()
    abortRef.current = controller

    void (async () => {
      try {
        const model = getModel(loadAIConfig())
        const result = await runExtractionPass(db, model, {
          signal: controller.signal,
          onProgress: (p) => {
            setProgress(p)
            if ((p.done + p.failed) % CHUNK_REFRESH === 0) void reloadCounts()
          },
        })
        if (result.stopped) {
          // Repeated failures — pause auto-extract to protect the inbox.
          setAutoExtract(false)
        }
      } catch (err) {
        log("error", "extract", "Extraction worker crashed", String(err))
      } finally {
        runningRef.current = false
        setRunning(false)
        setProgress(null)
        abortRef.current = null
        void reloadCounts()
      }
    })()
  }, [db, reloadCounts, setAutoExtract])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const retryFailed = useCallback(async () => {
    await retryFailedEmails(db)
    setAutoExtract(true)
    await reloadCounts()
  }, [db, reloadCounts, setAutoExtract])

  // Auto-start whenever: model connected + specs exist + pending emails.
  useEffect(() => {
    if (
      autoExtract &&
      aiStatus.status === "connected" &&
      !aiStatus.modelMissing &&
      counts.specCount > 0 &&
      counts.pending > 0 &&
      !runningRef.current
    ) {
      startNow()
    }
  }, [autoExtract, aiStatus.status, aiStatus.modelMissing, counts.specCount, counts.pending, startNow])

  // Stop the pass if the model drops mid-run.
  useEffect(() => {
    if (aiStatus.status !== "connected" && runningRef.current) {
      abortRef.current?.abort()
    }
  }, [aiStatus.status])

  const value = useMemo<ExtractionState>(
    () => ({
      ...counts,
      running,
      autoExtract,
      setAutoExtract,
      progress,
      startNow,
      stop,
      retryFailed,
      reloadCounts,
    }),
    [counts, running, autoExtract, setAutoExtract, progress, startNow, stop, retryFailed, reloadCounts],
  )

  return (
    <ExtractionContext.Provider value={value}>{children}</ExtractionContext.Provider>
  )
}

const CHUNK_REFRESH = 5

export function useExtraction(): ExtractionState {
  const context = useContext(ExtractionContext)
  if (!context) {
    throw new Error("useExtraction must be used within an ExtractionProvider")
  }
  return context
}
