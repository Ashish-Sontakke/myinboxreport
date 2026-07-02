import { ToolLoopAgent, isStepCount, type InferAgentUIMessage, type LanguageModel } from "ai"

import { agentTools } from "./tools"
import { buildInstructions, type InstructionSnapshot } from "./instructions"

export function buildAgent(model: LanguageModel, snapshot: InstructionSnapshot) {
  return new ToolLoopAgent({
    model,
    instructions: buildInstructions(snapshot),
    tools: agentTools,
    stopWhen: isStepCount(12),
  })
}

export type AppUIMessage = InferAgentUIMessage<ReturnType<typeof buildAgent>>
