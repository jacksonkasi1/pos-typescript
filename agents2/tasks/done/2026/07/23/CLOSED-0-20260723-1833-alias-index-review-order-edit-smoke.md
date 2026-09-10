---
## Closing summary (TOP)

- **What happened:** Enhancement reviewer queued a docs/npm alias gap for the existing Orders edit Puppeteer smoke (`review-order-edit-puppeteer.mjs`).
- **What was done:** Added `test:review-order-edit` in `front/package.json` and indexed it in `docs/testing.md` (how-to, npm table, Orders coverage); removed the stale “no npm script” note.
- **What was tested:** Alias mapping, docs/`rg` checks, and `HEADLESS=1 npm run test:review-order-edit` on `http://127.0.0.1:4202` — all **PASS** (Edit modal + status popover “Review OK”).
- **Why closed:** All pass/fail criteria met; no product code change.
- **Closed at (UTC):** 2026-07-26 03:02
---

# Alias and index review-order-edit Puppeteer smoke

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`front/scripts/review-order-edit-puppeteer.mjs` is a durable Orders smoke (Edit button, edit modal, status popover z-index) already described in **`docs/testing.md`**, but it has **no** `test:*` npm alias. The testing doc even calls out that it must be run via raw `node`. Agents following the npm table miss it next to `test:order-8-status` and other staff-order smokes.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:33Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; NEW backlog≈91 — tiny index/alias only
- `rg` on `front/package.json`: no `review-order-edit`
- `docs/testing.md` § coverage + how-to already document the script; line noting “no npm script” lists it with `test-menu-logo` / `test-websocket`
- Out of scope (already queued): **`NEW-0-20260723-1617-alias-index-remaining-puppeteer-smokes`** owns menu-logo / websocket / api-docs / etc. — do **not** re-list those; this task is **review-order-edit only**
- Sibling **`NEW-0-20260723-1714-order-comments-puppeteer-smoke`** invents a comments flow — do not merge

## High-level instructions for coder

- Add `test:review-order-edit` → `node scripts/review-order-edit-puppeteer.mjs` in **`front/package.json`** (same style as other `test:*`)
- Update **`docs/testing.md`**: npm table / how-to to prefer the alias; remove `review-order-edit-puppeteer` from the “have no npm script” sentence (leave menu-logo/websocket there until **1617** lands, or refresh that sentence if 1617 already shipped)
- No product code; do not change the Puppeteer assertions unless the alias path breaks
- Pass/fail: `npm run test:review-order-edit --prefix front` resolves; `rg 'test:review-order-edit' docs/testing.md front/package.json` hits

## Coder notes (2026-07-26)

- Added `test:review-order-edit` in `front/package.json` next to `test:order-8-status`.
- Updated `docs/testing.md` §7b how-to to prefer `npm run test:review-order-edit --prefix front`; added npm table row; coverage summary uses the alias.
- Removed the leftover “has no npm script” sentence (sibling **1617** already shipped `test:menu-logo` / `test:websocket` / `test:api-docs`).
- Verified: `npm run test:review-order-edit --prefix front` exited 0 (Review OK).

## Testing instructions

### What to verify

- `front/package.json` exposes `test:review-order-edit` → `node scripts/review-order-edit-puppeteer.mjs`.
- `docs/testing.md` documents the alias in §7b, the npm scripts table, and the Orders coverage row.
- No remaining “review-order-edit has no npm script” note.

### How to test

```bash
# Alias resolves + smoke (app up on HAProxy, e.g. 4202; needs LOGIN_* / DEMO_LOGIN_* for tenant 1)
BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:review-order-edit --prefix front

# Index checks
rg 'test:review-order-edit' docs/testing.md front/package.json
rg -n 'has no npm script|no npm script' docs/testing.md || true
```

### Pass/fail criteria

- **Pass:** `npm run test:review-order-edit --prefix front` runs the existing Puppeteer script (exit 0 when stack + creds OK); `rg 'test:review-order-edit'` hits both `front/package.json` and `docs/testing.md`; no sentence claiming this script lacks an npm alias.
- **Fail:** missing script key, docs still say run only via raw `node` / “no npm script”, or alias points at a non-existent path.

## Test report

1. **Date/time (UTC):** 2026-07-26 03:01:25 start → 03:01:51 end. Log window: last ~5 minutes on `pos-front` / `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced); `HEADLESS=1`; credentials via `.env` `DEMO_LOGIN_*`.
3. **What was tested:** `test:review-order-edit` npm alias → existing Puppeteer script; `docs/testing.md` §7b / npm table / Orders coverage; absence of “no npm script” claim for this smoke.
4. **Results:**
   - Alias in `front/package.json` maps to `node scripts/review-order-edit-puppeteer.mjs` — **PASS** (`"test:review-order-edit": "node scripts/review-order-edit-puppeteer.mjs"`).
   - Script file exists — **PASS** (`front/scripts/review-order-edit-puppeteer.mjs`).
   - `rg 'test:review-order-edit'` hits `docs/testing.md` (how-to, npm table, Orders coverage) and `front/package.json` — **PASS** (3 doc hits + 1 package hit).
   - No remaining “has no npm script” / “no npm script” sentence in `docs/testing.md` — **PASS** (`rg` empty).
   - `BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:review-order-edit --prefix front` — **PASS** (exit 0; “Review OK: Edit buttons present, order edit modal opens (from History), status popover visible.”).
5. **Overall:** **PASS**
6. **Product owner feedback:** Agents can now discover and run the Orders edit/z-index smoke next to other staff-order aliases without raw `node`. Docs and package.json stay aligned; no product behavior change.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (preflight HTTP 200)
   2. `http://127.0.0.1:4202/login` (Puppeteer login, tenant 1)
   3. `http://127.0.0.1:4202/staff/orders` (Edit on card + History, status popover)
8. **Relevant log excerpts:**
   - `pos-front`: `Application bundle generation complete. [1.035 seconds] - 2026-07-26T03:00:29.998Z` (no TS/build errors in window).
   - `pos-back` during smoke: `GET /users/me` 200; `GET /orders` 200; `GET /tenant-products?active_only=true` 200; no 4xx/5xx errors matched in the test window.
   - Puppeteer stdout: `Review OK: Edit buttons present, order edit modal opens (from History), status popover visible.`

