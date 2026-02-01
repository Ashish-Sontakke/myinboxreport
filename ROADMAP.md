# Roadmap

This is an agent-ready implementation roadmap. Each task is self-contained with clear inputs, outputs, files, and acceptance criteria so an autonomous AI agent can execute it independently.

---

## Architecture Overview

### Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | Already in place; SSG marketing + client-only dashboard |
| UI | React 19, Tailwind v4, shadcn/ui | Already in place |
| Auth | Google Identity Services (GIS) implicit grant | Browser-only SPA; Google doesn't support PKCE without client_secret |
| Gmail API | Direct `fetch()` REST calls | `googleapis` npm is 500KB+ and Node-only |
| Local DB | Dexie.js (IndexedDB wrapper) | Typed, reactive, migration support |
| AI Parsing | Vercel AI SDK (`ai` package) | Unified interface for Ollama, OpenAI, Anthropic |
| Charts | Recharts | Lightweight, composable, React-native |

### Data Flow

```
┌─────────────┐     GIS implicit grant     ┌──────────────┐
│  User signs  │ ──────────────────────────▶│ Google OAuth  │
│  in with     │◀────── access_token ───────│ (token only)  │
│  Gmail       │                            └──────────────┘
└──────┬──────┘
       │ access_token
       ▼
┌─────────────┐   fetch() REST calls    ┌──────────────┐
│  Sync Engine │ ──────────────────────▶ │  Gmail API   │
│  (30-day     │◀── messages (JSON) ─── │  REST        │
│   window)    │                         └──────────────┘
└──────┬──────┘
       │ raw emails
       ▼
┌─────────────┐                         ┌──────────────┐
│  Dexie DB   │ ── unparsed emails ───▶ │  AI Parser   │
│  (IndexedDB) │◀── structured data ─── │  (Vercel AI  │
│              │                         │   SDK)       │
└──────┬──────┘                         └──────────────┘
       │ query
       ▼
┌─────────────┐
│  Dashboard   │
│  Pages       │
└─────────────┘
```

### Key Architectural Decisions

1. **GIS implicit grant, not PKCE** — Google's OAuth for browser-only SPAs without a backend doesn't properly support PKCE (requires `client_secret` for token exchange). GIS implicit grant returns the `access_token` directly in the URL fragment. Tokens are short-lived (1 hour); we re-prompt on expiry.

2. **Direct `fetch()` for Gmail API** — The `googleapis` npm package is 500KB+, designed for Node.js, and pulls in `gaxios`. We use raw `fetch()` with typed response interfaces instead.

3. **AI-first parsing, no rule-based parsers** — Rule-based parsers are brittle and require per-vendor maintenance. We use Vercel AI SDK with structured output (Zod schemas) for all classification and extraction. Users choose their provider: Ollama (free, local), OpenAI, or Anthropic.

4. **Incremental 30-day sync** — First sync fetches only the last 30 days. Users can request older months on demand via "Load more" in the UI. Emails are never bulk-loaded. Sync state tracks the oldest fetched date and the latest `historyId` for incremental updates.

5. **No backend** — All processing runs client-side. The Next.js app is statically exported (`output: 'export'`). No API routes, no server components that fetch data.

---

## Phase 0: Foundation (Types, Dependencies, Database)

### Task 0.1: Install dependencies

**Goal**: Add all runtime dependencies needed for phases 0–4.

**Depends on**: Nothing

**Files to modify**:
- `package.json`

**Packages to add**:
```
dexie dexie-react-hooks    # IndexedDB
ai @ai-sdk/openai @ai-sdk/anthropic ollama-ai-provider    # Vercel AI SDK + providers
recharts                   # Charts
```

**Acceptance criteria**:
- `bun install` succeeds with no errors
- `bun build` still succeeds (no breaking imports)

**Key notes**:
- Do NOT install `googleapis` or `google-auth-library`
- `ai` is the Vercel AI SDK core; provider packages are separate

**Commit message**: `feat: add dexie, vercel ai sdk, and recharts dependencies`

---

### Task 0.2: Create shared type definitions

**Goal**: Define all TypeScript types used across the app in a single location.

**Depends on**: Nothing

**Files to create**:
- `lib/types/email.ts` — Raw email types from Gmail API
- `lib/types/parsed.ts` — Parsed entity types (subscription, transaction, income, newsletter)
- `lib/types/settings.ts` — User settings and AI provider config
- `lib/types/index.ts` — Barrel export

**Type definitions**:

`lib/types/email.ts`:
```typescript
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
```

