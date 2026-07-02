import { z } from "zod"

import type { Db } from "@/lib/db/client"

export interface SpecColumn {
  name: string
  type: "text" | "integer" | "real"
  description: string
  enumValues?: string[]
}

export interface ExtractionSpec {
  tableName: string
  description: string
  columns: SpecColumn[]
  promptGuidance: string
}

export async function loadSpecs(db: Db): Promise<ExtractionSpec[]> {
  const rows = await db.query<{
    table_name: string
    description: string
    columns_json: string
    prompt_guidance: string
  }>(`SELECT table_name, description, columns_json, prompt_guidance FROM _extraction_specs`)

  const specs: ExtractionSpec[] = []
  for (const row of rows) {
    try {
      specs.push({
        tableName: row.table_name,
        description: row.description,
        columns: JSON.parse(row.columns_json),
        promptGuidance: row.prompt_guidance ?? "",
      })
    } catch {
      /* skip corrupt spec */
    }
  }
  return specs
}

function columnToZod(col: SpecColumn): z.ZodType {
  let base: z.ZodType
  if (col.enumValues && col.enumValues.length > 0) {
    base = z.enum(col.enumValues as [string, ...string[]])
  } else if (col.type === "integer") {
    base = z.number().int()
  } else if (col.type === "real") {
    base = z.number()
  } else {
    base = z.string()
  }
  return base.nullable().describe(col.description)
}

/**
 * Combined per-email schema across ALL specs — one structured-output call per
 * email regardless of how many concerns exist. null for a concern means "this
 * email is not relevant to it".
 */
export function specsToZod(specs: ExtractionSpec[]) {
  const shape: Record<string, z.ZodType> = {}
  for (const spec of specs) {
    const rowShape: Record<string, z.ZodType> = {}
    for (const col of spec.columns) {
      rowShape[col.name] = columnToZod(col)
    }
    shape[spec.tableName] = z
      .object(rowShape)
      .nullable()
      .describe(`${spec.description}. null if this email is not relevant.`)
  }
  return z.object(shape)
}

export function buildExtractionPrompt(
  specs: ExtractionSpec[],
  email: {
    from_addr: string
    subject: string
    date: number
    snippet: string
    body_text: string
  },
): string {
  const specBlocks = specs
    .map(
      (s) =>
        `### ${s.tableName}\n${s.description}\nGuidance: ${s.promptGuidance}\nColumns: ${s.columns
          .map((c) => `${c.name} (${c.type}${c.enumValues ? `: ${c.enumValues.join("|")}` : ""}) — ${c.description}`)
          .join("; ")}`,
    )
    .join("\n\n")

  const body = (email.body_text || email.snippet || "").slice(0, 4000)

  return `Analyze this email against each tracked concern below. For each concern, return the extracted row, or null if the email is not relevant to it. Extract only facts present in the email — never guess amounts, dates, or names.

${specBlocks}

## Email
From: ${email.from_addr}
Subject: ${email.subject}
Date: ${new Date(email.date).toISOString()}

${body}`
}
