/**
 * Google Identity Services (GIS) implicit grant flow.
 *
 * Uses the GIS client library to obtain a short-lived access_token
 * without a backend or client_secret. Tokens live in memory only
 * and expire after ~1 hour.
 */

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
}

// In-memory token store (intentionally not persisted)
let accessToken: string | null = null;
let tokenExpiresAt: number = 0;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

// Pending sign-in promise handlers
let pendingResolve: ((token: TokenResponse) => void) | null = null;
let pendingReject: ((error: Error) => void) | null = null;

/**
 * Dynamically load the GIS script and initialize the token client.
 */
export async function initGoogleAuth(): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
  }

  // Load GIS script if not already loaded
  if (typeof google === 'undefined' || !google.accounts) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response: TokenResponse) => {
      if (response.error) {
        pendingReject?.(new Error(response.error_description ?? response.error));
        pendingResolve = null;
        pendingReject = null;
        return;
      }

      accessToken = response.access_token;
      tokenExpiresAt = Date.now() + response.expires_in * 1000;
      pendingResolve?.(response);
      pendingResolve = null;
      pendingReject = null;
    },
  });
}

/**
 * Trigger the Google consent screen and return a token response.
 */
export function signIn(): Promise<TokenResponse> {
  if (!tokenClient) {
    return Promise.reject(new Error('Google Auth not initialized. Call initGoogleAuth() first.'));
  }

  return new Promise<TokenResponse>((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;
    tokenClient!.requestAccessToken();
  });
}

/**
 * Revoke the current token and clear local state.
 */
export function signOut(): void {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      // Revocation callback — no-op, we clear state regardless
    });
  }
  accessToken = null;
  tokenExpiresAt = 0;
}

/**
 * Get the current access token, or null if not signed in / expired.
 */
export function getAccessToken(): string | null {
  if (!accessToken || !isTokenValid()) {
    return null;
  }
  return accessToken;
}

/**
 * Check if the current token is still valid (not expired).
 * Adds a 60-second buffer to avoid using tokens that are about to expire.
 */
export function isTokenValid(): boolean {
  return !!accessToken && Date.now() < tokenExpiresAt - 60_000;
}
