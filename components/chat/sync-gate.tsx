"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Logo } from "@/components/logo"
import { useSync } from "@/contexts/sync-context"
import { SYNC_RANGE_PRESETS } from "@/lib/gmail/sync"

/** First-run screen: choose a range, sync, watch progress. */
export function SyncGate() {
  const { syncing, progress, error, startInitial } = useSync()
  const [days, setDays] = useState(90)

  const percent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <Logo className="size-8 text-primary" />
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Sync your inbox
          </h2>
          <p className="text-sm text-muted-foreground">
            How far back should we look? Emails are stored only in your
            browser. You can load older mail anytime.
          </p>
        </div>

        <ToggleGroup
          variant="outline"
          value={[String(days)]}
          onValueChange={(value) => {
            const next = value[value.length - 1]
            if (next) setDays(Number(next))
          }}
        >
          {SYNC_RANGE_PRESETS.map((preset) => (
            <ToggleGroupItem key={preset.days} value={String(preset.days)}>
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Button onClick={() => void startInitial(days)} disabled={syncing}>
          <HugeiconsIcon
            icon={RefreshIcon}
            data-icon="inline-start"
            className={syncing ? "animate-spin" : undefined}
          />
          {syncing ? "Syncing…" : "Start sync"}
        </Button>

        {syncing && progress && (
          <div className="flex w-full flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground uppercase">
              <span>{progress.phase}…</span>
              <span>
                {progress.current}
                {progress.total > 0 && ` / ${progress.total}`}
              </span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
