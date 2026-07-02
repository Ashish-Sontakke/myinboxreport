"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { BubbleChatSparkIcon } from "@hugeicons/core-free-icons"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Spinner } from "@/components/ui/spinner"
import type { AppUIMessage } from "@/lib/agent/agent"
import {
  ConfirmationPart,
  RenderChartPart,
  RunSqlPart,
  ToolErrorAlert,
} from "./tool-parts"

function AssistantAvatar() {
  return (
    <MessageAvatar>
      <HugeiconsIcon
        icon={BubbleChatSparkIcon}
        className="size-4 p-0.5 text-muted-foreground"
      />
    </MessageAvatar>
  )
}

function MessageParts({ message }: { message: AppUIMessage }) {
  return (
    <>
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return message.role === "user" ? (
              <Bubble key={i} variant="default" align="end">
                <BubbleContent>{part.text}</BubbleContent>
              </Bubble>
            ) : (
              <div key={i} className="max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {part.text}
              </div>
            )

          case "step-start":
            return null

          case "tool-run_sql":
            return (
              <RunSqlPart
                key={i}
                state={part.state}
                input={part.state !== "input-streaming" ? part.input : undefined}
                output={part.state === "output-available" ? part.output : undefined}
                errorText={part.state === "output-error" ? part.errorText : undefined}
              />
            )

          case "tool-render_chart":
            return (
              <RenderChartPart
                key={i}
                state={part.state}
                output={part.state === "output-available" ? part.output : undefined}
                errorText={part.state === "output-error" ? part.errorText : undefined}
              />
            )

          case "tool-list_schema":
          case "tool-sample_emails":
            return (
              <div key={i} className="py-0.5 font-mono text-[11px] text-muted-foreground">
                {part.state === "output-available"
                  ? part.type === "tool-list_schema"
                    ? "checked your tables"
                    : "looked at a sample of your emails"
                  : part.state === "output-error"
                    ? `failed: ${part.errorText}`
                    : "looking at your data…"}
              </div>
            )

          case "tool-define_extraction":
            return (
              <ConfirmationPart
                key={i}
                state={part.state}
                label={
                  part.state === "output-available" && "created" in part.output
                    ? `Now tracking “${part.output.created}” — extraction runs in the background`
                    : "Setting up tracking…"
                }
                error={
                  part.state === "output-available" && "error" in part.output
                    ? String(part.output.error)
                    : undefined
                }
                errorText={part.state === "output-error" ? part.errorText : undefined}
              />
            )

          case "tool-pin_to_dashboard":
            return (
              <ConfirmationPart
                key={i}
                state={part.state}
                label={
                  part.state === "output-available" && "pinned" in part.output
                    ? `Pinned “${part.output.pinned}” to your dashboard`
                    : "Pinning…"
                }
                error={
                  part.state === "output-available" && "error" in part.output
                    ? String(part.output.error)
                    : undefined
                }
                errorText={part.state === "output-error" ? part.errorText : undefined}
              />
            )

          default:
            return null
        }
      })}
    </>
  )
}

export function MessageList({
  messages,
  status,
  error,
}: {
  messages: AppUIMessage[]
  status: "submitted" | "streaming" | "ready" | "error"
  error?: Error
}) {
  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="end">
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            {messages.map((message) => (
              <MessageScrollerItem key={message.id} messageId={message.id}>
                <Message align={message.role === "user" ? "end" : "start"}>
                  {message.role === "assistant" && <AssistantAvatar />}
                  <MessageContent>
                    <MessageParts message={message} />
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}

            {status === "submitted" && (
              <MessageScrollerItem messageId="__thinking">
                <Message>
                  <AssistantAvatar />
                  <MessageContent>
                    <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                      <Spinner className="size-3.5" />
                      Thinking…
                    </div>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            )}

            {status === "error" && error && (
              <MessageScrollerItem messageId="__error">
                <ToolErrorAlert errorText={error.message} />
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
