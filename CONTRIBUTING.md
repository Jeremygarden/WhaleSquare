# Contributing

Thanks for helping improve WhaleSquare. This guide is short on purpose. Keep changes focused and ship cleanly.

## Setup

```bash
npm install
npm run dev:full
```

- App: http://localhost:5173
- EDGAR proxy: http://localhost:5174

### Mock data

Use mock data when you want fast UI iteration without EDGAR calls:

```bash
VITE_USE_MOCK=true npm run dev
```

## Workflow

- Create a branch per change.
- Keep commits small and descriptive.
- Run tests before opening a PR.

## Tests and lint

```bash
npm run test
npm run lint
```

## Design system

Read DESIGN.md before touching UI. If you deviate, explain why in the PR.