`lib/types/parsed.ts`:
```typescript
export interface Subscription {
  id: string;
  emailId: string;
  vendor: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextRenewal?: Date;
  status: 'active' | 'cancelled' | 'trial';
  confidence: number;
  detectedAt: Date;
}

export interface Transaction {
  id: string;
  emailId: string;
  vendor: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  confidence: number;
  detectedAt: Date;
}

export interface Income {
  id: string;
  emailId: string;
  source: string;
  amount: number;
  currency: string;
  date: Date;
  type: 'salary' | 'freelance' | 'refund' | 'investment' | 'other';
  confidence: number;
  detectedAt: Date;
}

export interface Newsletter {
  id: string;
  emailId: string;
  sender: string;
  senderName: string;
  subject: string;
  receivedAt: Date;
  summary?: string;
  hasUnsubscribe: boolean;
  detectedAt: Date;
}
```

`lib/types/settings.ts`:
```typescript
export type AIProvider = 'ollama' | 'openai' | 'anthropic';

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string; // not needed for Ollama
  baseUrl?: string; // custom Ollama URL
}

export interface SyncState {
  lastSyncedAt?: Date;
  latestHistoryId?: string;
  oldestFetchedDate?: Date;
  isSyncing: boolean;
  totalFetched: number;
}

export interface UserSettings {
  aiProvider: AIProviderConfig;
  syncState: SyncState;
  theme: 'light' | 'dark' | 'system';
}
```

**Acceptance criteria**:
- All types exported from `lib/types/index.ts`
- `bun build` succeeds (types are import-only, no runtime effect)
- No `any` types used

**Commit message**: `feat: add shared TypeScript type definitions for email, parsed entities, and settings`

---

### Task 0.3: Set up Dexie database

**Goal**: Create the IndexedDB database with all tables and indexes using Dexie.

**Depends on**: Task 0.2

**Files to create**:
- `lib/db/index.ts` — Dexie database class definition
- `lib/db/seed.ts` — Optional dev-only seed data (empty for now)

**Implementation notes**:

```typescript
// lib/db/index.ts
import Dexie, { type Table } from 'dexie';
import type { StoredEmail } from '@/lib/types/email';
import type { Subscription, Transaction, Income, Newsletter } from '@/lib/types/parsed';

export class InboxDB extends Dexie {
  emails!: Table<StoredEmail, string>;
  subscriptions!: Table<Subscription, string>;
  transactions!: Table<Transaction, string>;
  income!: Table<Income, string>;
  newsletters!: Table<Newsletter, string>;

  constructor() {
    super('myinboxreport');
    this.version(1).stores({
      emails: 'id, threadId, from, date, *labels, parsed, category',
      subscriptions: 'id, emailId, vendor, status, frequency',
      transactions: 'id, emailId, vendor, category, date',
      income: 'id, emailId, source, date, type',
      newsletters: 'id, emailId, sender, receivedAt',
    });
  }
}

export const db = new InboxDB();
```

**Acceptance criteria**:
- `db` singleton exported from `lib/db/index.ts`
- All five tables defined with appropriate indexes
- Compound indexes on fields used for filtering/sorting (date, vendor, category)
- `bun build` succeeds

**Commit message**: `feat: set up Dexie IndexedDB database with email and parsed entity tables`

---

### Task 0.4: Create database React hooks

**Goal**: Create React hooks that components use to query the database reactively.

**Depends on**: Task 0.3

**Files to create**:
- `lib/db/hooks.ts` — React hooks using `dexie-react-hooks`

**Implementation notes**:

Use `useLiveQuery` from `dexie-react-hooks` for reactive queries. Create hooks for common queries:

```typescript
export function useEmails(filters?: { parsed?: boolean; category?: EmailCategory }) { ... }
export function useSubscriptions(status?: 'active' | 'cancelled' | 'trial') { ... }
export function useTransactions(dateRange?: { from: Date; to: Date }) { ... }
export function useIncome(dateRange?: { from: Date; to: Date }) { ... }
export function useNewsletters() { ... }
export function useSyncState(): SyncState { ... }
export function useStats(): { totalEmails: number; parsed: number; unparsed: number } { ... }
```

Each hook should return `undefined` while loading (Dexie convention) and the data array when ready.

**Acceptance criteria**:
- All hooks exported from `lib/db/hooks.ts`
- Hooks use `useLiveQuery` for reactivity
- Hooks accept filter/range parameters
- `bun build` succeeds

**Commit message**: `feat: add reactive Dexie database hooks for emails and parsed entities`

---

## Phase 1: Gmail Authentication

### Task 1.1: GIS auth module

