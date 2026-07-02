"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, Settings01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { ErrorBoundary } from "@/components/error-boundary"
import { useAuth } from "@/contexts/auth-context"
import { useSync } from "@/contexts/sync-context"
import { PinnedCharts } from "@/components/dashboard/pinned-charts"
import { DataOverview } from "@/components/data/data-overview"
import { Chat } from "./chat"
import { ModelSettingsSheet } from "./model-settings"
import { AIStatusChip, ExtractionChip } from "./status-chips"
import { SyncGate } from "./sync-gate"

type Tab = "chat" | "dashboard" | "data"

export function ChatShell() {
  const { signOut } = useAuth()
  const { emailCount } = useSync()
  const [tab, setTab] = useState<Tab>("chat")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)

  const firstRun = emailCount === 0

  const askAgentForDashboard = () => {
    setPendingPrompt(
      "Look at my tracked tables and build me a starter dashboard: create and pin 2-4 charts that best summarize the data. Briefly explain what each one shows.",
    )
    setTab("chat")
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <Logo className="size-4.5 text-primary" />
          <span className="hidden font-mono text-sm font-semibold tracking-tight sm:inline">
            myinboxreport
          </span>
        </div>

        {!firstRun && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="flex items-center gap-1">
          <ExtractionChip />
          <AIStatusChip onOpenSettings={() => setSettingsOpen(true)} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <HugeiconsIcon icon={Settings01Icon} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={signOut}
            aria-label="Sign out"
          >
            <HugeiconsIcon icon={Logout01Icon} />
          </Button>
        </div>
      </header>

      <ErrorBoundary>
        {firstRun ? (
          <SyncGate />
        ) : tab === "chat" ? (
          <Chat
            pendingPrompt={pendingPrompt}
            onPromptConsumed={() => setPendingPrompt(null)}
          />
        ) : tab === "dashboard" ? (
          <PinnedCharts onAskAgent={askAgentForDashboard} />
        ) : (
          <DataOverview />
        )}
      </ErrorBoundary>

      <ModelSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
