# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The full project guide — architecture decisions, commands, design-system rules — lives in AGENTS.md and applies to all agents:

@AGENTS.md

Claude-specific notes:

- **Non-negotiable**: `bun run build` must pass before any commit.
- When building UI, follow the shadcn skill rules if available; this project uses **base-sera** style (Base UI `render` prop, not Radix `asChild`) and **Hugeicons** (never lucide).
- V1 lives at `../myinboxreport.com` — reference it when porting the Gmail engine (`lib/gmail/`) or the AI provider/availability patterns, but do not import from it.
