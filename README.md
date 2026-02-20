# Portfolio Dashboard

A portfolio-grade dashboard skeleton for strategy/backtest workflows built with Vite + React + TypeScript.

It demonstrates three core product surfaces:
- Interactive runs table with URL-synced state.
- Validated run creation form with presets.
- Run detail metrics with lazily loaded charts.

## Features

- Routing and layout
  - Sidebar + top bar app shell
  - Routes: `/dashboard`, `/runs`, `/runs/new`, `/runs/:id`, `404`
- Runs table
  - TanStack Table integration
  - Global search, status filter, server-style sorting/pagination
  - URL query-state persistence (`query`, `status`, `sort`, `page`, `pageSize`)
  - Loading, empty, and error states with retry
- New Run form
  - `react-hook-form` + `zod` validation
  - 6 presets that auto-fill fields
  - Inline submit loading/error feedback
- Run detail
  - Metric cards (PF, trades, max drawdown, status, date range)
  - Equity and drawdown charts (`recharts`)
  - Chart module lazy-loaded with Suspense fallback
- Accessibility polish
  - Consistent visible focus styles
  - Keyboard row navigation on runs table (Enter/Space)
  - Form helper/error text associated via `aria-describedby`

## Screenshots

Programmatic screenshot capture is not configured in this repo yet.

Place screenshots in `docs/screenshots/` using these filenames:
- `runs-table.png`
- `new-run-form.png`
- `run-detail-charts.png`
- `dashboard.png` (optional)

TODO placeholders and capture steps are in `docs/screenshots/README.md`.

## Tech Stack

- React 19
- TypeScript
- Vite (react-swc-ts)
- React Router
- TanStack Table
- React Hook Form + Zod
- Recharts

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Run dev server

```bash
npm run dev
```

### 3. Build

```bash
npm run build
```

### 4. Run lightweight tests

```bash
npm test
```

## Project Structure

```text
src/
  app/
    router.tsx
    RouteLoadingState.tsx
  components/
    layout/
      AppLayout.tsx
      SideNav.tsx
      TopNav.tsx
    ui/
      Badge.tsx
      Button.tsx
      Card.tsx
      Input.tsx
      Select.tsx
  features/
    runs/
      components/
        RunDetailCharts.tsx
      mockApi.ts
      mockData.ts
      queryState.ts
      types.ts
  lib/
    format.ts
  pages/
    DashboardPage.tsx
    RunsPage.tsx
    NewRunPage.tsx
    RunDetailPage.tsx
    NotFoundPage.tsx
scripts/
  run-tests.mjs
docs/
  screenshots/
```

## Testing Notes

`npm test` runs a lightweight Node script (no extra test framework) that validates:
- `listRuns` filtering/sorting/pagination behavior.
- URL query parsing sanitizes invalid params to defaults.

## Performance Notes

Route-level lazy loading is enabled and the heavy run-detail chart module is split into its own chunk.

## Roadmap

- Server/API integration for runs and analytics.
- Debounced search and richer column filters.
- More chart drill-downs and benchmark overlays.
- End-to-end tests for critical flows.
