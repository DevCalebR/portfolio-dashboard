# Portfolio Dashboard Template

Portfolio Dashboard is a production-ready Vite + React + TypeScript template for backtest research workflows. It includes URL-synced run exploration, validated run creation, and chart-based run detail pages.

## Features

- URL-synced runs table state for query, status, sorting, and pagination.
- New Run flow with `react-hook-form` + `zod` validation and presets.
- Run detail metrics with lazy-loaded chart modules.
- Accessible keyboard navigation and visible focus states.
- Built-in CI-friendly checks: lint, typecheck, tests, build, and smoke test.
- Starter branding via `.env.local` for name/tagline/title customization.

## Screenshots

![Runs table](docs/screenshots/runs.png)
![New run form](docs/screenshots/new-run.png)
![Run detail charts](docs/screenshots/run-detail.png)

## Quickstart

### Prerequisites

- Node.js 20+
- npm 10+

### 1. Install dependencies + generate starter config

```bash
npm run setup
```

This runs `npm ci` and creates `.env.local` from `.env.example` if it does not already exist.

### 2. Customize starter configuration

Edit `.env.local` values (app name, subtitle, nav label, title suffix, description).

### 3. Run locally

```bash
npm run dev
```

### 4. Run release checks

```bash
npm run deploy:check
```

## Deploy Guide

### Netlify

Use:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

SPA routing is handled by `public/_redirects`:

```text
/* /index.html 200
```

### Optional hosted demo workflow

1. Run `npm run deploy:check` locally.
2. Push to your own Git provider repo.
3. Connect repo in Netlify and deploy with the settings above.
4. Share the deployed URL as your product demo.

## Scripts

- `npm run setup`: install deps and scaffold `.env.local`.
- `npm run dev`: run local dev server.
- `npm run lint`: ESLint checks.
- `npm run typecheck`: TypeScript checks.
- `npm test`: lightweight behavior tests for query state + mock API.
- `npm run build`: production build.
- `npm run smoke`: checks required files in `dist/` after build.
- `npm run deploy:check`: full pre-deploy verification pipeline.

## Starter Configuration Reference

See `.env.example` for descriptions. Keys:
- `VITE_APP_NAME`
- `VITE_APP_SUBTITLE`
- `VITE_APP_NAV_LABEL`
- `VITE_APP_PRIMARY_ACTION_LABEL`
- `VITE_APP_MARK`
- `VITE_APP_TITLE_SUFFIX`
- `VITE_APP_DESCRIPTION`

## FAQ

### Does this template include a backend?

No. It ships with a mock API layer in `src/features/runs/mockApi.ts`.

### Can I replace the mock data with my own API?

Yes. Keep the page-level contracts and swap the mock API functions with your service client.

### Is this suitable for a paid product template?

Yes. The repository includes licensing files, setup flow, screenshots, and deploy guidance.

### How do I validate a release quickly?

Run `npm run deploy:check` before publishing a demo or distributing the template.

## Project Structure

```text
src/
  app/
  components/
  config/
  features/
  lib/
  pages/
scripts/
docs/
  screenshots/
```

## License and Terms

- License: [LICENSE](LICENSE)
- Usage terms: [TEMPLATE_USAGE_TERMS.md](TEMPLATE_USAGE_TERMS.md)
- In-app links: footer `Legal` links open hosted copies at `/legal/license.txt` and `/legal/template-usage-terms.txt`.
