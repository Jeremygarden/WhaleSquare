# Design System — WhaleSquare

## Product Context
- **What this is:** A 13F institutional holdings tracker for market participants who need fast, reliable visibility into fund positioning and quarterly changes.
- **Who it's for:** Investors, analysts, portfolio managers, and finance hobbyists who work with data-dense screens daily.
- **Space/industry:** Financial data, institutional holdings analytics (WhaleWisdom / Unusual Whales class).
- **Project type:** Web app dashboard with heavy tables, filters, and detail pages.

## Aesthetic Direction
- **Direction:** Industrial / Utilitarian with editorial accents
- **Decoration level:** Minimal with intentional contrast and hierarchy
- **Mood:** Precise, trustworthy, and data-first. Feels like a professional terminal that grew a modern UI, not a marketing site.
- **Reference sites:** whalewisdom.com, unusualwhales.com/portfolios

## Typography
- **Display/Hero:** Fraunces — adds gravitas for page headers and key moments without affecting dense data areas.
- **Body:** Instrument Sans — sharp, legible, modern, built for UI density.
- **UI/Labels:** Instrument Sans (all-caps optional for section labels).
- **Data/Tables:** IBM Plex Mono — compact, tabular-nums friendly, strong alignment.
- **Code:** IBM Plex Mono.
- **Loading:** Google Fonts import for Fraunces + Instrument Sans + IBM Plex Mono.
- **Scale:**
  - xs 12px / 0.75rem
  - sm 13px / 0.8125rem
  - base 15px / 0.9375rem
  - md 16px / 1rem
  - lg 18px / 1.125rem
  - xl 22px / 1.375rem
  - 2xl 28px / 1.75rem
  - 3xl 36px / 2.25rem

## Color
- **Approach:** Restrained with one primary accent, strong neutrals, semantic colors only where needed.
- **Primary (action/links):** #3B82F6
- **Secondary (highlights):** #F59E0B
- **Neutrals:**
  - bg: #0B0F14
  - surface-1: #111827
  - surface-2: #151C2D
  - border: #1F2937
  - text-strong: #F8FAFC
  - text: #E5E7EB
  - text-muted: #9CA3AF
- **Semantic:**
  - success: #22C55E
  - warning: #F59E0B
  - error: #EF4444
  - info: #38BDF8
- **Dark mode:** Default. Surfaces step up by 6–10% lightness, accent saturation reduced slightly to avoid glare.

## Spacing
- **Base unit:** 4px
- **Density:** Compact for tables, comfortable for cards.
- **Scale:** 2xs(2) xs(4) sm(8) md(12) lg(16) xl(24) 2xl(32) 3xl(48) 4xl(64)

## Layout
- **Approach:** Grid-disciplined
- **Grid:** 12 columns desktop, 8 columns tablet, 4 columns mobile
- **Max content width:** 1280px for data pages, 1440px for dashboard overview
- **Border radius:** sm 4px, md 8px, lg 12px, full 9999px
- **Elevation:** subtle, 1–2 layer levels only

## Motion
- **Approach:** Minimal-functional
- **Easing:** enter (ease-out), exit (ease-in), move (ease-in-out)
- **Duration:** micro 80ms, short 160ms, medium 240ms, long 400ms

## Component Guidance
- **Metric cards:** label in muted caps, value in 28–36px, delta chip to the right.
- **Tables:** 12px vertical padding, sticky header, hover wash at 8% accent.
- **Filters:** compact inputs, left icon, clear focus ring in primary.
- **Charts:** thin gridlines, muted axis text, color used sparingly.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-05 | Full design system defined | Built for data density, trust, and speed in a financial dashboard |
