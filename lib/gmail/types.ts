// Gmail API wire types

export interface GmailMessage {
  id: string
  threadId: string
  historyId: string
  internalDate: string // epoch ms as string
  labelIds: string[]
  snippet: string
  payload: GmailPayload
}

export interface GmailPayload {
  mimeType: string
  headers: GmailHeader[]
  body?: { data?: string; size: number }
  parts?: GmailPayload[]
}

export interface GmailHeader {
  name: string
  value: string
}

/** Row shape of the _raw_emails table (snake_case matches column names). */
export interface RawEmailRow {
  id: string
  thread_id: string
  from_addr: string
  to_addrs: string // JSON array
  subject: string
  date: number // unix epoch ms
  snippet: string
  body_text: string
  labels: string // JSON array
  extraction_status: "pending" | "done" | "failed" | "skipped"
  extraction_error: string | null
  extracted_at: number | null
}
