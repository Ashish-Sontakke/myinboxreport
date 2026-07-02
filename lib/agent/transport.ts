import { DirectChatTransport, type ChatTransport, type UIMessageChunk } from "ai"

import type { Db } from "@/lib/db/client"
import { getModel } from "@/lib/ai/provider"
import { loadAIConfig } from "@/lib/ai/settings"
import { buildAgent, type AppUIMessage } from "./agent"
import { buildSnapshot } from "./instructions"

/**
 * Builds a fresh agent for every send: the instruction snapshot (schema, row
 * counts, onboarding state) and the model config are re-read each time, so
 * schema changes mid-conversation and model switches apply to the next
 * message automatically. Delegates the actual run to DirectChatTransport —
 * the agent loop executes entirely in the browser.
 */
export class LazyAgentTransport implements ChatTransport<AppUIMessage> {
  constructor(private readonly db: Db) {}

  async sendMessages(
    options: Parameters<ChatTransport<AppUIMessage>["sendMessages"]>[0],
  ): Promise<ReadableStream<UIMessageChunk>> {
    const snapshot = await buildSnapshot(this.db)
    const model = getModel(loadAIConfig())
    const agent = buildAgent(model, snapshot)
    return new DirectChatTransport({ agent }).sendMessages(options)
  }

  reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return Promise.resolve(null)
  }
}
