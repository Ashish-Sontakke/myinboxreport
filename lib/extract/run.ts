import { generateText, Output, type LanguageModel } from "ai"

import type { Db } from "@/lib/db/client"
import { log } from "@/lib/log"
import {
  buildExtractionPrompt,
  loadSpecs,
  specsToZod,
  type ExtractionSpec,
} from "./spec"

export interface ExtractProgress {
  done: number
  failed: number
  currentSubject?: string
}

const CHUNK_SIZE = 10
const CONSECUTIVE_FAILURE_LIMIT = 5

interface PendingEmail {
  id: string
  from_addr: string
  subject: string
  date: number
  snippet: string
  body_text: string
}

async function extractOne(
  db: Db,
  model: LanguageModel,
  specs: ExtractionSpec[],
  email: PendingEmail,
): Promise<void> {
  const schema = specsToZod(specs)
  const { output } = await generateText({
    model,
    output: Output.object({ schema }),
    prompt: buildExtractionPrompt(specs, email),
    temperature: 0,
  })

  const now = Date.now()
  for (const spec of specs) {
    const row = (output as Record<string, Record<string, unknown> | null>)[
      spec.tableName
    ]
    // Idempotent per email: replace any previous rows from this email.
    await db.exec(`DELETE FROM ${spec.tableName} WHERE email_id = ?`, [email.id])
    if (!row) continue

    const cols = spec.columns.map((c) => c.name)
    const placeholders = cols.map(() => "?").join(", ")
    await db.exec(
      `INSERT INTO ${spec.tableName} (email_id, extracted_at, ${cols.join(", ")})
       VALUES (?, ?, ${placeholders})`,
      [email.id, now, ...cols.map((c) => row[c] ?? null)],
    )
  }

  await db.exec(
    `UPDATE _raw_emails SET extraction_status = 'done', extraction_error = NULL, extracted_at = ? WHERE id = ?`,
    [now, email.id],
  )
}

/**
 * Extract ALL pending emails, newest first, until none remain or the signal
 * aborts. One structured-output call per email across all specs. Failures are
 * recorded per email and never silently dropped. If the first
 * CONSECUTIVE_FAILURE_LIMIT attempts all fail, stops with stopped=true.
 */
export async function runExtractionPass(
  db: Db,
  model: LanguageModel,
  opts: { signal: AbortSignal; onProgress?: (p: ExtractProgress) => void },
): Promise<{ done: number; failed: number; stopped: boolean }> {
  const specs = await loadSpecs(db)
  if (specs.length === 0) return { done: 0, failed: 0, stopped: false }

  let done = 0
  let failed = 0
  let attempts = 0
  let consecutiveFailures = 0

  log("info", "extract", "Extraction pass started")

  while (!opts.signal.aborted) {
    const chunk = await db.query<PendingEmail>(
      `SELECT id, from_addr, subject, date, snippet, body_text
       FROM _raw_emails WHERE extraction_status = 'pending'
       ORDER BY date DESC LIMIT ${CHUNK_SIZE}`,
    )
    if (chunk.length === 0) break

    for (const email of chunk) {
      if (opts.signal.aborted) break
      opts.onProgress?.({ done, failed, currentSubject: email.subject })
      attempts++
      try {
        await extractOne(db, model, specs, email)
        done++
        consecutiveFailures = 0
      } catch (err) {
        failed++
        consecutiveFailures++
        const message = err instanceof Error ? err.message : String(err)
        await db.exec(
          `UPDATE _raw_emails SET extraction_status = 'failed', extraction_error = ?, extracted_at = ? WHERE id = ?`,
          [message, Date.now(), email.id],
        )
        log("error", "extract", `Failed on "${email.subject}"`, message)
      }

      if (
        attempts === consecutiveFailures &&
        consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT
      ) {
        log(
          "error",
          "extract",
          `Extraction paused: the first ${CONSECUTIVE_FAILURE_LIMIT} attempts all failed — check the AI model settings`,
        )
        return { done, failed, stopped: true }
      }
    }
  }

  opts.onProgress?.({ done, failed })
  log(
    "info",
    "extract",
    `Extraction pass finished: ${done} done, ${failed} failed${opts.signal.aborted ? " (stopped early)" : ""}`,
  )
  return { done, failed, stopped: false }
}

/** Re-queue failed emails so the worker retries them. */
export async function retryFailed(db: Db): Promise<number> {
  const { changes } = await db.exec(
    `UPDATE _raw_emails SET extraction_status = 'pending', extraction_error = NULL WHERE extraction_status = 'failed'`,
  )
  if (changes > 0) log("info", "extract", `Re-queued ${changes} failed emails`)
  return changes
}
