"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pin02Icon, Tick01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getDb } from "@/lib/db/client"
import { log } from "@/lib/log"
import type { ChartSpec } from "@/lib/agent/types"

type Row = Record<string, unknown>

function buildConfig(yKeys: string[]): ChartConfig {
  const config: ChartConfig = {}
  yKeys.forEach((key, i) => {
    config[key] = { label: key, color: `var(--chart-${(i % 5) + 1})` }
  })
  return config
}

export function ChartCard({
  spec,
  rows,
  pinnable = true,
}: {
  spec: ChartSpec
  rows: Row[]
  pinnable?: boolean
}) {
  const [pinned, setPinned] = useState(false)
  const config = buildConfig(spec.yKeys)

  const pin = async () => {
    try {
      const db = await getDb()
      await db.exec(
        `INSERT INTO _pins (title, chart_json, created_at) VALUES (?, ?, ?)`,
        [spec.title, JSON.stringify(spec), Date.now()],
      )
      log("info", "agent", `Pinned to dashboard: ${spec.title}`)
      setPinned(true)
    } catch {
      /* surfaced via activity log */
    }
  }

  return (
    <div className="w-full max-w-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b py-1 pr-1 pl-4">
        <span className="truncate font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          {spec.title}
        </span>
        {pinnable && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => void pin()}
            disabled={pinned}
            aria-label="Pin to dashboard"
          >
            <HugeiconsIcon icon={pinned ? Tick01Icon : Pin02Icon} />
          </Button>
        )}
      </div>
      <div className="p-3">
        <ChartContainer config={config} className="h-56 w-full">
          {renderChart(spec, rows)}
        </ChartContainer>
      </div>
    </div>
  )
}

function renderChart(spec: ChartSpec, rows: Row[]) {
  const common = {
    data: rows,
    margin: { left: 4, right: 8, top: 4 },
  }

  switch (spec.type) {
    case "bar":
      return (
        <BarChart {...common}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={spec.xKey} tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} width={44} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {spec.yKeys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
          {spec.yKeys.map((key) => (
            <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={2} />
          ))}
        </BarChart>
      )
    case "line":
      return (
        <LineChart {...common}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={spec.xKey} tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} width={44} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {spec.yKeys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
          {spec.yKeys.map((key) => (
            <Line
              key={key}
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      )
    case "area":
      return (
        <AreaChart {...common}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={spec.xKey} tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} width={44} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {spec.yKeys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
          {spec.yKeys.map((key) => (
            <Area
              key={key}
              dataKey={key}
              stroke={`var(--color-${key})`}
              fill={`var(--color-${key})`}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      )
    case "pie": {
      const yKey = spec.yKeys[0]
      return (
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey={spec.xKey} />} />
          <Pie data={rows} dataKey={yKey} nameKey={spec.xKey} strokeWidth={1}>
            {rows.map((_, i) => (
              <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
            ))}
          </Pie>
        </PieChart>
      )
    }
  }
}
