import type { GmailMessage } from "./types"

const BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me"
const MAX_RETRIES = 3
const CONCURRENCY_LIMIT = 10

export class AuthExpiredError extends Error {
  constructor() {
    super("Gmail access token has expired. Please sign in again.")
    this.name = "AuthExpiredError"
  }
}

export class GmailApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "GmailApiError"
    this.status = status
  }
}

async function gmailFetch(
  token: string,
  path: string,
  retries = MAX_RETRIES,
): Promise<Response> {
  const url = `${BASE_URL}${path}`

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) return res

    if (res.status === 401) {
      throw new AuthExpiredError()
    }

    if (res.status === 429 && attempt < retries) {
      // Exponential backoff: 1s, 2s, 4s
      await sleep(1000 * 2 ** attempt)
      continue
    }

    const body = await res.text().catch(() => "")
    throw new GmailApiError(res.status, `Gmail API ${res.status}: ${body}`)
  }

  throw new GmailApiError(500, "Max retries exceeded")
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface ListMessagesResponse {
  messages?: { id: string; threadId: string }[]
  nextPageToken?: string
}

/** List message IDs matching a Gmail search query. */
export async function listMessages(
  token: string,
  query: string,
  pageToken?: string,
  maxResults: number = 100,
): Promise<{
  messages: { id: string; threadId: string }[]
  nextPageToken?: string
}> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  })
  if (pageToken) params.set("pageToken", pageToken)

  const res = await gmailFetch(token, `/messages?${params}`)
  const data: ListMessagesResponse = await res.json()

  return {
    messages: data.messages ?? [],
    nextPageToken: data.nextPageToken,
  }
}

/** Fetch a single message by ID. */
export async function getMessage(
  token: string,
  messageId: string,
  format: "full" | "metadata" | "minimal" = "full",
): Promise<GmailMessage> {
  const params = new URLSearchParams({ format })
  const res = await gmailFetch(token, `/messages/${messageId}?${params}`)
  return res.json()
}

/**
 * Fetch multiple messages concurrently with a concurrency limit.
 * Uses Promise.allSettled so one failure doesn't abort the batch.
 */
export async function batchGetMessages(
  token: string,
  messageIds: string[],
): Promise<GmailMessage[]> {
  const results: GmailMessage[] = []
  const chunks = chunkArray(messageIds, CONCURRENCY_LIMIT)

  for (const chunk of chunks) {
    const settled = await Promise.allSettled(
      chunk.map((id) => getMessage(token, id)),
    )
    for (const result of settled) {
      if (result.status === "fulfilled") {
        results.push(result.value)
      }
      // Failed individual messages are skipped; callers compare counts.
    }
  }

  return results
}

interface HistoryRecord {
  id: string
  messagesAdded?: { message: { id: string; threadId: string } }[]
}

interface ListHistoryResponse {
  history?: HistoryRecord[]
  nextPageToken?: string
  historyId: string
}

/** List message IDs added since a given historyId (incremental sync). */
export async function listHistory(
  token: string,
  startHistoryId: string,
  pageToken?: string,
): Promise<{ messageIds: string[]; nextPageToken?: string; historyId: string }> {
  const params = new URLSearchParams({
    startHistoryId,
    historyTypes: "messageAdded",
    maxResults: "500",
  })
  if (pageToken) params.set("pageToken", pageToken)

  const res = await gmailFetch(token, `/history?${params}`)
  const data: ListHistoryResponse = await res.json()

  const messageIds: string[] = []
  for (const record of data.history ?? []) {
    for (const added of record.messagesAdded ?? []) {
      messageIds.push(added.message.id)
    }
  }

  return {
    messageIds,
    nextPageToken: data.nextPageToken,
    historyId: data.historyId,
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
