import { tool } from "ai"
import { z } from "zod"

import { getDb } from "@/lib/db/client"
import { assertSqlAllowed, SqlGuardError } from "@/lib/db/guards"
import { log } from "@/lib/log"
import { CHART_TYPES } from "./types"

const SQL_ROW_CAP = 500
const CHART_ROW_CAP = 200
const IDENTIFIER = /^[a-z][a-z0-9_]*$/

/**
 * Tool errors are returned as output (not thrown) so the model sees them and
 * self-corrects instead of the run dying.
 */
function errorOutput(err: unknown): { error: string } {
  const message =
    err instanceof SqlGuardError
      ? err.message
      : err instanceof Error
        ? err.message
        : String(err)
  return { error: message }
}

export const runSql = tool({
  description:
    "Run SQL against the user's local SQLite database. Use SELECT to answer questions. You may also UPDATE/INSERT/DELETE rows in the user's own tables when the user asks for corrections. App tables (names starting with _) are read-only.",
  inputSchema: z.object({
    sql: z.string().describe("One or more SQL statements, ; separated"),
    purpose: z
      .string()
      .optional()
      .describe("One short sentence: why you are running this"),
  }),
  execute: async ({ sql }) => {
    try {
      assertSqlAllowed(sql)
      const db = await getDb()
      const { rows, changes } = await db.exec(sql)
      const truncated = rows.length > SQL_ROW_CAP
      return {
        rows: truncated ? rows.slice(0, SQL_ROW_CAP) : rows,
        rowCount: rows.length,
        truncated,
        changes,
      }
    } catch (err) {
      return errorOutput(err)
    }
  },
})

export const listSchema = tool({
  description:
    "List the tables in the user's database: names, DDL, and row counts. Call this if you are unsure what exists.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const db = await getDb()
      const tables = await db.query<{ name: string; sql: string }>(
        `SELECT name, sql FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE '\\_%' ESCAPE '\\'
         ORDER BY name`,
      )
      const withCounts = []
      for (const t of tables) {
        const count = await db.query<{ n: number }>(
          `SELECT COUNT(*) AS n FROM "${t.name.replace(/"/g, '""')}"`,
        )
        withCounts.push({ name: t.name, ddl: t.sql, rowCount: count[0]?.n ?? 0 })
      }
      return {
        userTables: withCounts,
        rawEmails: {
          table: "_raw_emails",
          readableColumns:
            "id, thread_id, from_addr, to_addrs (JSON array), subject, date (unix epoch MILLISECONDS), snippet, labels (JSON array), extraction_status",
          note: "Read-only. body_text exists but is large — avoid selecting it.",
        },
      }
    } catch (err) {
      return errorOutput(err)
    }
  },
})

export const sampleEmails = tool({
  description:
    "Look at a small sample of the user's raw emails (sender, subject, date, snippet — never full bodies). Use during onboarding to understand what's in the inbox, or to check what a sender's emails look like.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(50).default(25),
    strategy: z.enum(["recent", "random"]).default("recent"),
    query: z
      .string()
      .optional()
      .describe("Optional filter matched against sender and subject"),
  }),
  execute: async ({ limit, strategy, query }) => {
    try {
      const db = await getDb()
      const where = query
        ? `WHERE from_addr LIKE ? OR subject LIKE ?`
        : ""
      const params = query ? [`%${query}%`, `%${query}%`] : []
      const order = strategy === "random" ? "RANDOM()" : "date DESC"
      const rows = await db.query(
        `SELECT from_addr, subject, date, snippet FROM _raw_emails ${where}
         ORDER BY ${order} LIMIT ${limit}`,
        params,
      )
      return { emails: rows, count: rows.length }
    } catch (err) {
      return errorOutput(err)
    }
  },
})

const columnSchema = z.object({
  name: z.string().describe("snake_case column name"),
  type: z.enum(["text", "integer", "real"]),
  description: z.string().describe("What to extract into this column"),
  enumValues: z
    .array(z.string())
    .optional()
    .describe("If set, the value must be one of these"),
})

