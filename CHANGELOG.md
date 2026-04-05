# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added
- Real EDGAR 13F XML parsing with cache and error handling.
- Institution selector for Berkshire, BlackRock, Vanguard, Tiger Global, and Third Point.
- Quarter selector with per-quarter holdings via filingsByQuarter.
- Cross-quarter changeShares delta computation across the two most recent filings.
- Holdings table sorting, sticky header, horizontal scroll, and column min-widths.
- Holding delta arrows, green/red styling, and count-up animation.
- Dashboard metric strip (total value, holdings count, top holding, quarter).
- Loading skeleton, empty state, and error card UX.
- Dark filters bar with search icon styling.
- Dark sticky header layout with quarter badge and responsive nav.
- Design system tokens and type stack (Fraunces, Instrument Sans, IBM Plex Mono).
- design-preview.html for visual QA.
- VITE_USE_MOCK env support for mock data.
- Express EDGAR proxy server on port 5174.
