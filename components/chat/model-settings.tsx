"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useAIStatus } from "@/contexts/ai-status-context"
import { useExtraction } from "@/contexts/extraction-context"
import { modelSupportsTools } from "@/lib/ai/settings"

export function ModelSettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Model</SheetTitle>
          <SheetDescription>
            Your emails are only ever sent to the model you choose here. Local
            Ollama today; cloud models via your own API key are coming soon.
          </SheetDescription>
        </SheetHeader>
        {open && <SettingsForm onSaved={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  )
}

function SettingsForm({ onSaved }: { onSaved: () => void }) {
  const { config, models, status, updateConfig } = useAIStatus()
  const { autoExtract, setAutoExtract } = useExtraction()
  const [model, setModel] = useState(config.model)
  const [baseUrl, setBaseUrl] = useState(config.baseUrl)

  return (
    <div className="flex flex-col gap-6 px-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="model">Ollama model</FieldLabel>
          {status === "connected" && models.length > 0 ? (
            <Select value={model} onValueChange={(v) => v && setModel(v)}>
              <SelectTrigger id="model" className="w-full">
                <SelectValue placeholder={`Current: ${model}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {models.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name}
                      {m.parameterSize ? ` · ${m.parameterSize}` : ""}
                      {!modelSupportsTools(m.name) ? " · no tool support" : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          )}
          {!modelSupportsTools(model) && (
            <FieldDescription className="text-destructive">
              This model can&apos;t call tools — the agent won&apos;t be able
              to query your data with it. Pick a tool-capable model like
              qwen3-coder.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="baseUrl">Ollama URL</FieldLabel>
          <Input
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:11434"
          />
        </Field>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="autoextract">Extract automatically</FieldLabel>
          <Switch
            id="autoextract"
            checked={autoExtract}
            onCheckedChange={setAutoExtract}
          />
        </Field>
      </FieldGroup>

      <Button
        onClick={() => {
          updateConfig({ provider: "ollama", model, baseUrl })
          onSaved()
        }}
      >
        Save
      </Button>
    </div>
  )
}
