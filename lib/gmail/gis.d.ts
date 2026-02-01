/**
 * Minimal type declarations for Google Identity Services (GIS) OAuth2 client.
 * Only covers the subset we use — implicit grant token client.
 */

declare namespace google.accounts.oauth2 {
  interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: { type: string; message: string }) => void;
  }

  interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    error?: string;
    error_description?: string;
  }

  interface TokenClient {
    requestAccessToken: (overrides?: { prompt?: string }) => void;
  }

  function initTokenClient(config: TokenClientConfig): TokenClient;
  function revoke(accessToken: string, callback: () => void): void;
}
