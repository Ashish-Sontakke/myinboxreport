"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon, StopIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export function ChatInput({
  disabled,
  streaming,
  onSend,
  onStop,
  placeholder = "Ask about your inbox…",
}: {
  disabled?: boolean
  streaming?: boolean
  onSend: (text: string) => void
  onStop: () => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")

  const send = () => {
    const text = input.trim()
    if (!text || disabled || streaming) return
    onSend(text)
    setInput("")
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <InputGroup>
        <InputGroupTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
        />
        <InputGroupAddon align="inline-end">
          {streaming ? (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onStop}
              aria-label="Stop"
            >
              <HugeiconsIcon icon={StopIcon} />
            </Button>
          ) : (
            <Button
              size="icon-sm"
              onClick={send}
              disabled={disabled || !input.trim()}
              aria-label="Send"
            >
              <HugeiconsIcon icon={SentIcon} />
            </Button>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
