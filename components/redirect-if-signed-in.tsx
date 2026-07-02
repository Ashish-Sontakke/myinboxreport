"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { hasStoredProfile } from "@/lib/auth-storage"

/**
 * Signed-in visitors landing on the marketing page go straight to the app.
 * Purely client-side (localStorage check) — works on the static export.
 */
export function RedirectIfSignedIn() {
  const router = useRouter()

  useEffect(() => {
    if (hasStoredProfile()) {
      router.replace("/app")
    }
  }, [router])

  return null
}