export const defineExtraction = tool({
  description:
    "Create (or update) a tracked concern: makes a table with the given columns and registers an extraction spec so every synced email gets analyzed into it in the background. Use narrow, well-described columns. Call once per concern after the user confirms what they want to track.",
  inputSchema: z.object({
    tableName: z
      .string()
      .describe("snake_case plural, e.g. 'orders', 'subscriptions'"),
    description: z
      .string()
      .describe("Plain-language description of what this table tracks"),
    columns: z.array(columnSchema).min(1).max(12),
    promptGuidance: z
      .string()
      .describe(
        "Instructions for the extraction model: what qualifies, what to skip, edge cases",
      ),
  }),
  execute: async ({ tableName, description, columns, promptGuidance }) => {
    try {
      if (!IDENTIFIER.test(tableName) || tableName.startsWith("_")) {
        return {
          error: `Invalid table name "${tableName}": must match ^[a-z][a-z0-9_]*$ and not start with _.`,
        }
      }
      const reserved = new Set(["id", "email_id", "extracted_at"])
      for (const col of columns) {
        if (!IDENTIFIER.test(col.name) || reserved.has(col.name)) {
          return {
            error: `Invalid column name "${col.name}" (reserved or not snake_case).`,
          }
        }
      }

      const db = await getDb()
      const columnDdl = columns
        .map((c) => `  ${c.name} ${c.type.toUpperCase()}`)
        .join(",\n")
      await db.execScript(
        `CREATE TABLE IF NOT EXISTS ${tableName} (
  id INTEGER PRIMARY KEY,
  email_id TEXT NOT NULL,
  extracted_at INTEGER NOT NULL,
${columnDdl}
);
CREATE INDEX IF NOT EXISTS idx_${tableName}_email ON ${tableName}(email_id);`,
      )

      const now = Date.now()
      await db.exec(
        `INSERT INTO _extraction_specs (table_name, description, columns_json, prompt_guidance, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(table_name) DO UPDATE SET
           description = excluded.description,
           columns_json = excluded.columns_json,
           prompt_guidance = excluded.prompt_guidance,
           updated_at = excluded.updated_at`,
        [tableName, description, JSON.stringify(columns), promptGuidance, now, now],
      )

      // Re-queue all emails so the new concern is extracted from history too.
      await db.exec(
        `UPDATE _raw_emails SET extraction_status = 'pending', extraction_error = NULL`,
      )
      const pending = await db.query<{ n: number }>(
        `SELECT COUNT(*) AS n FROM _raw_emails WHERE extraction_status = 'pending'`,
      )

      log("info", "agent", `Extraction spec created: ${tableName}`)
      return {
        created: tableName,
        pendingEmails: pending[0]?.n ?? 0,
        note: "Extraction runs automatically in the background. Data will fill in over time — the user can ask questions right away.",
      }
    } catch (err) {
      return errorOutput(err)
    }
  },
})

export const renderChart = tool({
  description:
    "Render a chart from a SQL query. Use for trends, comparisons, and breakdowns instead of pasting tables of numbers. The SQL must return the xKey column and every yKey column.",
  inputSchema: z.object({
    type: z.enum(CHART_TYPES),
    title: z.string(),
    sql: z.string().describe("SELECT that returns xKey + yKeys columns"),
    xKey: z.string(),
    yKeys: z.array(z.string()).min(1).max(5),
  }),
  execute: async ({ type, title, sql, xKey, yKeys }) => {
    try {
      assertSqlAllowed(sql)
      const db = await getDb()
      const rows = await db.query(sql)
      if (rows.length === 0) {
        return { error: "Query returned no rows — nothing to chart." }
      }
      const missing = [xKey, ...yKeys].filter((k) => !(k in rows[0]))
      if (missing.length > 0) {
        return {
          error: `Query result is missing column(s): ${missing.join(", ")}. Available: ${Object.keys(rows[0]).join(", ")}.`,
        }
      }
      return {
        spec: { type, title, sql, xKey, yKeys },
        rows: rows.slice(0, CHART_ROW_CAP),
        rowCount: rows.length,
      }
    } catch (err) {
      return errorOutput(err)
    }
  },
})

export const pinToDashboard = tool({
  description:
    "Pin a chart to the user's dashboard. Only call when the user asks to pin/save a chart.",
  inputSchema: z.object({
    title: z.string(),
    chart: z.object({
      type: z.enum(CHART_TYPES),
      title: z.string(),
      sql: z.string(),
      xKey: z.string(),
      yKeys: z.array(z.string()).min(1).max(5),
    }),
  }),
  execute: async ({ title, chart }) => {
    try {
      assertSqlAllowed(chart.sql)
      const db = await getDb()
      await db.exec(
        `INSERT INTO _pins (title, chart_json, created_at) VALUES (?, ?, ?)`,
        [title, JSON.stringify(chart), Date.now()],
      )
      log("info", "agent", `Pinned to dashboard: ${title}`)
      return { pinned: title }
    } catch (err) {
      return errorOutput(err)
    }
  },
})

export const agentTools = {
  run_sql: runSql,
  list_schema: listSchema,
  sample_emails: sampleEmails,
  define_extraction: defineExtraction,
  render_chart: renderChart,
  pin_to_dashboard: pinToDashboard,
}
