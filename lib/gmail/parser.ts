import type { GmailMessage, GmailPayload, GmailHeader, StoredEmail } from '@/lib/types/email';

/**
 * Transform a raw Gmail API message into a StoredEmail for Dexie.
 */
export function parseGmailMessage(msg: GmailMessage): StoredEmail {
  const headers = msg.payload.headers;

  return {
    id: msg.id,
    threadId: msg.threadId,
    historyId: msg.historyId,
    from: extractHeader(headers, 'From') ?? '',
    to: parseAddressList(extractHeader(headers, 'To') ?? ''),
    subject: extractHeader(headers, 'Subject') ?? '(no subject)',
    date: new Date(Number(msg.internalDate)),
    snippet: msg.snippet,
    bodyText: extractBody(msg.payload, 'text/plain'),
    bodyHtml: extractBody(msg.payload, 'text/html'),
    labels: msg.labelIds ?? [],
    parsed: false,
  };
}

/**
 * Find a header value by name (case-insensitive).
 */
export function extractHeader(
  headers: GmailHeader[],
  name: string,
): string | undefined {
  const lower = name.toLowerCase();
  return headers.find((h) => h.name.toLowerCase() === lower)?.value;
}

/**
 * Recursively walk a MIME payload tree and extract the body for a given mimeType.
 * Returns the decoded text, or empty string if not found.
 */
export function extractBody(payload: GmailPayload, mimeType: string): string {
  // Direct match on this part
  if (payload.mimeType === mimeType && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Recurse into multipart parts
  if (payload.parts) {
    for (const part of payload.parts) {
      const result = extractBody(part, mimeType);
      if (result) return result;
    }
  }

  return '';
}

/**
 * Decode a base64url-encoded string (Gmail's encoding).
 * Replaces URL-safe characters and uses atob().
 */
export function decodeBase64Url(encoded: string): string {
  // Replace URL-safe chars with standard base64 chars
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
  } catch {
    // Fallback for non-UTF-8 content
    try {
      return atob(base64);
    } catch {
      return '';
    }
  }
}

/**
 * Parse a comma-separated address list into individual addresses.
 */
function parseAddressList(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw.split(',').map((addr) => addr.trim()).filter(Boolean);
}
