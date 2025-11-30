# myinboxreport.com

Privacy-first Gmail analytics powered by local LLMs. Everything runs in the browser: connect your inbox with read-only OAuth, parse messages on-device, and see dashboards for subscriptions, income, spend patterns, newsletters, and more. No servers, no hosted database, open source by default.

## What it does
- Surfaces subscriptions and auto-pay charges with renewal reminders.
- Tracks income signals like payroll, refunds, and payouts with simple trends.
- Auto-categorizes spending using a local LLM you control.
- Compiles newsletters to declutter the inbox.
- Stores data locally (IndexedDB/local storage) so you stay in control.

## How it works
1. Authorize Gmail with the minimum read-only scope.
2. Sync mail locally, then run parsing with your own LLM (Ollama, LM Studio, or a custom endpoint).
3. Render dashboards and exports without sending data off-device.
4. Clear or export everything whenever you want.

## Trust and privacy
- Client-only Next.js app; no backend calls to vendors you did not configure.
- Bring-your-own-model for parsing; defaults will stay local-first.
- Transparent codebase so you can audit before connecting Gmail.

## Development
Prereqs: [Bun](https://bun.sh/) and Node 20+.

```bash
bun install         # install deps
bun dev             # run the app on http://localhost:3000
bun lint            # lint the project
```

Project entrypoints:
- `app/page.tsx` — landing page and marketing content.
- `app/layout.tsx` — global layout and providers.
- `app/globals.css` — Tailwind (v4) theme tokens and base styles.

## Roadmap (early draft)
- Gmail sync pipeline with local persistence.
- Pluggable parsers for subscriptions, income, spend, and newsletters.
- Export to CSV/Parquet and optional offline search index.
- Local LLM connectors and prompt packs.

## Contributing
Contributions are welcome. See `CONTRIBUTING.md` for setup, workflow, and review guidelines.
