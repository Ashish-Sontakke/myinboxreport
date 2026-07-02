import type { WorkerRequest, WorkerResponse } from "./protocol"
import { migrate } from "./migrations"

export interface Db {
  /** Run a single SELECT-like statement and get typed rows back. */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
  /** Run a single statement; returns rows (if any) and affected-row count. */
  exec(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: Record<string, unknown>[]; changes: number }>
  /** Run a multi-statement script (DDL). No rows returned. */
  execScript(sql: string): Promise<void>
}

let dbPromise: Promise<Db> | null = null

/**
 * Open (once) the SQLite database in its worker, run migrations, and return
 * the promise-RPC client. Browser-only. On failure the promise is cleared so
 * a later call can retry (e.g. after the other tab holding the OPFS lock
 * closes).
 */
export function getDb(): Promise<Db> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("getDb() is browser-only"))
  }
  if (!dbPromise) {
    dbPromise = init().catch((err) => {
      dbPromise = null
      throw err
    })
  }
  return dbPromise
}

async function init(): Promise<Db> {
  const worker = new Worker(new URL("./sqlite-worker.ts", import.meta.url), {
    type: "module",
  })

  const pending = new Map<number, (response: WorkerResponse) => void>()
  let nextId = 1

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const resolve = pending.get(event.data.id)
    if (resolve) {
      pending.delete(event.data.id)
      resolve(event.data)
    }
  }

  type CallRequest =
    | { op: "open" }
    | { op: "exec"; sql: string; params?: unknown[] }
    | { op: "script"; sql: string }

  async function call(
    req: CallRequest,
  ): Promise<Extract<WorkerResponse, { ok: true }>> {
    const response = await new Promise<WorkerResponse>((resolve) => {
      const id = nextId++
      pending.set(id, resolve)
      worker.postMessage({ ...req, id } satisfies WorkerRequest)
    })
    if (!response.ok) throw new Error(response.error)
    return response
  }

  await call({ op: "open" })

  const db: Db = {
    async query<T>(sql: string, params?: unknown[]) {
      const res = await call({ op: "exec", sql, params })
      return (res.rows ?? []) as T[]
    },
    async exec(sql: string, params?: unknown[]) {
      const res = await call({ op: "exec", sql, params })
      return { rows: res.rows ?? [], changes: res.changes ?? 0 }
    },
    async execScript(sql: string) {
      await call({ op: "script", sql })
    },
  }

  await migrate(db)
  return db
}
