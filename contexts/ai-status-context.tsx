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

import {
  fetchOllamaModels,
  loadAIConfig,
  saveAIConfig,
  type AIConfig,
  type OllamaModel,
} from "@/lib/ai/settings"
import { log } from "@/lib/log"

export type AIStatus = "checking" | "connected" | "disconnected"

interface AIStatusState {
  status: AIStatus
  models: OllamaModel[]
  /** True when the configured model is not among the available models. */
  modelMissing: boolean
  config: AIConfig
  lastCheckedAt: number | null
  lastError: string | null
  updateConfig: (config: AIConfig) => void
  refresh: () => Promise<void>
}

const AIStatusContext = createContext<AIStatusState | null>(null)

const POLL_INTERVAL_MS = 15_000
const CHECK_TIMEOUT_MS = 3_000

export function AIStatusProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIConfig>(() => loadAIConfig())
  const [status, setStatus] = useState<AIStatus>("checking")
  const [models, setModels] = useState<OllamaModel[]>([])
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  const check = useCallback(async (cfg: AIConfig) => {
    try {
      const result = await fetchOllamaModels(
        cfg.baseUrl,
        AbortSignal.timeout(CHECK_TIMEOUT_MS),
      )
      setModels(result)
      setStatus("connected")
      setLastError(null)
    } catch (err) {
      setModels([])
      setStatus("disconnected")
      setLastError(err instanceof Error ? err.message : String(err))
    } finally {
      setLastCheckedAt(Date.now())
    }
  }, [])

  const refresh = useCallback(() => check(config), [check, config])

  // Poll while the tab is visible; re-check immediately on regaining focus.
  useEffect(() => {
    // Initial async availability check — setState happens after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void check(config)

    const interval = setInterval(() => {
      if (!document.hidden) void check(config)
    }, POLL_INTERVAL_MS)

    const onVisible = () => {
      if (!document.hidden) void check(config)
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [check, config])

  // Log status transitions only — never per-poll.
  const prevStatus = useRef<AIStatus>("checking")
  useEffect(() => {
    if (status === prevStatus.current || status === "checking") return
    if (status === "connected") {
      log("info", "agent", `Ollama connected (${models.length} models)`)
    } else {
      log("warn", "agent", "Ollama disconnected", lastError ?? undefined)
    }
    prevStatus.current = status
  }, [status, models.length, lastError])

  const updateConfig = useCallback((next: AIConfig) => {
    saveAIConfig(next)
    setConfig(next)
    setStatus("checking")
    // The polling effect re-runs on config change and checks immediately.
  }, [])

  const modelMissing =
    status === "connected" &&
    models.length > 0 &&
    !models.some((m) => m.name === config.model)

  const value = useMemo<AIStatusState>(
    () => ({
      status,
      models,
      modelMissing,
      config,
      lastCheckedAt,
      lastError,
      updateConfig,
      refresh,
    }),
    [status, models, modelMissing, config, lastCheckedAt, lastError, updateConfig, refresh],
  )

  return (
    <AIStatusContext.Provider value={value}>{children}</AIStatusContext.Provider>
  )
}

export function useAIStatus(): AIStatusState {
  const context = useContext(AIStatusContext)
  if (!context) {
    throw new Error("useAIStatus must be used within an AIStatusProvider")
  }
  return context
}
