export const CHART_TYPES = ["bar", "line", "area", "pie"] as const
export type ChartType = (typeof CHART_TYPES)[number]

export interface ChartSpec {
  type: ChartType
  title: string
  sql: string
  xKey: string
  yKeys: string[]
}
