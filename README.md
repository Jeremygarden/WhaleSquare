# WhaleSquare (WhaleWisdom Clone)

Track institutional 13F holdings with a fast, dark UI and real EDGAR data. Pick an institution, pick a quarter, and see holdings plus quarter-over-quarter deltas.

## Features
- Real EDGAR 13F XML parsing with caching and error handling
- Institution selector (Berkshire, BlackRock, Vanguard, Tiger Global, Third Point)
- Quarter selector with per-quarter holdings
- Cross-quarter changeShares delta computation
- Holdings table with sorting, sticky header, and horizontal scroll
- Delta indicator with up/down arrows and count-up animation
- Dashboard metrics strip (total value, holdings count, top holding, quarter)
- Loading skeleton, empty state, and error cards
- Dark design system with shared tokens (see DESIGN.md)

## Quickstart

```bash
npm install
npm run dev:full
```

- App: http://localhost:5173
- EDGAR proxy: http://localhost:5174

### Using mock data

Set `VITE_USE_MOCK=true` to bypass EDGAR and use local mock data.

```bash
VITE_USE_MOCK=true npm run dev
```

## Scripts

- `npm run dev` — Vite dev server
- `npm run dev:server` — EDGAR proxy on :5174
- `npm run dev:full` — app + proxy together
- `npm run build` — typecheck + production build
- `npm run preview` — serve production build
- `npm run test` — run unit tests

## Architecture (high level)

- **Frontend**: React + Vite
- **State**: Zustand for UI/data state
- **Tables**: @tanstack/react-table for sorting and layout
- **Server**: Express proxy to EDGAR 13F data (port 5174)

## Docs

- DESIGN.md — visual system and UI constraints
- CONTRIBUTING.md — local setup, workflow, and testing
- CHANGELOG.md — shipped changes
- CLAUDE.md — project-specific instructions for agents

## Notes

The EDGAR proxy is required for real 13F data. If the proxy is down, the UI will surface an error state.