**Goal**: Implement Gmail sign-in using Google Identity Services implicit grant flow.

**Depends on**: Task 0.2

**Files to create**:
- `lib/gmail/auth.ts` — GIS initialization, token management, sign-out

**Implementation notes**:

Load the GIS script (`accounts.google.com/gsi/client`) dynamically. Use `google.accounts.oauth2.initTokenClient` with:
- `client_id` from `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var
- `scope: 'https://www.googleapis.com/auth/gmail.readonly'`
- `callback` that receives `{ access_token, expires_in, token_type }`

Store the token and expiry in memory (not localStorage — tokens are short-lived). Expose:

```typescript
export function initGoogleAuth(): Promise<void>;     // load GIS script
export function signIn(): Promise<TokenResponse>;     // trigger consent
export function signOut(): void;                      // revoke + clear
export function getAccessToken(): string | null;      // current token
export function isTokenValid(): boolean;              // check expiry
```

**Acceptance criteria**:
- GIS script loads without errors
- `signIn()` opens Google consent screen
- Token stored in memory with expiry tracking
- `signOut()` revokes token via Google's revocation endpoint
- `isTokenValid()` returns false when token expired
- No `googleapis` npm package used

**Key notes**:
- The `.env.local` file needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- GIS implicit grant does NOT use `client_secret` — this is intentional
- Token lasts ~1 hour; we re-trigger consent on expiry (no refresh tokens in implicit flow)

**Commit message**: `feat: implement Gmail OAuth via Google Identity Services implicit grant`

---

### Task 1.2: Auth React context

**Goal**: Wrap the GIS auth module in a React context so any component can access auth state.

**Depends on**: Task 1.1

**Files to create**:
- `contexts/auth-context.tsx` — React context provider + hook

**Implementation notes**:

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { email: string; name: string; picture: string } | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}
```

The context provider should:
1. Call `initGoogleAuth()` on mount
2. After sign-in, fetch user profile from `https://www.googleapis.com/oauth2/v3/userinfo` using the access token
3. Store user profile in state
4. Expose `useAuth()` hook

**Acceptance criteria**:
- `AuthProvider` wraps the app in the root layout
- `useAuth()` returns current auth state from any component
- Sign-in triggers Google consent and updates state
- Sign-out clears state and revokes token
- Loading state is true until GIS initializes

**Commit message**: `feat: add auth React context with Google Identity Services`

---

### Task 1.3: Route restructure (marketing vs dashboard)

**Goal**: Reorganize the App Router into two layout groups — public marketing pages and authenticated dashboard.

**Depends on**: Task 1.2

**Files to create/modify**:
- `app/(marketing)/layout.tsx` — Marketing layout (Header + Footer)
- `app/(marketing)/page.tsx` — Move current landing page here
- `app/(dashboard)/layout.tsx` — Dashboard layout (auth guard, sidebar placeholder)
- `app/(dashboard)/dashboard/page.tsx` — Dashboard entry point (placeholder)
- `app/layout.tsx` — Root layout with `AuthProvider`

**Implementation notes**:

Next.js route groups (parenthesized folders) share layouts without affecting the URL. The marketing group keeps the current Header/Footer. The dashboard group has its own layout with:
- Auth guard: redirect to `/` if not authenticated
- Sidebar placeholder (built in Phase 3)
- No marketing Header/Footer

Update `app/layout.tsx` to wrap children with `AuthProvider` and `ThemeProvider`.

**Acceptance criteria**:
- `/` still renders the landing page with Header/Footer
- `/dashboard` renders a placeholder page within the dashboard layout
- Visiting `/dashboard` without auth redirects to `/`
- Root layout includes `AuthProvider`
- Existing pages and styles still work

**Commit message**: `feat: restructure routes into marketing and dashboard layout groups`

---

## Phase 2: Gmail Sync (Incremental, 30-Day Window)

### Task 2.1: Gmail API client (fetch-based)

**Goal**: Create a typed Gmail API client using raw `fetch()` calls.

**Depends on**: Task 0.2, Task 1.1

**Files to create**:
- `lib/gmail/client.ts` — Gmail REST API wrapper
- `lib/gmail/types.ts` — Gmail API response types (if not covered by `lib/types/email.ts`)

**Implementation notes**:

Base URL: `https://gmail.googleapis.com/gmail/v1/users/me`

Implement these functions:

