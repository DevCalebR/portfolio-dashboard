# Ship Readiness Audit

Date: 2026-03-03  
Project: `portfolio-dashboard`

## Scope and Sales Model

Audit target: sell this repository as a one-time purchase template/app, where buyers receive source + setup docs, or a hosted demo + deploy guide.

## Readiness Snapshot

- Overall readiness: **Conditional Go**
- Reason: core template packaging blockers were fixed in this pass, with one remaining business/legal sign-off item.

## 1) Release-Readiness Verification

### README with quickstart + deploy

- Status: **Pass**
- Evidence:
  - Quickstart flow with setup, run, and pre-deploy checks in `README.md`.
  - Netlify deploy guide included.
  - Script reference section added for buyers.

### `.env.example` + clear env descriptions

- Status: **Pass**
- Evidence:
  - `.env.example` added with comments for each `VITE_APP_*` key.
  - `scripts/setup-env.mjs` creates `.env.local` from example.
  - Runtime config now reads these values in `src/config/appConfig.ts`.

### Remove hardcoded personal identifiers

- Status: **Pass**
- Evidence:
  - Personal links removed from `README.md`.
  - Internal artifact with personal references removed (`FINISHING_REPORT.md`).

### Consistent licensing + template terms

- Status: **Pass (pending legal review)**
- Evidence:
  - `LICENSE` added (Relay Works Template License v1.0).
  - `TEMPLATE_USAGE_TERMS.md` added and referenced from `README.md`.

## 2) Productization Gaps Identified

### Screenshots in `/public` or `docs/`

- Status: **Already present**
- Evidence: `docs/screenshots/runs.png`, `new-run.png`, `run-detail.png`.

### Feature list + FAQ

- Status: **Fixed**
- Evidence: dedicated `Features` and `FAQ` sections in `README.md`.

### Starter configuration flow

- Status: **Fixed**
- Evidence:
  - `.env.example`
  - `npm run setup`
  - `npm run setup:env`
  - README starter-config instructions

## 3) Punch List

### Blockers

- [x] Add template license and usage terms.
- [x] Add `.env.example` and setup automation for buyer onboarding.
- [x] Remove personal/public identity links from ship-facing docs.
- [x] Add release verification pipeline (`deploy:check`) and smoke test.
- [ ] Run legal/commercial review of `LICENSE` and `TEMPLATE_USAGE_TERMS.md` before marketplace launch.

### Important

- [ ] Decide whether to keep mock API for v1 or ship a minimal real API adapter example.
- [ ] Add a browser-level smoke test (Playwright/Cypress) for critical routes.
- [ ] Add `CHANGELOG.md` and versioning policy for buyer updates.
- [ ] Add a one-page support policy (response window, update window, boundaries).

### Nice-to-have

- [ ] Add 1-click deploy buttons (Netlify/Vercel).
- [ ] Add animated GIF/video walkthrough for product listing pages.
- [ ] Add optional seed/fixture generator for demo personalization.

## 4) Top Blockers Implemented in This Pass

- README polish: quickstart, scripts, deploy guide, feature list, FAQ, license links.
- Env example + starter flow:
  - `.env.example`
  - `scripts/setup-env.mjs`
  - `src/config/appConfig.ts`
  - UI wiring in top/side nav and document metadata.
- Install/run/deploy scripts in `package.json`:
  - `setup`, `setup:env`, `install:deps`, `start`, `smoke`, `deploy:check`.
- Dead links/identity cleanup:
  - Removed personal external links from README.
  - Removed non-shipping `FINISHING_REPORT.md`.
- In-app legal surfacing:
  - Added minimal footer legal links in the shell layout.
  - Added hosted legal assets in `public/legal/`.
- Basic smoke test:
  - `scripts/smoke-test.mjs` validates `dist/index.html` and SPA `_redirects`.

## Verification Commands and Results

Commands run successfully:
- `npm run lint` (1 warning, 0 errors)
- `npm run typecheck`
- `npm test`
- `npm run build`

Additional release check added and validated:
- `npm run smoke`

Known non-blocking warning:
- ESLint `react-hooks/incompatible-library` warning in `src/pages/RunsPage.tsx` for TanStack `useReactTable` interaction with React Compiler memoization rules.
