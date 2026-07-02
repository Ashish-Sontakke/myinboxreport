export type LogLevel = "info" | "warn" | "error"

export type LogArea = "sync" | "auth" | "agent" | "extract" | "db" | "app"

export interface LogEntry {
  ts: number
  level: LogLevel
  area: LogArea
  message: string
  detail?: string
}

type LogSink = (entry: LogEntry) => void

let sink: LogSink | null = null

/**
 * Register a sink that persists log entries (the DbProvider registers one
 * that writes into the _activity_log table once the database is open).
 * Entries logged before registration are only mirrored to the console.
 */
export function registerLogSink(fn: LogSink | null): void {
  sink = fn
}

/** Structured app logging: console mirror + optional persistent sink. Never throws. */
export function log(
  level: LogLevel,
  area: LogArea,
  message: string,
  detail?: string,
): void {
  const consoleFn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info
  consoleFn(`[${area}] ${message}`, detail ?? "")

  try {
    sink?.({ ts: Date.now(), level, area, message, detail })
  } catch {
    /* logging must never break the app */
  }
}