```typescript
export async function listMessages(
  token: string,
  query: string,       // Gmail search query, e.g. 'after:2025/01/01'
  pageToken?: string,
  maxResults?: number,
): Promise<{ messages: { id: string; threadId: string }[]; nextPageToken?: string }>;

export async function getMessage(
  token: string,
  messageId: string,
  format?: 'full' | 'metadata' | 'minimal',
): Promise<GmailMessage>;

export async function batchGetMessages(
  token: string,
  messageIds: string[],
): Promise<GmailMessage[]>;
```

All functions should:
- Set `Authorization: Bearer ${token}` header
- Handle 401 (token expired) by throwing a typed `AuthExpiredError`
- Handle 429 (rate limit) with exponential backoff (3 retries, 1s/2s/4s)
- Handle network errors gracefully

For `batchGetMessages`, use Gmail's batch endpoint (`https://www.googleapis.com/batch/gmail/v1`) with multipart/mixed requests, or fall back to `Promise.allSettled` with concurrency limit of 10.

**Acceptance criteria**:
- All three functions work with a valid access token
- 401 errors throw `AuthExpiredError`
- 429 errors retry with backoff
- No `googleapis` npm package imported
- Response types match `GmailMessage` interface

**Commit message**: `feat: add fetch-based Gmail API client with retry and error handling`

---

### Task 2.2: Email message parser

**Goal**: Parse raw Gmail API responses into `StoredEmail` objects.

**Depends on**: Task 0.2, Task 2.1

**Files to create**:
- `lib/gmail/parser.ts` — Transform `GmailMessage` → `StoredEmail`

**Implementation notes**:

Extract from `GmailMessage.payload`:
- `from`: Find header `From`, parse into email string
- `to`: Find header `To`, split by comma
- `subject`: Find header `Subject`
- `date`: Use `internalDate` (epoch ms), convert to `Date`
- `bodyText`: Recursively walk `parts`, find `text/plain`, base64url-decode
- `bodyHtml`: Recursively walk `parts`, find `text/html`, base64url-decode
- `labels`: Direct from `labelIds`

Base64url decoding: Replace `-` with `+`, `_` with `/`, then `atob()`.

```typescript
export function parseGmailMessage(msg: GmailMessage): StoredEmail;
export function decodeBase64Url(encoded: string): string;
export function extractHeader(headers: GmailHeader[], name: string): string | undefined;
export function extractBody(payload: GmailPayload, mimeType: string): string;
```

**Acceptance criteria**:
- Correctly parses `From`, `To`, `Subject` headers
- Decodes base64url body content
- Handles multipart messages (recursively walks parts)
- Handles missing body gracefully (empty string)
- Sets `parsed: false` on all new emails

**Commit message**: `feat: add Gmail message parser to transform API responses into StoredEmail`

---

### Task 2.3: Sync engine (30-day window, backward pagination)

**Goal**: Build the sync orchestrator that fetches emails in 30-day windows and stores them in Dexie.

**Depends on**: Task 0.3, Task 1.1, Task 2.1, Task 2.2

**Files to create**:
- `lib/gmail/sync.ts` — Sync engine

**Implementation notes**:

The sync engine has two modes:

1. **Initial sync**: Fetch last 30 days using Gmail query `after:YYYY/MM/DD`. Paginate through all results. Store in Dexie. Save `latestHistoryId` and `oldestFetchedDate` in sync state.

2. **Incremental sync**: Use `history.list` endpoint with `startHistoryId` to get only new/changed messages since last sync. This is much faster than re-querying.

3. **Load older**: User clicks "Load more" → fetch the 30-day window before `oldestFetchedDate`. Update `oldestFetchedDate`.

```typescript
export interface SyncProgress {
  phase: 'listing' | 'fetching' | 'storing';
  current: number;
  total: number;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export async function initialSync(
  token: string,
  onProgress?: SyncProgressCallback,
): Promise<void>;

export async function incrementalSync(
  token: string,
  onProgress?: SyncProgressCallback,
): Promise<void>;

export async function loadOlderEmails(
  token: string,
  onProgress?: SyncProgressCallback,
): Promise<void>;
```

Concurrency: Fetch messages in batches of 20 using `batchGetMessages`. Don't fetch messages already in Dexie (check by `id`).

**Acceptance criteria**:
- Initial sync fetches exactly 30 days of email
- Messages stored in Dexie with no duplicates
- Sync state (historyId, oldestFetchedDate) persisted
- Progress callback fires during sync
- Incremental sync only fetches new messages
- `loadOlderEmails` extends the window by another 30 days

**Commit message**: `feat: add sync engine with 30-day window and incremental updates`

---

## Phase 3: Dashboard Shell & Settings

### Task 3.1: Dashboard layout (sidebar, header)

