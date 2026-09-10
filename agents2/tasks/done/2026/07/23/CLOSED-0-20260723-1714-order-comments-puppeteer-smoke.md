---
## Closing summary (TOP)

- **What happened:** Optional order-line and order-level comments were shipped without a Puppeteer smoke or `docs/testing.md` index.
- **What was done:** Added `front/scripts/test-order-comments.mjs`, npm alias `test:order-comments`, and testing-doc rows covering public menu comments through kitchen/bar highlight.
- **What was tested:** Local HAProxy smoke (2026-07-25) — guest item + order notes → kitchen `.item-notes` / `.order-notes`; overall **PASS**.
- **Why closed:** All pass/fail criteria met; no GitHub issue (#0).
- **Closed at (UTC):** 2026-07-25 21:47
---

# Add Puppeteer smoke for order / item comments

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Optional order-line and order-level comments (#284) are shipped (public menu “Add comment”, staff notes, kitchen/bar highlight) with pytest coverage, but **`front/scripts/`** has **no** Puppeteer smoke and **`docs/testing.md`** does not index one. UI regressions on the guest comment path or kitchen highlight would only be caught manually. Sibling **`NEW-0-20260723-0734-document-order-item-comments`** is **docs only** — do not merge.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:14Z: `SIGNAL docs_stale×14` owned; improvement theme (smoke coverage), not a stale-doc rewrite
- Shipped: `back/app/order_notes.py`, public menu cart comments, kitchen/bar highlight; `back/tests/test_order_notes.py`
- `rg` on `front/scripts/*.mjs`: no `notes` / `comment` / `Add comment` smoke
- Out of scope: kitchen-display delivery refresh (**`NEW-0-20260723-0716-refresh-kitchen-display-doc-delivery`**); order-comments documentation NEW above

## High-level instructions for coder

- Add **`front/scripts/test-order-comments.mjs`** (or similar) using existing Puppeteer helpers (`puppeteer-headless.mjs`, `BASE_URL`, demo/`LOGIN_*` or public menu token as appropriate)
- Prefer a minimal path: public menu (or staff order) → set an item/order comment → open kitchen (or order detail) and assert the comment text is visible / highlighted
- Keep assertions resilient (optional fields must not block checkout); respect ~500 char product cap if asserted
- Add `test:order-comments` to **`front/package.json`** and a short row in **`docs/testing.md`**
- Do **not** expand product behaviour; link the smoke from the order-comments doc NEW only if that file already exists
- Pass/fail: `npm run test:order-comments --prefix front` exits 0 against local HAProxy; script listed in `docs/testing.md`

## Implementation notes (coder)

- Added **`front/scripts/test-order-comments.mjs`**, npm alias **`test:order-comments`**, and rows in **`docs/testing.md`** (npm scripts table + coverage summary).
- Path: resolve tenant **Take Away** token via API → public `/menu/:token` → Main Course product → item + order comments → place order → assert `.item-notes` / `.order-notes` on `/kitchen` (fallback `/bar`).
- Local run 2026-07-25: `BASE_URL=http://127.0.0.1:4202 npm run test:order-comments --prefix front` → **PASS**.

## Testing instructions

### What to verify

- Guest can set an optional **item comment** and **order notes** on the public Take Away menu and place the order without a PIN.
- Kitchen (or bar) display shows both texts in the highlighted note UI (`.item-notes`, `.order-notes`).
- `test:order-comments` is wired in `front/package.json` and indexed in `docs/testing.md`.

### How to test

```bash
# Stack up (HAProxy), demo credentials in .env (DEMO_LOGIN_* or LOGIN_*)
BASE_URL=http://127.0.0.1:4202 npm run test:order-comments --prefix front

# Optional: watch browser
HEADLESS=0 BASE_URL=http://127.0.0.1:4202 npm run test:order-comments --prefix front
```

If Take Away is missing: `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.seeds.seed_demo_tables`

### Pass/fail criteria

- **Pass:** script exits **0**; kitchen/bar shows both unique smoke comment strings; `rg test:order-comments front/package.json docs/testing.md` hits.
- **Fail:** exit ≠ 0; comments missing on display; alias or testing.md row absent.

## Test report

1. **Date/time (UTC):** start 2026-07-25T21:46:03Z, end 2026-07-25T21:46:28Z. Log window: `--since 5m` on `pos-front` / `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; HAProxy `http://127.0.0.1:4202`; branch `development`; `HEADLESS=1`; demo `LOGIN_*` from `.env`.
3. **What was tested:** Public Take Away menu item + order comments → place order → kitchen `.item-notes` / `.order-notes`; npm alias + `docs/testing.md` index.
4. **Results:**
   - Guest item + order comments and checkout without PIN — **PASS** (`RESULT: Order comments smoke passed.`; unique strings `Smoke item note 15967493` / `Smoke order notes 15967493`; `POST /menu/.../order` 200).
   - Kitchen shows both texts in highlighted note UI — **PASS** (`/kitchen`: `bodyHasItem: true`, `bodyHasOrder: true`, `itemNotesEl: true`, `orderNotesEl: true`).
   - `test:order-comments` wired and indexed — **PASS** (`front/package.json:49`; `docs/testing.md` npm table + coverage rows for Kitchen / Menu).
5. **Overall:** **PASS**
6. **Product owner feedback:** The smoke covers the guest comment path end-to-end into kitchen highlight with unique strings, so UI regressions on optional notes should be caught without manual checks. Wiring in `package.json` and `docs/testing.md` matches the task pass criteria. No GitHub issue (#0); no label updates.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/menu/c8b96dbb-a988-447c-a25c-9cf892e5afce`
   2. `http://127.0.0.1:4202/kitchen` (after staff login)
8. **Relevant log excerpts:**
   - `pos-back`: `POST /menu/c8b96dbb-a988-447c-a25c-9cf892e5afce/order HTTP/1.1" 200 OK`; kitchen settings/stations GETs 200 during assert window.
   - `pos-front`: no TS/NG build errors in window; only existing NG8107 optional-chain warnings unrelated to this smoke.
   - Script stdout: exit 0 — `RESULT: Order comments smoke passed.`
