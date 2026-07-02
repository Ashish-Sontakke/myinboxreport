"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  Database01Icon,
  Pin02Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ChartSpec } from "@/lib/agent/types"
import { ChartCard } from "./chart-card"

type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied"

function PendingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <Spinner className="size-3" />
      <span>{label}</span>
    </div>
  )
}

export function ToolErrorAlert({ errorText }: { errorText?: string }) {
  return (
    <Alert variant="destructive" className="max-w-xl">
      <AlertTitle>Tool failed</AlertTitle>
      <AlertDescription className="font-mono text-xs break-words">
        {errorText ?? "Unknown error"}
      </AlertDescription>
    </Alert>
  )
}

/** Collapsed monospace card for run_sql: SQL + row count, expandable rows. */
export function RunSqlPart({
  state,
  input,
  output,
  errorText,
}: {
  state: ToolState
  input?: { sql?: string; purpose?: string }
  output?: {
    rows?: Record<string, unknown>[]
    rowCount?: number
    truncated?: boolean
    changes?: number
    error?: string
  }
  errorText?: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (state === "input-streaming" || state === "input-available") {
    return <PendingRow label={input?.purpose ?? "Running SQL…"} />
  }
  if (state === "output-error") {
    return <ToolErrorAlert errorText={errorText} />
  }

  const failed = output?.error
  const rows = output?.rows ?? []
  const summary = failed
    ? "query failed"
    : rows.length > 0
      ? `${output?.rowCount} row${output?.rowCount === 1 ? "" : "s"}${output?.truncated ? " (truncated)" : ""}`
      : `${output?.changes ?? 0} change${output?.changes === 1 ? "" : "s"}`

  return (
    <div className="w-full max-w-xl border bg-muted/30">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
      >
        <HugeiconsIcon
          icon={Database01Icon}
          className="size-3 shrink-0 text-muted-foreground"
        />
        <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {input?.sql ?? ""}
        </code>
        <span
          className={cn(
            "shrink-0 font-mono text-[11px]",
            failed ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {summary}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-3 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="border-t">
          <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px] whitespace-pre-wrap text-muted-foreground">
            {input?.sql}
          </pre>
          {failed && (
            <p className="border-t px-3 py-2 font-mono text-[11px] text-destructive">
              {failed}
            </p>
          )}
          {rows.length > 0 && (
            <div className="max-h-64 overflow-auto border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(rows[0]).map((key) => (
                      <TableHead key={key} className="font-mono text-[11px]">
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 50).map((row, i) => (
                    <TableRow key={i}>
                      {Object.keys(rows[0]).map((key) => (
                        <TableCell key={key} className="font-mono text-[11px]">
                          {String(row[key] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function RenderChartPart({
  state,
  output,
  errorText,
}: {
  state: ToolState
  output?: {
    spec?: ChartSpec
    rows?: Record<string, unknown>[]
    error?: string
  }
  errorText?: string
}) {
  if (state === "input-streaming" || state === "input-available") {
    return <PendingRow label="Building chart…" />
  }
  if (state === "output-error") {
    return <ToolErrorAlert errorText={errorText} />
  }
  if (output?.error || !output?.spec) {
    return (
      <p className="font-mono text-[11px] text-destructive">
        Chart failed: {output?.error ?? "no spec returned"}
      </p>
    )
  }
  return <ChartCard spec={output.spec} rows={output.rows ?? []} />
}

/** Small confirmation card for define_extraction / pin_to_dashboard. */
export function ConfirmationPart({
  state,
  label,
  errorText,
  error,
}: {
  state: ToolState
  label: string
  errorText?: string
  error?: string
}) {
  if (state === "input-streaming" || state === "input-available") {
    return <PendingRow label="Working…" />
  }
  if (state === "output-error") {
    return <ToolErrorAlert errorText={errorText} />
  }
  if (error) {
    return (
      <p className="font-mono text-[11px] text-destructive">{error}</p>
    )
  }
  return (
    <div className="flex w-fit items-center gap-2 border bg-muted/30 px-3 py-1.5 text-xs">
      <HugeiconsIcon icon={Tick01Icon} className="size-3 text-primary" />
      <span>{label}</span>
    </div>
  )
}

export function PinnedPart({ title }: { title: string }) {
  return (
    <div className="flex w-fit items-center gap-2 border bg-muted/30 px-3 py-1.5 text-xs">
      <HugeiconsIcon icon={Pin02Icon} className="size-3 text-primary" />
      <span>Pinned “{title}” to your dashboard</span>
    </div>
  )
}
