# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyInboxReport is a privacy-first Gmail analytics web app. All processing runs client-side—no backend servers. Users connect Gmail with read-only OAuth, parse messages locally (optionally with local LLMs like Ollama), and view dashboards for subscriptions, income, spending, and newsletters. Data stays in browser storage (IndexedDB/localStorage).

## Development Commands

```bash
bun install    # install dependencies
bun dev        # run dev server at http://localhost:3000
bun lint       # run ESLint
bun build      # production build
```

Requires: [Bun](https://bun.sh/) and Node 20+

## Architecture

**Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript

**Key directories**:
- `app/(marketing)/` — Public landing pages with Header/Footer layout
- `app/(dashboard)/dashboard/` — Authenticated dashboard pages (overview, subscriptions, spending, income, newsletters, settings)
- `components/ui/` — shadcn/ui component library (Radix primitives)
- `components/` — App-level components (Header, Footer, ThemeProvider)
- `components/dashboard/` — Dashboard-specific components (sidebar, stats cards, charts, sync controls)
- `contexts/` — React contexts (auth)
- `lib/types/` — Shared TypeScript type definitions (email, parsed entities, settings)
- `lib/db/` — Dexie.js database layer (IndexedDB schema, hooks)
- `lib/gmail/` — Gmail auth (GIS), API client (fetch-based), sync engine
- `lib/ai/` — AI parsing pipeline (provider factory, Zod schemas, orchestrator, batch processor)
- `lib/utils.ts` — `cn()` helper for Tailwind class merging
- `config.ts` — Site metadata (title, description, URLs)

**Styling**: Tailwind v4 with OKLCH color tokens defined in `app/globals.css`. Theme tokens follow shadcn/ui conventions (`--primary`, `--secondary`, `--background`, etc.) with light/dark mode support via `next-themes`.

**Path aliases**: `@/*` maps to project root (configured in `tsconfig.json`)

## Design Principles

- **Local-first**: All data processing happens in the browser. No backend servers, no API routes. The app is statically exported (`output: 'export'`).
- **Minimal Gmail scopes**: Read-only access only (`gmail.readonly`).
- **Incremental fetch**: First sync fetches the last 30 days only. Users can load older months on demand. Never bulk-load an entire mailbox.
- **AI-first parsing**: All email classification and data extraction uses Vercel AI SDK with structured output (Zod schemas). No rule-based parsers. Users configure their own provider (Ollama, OpenAI, Anthropic).
- **GIS implicit grant**: Gmail auth uses Google Identity Services implicit grant (not PKCE). Tokens are short-lived and stored in memory only.
- **Direct fetch() for Gmail**: No `googleapis` npm package. Direct REST calls with typed responses.
- **Auditable**: Parsing logic and AI prompts should be transparent and easy to review.
- **Performance-conscious**: Target mid-range laptops; avoid heavy dependencies.
- **Agent-ready tasks**: The ROADMAP.md contains numbered, self-contained tasks with clear inputs, outputs, files, and acceptance criteria for autonomous AI agent execution.

## PR Guidelines

- Run `bun lint` before pushing
- Include screenshots for UI changes
- Note privacy implications when touching Gmail, storage, or LLM integrations
- Use feature branches (`feature/...`, `docs/...`)