**Goal**: Build the dashboard layout with a collapsible sidebar and top header.

**Depends on**: Task 1.3

**Files to create**:
- `components/dashboard/sidebar.tsx` — Navigation sidebar
- `components/dashboard/dashboard-header.tsx` — Top bar with user info and sync button
- Update `app/(dashboard)/layout.tsx` — Compose sidebar + header + content area

**Sidebar navigation items**:
- Overview (`/dashboard`)
- Subscriptions (`/dashboard/subscriptions`)
- Spending (`/dashboard/spending`)
- Income (`/dashboard/income`)
- Newsletters (`/dashboard/newsletters`)
- Settings (`/dashboard/settings`)

**Implementation notes**:
- Use shadcn/ui `Sheet` for mobile sidebar (slide-out drawer)
- Desktop: fixed sidebar, ~240px wide
- Sidebar collapses to icons on smaller viewports
- Header shows user avatar/name from auth context, sync status badge, theme toggle
- Use `usePathname()` to highlight active nav item

**Acceptance criteria**:
- Sidebar renders all nav items with icons
- Active page is visually highlighted
- Mobile: sidebar opens as a drawer
- Desktop: sidebar is always visible
- Header shows user info from `useAuth()`
- Layout is responsive (no horizontal scroll)

**Commit message**: `feat: add dashboard layout with sidebar navigation and header`

---

### Task 3.2: Settings page (AI provider config)

**Goal**: Build the settings page where users configure their AI provider and manage data.

**Depends on**: Task 3.1, Task 0.4

**Files to create**:
- `app/(dashboard)/dashboard/settings/page.tsx`
- `components/dashboard/ai-provider-form.tsx` — AI config form
- `components/dashboard/data-management.tsx` — Clear/export data controls

**Implementation notes**:

AI Provider form fields:
- Provider selector: Ollama / OpenAI / Anthropic (radio group)
- Model name (text input, with suggestions per provider)
- API key (password input, only shown for OpenAI/Anthropic)
- Base URL (only shown for Ollama, defaults to `http://localhost:11434`)
- "Test Connection" button that verifies the provider is reachable

Data management section:
- "Clear all emails" button with confirmation dialog
- "Clear parsed data" button (keeps emails, removes parsed entities)
- "Export data" button (delegates to Phase 6)
- Shows storage usage (approximate IndexedDB size)

Store settings in Dexie (new `settings` table, single row) or `localStorage`.

**Acceptance criteria**:
- User can select AI provider and save config
- API key field is type=password
- "Test Connection" validates the provider is reachable
- Clear data buttons require confirmation
- Settings persist across page reloads

**Commit message**: `feat: add settings page with AI provider configuration and data management`

---

### Task 3.3: Sync controls UI

**Goal**: Add UI controls for triggering sync and showing progress.

**Depends on**: Task 2.3, Task 3.1

**Files to create**:
- `components/dashboard/sync-controls.tsx` — Sync button, progress bar, "Load more" button

**Implementation notes**:

Show in the dashboard header or as a prominent card on the overview page:
- "Sync Now" button (calls `incrementalSync` or `initialSync` if never synced)
- Progress bar during sync (uses `SyncProgressCallback`)
- Last synced timestamp
- "Load older emails" button (calls `loadOlderEmails`)
- Email count badge

Use the sync state from Dexie (via `useSyncState()` hook) for last synced time and counts.

**Acceptance criteria**:
- Sync button triggers the appropriate sync mode
- Progress bar shows during sync with phase and count
- "Load more" button appears after initial sync
- UI is disabled during active sync
- Last synced time updates after sync completes

**Commit message**: `feat: add sync controls with progress tracking and load-more support`

---

## Phase 4: AI Parsing Pipeline

### Task 4.1: AI provider factory

**Goal**: Create a factory that returns a configured Vercel AI SDK provider based on user settings.

**Depends on**: Task 0.1, Task 0.2

**Files to create**:
- `lib/ai/provider.ts` — Provider factory

**Implementation notes**:

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOllama } from 'ollama-ai-provider';
import type { AIProviderConfig } from '@/lib/types/settings';

export function createAIProvider(config: AIProviderConfig) {
  switch (config.provider) {
    case 'ollama':
      return createOllama({ baseURL: config.baseUrl ?? 'http://localhost:11434/api' });
    case 'openai':
      return createOpenAI({ apiKey: config.apiKey });
    case 'anthropic':
      return createAnthropic({ apiKey: config.apiKey });
  }
}

