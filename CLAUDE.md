# CLAUDE.md

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Local commands
- `npm run dev` — Vite dev server
- `npm run dev:server` — EDGAR proxy on :5174
- `npm run dev:full` — app + proxy together
- `npm run build` — typecheck + production build
- `npm run test` — unit tests
- `npm run lint` — lint

## Docs
- README.md — product overview + quickstart
- DESIGN.md — visual system
- CONTRIBUTING.md — contribution workflow
- CHANGELOG.md — shipped changes
