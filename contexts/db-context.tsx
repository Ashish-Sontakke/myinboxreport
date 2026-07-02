"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getDb, type Db } from "@/lib/db/client"
import { registerLogSink, log } from "@/lib/log"

const DbContext = createContext<Db | null>(null)

const LOG_CAP = 600
const LOG_TRIM = 100

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"opening" | "ready" | "error">("opening")
  const [errorMessage, setErrorMessage] = useState("")
  const [dbInstance, setDbInstance] = useState<Db | null>(null)

  useEffect(() => {
    let cancelled = false

    getDb()
      .then((db) => {
        if (cancelled) return
        setDbInstance(db)

        let writesSinceTrim = 0
        registerLogSink((entry) => {
          void (async () => {
            try {
              await db.exec(
                `INSERT INTO _activity_log (ts, level, area, message, detail) VALUES (?, ?, ?, ?, ?)`,
                [entry.ts, entry.level, entry.area, entry.message, entry.detail ?? null],
              )
              if (++writesSinceTrim >= LOG_TRIM) {
                writesSinceTrim = 0
                await db.exec(
                  `DELETE FROM _activity_log WHERE id IN (
                     SELECT id FROM _activity_log ORDER BY ts DESC LIMIT -1 OFFSET ?
                   )`,
                  [LOG_CAP],
                )
              }
            } catch {
              /* never break the app over logging */
            }
          })()
        })

        log("info", "db", "Database ready")
        setState("ready")
      })
      .catch((err) => {
        if (cancelled) return
        setErrorMessage(err instanceof Error ? err.message : String(err))
        setState("error")
      })

    return () => {
      cancelled = true
      registerLogSink(null)
    }
  }, [])

  if (state === "opening") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Alert02Icon} />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t open your database</EmptyTitle>
            <EmptyDescription>
              MyInboxReport is probably open in another tab — your data can
              only be opened by one tab at a time. Close the other tab, then
              try again. If you&apos;re in a private/incognito window, browser
              storage is restricted there — use a normal window.
              {errorMessage && (
                <span className="mt-2 block font-mono text-xs">{errorMessage}</span>
              )}
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </Empty>
      </div>
    )
  }

  return <DbContext.Provider value={dbInstance}>{children}</DbContext.Provider>
}

export function useDb(): Db {
  const db = useContext(DbContext)
  if (!db) {
    throw new Error("useDb must be used within a DbProvider (after it is ready)")
  }
  return db
}
