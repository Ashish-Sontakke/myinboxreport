"use client"

import { useCallback, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, RefreshIcon } from "@hugeicons/core-free-icons"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDb } from "@/contexts/db-context"
import { useExtraction } from "@/contexts/extraction-context"
import { useSync } from "@/contexts/sync-context"
import { clearChatMessages } from "@/lib/chat/persistence"
import { log, type LogEntry } from "@/lib/log"

function fmtDate(ms: number | null | undefined): string {
  if (!ms) return "—"
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function fmtBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${Math.round(bytes / 1e3)} KB`
}

function relTime(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface TableColumn {
  name: string
  type: string
  description: string
}

interface TableInfo {
  name: string
  description: string
  columns: TableColumn[]
  rowCount: number
  ddl: string
}

interface ActivityRow {
  ts: number
  level: LogEntry["level"]
  area: string
  message: string
}

export function DataOverview() {
  const db = useDb()
  const sync = useSync()
  const extraction = useExtraction()

  const [dateRange, setDateRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })
  const [extractedThrough, setExtractedThrough] = useState<number | null>(null)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null)
  const [activity, setActivity] = useState<ActivityRow[]>([])

  const load = useCallback(async () => {
    const [range] = await db.query<{ min: number | null; max: number | null }>(
      `SELECT MIN(date) AS min, MAX(date) AS max FROM _raw_emails`,
    )
    setDateRange(range ?? { min: null, max: null })

    // Extraction runs newest-first, so "extracted through" = oldest done email.
    const [through] = await db.query<{ min: number | null }>(
      `SELECT MIN(date) AS min FROM _raw_emails WHERE extraction_status = 'done'`,
    )
    setExtractedThrough(through?.min ?? null)

    const specRows = await db.query<{
      table_name: string
      description: string
      columns_json: string
    }>(`SELECT table_name, description, columns_json FROM _extraction_specs`)
    const infos: TableInfo[] = []
    for (const spec of specRows) {
      const [count] = await db.query<{ n: number }>(
        `SELECT COUNT(*) AS n FROM "${spec.table_name.replace(/"/g, '""')}"`,
      )
      const [ddl] = await db.query<{ sql: string }>(
        `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?`,
        [spec.table_name],
      )
      let columns: TableColumn[] = []
      try {
        columns = JSON.parse(spec.columns_json)
      } catch {
        /* ignore */
      }
      infos.push({
        name: spec.table_name,
        description: spec.description,
        columns,
        rowCount: count?.n ?? 0,
        ddl: ddl?.sql ?? "",
      })
    }
    setTables(infos)

    try {
      const estimate = await navigator.storage.estimate()
      setStorage({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 })
    } catch {
      setStorage(null)
    }

    const logs = await db.query<ActivityRow>(
      `SELECT ts, level, area, message FROM _activity_log ORDER BY ts DESC LIMIT 100`,
    )
    setActivity(logs)
  }, [db])

  useEffect(() => {
    // Async re-load when counts change — setState happens after awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, sync.emailCount, extraction.pending, extraction.done])

  const clearAll = async () => {
    for (const table of tables) {
      await db.execScript(`DROP TABLE IF EXISTS "${table.name.replace(/"/g, '""')}"`)
    }
    await db.exec(`DELETE FROM _extraction_specs`)
    await db.exec(`DELETE FROM _raw_emails`)
    await db.exec(`DELETE FROM _pins`)
    await db.exec(`DELETE FROM _meta WHERE key = 'sync_state'`)
    await clearChatMessages(db)
    log("info", "app", "All data cleared")
    await sync.reload()
    await extraction.reloadCounts()
    await load()
  }

  const total = extraction.pending + extraction.done + extraction.failed
  const donePercent = total > 0 ? Math.round((extraction.done / total) * 100) : 0

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">
            Tables{tables.length > 0 ? ` (${tables.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          {/* Sync */}
          <Card>
        <CardHeader>
          <CardTitle>Synced emails</CardTitle>
          <CardDescription>
            {sync.emailCount} emails · {fmtDate(dateRange.min)} →{" "}
            {fmtDate(dateRange.max)}
            {sync.syncState?.lastSyncedAt &&
              ` · last synced ${relTime(new Date(sync.syncState.lastSyncedAt).getTime())}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void sync.refresh()}
            disabled={sync.syncing}
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              data-icon="inline-start"
              className={sync.syncing ? "animate-spin" : undefined}
            />
            {sync.syncing ? "Syncing…" : "Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void sync.loadOlder(90)}
            disabled={sync.syncing}
          >
            Load 3 more months
          </Button>
          {sync.error && (
            <p className="w-full text-xs text-destructive">{sync.error}</p>
          )}
        </CardContent>
      </Card>

      {/* Extraction */}
      <Card>
        <CardHeader>
          <CardTitle>Extraction</CardTitle>
          <CardDescription>
            {extraction.specCount === 0
              ? "No tracked concerns yet — set them up in the chat."
              : `${extraction.done} done · ${extraction.pending} pending · ${extraction.failed} failed · extracted through ${fmtDate(extractedThrough)}`}
          </CardDescription>
        </CardHeader>
        {extraction.specCount > 0 && (
          <CardContent className="flex flex-col gap-3">
            <Progress value={donePercent} className="h-1.5" />
            <div className="flex flex-wrap gap-2">
              {extraction.failed > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void extraction.retryFailed()}
                >
                  Retry {extraction.failed} failed
                </Button>
              )}
              {!extraction.running && extraction.pending > 0 && (
                <Button variant="outline" size="sm" onClick={extraction.startNow}>
                  Extract now
                </Button>
              )}
              {extraction.running && (
                <Button variant="outline" size="sm" onClick={extraction.stop}>
                  Stop
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

          {/* Storage */}
          <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>
            {storage
              ? `${fmtBytes(storage.usage)} used in your browser (OPFS). Never uploaded anywhere.`
              : "Stored in your browser (OPFS). Never uploaded anywhere."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" size="sm" />}
            >
              <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
              Clear all data
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently deletes all synced emails, your tables, tracked
                  concerns, pins, and chat history from this browser. You can
                  sync again afterwards. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void clearAll()}>
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="tables" className="mt-4 flex flex-col gap-4">
          {tables.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No tables yet</CardTitle>
                <CardDescription>
                  The agent creates these when you set up tracking in the chat.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {tables.map((table) => (
            <Card key={table.name}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="font-mono">{table.name}</CardTitle>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {table.rowCount} rows
                  </Badge>
                </div>
                <CardDescription>{table.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  {table.columns.map((col) => (
                    <div key={col.name} className="flex items-baseline gap-2 text-xs">
                      <span className="w-36 shrink-0 truncate font-mono font-medium">
                        {col.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground uppercase">
                        {col.type}
                      </span>
                      <span className="text-muted-foreground">{col.description}</span>
                    </div>
                  ))}
                </div>
                <Collapsible>
                  <CollapsibleTrigger className="font-mono text-[11px] text-muted-foreground underline-offset-2 hover:underline">
                    show SQL
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="mt-1 overflow-x-auto border bg-muted/30 p-2 font-mono text-[11px] whitespace-pre-wrap">
                      {table.ddl}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>What the app has been doing, newest first.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {activity.length === 0 && (
                <p className="text-xs text-muted-foreground">Nothing yet.</p>
              )}
              {activity.map((entry, i) => (
                <div key={i} className="flex items-baseline gap-2 text-xs">
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {relTime(entry.ts)}
                  </span>
                  <Badge variant="outline" className="shrink-0 px-1 font-mono text-[9px] uppercase">
                    {entry.area}
                  </Badge>
                  <span
                    className={
                      entry.level === "error"
                        ? "text-destructive"
                        : entry.level === "warn"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                    }
                  >
                    {entry.message}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
