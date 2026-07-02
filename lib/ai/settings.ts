/**
 * Model configuration. Local Ollama only for now — the discriminated union
 * exists so a future BYO-key "openai-compatible" arm can slot in without
 * reworking call sites.
 */
export type AIConfig = {
  provider: "ollama"
  model: string
  baseUrl: string
}

const AI_SETTINGS_KEY = "myinboxreport_ai_settings"

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "ollama",
  model: "qwen3-coder:30b",
  baseUrl: "http://localhost:11434",
}

/** Models known to lack tool-calling support — flagged in the model picker. */
export const NO_TOOL_SUPPORT = [/^llama2/, /^gemma[12]?[:\b]/]

export function modelSupportsTools(model: string): boolean {
  return !NO_TOOL_SUPPORT.some((re) => re.test(model))
}

export function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.provider === "ollama" && parsed.model && parsed.baseUrl) {
        return parsed as AIConfig
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_AI_CONFIG
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(config))
}

export interface OllamaModel {
  name: string
  size: number
  parameterSize: string
}

export async function fetchOllamaModels(
  baseUrl: string,
  signal?: AbortSignal,
): Promise<OllamaModel[]> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/tags`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Ollama returned ${res.status}`)
  const data = await res.json()
  return (data.models ?? []).map((m: Record<string, unknown>) => ({
    name: String(m.name),
    size: Number(m.size ?? 0),
    parameterSize: String(
      (m.details as Record<string, unknown>)?.parameter_size ?? "",
    ),
  }))
}
