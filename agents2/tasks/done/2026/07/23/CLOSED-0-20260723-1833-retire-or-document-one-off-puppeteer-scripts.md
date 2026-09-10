---
## Closing summary (TOP)

- **What happened:** One-off Puppeteer scripts `review-orders-buttons.mjs` and `capture-reports-screenshot.mjs` were undocumented and superseded by durable tooling.
- **What was done:** Both scripts were deleted; operators rely on `capture-screenshots.mjs` / `npm run capture-screenshots` and `npm run test:reports`. No docs or package.json links to the deleted basenames remained.
- **What was tested:** File-absence checks, rg for leftover refs (none), durable scripts present, optional landing + reports Puppeteer — overall **PASS**.
- **Why closed:** All pass/fail criteria met; tester outcome PASS.
- **Closed at (UTC):** 2026-07-26 02:35
---

# Retire or document one-off Puppeteer scripts

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Two committed one-off scripts under **`front/scripts/`** are invisible to the testing/screenshots indexes and have no npm aliases: `review-orders-buttons.mjs` (print/Factura button screenshots) and `capture-reports-screenshot.mjs` (writes `docs/screenshots/reports-review.png`). Operators either rediscover them by accident or leave dead tooling in the tree. Prefer **remove** if superseded; otherwise document briefly.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:33Z: smoke/orphan script scan after SIGNAL docs/changelog owned; NEW backlog≈91
- `rg` on `docs/testing.md` / `docs/screenshots/README.md` / `front/package.json`: no hits for either basename
- Durable replacements already exist: **`capture-screenshots.mjs`** (+ `npm run capture-screenshots`) documented in **`docs/screenshots/README.md`**; **`test:reports`** covers Reports UI
- Do not confuse with **`review-order-edit-puppeteer.mjs`** (owned by sibling **`NEW-0-20260723-1833-alias-index-review-order-edit-smoke`**)

## High-level instructions for coder

- For each of `review-orders-buttons.mjs` and `capture-reports-screenshot.mjs`, choose **one**:
  - **Delete** the script (and any obsolete output path notes) if `capture-screenshots` / `test:reports` / manual screenshot steps fully supersede it, **or**
  - Add a short “one-off / historical” bullet under **`docs/screenshots/README.md`** or **`docs/testing.md`** with usage + when to prefer the durable script instead
- Do not add new product flows; do not invent a third capture framework
- Pass/fail: either scripts gone and no broken docs links, or both names appear once in docs with clear “prefer X instead” guidance; `rg` on package.json still has no accidental aliases unless intentionally added

## Implementation notes (coder)

- **Choice:** delete both (superseded).
- Removed `front/scripts/review-orders-buttons.mjs` — orders visuals covered by `capture-screenshots.mjs` → `docs/screenshots/orders.png` (`/staff/orders`).
- Removed `front/scripts/capture-reports-screenshot.mjs` — reports visuals covered by same durable script → `docs/screenshots/reports.png`; UI smoke via `npm run test:reports`.
- No docs/README/`package.json` references to the deleted basenames or to `reports-review.png` (file was never indexed); left `review-order-edit-puppeteer.mjs` alone (sibling NEW).

## Testing instructions

### What to verify

- Both one-off scripts are gone from `front/scripts/`.
- Durable capture + reports smoke remain; no broken doc links to the deleted scripts.
- `front/package.json` has no aliases for the deleted basenames.

### How to test

```bash
# From repo root
test ! -f front/scripts/review-orders-buttons.mjs
test ! -f front/scripts/capture-reports-screenshot.mjs
test -f front/scripts/capture-screenshots.mjs
test -f front/scripts/test-reports.mjs

rg -n 'review-orders-buttons|capture-reports-screenshot' \
  front/package.json docs/testing.md docs/screenshots/README.md README.md \
  || true
# Expect: no matches

# Optional (stack up): durable replacements still work
# BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
# BASE_URL=http://127.0.0.1:4202 LOGIN_EMAIL=… LOGIN_PASSWORD=… npm run test:reports --prefix front
```

### Pass/fail criteria

- **Pass:** both scripts deleted; `rg` finds no references in testing/screenshots indexes or `package.json`; `capture-screenshots.mjs` and `test-reports.mjs` still present.
- **Fail:** either script still on disk, or docs/`package.json` still point at the deleted basenames.

## Test report

1. **Date/time (UTC):** 2026-07-26 02:33:58–02:34:37 UTC (log window ≈ last 10m of container logs during optional smoke).
2. **Environment:** local Docker `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development`; HEADLESS=1 for Puppeteer.
3. **What was tested:** both one-off scripts removed from `front/scripts/`; durable `capture-screenshots.mjs` + `test-reports.mjs` present; no leftover refs in `front/package.json`, `docs/testing.md`, `docs/screenshots/README.md`, or `README.md`; optional landing + reports smoke.
4. **Results:**
   - Both scripts gone (`test ! -f` for `review-orders-buttons.mjs` and `capture-reports-screenshot.mjs`) — **PASS**
   - Durable replacements present (`capture-screenshots.mjs`, `test-reports.mjs`) — **PASS**
   - `rg` on package.json / testing / screenshots README / README for deleted basenames — **PASS** (no matches; exit 1)
   - `package.json` still has `capture-screenshots` and `test:reports` aliases only — **PASS**
   - Optional `npm run test:landing-version` — **PASS** (exit 0)
   - Optional `npm run test:reports` — **PASS** (exit 0; Reports page loaded)
5. **Overall:** **PASS**
6. **Product owner feedback:** Dead one-offs are gone; operators should use `npm run capture-screenshots` and `npm run test:reports`. No broken index links. Safe cleanup with no product-flow impact.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/my-shift
   4. http://127.0.0.1:4202/staff/orders
   5. http://127.0.0.1:4202/tables
   6. http://127.0.0.1:4202/kitchen
   7. http://127.0.0.1:4202/bar
   8. http://127.0.0.1:4202/customers
   9. http://127.0.0.1:4202/reports
8. **Relevant log excerpts:** Landing and reports Puppeteer both printed `RESULT: … OK/passed` with exit 0. Front logs in window showed only pre-existing NG8107 optional-chain warnings (no TS/build failures). Back: routine `GET /docs` 200; no traceback/500 in the window. No GitHub issue (# none — enhancement reviewer); labels skipped.
