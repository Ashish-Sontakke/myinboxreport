export interface GmailMessage {
  id: string;
  threadId: string;
  historyId: string;
  internalDate: string; // epoch ms as string
  labelIds: string[];
  snippet: string;
  payload: GmailPayload;
}

export interface GmailPayload {
  mimeType: string;
  headers: GmailHeader[];
  body?: { data?: string; size: number };
  parts?: GmailPayload[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface StoredEmail {
  id: string;
  threadId: string;
  historyId: string;
  from: string;
  to: string[];
  subject: string;
  date: Date;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  labels: string[];
  parsed: boolean;
  parsedAt?: Date;
  category?: EmailCategory;
}

export type EmailCategory =
  | 'subscription'
  | 'transaction'
  | 'income'
  | 'newsletter'
  | 'other';
