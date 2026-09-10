---
## Closing summary (TOP)

- **What happened:** Five existing Puppeteer npm aliases (`test:settings-logo`, `test:support-access`, `test:kitchen-timer`, `test:book-whatsapp`, `test:my-shift-clock-qr`) were missing from `docs/testing.md`.
- **What was done:** Documented how-to sections **13c–13g** and matching npm scripts table rows in `docs/testing.md` only; no `package.json` or product code changes.
- **What was tested:** All index checks passed (`rg` for five aliases, script paths vs `package.json`, env notes vs headers); optional `test:book-whatsapp` smoke PASS. Overall PASS.
- **Why closed:** All criteria passed; docs-only index gap closed.
- **Closed at (UTC):** 2026-07-26 01:02
---

# Index five aliased Puppeteer smokes missing from docs/testing.md

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`front/package.json` already exposes **`test:settings-logo`**, **`test:support-access`**, **`test:kitchen-timer`**, **`test:book-whatsapp`**, and **`test:my-shift-clock-qr`**, but **`docs/testing.md`** does not list them. Agents and humans following the testing index miss durable smokes for Settings logo upload, support-user flows, kitchen timer, book WhatsApp CTA, and my-shift clock QR.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` all owned; demo_tables_check=ok; NEW backlog=56 — this is **index-only**, not a bulk docs rewrite
- `rg` on `docs/testing.md`: no hits for `settings-logo`, `support-access`, `kitchen-timer`, `book-whatsapp`, or `my-shift-clock`
- Scripts + aliases already exist under `front/scripts/` / `front/package.json`
- Sibling tasks own other gaps: **`UNTESTED/CLOSED-0-20260723-1801-retarget-delivery-checkout-smoke-index`** (courier/delivery checkout — supersedes archived 1142), **`NEW-0-20260723-0639-index-platform-operator-smoke-testing-doc`** (platform) — do **not** merge; this task is the five aliased orphans only

## High-level instructions for coder

- Add short Test-scripts table rows (and brief how-to bullets if the file’s pattern requires them) in **`docs/testing.md`** for:
  - `npm run test:settings-logo --prefix front` → `test-settings-logo-upload.mjs` (`LOGIN_EMAIL` / `LOGIN_PASSWORD`)
  - `npm run test:support-access --prefix front` → `test-support-access.mjs` (admin/owner login)
  - `npm run test:kitchen-timer --prefix front` → `test-kitchen-timer.mjs`
  - `npm run test:book-whatsapp --prefix front` → `test-book-whatsapp-puppeteer.mjs` (public book; note `API_BASE` if needed)
  - `npm run test:my-shift-clock-qr --prefix front` → `test-my-shift-clock-qr.mjs` (waiter + optional `OWNER_EMAIL`)
- Documentation only — do not invent new Puppeteer flows; do not change `package.json` aliases
- Pass/fail: `rg` finds each `test:` name in `docs/testing.md`; a reader can copy-paste a working command from the header comments of each script

## Implementation notes (coder)

- Status: **implemented** (docs only; no `back/` / `front/` product or `package.json` changes).
- Updated **`docs/testing.md`**:
  - How-to sections **13c–13g** (settings logo, support access, kitchen timer, book WhatsApp, my-shift clock QR) with copy-paste `npm run test:… --prefix front` commands and env notes aligned with each script header.
  - Matching rows in the **npm scripts (front)** table.
- Verified: `rg` finds all five `test:` names in `docs/testing.md`.

## Testing instructions

### What to verify

- `docs/testing.md` indexes the five existing npm aliases and points at the correct script files / env vars.
- No product or `package.json` changes were introduced for this task.

### How to test

From repo root:

```bash
rg -n 'test:settings-logo|test:support-access|test:kitchen-timer|test:book-whatsapp|test:my-shift-clock-qr' docs/testing.md
# Optional smoke (app up): BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:book-whatsapp --prefix front
```

Confirm each alias appears in both a how-to subsection (**13c–13g**) and the npm scripts table, and that script paths match `front/package.json`.

### Pass/fail criteria

- **Pass:** All five `test:` names appear in `docs/testing.md`; commands and env match script headers; `package.json` unchanged for this task.
- **Fail:** Any alias still missing, wrong script path, or inventing new Puppeteer flows / alias renames.

## Test report

1. **Date/time (UTC):** 2026-07-26 01:02:13 start → 01:02:30 end. Log window: ~5m before end (no front/back errors in window).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Index of five aliased Puppeteer smokes in `docs/testing.md` (how-to **13c–13g** + npm scripts table); script paths vs `front/package.json`; env notes vs script headers; no `package.json` change for this task; optional `test:book-whatsapp` smoke.
4. **Results:**
   - All five `test:` names in `docs/testing.md` (how-to + table): **PASS** — `rg` hits at lines 580/593/606/619/633 (how-to) and 673–677 (table).
   - Script paths match `front/package.json`: **PASS** — aliases point to `test-settings-logo-upload.mjs`, `test-support-access.mjs`, `test-kitchen-timer.mjs`, `test-book-whatsapp-puppeteer.mjs`, `test-my-shift-clock-qr.mjs`.
   - Commands/env match script headers: **PASS** — `LOGIN_*`/`DEMO_LOGIN_*`, admin/owner, kitchen login, public book + optional `API_BASE`, waiter `LOGIN_*` + optional `OWNER_*`.
   - No product / `package.json` changes for this task: **PASS** — `git status` clean for `front/package.json`; only `docs/testing.md` (+71) differs.
   - Optional smoke `test:book-whatsapp`: **PASS** — exit 0; WhatsApp link `https://wa.me/34717102603` on `/book/1`.
5. **Overall:** **PASS**
6. **Product owner feedback:** The five orphaned npm aliases are now discoverable from the testing index with copy-paste commands. Agents following `docs/testing.md` will no longer miss settings logo, support access, kitchen timer, book WhatsApp, or my-shift clock QR smokes. Docs-only change; no alias renames or new Puppeteer flows.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (health; HTTP 200)
   2. `http://127.0.0.1:4202/book/1` (optional book-whatsapp smoke)
8. **Relevant log excerpts:**
   ```
   > front@2.1.59 test:book-whatsapp
   BASE_URL: http://127.0.0.1:4202
   WhatsApp link found: true https://wa.me/34717102603
   PASS: WhatsApp link visible on book page.
   ```
   Front/back: no error/exception lines in the 5m window during verification.
