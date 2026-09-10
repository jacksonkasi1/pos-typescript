---
## Closing summary (TOP)

- **What happened:** Bar display (`/bar`) had no Puppeteer smoke while kitchen-only tests could stay green over broken bar guard/title regressions.
- **What was done:** Added `front/scripts/test-bar-display.mjs`, `test:bar-display` npm alias, and `docs/testing.md` coverage for the Bar route.
- **What was tested:** Tester ran `BASE_URL=http://127.0.0.1:4202 npm run test:bar-display` — exit 0, `RESULT: Bar display smoke passed.`, alias/docs present; overall **PASS**.
- **Why closed:** All pass/fail criteria met; ready to archive.
- **Closed at (UTC):** 2026-07-25 22:16
---

# Add Puppeteer smoke for Bar display (`/bar`)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Kitchen UI smokes only open **`/kitchen`**. The Bar display at **`/bar`** (same component, beverage station route) has no Puppeteer coverage, so a broken `uiModuleGuard('kitchen_bar')`, wrong `data.view`, or empty bar filter can ship unnoticed while kitchen tests stay green.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:52Z: SIGNAL docs/changelog owned; smoke-gap scan after demo OK
- `front/scripts/test-kitchen-status-dropdown.mjs` and `test-kitchen-timer.mjs` hard-code `/kitchen` only
- `front/package.json`: no `test:bar*` alias; `rg` on `docs/testing.md`: no `/bar` smoke
- Sibling README Access Point NEW owns docs only; kitchen-doc refresh owns **0015** prose — do **not** merge; this task owns the harness

## High-level instructions for coder

- Add a small Puppeteer script (new file or thin extension) that logs in (demo credentials), opens **`/bar`**, and asserts the page loaded (URL contains `/bar`, kitchen/bar chrome visible — mirror kitchen smoke style)
- Add `test:bar-display` (or similar) in **`front/package.json`** and a short row in **`docs/testing.md`**
- Reuse patterns from `test-kitchen-status-dropdown.mjs` / `test-kitchen-timer.mjs`; do not duplicate full timer/status matrix unless cheap
- Pass/fail: `BASE_URL=http://127.0.0.1:4202 npm run test:bar-display --prefix front` exits 0; docs list the alias

## Implementation notes (coder)

- Added `front/scripts/test-bar-display.mjs`: login → `/bar` → assert URL, `.kitchen-view` header, Bar title (`BAR_DISPLAY.TITLE`), timer settings + fullscreen toggle; loads `.env` `DEMO_LOGIN_*` like other staff smokes.
- Added `test:bar-display` in `front/package.json`.
- Documented in `docs/testing.md` (§13b, npm scripts table, coverage summary).
- Coder smoke: `BASE_URL=http://127.0.0.1:4202 npm run test:bar-display --prefix front` → exit 0 (Title: Bar display).

## Testing instructions

### What to verify

- New Puppeteer smoke opens **`/bar`** (not `/kitchen`) and confirms Bar display chrome + title.
- npm alias and `docs/testing.md` list `test:bar-display`.

### How to test

```bash
# From repo root, stack up on HAProxy (dev):
set -a && source .env && set +a
export LOGIN_EMAIL="${DEMO_LOGIN_EMAIL:-$LOGIN_EMAIL}"
export LOGIN_PASSWORD="${DEMO_LOGIN_PASSWORD:-$LOGIN_PASSWORD}"
BASE_URL=http://127.0.0.1:4202 npm run test:bar-display --prefix front
```

Optional checks:

```bash
rg -n 'test:bar-display|test-bar-display' front/package.json docs/testing.md
test -f front/scripts/test-bar-display.mjs
```

### Pass/fail criteria

- **Pass:** script exits **0**; stdout includes `RESULT: Bar display smoke passed.` and a Bar (not Kitchen) title; `docs/testing.md` and `package.json` mention `test:bar-display`.
- **Fail:** redirected away from `/bar`, Kitchen title, missing `.kitchen-view` / timer chrome, pageerror, or missing alias/docs.

## Test report

1. **Date/time (UTC):** 2026-07-25T22:15:59Z start → 2026-07-25T22:16:14Z end. Log window: last ~5 minutes around the run.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development`; `HEADLESS=1`; demo/staff login via `.env` `DEMO_LOGIN_*`.
3. **What was tested:** Puppeteer `test:bar-display` opens `/bar` (not `/kitchen`), asserts Bar chrome + title; `front/package.json` alias and `docs/testing.md` coverage.
4. **Results:**
   - Script exit 0 + `RESULT: Bar display smoke passed.` + title `Bar display` — **PASS** (stdout: login → `/bar` → chrome; exit 0 in ~7.4s)
   - Route is `/bar` not `/kitchen` — **PASS** (script asserts URL contains `/bar`; HAProxy served KitchenDisplayComponent after `/bar`)
   - `test:bar-display` in `package.json` — **PASS** (`front/package.json:40`)
   - Documented in `docs/testing.md` — **PASS** (§13b / npm table / coverage summary; `rg` hits at lines 451, 488, 590)
   - Script file present — **PASS** (`front/scripts/test-bar-display.mjs`)
5. **Overall:** **PASS**
6. **Product owner feedback:** Bar display now has a dedicated smoke, so a broken `/bar` guard or title regression will fail CI/local checks even when kitchen smokes stay green. Alias and testing docs match the rest of the kitchen suite. Ready to close.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/login`
   2. `http://127.0.0.1:4202/bar`
8. **Relevant log excerpts (last section):**
   - Smoke stdout: `Title: Bar display` / `RESULT: Bar display smoke passed.`
   - HAProxy ~22:16:11–22:16:12Z: `GET /api/users/me` 200; `GET /api/tenant/kitchen-display-settings` 200; `GET /api/orders` 200; Angular HMR touch for `kitchen-display.component.ts@KitchenDisplayComponent`
   - `pos-front`: prior rebuild OK; only pre-existing NG8107 MenuComponent warnings (unrelated)
   - `pos-back`: no errors in window