export function getModel(config: AIProviderConfig) {
  const provider = createAIProvider(config);
  return provider(config.model);
}
```

**Acceptance criteria**:
- Factory returns a valid Vercel AI SDK provider for each provider type
- Ollama uses custom base URL if provided
- OpenAI/Anthropic use provided API keys
- `getModel()` returns a model instance ready for `generateObject()` / `generateText()`

**Commit message**: `feat: add AI provider factory for Ollama, OpenAI, and Anthropic`

---

### Task 4.2: Zod schemas for structured extraction

**Goal**: Define Zod schemas that the AI uses to return structured, typed data.

**Depends on**: Task 0.2

**Files to create**:
- `lib/ai/schemas.ts` — Zod schemas for classification and extraction

**Implementation notes**:

```typescript
import { z } from 'zod';

export const emailClassificationSchema = z.object({
  category: z.enum(['subscription', 'transaction', 'income', 'newsletter', 'other']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const subscriptionExtractionSchema = z.object({
  vendor: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  status: z.enum(['active', 'cancelled', 'trial']),
  nextRenewalDate: z.string().optional(), // ISO date string
});

export const transactionExtractionSchema = z.object({
  vendor: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  category: z.string(),
  date: z.string(), // ISO date string
});

export const incomeExtractionSchema = z.object({
  source: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  type: z.enum(['salary', 'freelance', 'refund', 'investment', 'other']),
  date: z.string(),
});

export const newsletterExtractionSchema = z.object({
  senderName: z.string(),
  summary: z.string().max(200),
});
```

These schemas are used with `generateObject()` from the AI SDK, which enforces the shape at generation time.

**Acceptance criteria**:
- All schemas exported from `lib/ai/schemas.ts`
- Schemas match the corresponding types in `lib/types/parsed.ts`
- Each schema can be passed to `generateObject({ schema })` successfully
- Zod is already a dependency (shadcn/ui uses it); no new install needed

**Commit message**: `feat: add Zod schemas for AI-powered email classification and extraction`

---

### Task 4.3: Parsing orchestrator (classify → extract)

**Goal**: Build the two-stage parsing pipeline: classify email category, then extract structured data.

**Depends on**: Task 4.1, Task 4.2, Task 0.3

**Files to create**:
- `lib/ai/parse.ts` — Orchestrator

**Implementation notes**:

Two-stage pipeline per email:

1. **Classify**: Call `generateObject()` with `emailClassificationSchema`. Input is email subject + truncated body (first 2000 chars). If category is `other`, skip extraction.

2. **Extract**: Based on category, call `generateObject()` with the appropriate extraction schema. Input includes the full email body.

```typescript
export async function classifyEmail(
  model: LanguageModel,
  email: StoredEmail,
): Promise<{ category: EmailCategory; confidence: number }>;

export async function extractData(
  model: LanguageModel,
  email: StoredEmail,
  category: EmailCategory,
): Promise<Subscription | Transaction | Income | Newsletter | null>;

export async function parseEmail(
  model: LanguageModel,
  email: StoredEmail,
): Promise<void>; // classifies, extracts, and stores in Dexie
```

`parseEmail` is the main entry point:
1. Classify
2. If category != 'other' and confidence > 0.6, extract
3. Store parsed entity in the appropriate Dexie table
4. Update email record: `parsed = true`, `parsedAt = new Date()`, `category`

**Acceptance criteria**:
- Classification returns a valid `EmailCategory` and confidence
- Extraction returns typed data matching the Zod schema
- Low-confidence results (< 0.6) are skipped
- Parsed results stored in correct Dexie table
- Email record updated with `parsed: true`

**Commit message**: `feat: add AI parsing orchestrator with classify-then-extract pipeline`

---

### Task 4.4: Batch processor with progress

**Goal**: Process unparsed emails in batches with progress reporting and cancellation.

**Depends on**: Task 4.3

**Files to create**:
- `lib/ai/batch.ts` — Batch processing orchestrator

**Implementation notes**:

```typescript
export interface BatchProgress {
  processed: number;
  total: number;
  succeeded: number;
  failed: number;
  currentEmail?: string; // subject of email being processed
}

export type BatchProgressCallback = (progress: BatchProgress) => void;

export async function processBatch(
  model: LanguageModel,
  options?: {
    batchSize?: number; // default 10
    onProgress?: BatchProgressCallback;
    signal?: AbortSignal; // for cancellation
  },
): Promise<{ succeeded: number; failed: number }>;
```

Query Dexie for emails where `parsed === false`. Process them one at a time (LLM calls are sequential to avoid rate limits). Report progress after each email. Respect `AbortSignal` for cancellation.

**Acceptance criteria**:
- Processes all unparsed emails from Dexie
- Progress callback fires after each email
- AbortSignal cancels processing between emails
- Errors on individual emails don't stop the batch
- Returns count of succeeded/failed

**Commit message**: `feat: add batch AI processor with progress tracking and cancellation`

---

## Phase 5: Dashboard Pages

### Task 5.1: Overview page

**Goal**: Build the main dashboard overview with summary stats and recent activity.

**Depends on**: Task 0.4, Task 3.1

**Files to create**:
- `app/(dashboard)/dashboard/page.tsx` — Overview page (replace placeholder)
- `components/dashboard/stats-card.tsx` — Reusable stat card
- `components/dashboard/recent-activity.tsx` — Recent email/parsed items list

**Content**:
- Stat cards: Total emails synced, Subscriptions found, Monthly spend, Monthly income
- Recent activity: Last 10 parsed items with category icon and summary
- Quick actions: Sync button, Parse emails button, Settings link

**Acceptance criteria**:
- Stats cards show live data from Dexie hooks
- Cards show 0 gracefully when no data
- Recent activity list shows parsed items sorted by date
- Page is responsive (cards stack on mobile)
- Loading states while Dexie queries resolve

**Commit message**: `feat: add dashboard overview page with stats and recent activity`

---

### Task 5.2: Subscriptions page

**Goal**: Display detected subscriptions with filtering and summary stats.

**Depends on**: Task 5.1

**Files to create**:
- `app/(dashboard)/dashboard/subscriptions/page.tsx`
- `components/dashboard/subscription-card.tsx` — Individual subscription display

**Content**:
- Summary bar: Active count, monthly total, yearly estimate
- Filter tabs: All / Active / Cancelled / Trial
- Subscription cards: Vendor name, amount, frequency, next renewal, status badge
- Sort: By amount, vendor name, next renewal date
- Empty state when no subscriptions found

**Acceptance criteria**:
- Subscriptions load from Dexie via `useSubscriptions()` hook
- Filter tabs work correctly
- Sorting works on all fields
- Empty state message guides user to sync/parse emails
- Amounts formatted with currency symbol

**Commit message**: `feat: add subscriptions dashboard page with filtering and sorting`

---

### Task 5.3: Spending page

**Goal**: Show transaction history with category breakdown chart.

**Depends on**: Task 5.1

**Files to create**:
- `app/(dashboard)/dashboard/spending/page.tsx`
- `components/dashboard/category-chart.tsx` — Recharts pie/bar chart
- `components/dashboard/transaction-row.tsx` — Table row component

**Content**:
- Category breakdown: Pie chart or horizontal bar chart (Recharts)
- Monthly total display
- Transaction table: Date, vendor, amount, category
- Date range filter (this month / last 3 months / last 6 months / all time)
- Empty state

**Acceptance criteria**:
- Chart renders with real data from Dexie
- Chart updates when date range changes
- Transaction table is sortable
- Date range filter works
- Empty state shown when no transactions

**Commit message**: `feat: add spending dashboard page with category chart and transaction list`

---

### Task 5.4: Income page

**Goal**: Display income history with trends.

**Depends on**: Task 5.1

**Files to create**:
- `app/(dashboard)/dashboard/income/page.tsx`
- `components/dashboard/income-chart.tsx` — Monthly trend line/bar chart

**Content**:
- Monthly income trend chart (Recharts BarChart)
- Income source breakdown
- Income list: Date, source, amount, type
- Date range filter
- Empty state

**Acceptance criteria**:
- Chart shows monthly income over time
- Income items load from Dexie via `useIncome()` hook
- Source breakdown groups income by source
- Date range filter works
- Empty state shown when no income detected

**Commit message**: `feat: add income dashboard page with trend chart and source breakdown`

---

### Task 5.5: Newsletters page

**Goal**: Display detected newsletters with sender grouping and unsubscribe info.

**Depends on**: Task 5.1

**Files to create**:
- `app/(dashboard)/dashboard/newsletters/page.tsx`
- `components/dashboard/newsletter-card.tsx` — Newsletter sender card

**Content**:
- Group newsletters by sender
- Show count per sender, latest subject, frequency estimate
- AI summary (if available) shown inline
- "Has unsubscribe link" badge
- Sort: By count (most frequent first), sender name, latest date
- Empty state

**Acceptance criteria**:
- Newsletters grouped by sender
- Count and latest subject shown per sender
- Summary displayed when available
- Sortable by all fields
- Empty state shown when no newsletters

**Commit message**: `feat: add newsletters dashboard page with sender grouping`

---

## Phase 6: Search, Export & Polish

### Task 6.1: Global search (Cmd+K)

**Goal**: Add a global search dialog accessible via Cmd+K (or Ctrl+K on Windows/Linux).

**Depends on**: Task 5.1

**Files to create**:
- `components/dashboard/search-dialog.tsx` — Command palette dialog
- `lib/search.ts` — Search helper that queries across all Dexie tables

**Implementation notes**:
- Use shadcn/ui `CommandDialog` (based on `cmdk`)
- Search across email subjects, vendor names, sender names
- Show results grouped by type (emails, subscriptions, transactions, etc.)
- Clicking a result navigates to the relevant dashboard page
- Register `Cmd+K` keyboard shortcut globally within dashboard layout

**Acceptance criteria**:
- Cmd+K opens search dialog
- Typing queries across all tables
- Results grouped by type with icons
- Clicking a result navigates to the correct page
- Escape closes the dialog
- Debounced search (200ms)

**Commit message**: `feat: add global Cmd+K search dialog across all data`

---

### Task 6.2: CSV/JSON export

**Goal**: Let users export their parsed data as CSV or JSON.

**Depends on**: Task 0.4

**Files to create**:
- `lib/export.ts` — Export logic for CSV and JSON
- `components/dashboard/export-dialog.tsx` — Export UI

**Implementation notes**:

```typescript
export function exportToCSV(data: Record<string, unknown>[], filename: string): void;
export function exportToJSON(data: unknown, filename: string): void;
export async function exportAll(): Promise<void>; // exports all tables as JSON
```

Use `Blob` + `URL.createObjectURL` + programmatic `<a>` click for download. CSV generation: headers from object keys, escape commas/quotes.

Export dialog:
- Data type selector: All / Emails / Subscriptions / Transactions / Income / Newsletters
- Format: CSV / JSON
- Date range filter (optional)
- "Export" button triggers download

**Acceptance criteria**:
- CSV export produces valid CSV with headers
- JSON export produces formatted JSON
- Export dialog allows selecting data type and format
- Download triggers immediately in browser
- Large exports (10K+ rows) don't freeze UI (use chunked processing)

**Commit message**: `feat: add CSV and JSON data export with type and date filtering`

---

### Task 6.3: Error boundaries & loading states

**Goal**: Add error boundaries and consistent loading states across the dashboard.

**Depends on**: Task 5.1

**Files to create**:
- `components/dashboard/error-boundary.tsx` — React error boundary with retry
- `components/dashboard/loading-skeleton.tsx` — Reusable skeleton components

**Implementation notes**:
- Error boundary catches render errors, shows a friendly message with "Try again" button
- Loading skeletons for: stats cards, table rows, chart areas
- Use shadcn/ui `Skeleton` component as base
- Wrap each dashboard page in an error boundary

**Acceptance criteria**:
- Render errors show a user-friendly message (not a white screen)
- "Try again" re-renders the component
- Loading skeletons shown while Dexie queries resolve
- Skeletons match the shape of the content they replace

**Commit message**: `feat: add error boundaries and loading skeletons to dashboard`

---

### Task 6.4: Toast notifications

**Goal**: Add toast notifications for user actions (sync complete, export done, errors).

**Depends on**: Task 3.1

**Files to create**:
- `components/ui/toaster.tsx` — Toast container (if not already from shadcn)
- Update relevant components to show toasts

**Implementation notes**:
- Use shadcn/ui `toast` / `sonner` (already common in shadcn setups)
- Add toasts for: sync started/completed/failed, export completed, parse completed, settings saved, errors
- Toast types: success (green), error (red), info (blue), warning (yellow)

**Acceptance criteria**:
- Toasts appear in bottom-right corner
- Auto-dismiss after 5 seconds
- Different styles for success/error/info
- Can be dismissed manually
- Toasts triggered from sync, export, parse, and settings operations

**Commit message**: `feat: add toast notifications for sync, parse, export, and settings`

---

## Future (Not in Scope Yet)

These items are intentionally deferred. Do not implement them now.

- **Multi-account support** — Connect multiple Gmail accounts, switch between them
- **PWA / offline mode** — Service worker, app manifest, background sync
- **MBOX import** — Upload `.mbox` files for non-Gmail analysis
- **Browser extension** — Chrome extension for inline Gmail insights
- **Team/sharing features** — Share dashboards with others (requires backend)
- **Advanced search** — Full-text search with filters (date, sender, amount range)
- **Budget alerts** — Notify when spending exceeds thresholds
- **Subscription cancellation links** — Deep link to vendor cancellation pages
