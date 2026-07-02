"use client"

import { useCallback, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartHistogramIcon, PinOffIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useDb } from "@/contexts/db-context"
import type { ChartSpec } from "@/lib/agent/types"
import { ChartCard } from "@/components/chat/chart-card"

interface Pin {
  id: number
  title: string
  spec: ChartSpec
  rows: Record<string, unknown>[]
  error?: string
}

export function PinnedCharts() {
  const db = useDb()
  const [pins, setPins] = useState<Pin[] | null>(null)

  const load = useCallback(async () => {
    const rows = await db.query<{ id: number; title: string; chart_json: string }>(
      `SELECT id, title, chart_json FROM _pins ORDER BY created_at DESC`,
    )
    const loaded: Pin[] = []
    for (const row of rows) {
      try {
        const spec: ChartSpec = JSON.parse(row.chart_json)
        try {
          const data = await db.query(spec.sql)
          loaded.push({ id: row.id, title: row.title, spec, rows: data.slice(0, 200) })
        } catch (err) {
          loaded.push({
            id: row.id,
            title: row.title,
            spec,
            rows: [],
            error: err instanceof Error ? err.message : String(err),
          })
        }
      } catch {
        /* corrupt pin — skip */
      }
    }
    setPins(loaded)
  }, [db])

  useEffect(() => {
    // Initial async data load — setState happens after awaits, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const unpin = async (id: number) => {
    await db.exec(`DELETE FROM _pins WHERE id = ?`, [id])
    await load()
  }

  if (pins === null) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner className="size-4" />
      </div>
    )
  }

  if (pins.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={ChartHistogramIcon} />
            </EmptyMedia>
            <EmptyTitle>Nothing pinned yet</EmptyTitle>
            <EmptyDescription>
              Ask for a chart in the chat, then pin it — it will live here and
              refresh from your data every time you open this tab.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 overflow-y-auto p-4 sm:grid-cols-2">
      {pins.map((pin) => (
        <div key={pin.id} className="relative">
          {pin.error ? (
            <div className="border bg-card p-4">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                {pin.title}
              </p>
              <p className="mt-2 font-mono text-xs text-destructive">
                Query failed: {pin.error}
              </p>
            </div>
          ) : (
            <ChartCard spec={pin.spec} rows={pin.rows} pinnable={false} />
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-0.5 right-0.5"
            onClick={() => void unpin(pin.id)}
            aria-label={`Unpin ${pin.title}`}
          >
            <HugeiconsIcon icon={PinOffIcon} />
          </Button>
        </div>
      ))}
    </div>
  )
}
