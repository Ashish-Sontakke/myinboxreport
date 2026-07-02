"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  getAccessToken,
  initGoogleAuth,
  signIn as gisSignIn,
  signInSilent,
  signOut as gisSignOut,
} from "@/lib/gmail/auth"
import { USER_PROFILE_KEY } from "@/lib/auth-storage"
import { log } from "@/lib/log"

interface UserProfile {
  email: string
  name: string
  picture: string
}

interface AuthState {
  /** True when a user profile exists. Data is local — no token required to browse it. */
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  /** True when a non-expired Gmail access token is available. */
  hasValidToken: boolean
  signIn: () => Promise<void>
  signOut: () => void
  /**
   * Return a valid access token: current one if valid, otherwise a silent
   * refresh, otherwise the interactive consent popup. Throws if the user
   * cancels. Call this from user-initiated actions (sync buttons) — silent
   * refresh only works inside a user gesture, popups are blocked elsewhere.
   * Single-flight: concurrent callers share one attempt.
   */
  ensureToken: () => Promise<string>
}

const AuthContext = createContext<AuthState | null>(null)

function persistUser(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
}

function restoreUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

function clearUser(): void {
  try {
    localStorage.removeItem(USER_PROFILE_KEY)
  } catch {
    /* ignore */
  }
}

async function fetchUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error("Failed to fetch user profile")
  }
  const data = await res.json()
  return {
    email: data.email,
    name: data.name ?? data.email,
    picture: data.picture ?? "",
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [hasValidToken, setHasValidToken] = useState(false)
  const ensureInflight = useRef<Promise<string> | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const restored = restoreUser()
      if (restored) setUser(restored)

      try {
        await initGoogleAuth()
      } catch (err) {
        log("error", "auth", "Failed to initialize Google Auth", String(err))
        return
      }

      if (cancelled) return

      // No silent token attempt here — browsers block popups outside a user
      // gesture, so GIS prompt:'' can never succeed on page load.
      // ensureToken() runs the silent attempt inside a click instead.
      if (getAccessToken()) {
        setHasValidToken(true)
      }
    })().finally(() => {
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Tokens expire after ~1h; keep hasValidToken honest.
  useEffect(() => {
    const interval = setInterval(() => {
      setHasValidToken(!!getAccessToken())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const signIn = useCallback(async () => {
    const tokenResponse = await gisSignIn()
    const profile = await fetchUserProfile(tokenResponse.access_token)
    persistUser(profile)
    setUser(profile)
    setHasValidToken(true)
    log("info", "auth", `Signed in as ${profile.email}`)
  }, [])

  const signOut = useCallback(() => {
    gisSignOut()
    clearUser()
    setUser(null)
    setHasValidToken(false)
    log("info", "auth", "Signed out")
  }, [])

  const ensureToken = useCallback(async (): Promise<string> => {
    // Single-flight: two concurrent sync actions must not open two popups.
    if (ensureInflight.current) return ensureInflight.current

    const attempt = (async () => {
      const existing = getAccessToken()
      if (existing) return existing

      const silent = await signInSilent()
      if (silent) {
        setHasValidToken(true)
        log("info", "auth", "Silently reconnected to Google")
        return silent
      }

      const response = await gisSignIn()
      setHasValidToken(true)
      return response.access_token
    })().finally(() => {
      ensureInflight.current = null
    })

    ensureInflight.current = attempt
    return attempt
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: !!user,
      isLoading,
      user,
      hasValidToken,
      signIn,
      signOut,
      ensureToken,
    }),
    [user, isLoading, hasValidToken, signIn, signOut, ensureToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
