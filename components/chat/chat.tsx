"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { BubbleChatSparkIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useAIStatus } from "@/contexts/ai-status-context"
import { useDb } from "@/contexts/db-context"
import { useExtraction } from "@/contexts/extraction-context"
import type { AppUIMessage } from "@/lib/agent/agent"
import { LazyAgentTransport } from "@/lib/agent/transport"
import { loadChatMessages, saveChatMessages } from "@/lib/chat/persistence"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"

function Welcome({
  onboarding,
  onSuggestion,
}: {
  onboarding: boolean
  onSuggestion: (text: string) => void
}) {
  const suggestions = onboarding
    ? ["Help me set up what to track in my inbox"]
    : [
        "Who emails me the most?",
        "Chart my email volume by week",
        "What did you extract recently?",
      ]

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={BubbleChatSparkIcon} />
          </EmptyMedia>
          <EmptyTitle>
            {onboarding ? "Let's set up your tracking" : "Ask your inbox anything"}
          </EmptyTitle>
          <EmptyDescription>
            {onboarding
              ? "Your emails are synced. Tell the agent what you care about and it will design your database around it."
              : "The agent answers with SQL over your local database — every number is checkable."}
          </EmptyDescription>
        </EmptyHeader>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => onSuggestion(s)}>
              {s}
            </Button>
          ))}
        </div>
      </Empty>
    </div>
  )
}

export function Chat({
  pendingPrompt,
  onPromptConsumed,
}: {
  pendingPrompt?: string | null
  onPromptConsumed?: () => void
}) {
  const db = useDb()
  const { status: aiStatusValue } = useAIStatus()
  const { specCount } = useExtraction()

  const [initialMessages, setInitialMessages] = useState<AppUIMessage[] | null>(null)
  const transport = useMemo(() => new LazyAgentTransport(db), [db])

  useEffect(() => {
    let cancelled = false
    void loadChatMessages(db).then((messages) => {
      if (!cancelled) setInitialMessages(messages)
    })
    return () => {
      cancelled = true
    }
  }, [db])

  if (initialMessages === null) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Spinner className="size-4" />
      </div>
    )
  }

  return (
    <ChatInner
      key={aiStatusValue === "connected" ? "ready" : "waiting"}
      transport={transport}
      initialMessages={initialMessages}
      onboarding={specCount === 0}
      aiConnected={aiStatusValue === "connected"}
      pendingPrompt={pendingPrompt}
      onPromptConsumed={onPromptConsumed}
    />
  )
}

function ChatInner({
  transport,
  initialMessages,
  onboarding,
  aiConnected,
  pendingPrompt,
  onPromptConsumed,
}: {
  transport: LazyAgentTransport
  initialMessages: AppUIMessage[]
  onboarding: boolean
  aiConnected: boolean
  pendingPrompt?: string | null
  onPromptConsumed?: () => void
}) {
  const db = useDb()
  const { reloadCounts } = useExtraction()
  const messagesRef = useRef<AppUIMessage[]>(initialMessages)

  const { messages, sendMessage, status, error, stop } = useChat<AppUIMessage>({
    transport,
    messages: initialMessages,
    onFinish: () => {
      // The agent may have created tables/specs — refresh counts promptly.
      void reloadCounts()
    },
  })

  // Persist continuously (debounced) — reload mid-stream loses at most ~400ms.
  useEffect(() => {
    messagesRef.current = messages
    if (messages.length === 0) return
    const timeout = setTimeout(() => {
      void saveChatMessages(db, messages)
    }, 400)
    return () => clearTimeout(timeout)
  }, [messages, db])

  const send = (text: string) => {
    void sendMessage({ text })
  }

  // A prompt handed over from another tab (e.g. the dashboard's
  // "build a starter dashboard" button) — send it once when ready.
  const pendingSentRef = useRef(false)
  useEffect(() => {
    if (!pendingPrompt || !aiConnected || pendingSentRef.current) return
    pendingSentRef.current = true
    send(pendingPrompt)
    onPromptConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, aiConnected])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {messages.length === 0 ? (
        <Welcome onboarding={onboarding} onSuggestion={send} />
      ) : (
        <MessageList messages={messages} status={status} error={error} />
      )}
      <ChatInput
        disabled={!aiConnected}
        streaming={status === "submitted" || status === "streaming"}
        onSend={send}
        onStop={() => void stop()}
        placeholder={
          aiConnected
            ? onboarding
              ? "Tell the agent what to track…"
              : "Ask about your inbox…"
            : "Start Ollama to chat — see the status dot above"
        }
      />
    </div>
  )
}
