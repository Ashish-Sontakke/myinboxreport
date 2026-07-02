import { createOllama } from "ollama-ai-provider-v2"
import type { LanguageModel } from "ai"

import type { AIConfig } from "./settings"

/** Build a LanguageModel from the user's config. Ollama only for now. */
export function getModel(config: AIConfig): LanguageModel {
  const ollama = createOllama({
    baseURL: `${config.baseUrl.replace(/\/$/, "")}/api`,
  })
  return ollama(config.model)
}
