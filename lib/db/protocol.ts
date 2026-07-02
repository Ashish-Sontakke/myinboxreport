export type WorkerRequest =
  | { id: number; op: "open" }
  | { id: number; op: "exec"; sql: string; params?: unknown[] }
  | { id: number; op: "script"; sql: string }

export type WorkerResponse =
  | {
      id: number
      ok: true
      rows?: Record<string, unknown>[]
      changes?: number
    }
  | { id: number; ok: false; error: string }
