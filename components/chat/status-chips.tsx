"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { useAIStatus } from "@/contexts/ai-status-context"
import { useExtraction } from "@/contexts/extraction-context"
import { cn } from "@/lib/utils"

/** Compact AI status dot with a details popover. */
export function AIStatusChip({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { status, config, models, modelMissing, lastError, refresh } = useAIStatus()

  const dot =
    status === "connected"
      ? modelMissing
        ? "bg-amber-500"
        : "bg-primary"
      : status === "checking"
        ? "bg-muted-foreground/50 animate-pulse"
        : "bg-destructive"

  const label =
    status === "connected"
      ? modelMissing
        ? "model missing"
        : config.model
      : status === "checking"
        ? "checking…"
        : "AI offline"

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-2 px-2 font-mono text-[11px]" />
        }
      >
        <span className={cn("size-1.5 rounded-full", dot)} />
        <span className="hidden max-w-40 truncate normal-case sm:inline">{label}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-72 flex-col gap-3 text-sm">
        <div className="flex flex-col gap-1 text-muted-foreground">
          <p>
            Model: <span className="text-foreground">{config.model}</span>
          </p>
          <p>
            Ollama: <span className="text-foreground">{config.baseUrl}</span>
          </p>
          {status === "connected" && <p>{models.length} models available</p>}
          {status === "disconnected" && (
            <p className="text-destructive">
              {lastError ?? "Not reachable"} — is <code>ollama serve</code>{" "}
              running?
            </p>
          )}
          {modelMissing && (
            <p className="text-amber-600 dark:text-amber-400">
              {config.model} is not pulled on this Ollama instance.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="xs" onClick={() => void refresh()}>
            <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
            Check
          </Button>
          <Button variant="outline" size="xs" onClick={onOpenSettings}>
            Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Extraction progress chip: spinner while running, failure count otherwise. */
export function ExtractionChip() {
  const { running, pending, failed, retryFailed, stop } = useExtraction()

  if (running) {
    return (
      <Badge variant="secondary" className="gap-1.5 font-mono text-[11px]">
        <Spinner className="size-2.5" />
        extracting · {pending} left
        <button
          type="button"
          onClick={stop}
          className="ml-0.5 underline-offset-2 hover:underline"
        >
          stop
        </button>
      </Badge>
    )
  }

  if (failed > 0) {
    return (
      <Badge variant="destructive" className="gap-1.5 font-mono text-[11px]">
        {failed} failed
        <button
          type="button"
          onClick={() => void retryFailed()}
          className="underline-offset-2 hover:underline"
        >
          retry
        </button>
      </Badge>
    )
  }

  return null
}
