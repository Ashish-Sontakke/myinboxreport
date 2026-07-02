/// <reference lib="webworker" />
import type { WorkerRequest, WorkerResponse } from "./protocol"

// The sqlite-wasm package cannot be bundled by Turbopack, so the worker loads
// the self-contained build copied into /public/sqlite by scripts/copy-sqlite.mjs.
// `new Function` keeps the dynamic import invisible to the bundler.
const importDynamic = new Function("u", "return import(u)") as (
  url: string,
) => Promise<{ default: (config?: unknown) => Promise<Sqlite3Static> }>

// Minimal typings for the slice of the sqlite3 API we use — the package's
// own types don't apply since we load it outside the module graph.
interface Sqlite3Static {
  installOpfsSAHPoolVfs(options: {
    name: string
    initialCapacity?: number
  }): Promise<{
    OpfsSAHPoolDb: new (filename: string) => SqliteDb
  }>
}
interface SqliteDb {
  exec(
    options:
      | string
      | {
          sql: string
          bind?: unknown[]
          rowMode?: "object"
          resultRows?: Record<string, unknown>[]
        },
  ): unknown
  changes(): number
}

let db: SqliteDb | null = null

async function open(): Promise<void> {
  if (db) return
  const moduleUrl = new URL("/sqlite/sqlite3.mjs", self.location.origin).href
  const { default: sqlite3InitModule } = await importDynamic(moduleUrl)
  const sqlite3 = await sqlite3InitModule()
  // initialCapacity 4 (default 6): we open exactly one database, so we only
  // need handles for the db file + journal. Some embedded Chromium builds cap
  // concurrently-writable sync access handles at 5 — the default of 6 makes
  // one pool handle silently unwritable there (writes return a wrapped errno
  // → SQLITE_IOERR).
  const poolUtil = await sqlite3.installOpfsSAHPoolVfs({
    name: "mir",
    initialCapacity: 4,
  })
  db = new poolUtil.OpfsSAHPoolDb("/myinboxreport.db")
}

function post(response: WorkerResponse): void {
  self.postMessage(response)
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data
  try {
    if (req.op === "open") {
      await open()
      post({ id: req.id, ok: true })
      return
    }

    if (!db) throw new Error("Database not open")

    if (req.op === "exec") {
      const rows: Record<string, unknown>[] = []
      db.exec({
        sql: req.sql,
        ...(req.params && req.params.length > 0 ? { bind: req.params } : {}),
        rowMode: "object",
        resultRows: rows,
      })
      post({ id: req.id, ok: true, rows, changes: db.changes() })
    } else if (req.op === "script") {
      db.exec(req.sql)
      post({ id: req.id, ok: true })
    }
  } catch (err) {
    post({
      id: req.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
