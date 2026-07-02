import type { GmailHeader, GmailMessage, GmailPayload } from "./types"

/** Parsed email fields ready for insertion into _raw_emails. */
export interface ParsedEmail {
  id: string
  threadId: string
  fromAddr: string
  toAddrs: string[]
  subject: string
  date: number // unix epoch ms
  snippet: string
  bodyText: string
  labels: string[]
}

/** Transform a raw Gmail API message into a row for _raw_emails. */
export function parseGmailMessage(msg: GmailMessage): ParsedEmail {
  const headers = msg.payload.headers

  return {
    id: msg.id,
    threadId: msg.threadId,
    fromAddr: extractHeader(headers, "From") ?? "",
    toAddrs: parseAddressList(extractHeader(headers, "To") ?? ""),
    subject: extractHeader(headers, "Subject") ?? "(no subject)",
    date: Number(msg.internalDate),
    snippet: msg.snippet,
    bodyText: extractBody(msg.payload, "text/plain"),
    labels: msg.labelIds ?? [],
  }
}

/** Find a header value by name (case-insensitive). */
export function extractHeader(
  headers: GmailHeader[],
  name: string,
): string | undefined {
  const lower = name.toLowerCase()
  return headers.find((h) => h.name.toLowerCase() === lower)?.value
}

/**
 * Recursively walk a MIME payload tree and extract the body for a given
 * mimeType. Returns the decoded text, or empty string if not found.
 */
export function extractBody(payload: GmailPayload, mimeType: string): string {
  if (payload.mimeType === mimeType && payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = extractBody(part, mimeType)
      if (result) return result
    }
  }

  return ""
}

/** Decode a base64url-encoded string (Gmail's encoding). */
export function decodeBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")

  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    )
  } catch {
    // Fallback for non-UTF-8 content
    try {
      return atob(base64)
    } catch {
      return ""
    }
  }
}

function parseAddressList(raw: string): string[] {
  if (!raw.trim()) return []
  return raw
    .split(",")
    .map((addr) => addr.trim())
    .filter(Boolean)
}
