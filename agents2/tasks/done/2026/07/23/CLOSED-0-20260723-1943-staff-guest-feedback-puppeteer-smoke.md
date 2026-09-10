---
## Closing summary (TOP)

- **What happened:** Staff Guest feedback (`/guest-feedback`) lacked a dedicated Puppeteer smoke; only public `/feedback` i18n was covered.
- **What was done:** Added `front/scripts/test-guest-feedback-staff.mjs`, npm alias `test:guest-feedback-staff`, and indexed it in `docs/testing.md`.
- **What was tested:** Local HAProxy smoke passed (list GET 200, heading “Guest feedback”, table visible; package.json + testing.md indexed).
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 22:44
---

# Add Puppeteer smoke for staff guest-feedback page

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Staff **Guest feedback** at **`/guest-feedback`** (Reservations module) is a live ops surface, but the only automated front coverage is **`test:feedback-public-i18n`** for public **`/feedback/:tenantId`**. Regressions on the staff list (empty state, load error, missing table) would not fail CI-style smokes.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:43Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; Unreleased=1 post-2.1.29; NEW backlog≈103 — small smoke only
- `front/src/app/app.routes.ts`: `guest-feedback` behind `authGuard` + reservations module
- `rg` on `front/scripts/*.mjs` / `front/package.json`: public i18n smoke only; no staff `/guest-feedback` script
- Sibling **`NEW-0-20260723-1943-readme-access-point-public-feedback`** owns README/0011 pointers — do **not** merge

## High-level instructions for coder

- Add **`front/scripts/test-guest-feedback-staff.mjs`** (or similar) using existing Puppeteer helpers (`puppeteer-headless.mjs`, `BASE_URL`, `LOGIN_*` for a user with reservations access)
- Happy path: login → open `/guest-feedback` → assert page shell (heading / `data-testid` if present / no raw i18n key dump) and that the request does not 500; empty list is OK
- Add `test:guest-feedback-staff` (or similar) to **`front/package.json`** and a short row in **`docs/testing.md`**
- Do **not** reinvent public `/feedback` coverage; do not expand product behaviour
- Pass/fail: `npm run test:guest-feedback-staff --prefix front` exits 0 against local HAProxy; alias listed in `docs/testing.md`

## Implementation notes (coder)

- Added `front/scripts/test-guest-feedback-staff.mjs`: login → `/guest-feedback` → wait for `GET /tenant/guest-feedback` (fail on ≥400) → assert `h1`, no raw `FEEDBACK.*`, QR card / table / empty state.
- npm script `test:guest-feedback-staff` in `front/package.json`.
- Documented in `docs/testing.md` §2a4 and npm scripts table.
- Local run 2026-07-25: `BASE_URL=http://127.0.0.1:4202 npm run test:guest-feedback-staff --prefix front` → OK (list GET 200, heading “Guest feedback”).

## Testing instructions

### What to verify

- Staff `/guest-feedback` loads after login for a reservations-capable user.
- List API does not hard-fail; page shows heading and table or empty state (not raw i18n keys).
- npm alias and `docs/testing.md` index the new smoke.

### How to test

```bash
# App up via HAProxy (dev overlay), credentials from .env DEMO_LOGIN_* or LOGIN_*
BASE_URL=http://127.0.0.1:4202 npm run test:guest-feedback-staff --prefix front

# Optional visible browser
HEADLESS=0 BASE_URL=http://127.0.0.1:4202 npm run test:guest-feedback-staff --prefix front
```

Confirm docs: `rg -n 'test:guest-feedback-staff|test-guest-feedback-staff' docs/testing.md front/package.json`

### Pass/fail criteria

- **Pass:** script exits 0; logs show list GET OK and heading/shell; `docs/testing.md` and `package.json` list `test:guest-feedback-staff`.
- **Fail:** still on `/login`, missing GET, HTTP ≥400 on list, raw `FEEDBACK.*` keys, or missing heading/shell.

## Test report

1. **Date/time (UTC):** 2026-07-25T22:43:51Z start → 2026-07-25T22:44:03Z end. Log window: last ~5m on `pos-back` / `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced); `HEADLESS=1`; credentials `DEMO_LOGIN_*` from `.env` as `LOGIN_*`.
3. **What was tested:** Staff `/guest-feedback` after login; list GET non-fail; heading/shell (no raw `FEEDBACK.*`); npm alias + `docs/testing.md` index.
4. **Results:**
   - Staff page loads after login — **PASS** (landed `/dashboard`, then `/guest-feedback`)
   - List API OK — **PASS** (`GET /tenant/guest-feedback` → 200; script: `List GET OK: 200`)
   - Heading / shell, no raw i18n dump — **PASS** (heading “Guest feedback”; feedback table visible)
   - npm alias + docs index — **PASS** (`front/package.json:47`; `docs/testing.md` §2a4 + scripts table)
5. **Overall:** **PASS**
6. **Product owner feedback:** Staff Guest feedback now has a dedicated smoke that would catch login-route or list API regressions. Empty-list tolerance is fine; this run saw a populated table. No product behaviour change was required for this task.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (app responds 200)
   2. `http://127.0.0.1:4202/login` (via smoke login)
   3. `http://127.0.0.1:4202/dashboard` (post-login)
   4. `http://127.0.0.1:4202/guest-feedback`
8. **Relevant log excerpts:**
   ```
   # npm run test:guest-feedback-staff --prefix front
   List GET OK: 200
   Heading: Guest feedback
   Feedback table visible
   >>> RESULT: Staff guest-feedback smoke OK

   # pos-back (window)
   GET /tenant/guest-feedback?limit=200 HTTP/1.1" 200 OK
   ```
   Front logs in-window show only unrelated `MenuComponent` NG8107 warnings; no guest-feedback build errors.

