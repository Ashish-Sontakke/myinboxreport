import type { Db } from "@/lib/db/client"
import type { AppUIMessage } from "@/lib/agent/agent"

/** Load the persisted conversation, oldest first. */
export async function loadChatMessages(db: Db): Promise<AppUIMessage[]> {
  const rows = await db.query<{ message_json: string }>(
    `SELECT message_json FROM _chat_messages ORDER BY seq ASC`,
  )
  const messages: AppUIMessage[] = []
  for (const row of rows) {
    try {
      messages.push(JSON.parse(row.message_json))
    } catch {
      /* skip corrupt rows */
    }
  }
  return messages
}

/** Persist the full conversation (replace-all; the list is the source of truth). */
export async function saveChatMessages(
  db: Db,
  messages: AppUIMessage[],
): Promise<void> {
  await db.exec(`DELETE FROM _chat_messages`)
  if (messages.length === 0) return
  const placeholders = messages.map(() => "(?, ?, ?)").join(",")
  const params: unknown[] = []
  messages.forEach((message, i) => {
    params.push(message.id, i, JSON.stringify(message))
  })
  await db.exec(
    `INSERT INTO _chat_messages (id, seq, message_json) VALUES ${placeholders}`,
    params,
  )
}

/** Clear the conversation. */
export async function clearChatMessages(db: Db): Promise<void> {
  await db.exec(`DELETE FROM _chat_messages`)
}
