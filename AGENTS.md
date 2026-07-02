<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MyInboxReport v2

Privacy-first Gmail analytics, rebuilt chat-first. An AI agent turns the user's Gmail into a **per-user analytics database**: it samples the inbox, converses with the user about what to track, designs the schema and categories itself, extracts structured data from emails, and answers questions with SQL + charts. Everything runs client-side — no backend, no API routes, statically exported.

This is the v2 rewrite of `../myinboxreport.com` (v1). V1's fixed schema/categories/dashboards produced wrong, uncorrectable data; v2's core thesis is that the schema belongs to the user, and errors must be correctable in conversation.

## Commands

```bash
bun install    # install dependencies
bun dev        # dev server at http://localhost:3000
bun lint       # ESLint
bun run build  # production build (static export to out/)
```

**Always run `bun run build` before committing. Run `bun lint` before pushing.**

## Architecture

**Stack**: Next.js (App Router, `output: 'export'`), React, Tailwind v4, TypeScript, Bun.

**Key decisions** (agreed 2026-07; see git history for context):

1. **Chat-first UI; dashboard is an artifact.** The conversation is the primary surface. Charts/tables the agent produces can be pinned; the dashboard is just saved (query, chart-spec) pairs.
2. **SQLite-wasm (OPFS) as the data layer** — NOT IndexedDB/Dexie. The agent literally runs `CREATE TABLE` / SQL. Schemas are per-user and agent-designed.
3. **Agent tools**: `run_sql`, `define_extraction_schema`, `render_chart(spec)`, `pin_to_dashboard`. Chart rendering takes a constrained spec (not arbitrary code).
4. **Capability split**: schema design / chat / SQL use the strongest available model (occasional calls); per-email extraction is bulk and runs as structured output against the agent-generated schema.
5. **Models**: Ollama is the free/local default. Users can add their own Anthropic API key — the Anthropic API supports direct browser access (CORS) — as the quality tier. Either way, email content goes only to the user's chosen model.
6. **Gmail**: GIS implicit grant (read-only scope), direct `fetch()` REST calls, incremental sync with a user-chosen initial window. Port this from v1 `../myinboxreport.com/lib/gmail/` — it is battle-tested. Silent token refresh (`prompt: ''`) only works inside a user gesture (popups are blocked on page load); v1's `ensureToken()` pattern handles this.
7. **No backend, ever.** No API routes, no server components that fetch. If a feature needs a server, the feature is wrong.
8. **Observability is a feature**: structured in-app activity log; extraction failures are recorded per-item, visible, and retryable — never silently swallowed.

## Implementation notes (hard-won — do not re-learn these)

- **sqlite-wasm cannot be bundled by Turbopack.** The worker (`lib/db/sqlite-worker.ts`) loads the self-contained build from `/public/sqlite/` (copied by `scripts/copy-sqlite.mjs` via predev/prebuild) through a bundler-invisible dynamic import (`new Function("u","return import(u)")`). Don't import `@sqlite.org/sqlite-wasm` directly anywhere.
- **OPFS sahpool is single-tab** (second tab gets a friendly error from DbProvider) and **does not work in incognito/ephemeral Chromium profiles** — writes intermittently return a wrapped `FILE_ERROR_NO_SPACE` errno. Pool capacity is set to 4 (default 6) since we open exactly one DB.
- **GIS silent token refresh (`prompt:''`) only works inside a user gesture** — popups are blocked on page load. `ensureToken()` in auth-context is the only correct entry point (single-flight).
- All `date` columns are **unix epoch milliseconds**; the agent instructions spell out the strftime pattern because local models get this wrong otherwise.
- Headless verification harness: `scratchpad verify-*.mjs` scripts (playwright-core + persistent profile against the static export). Playwright's default ephemeral context will falsely fail OPFS writes — always use `launchPersistentContext`.
- The new React compiler lint (`react-hooks/set-state-in-effect`) flags async data-load effects; those carry documented `eslint-disable-next-line` comments. Don't blanket-disable the rule.

## Next up (owner feedback, 2026-07-02)

- **Background sync**: initial sync currently blocks the first-run screen; it should continue in the background while the user starts chatting/onboarding.
- **Extraction as dispatched tasks / subagents**: extraction runs as one opaque loop today. Direction: dispatch per-concern extraction as visible tasks (what is being extracted, for which table, why) — likely per-spec workers with their own progress, and possibly a subagent that can refine specs from failures.
- **Async feel**: sync/extraction/chat currently feel too synchronous; decouple long operations from the UI thread of interaction.
- BYO-key cloud models via `@ai-sdk/openai-compatible` (planned; settings type already accommodates it).

## Design system

shadcn/ui with preset `b1oVyCNk` — style **base-sera**, neutral palette, Geist / Geist Mono fonts.

- **Primitives are Base UI, not Radix**: custom triggers use the `render` prop (`<Button render={<a href .../>}>`), NOT `asChild`.
- **Icons are Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`), NEVER lucide. Usage: `<HugeiconsIcon icon={Mail01Icon} />`. Icons inside Buttons get `data-icon="inline-start|inline-end"` and no size classes.
- Semantic tokens only (`bg-primary`, `text-muted-foreground`); never raw palette classes or manual `dark:` color overrides.
- Layout spacing with `flex`/`grid` + `gap-*`, never `space-x/y-*`. Equal dimensions use `size-*`.
- Forms use `FieldGroup`/`Field`; option sets use `ToggleGroup`; empty states use `Empty`; toasts via `sonner`.
- Chat UI composes the registry's `message`, `message-scroller`, and `bubble` components.
- Check installed components in `components/ui/` before adding; add via `bunx --bun shadcn@latest add <name>`.

## Conventions

- Bun is the package manager (`bun add`, not npm/pnpm).
- Feature branches (`feature/...`); include screenshots for UI changes.
- Note privacy implications in PRs touching Gmail, storage, or model integrations.
- The landing page lives at `app/page.tsx`; the app shell will live under `app/app/`.
