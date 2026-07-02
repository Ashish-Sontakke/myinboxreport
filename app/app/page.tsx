"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  EyeIcon,
  HardDriveIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/auth-context"

function SignInScreen() {
  const { signIn, isLoading } = useAuth()

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Logo className="size-10 text-primary" />
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              myinboxreport
            </h1>
            <p className="text-muted-foreground">
              Connect your Gmail to get started. Everything runs locally in
              your browser.
            </p>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={signIn} disabled={isLoading}>
          {isLoading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <HugeiconsIcon icon={Mail01Icon} data-icon="inline-start" />
          )}
          {isLoading ? "Initializing…" : "Sign in with Google"}
        </Button>

        <div className="grid grid-cols-2 gap-4 text-left text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <HugeiconsIcon icon={EyeIcon} className="mt-0.5 size-4 shrink-0" />
            <span>Read-only access. We never send or delete emails.</span>
          </div>
          <div className="flex items-start gap-2">
            <HugeiconsIcon
              icon={HardDriveIcon}
              className="mt-0.5 size-4 shrink-0"
            />
            <span>Data stays in your browser. No servers involved.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppPage() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <SignInScreen />
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo className="size-8 text-primary" />
      <p className="text-muted-foreground">
        Signed in as <span className="text-foreground">{user?.email}</span>.
        The agent chat is coming next.
      </p>
      <Button variant="outline" size="sm" onClick={signOut}>
        Sign out
      </Button>
    </div>
  )
}
