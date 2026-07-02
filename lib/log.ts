export type LogLevel = "info" | "warn" | "error"

export type LogArea = "sync" | "auth" | "agent" | "db" | "app"

/**
 * Structured app logging. Console-only for now — once the SQLite layer
 * exists, entries will also be written to an activity table so the user
 * can audit what the app did.
 */
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
}
