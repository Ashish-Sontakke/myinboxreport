## Contributing to MyInboxReport

Thanks for helping build a private, local-first Gmail analytics tool. This guide covers how to get set up, the workflow we prefer, and the principles to keep in mind.

### Ways to help
- Ship features (parsers, dashboards, local LLM connectors).
- Improve UX/copy for the landing page and in-app flows.
- Harden privacy defaults or OAuth scopes.
- File issues with reproducible steps, screenshots, or logs.
- Write docs: onboarding, architecture notes, or threat models.

### Local setup
1. Install [Bun](https://bun.sh/) and Node 20+.
2. Install dependencies: `bun install`.
3. Run the app: `bun dev` (http://localhost:3000).
4. Lint before pushing: `bun lint`.

### Workflow
- Use feature branches (`feature/subscriptions-card`, `docs/contributing`, etc.).
- Keep pull requests focused and small; include screenshots for UI changes.
- Add tests or docs when behavior changes, even for small tweaks.
- Describe privacy implications in the PR body if the change touches Gmail, storage, or LLM calls.
- Prefer client-side, local-first solutions; avoid adding servers or third-party trackers.

### Design principles
- Read-only Gmail access with minimum scopes.
- Local storage by default with explicit opt-ins for any remote calls.
- Transparent parsing logic: prompts and extractors should be easy to audit.
- Performance matters on mid-range laptops; avoid heavy dependencies when possible.

### Pull request checklist
- [ ] Lints pass (`bun lint`).
- [ ] Screenshots included for visual changes.
- [ ] Docs updated (README or inline comments) if behavior or setup changed.
- [ ] Notes on privacy impact and data flow are included when relevant.
