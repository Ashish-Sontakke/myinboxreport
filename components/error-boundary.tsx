"use client"

import { Component, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { log } from "@/lib/log"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Keeps a render error contained to the current view instead of unmounting the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    log("error", "app", "View crashed", error.message)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
          <p className="text-sm font-semibold">Something went wrong in this view.</p>
          <p className="max-w-md font-mono text-xs break-words text-destructive">
            {this.state.error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
