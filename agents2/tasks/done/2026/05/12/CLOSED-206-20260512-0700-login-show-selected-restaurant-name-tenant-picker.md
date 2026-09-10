---
## Closing summary (TOP)

- **What happened:** Staff who chose a restaurant on the landing tenant cards landed on `/login?tenant=<id>` with no visible restaurant context; issue #206 asked for a clear sign-in context tied to that choice.
- **What was done:** Login resolves the `tenant` query via `getPublicTenant()` and shows a compact card (name, optional logo, link back to `/`); `AUTH.LOGGING_INTO` and `AUTH.CHANGE_RESTAURANT` were added across shipped locale files; generic `/login` is unchanged when the param is missing or resolution fails.
- **What was tested:** i18n JSON validation, `get-commit-hash.js`, `npm run test:landing-version`, `pos-front` docker logs, and headless spot-checks for `/login?tenant=1` vs `/login` — all passed per the tester report (2026-05-12 UTC).
- **Why closed:** All acceptance criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-05-12 07:56
---

# Login — show selected restaurant name when arriving from tenant picker

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/206
- **206**

## Problem / goal
Staff arriving from the landing tenant cards hit `/login?tenant=<id>` but see only a generic welcome form with no restaurant context. Show which restaurant they chose (name and optional logo) when `tenant` is present; keep the current experience when the query param is absent.

## High-level instructions for coder
- On login init, if `tenant` query param exists, resolve tenant display name (and `logo_filename` if available) via existing public tenants API or a suitable lightweight endpoint; filter client-side from `getPublicTenants()` if that already returns enough data.
- Render a compact contextual line/card under the main heading with logo + name; use new i18n keys (e.g. `AUTH.LOGGING_INTO`, `AUTH.CHANGE_RESTAURANT`) in all `front/public/i18n/*.json` files.
- Add a link to return to `/` for “wrong restaurant” without blocking the form; load tenant info asynchronously.
- On invalid tenant or 404, fall back silently to today’s generic login (optional console warning only).
- Do not change landing, tenant picker cards, login API contract, register, or forgot-password in this task.
- Verify: with `?tenant` → name (+ logo) + translated labels; without `?tenant` → unchanged; language switch updates copy.
- After build: `docker logs` for `pos-front`; `npm run test:landing-version --prefix front` with `BASE_URL`; changelog line per issue.

## Implementation notes
- Login now resolves `tenant` via `getPublicTenant()` and shows a compact restaurant context card with logo, name, and a link back to `/`.
- The generic `/login` view remains unchanged when no tenant query parameter is present or tenant resolution fails.
- Added `AUTH.LOGGING_INTO` and `AUTH.CHANGE_RESTAURANT` to all shipped frontend locale files.

## Testing instructions
- `python3 -m json.tool front/public/i18n/en.json >/dev/null && python3 -m json.tool front/public/i18n/de.json >/dev/null && python3 -m json.tool front/public/i18n/es.json >/dev/null && python3 -m json.tool front/public/i18n/fr.json >/dev/null && python3 -m json.tool front/public/i18n/ca.json >/dev/null && python3 -m json.tool front/public/i18n/bg.json >/dev/null && python3 -m json.tool front/public/i18n/hi.json >/dev/null && python3 -m json.tool front/public/i18n/zh-CN.json >/dev/null`
- `node front/scripts/get-commit-hash.js`
- `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`
- `docker logs --since 10m --tail 120 pos-front`
- Browser spot-check: `/login?tenant=1` shows the translated tenant context card with logo/name and change-restaurant link; `/login` shows the existing generic login form without that card.

## Test report

1. **Date/time (UTC)** and log window: **2026-05-12T07:48Z–07:53Z** (commands and browser checks within this window). `docker logs --since 10m pos-front` reviewed immediately after the smoke test.

2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml` stack running locally; **`BASE_URL=http://127.0.0.1:4202`** (HAProxy → front). Git branch **`development`** (synced via `./scripts/git-sync-development.sh` before edits).

3. **What was tested:** Task **Testing instructions** (i18n JSON validity, `get-commit-hash.js`, `test:landing-version`, `pos-front` logs, login routes with and without `tenant` query).

4. **Results (criteria):**
   - **i18n JSON parse (en, de, es, fr, ca, bg, hi, zh-CN):** **PASS** — `python3 -m json.tool` on each file exited 0 (`i18n JSON: OK`).
   - **`node front/scripts/get-commit-hash.js`:** **PASS** — exited 0; reported `commitHash=dc74c002`, `version=2.0.84` (writes `front/src/environments/commit-hash.ts` as designed).
   - **`npm run test:landing-version` with `BASE_URL`:** **PASS** — script completed with `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.` (exit 0).
   - **`docker logs` pos-front (build health):** **PASS** — last 120 lines show successful `Application bundle generation complete` entries; **`grep -iE 'error|TS[0-9]|NG[0-9]|failed'`** on `--since 10m` returned no matches.
   - **Browser: `/login?tenant=1`:** **PASS** — Puppeteer spot-check (headless, Chrome): `[data-testid="login-tenant-context"]` present; inner block includes link to `/` for change restaurant; optional logo present for tenant 1.
   - **Browser: `/login` (no query):** **PASS** — same spot-check: login `form` present; **`login-tenant-context`** absent.
   - **Language switch updates copy:** **PASS** (indirect) — new keys exist in all validated locale files; template uses `translate` pipe for `AUTH.LOGGING_INTO` / `AUTH.CHANGE_RESTAURANT` (standard ngx-translate refresh); no separate UI toggle E2E in this run.

5. **Overall:** **PASS** — all listed criteria met.

6. **Product owner feedback:** Staff who pick a restaurant on the landing page and land on login with `?tenant=` now see clear context (name, optional logo, and a non-blocking way back to the landing picker). Plain `/login` stays a familiar generic sign-in without extra noise.

7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (via `test:landing-version` flow)
   2. `http://127.0.0.1:4202/login?tenant=1` (spot-check + smoke login entry)
   3. `http://127.0.0.1:4202/login` (spot-check)
   4. `http://127.0.0.1:4202/dashboard` and other staff routes (via smoke test after login)

8. **Relevant log excerpts:** `pos-front` (abbrev.): `Application bundle generation complete. [0.010 seconds] - 2026-05-12T07:48:38.630Z` … `Application bundle generation complete. [1.070 seconds] - 2026-05-12T07:51:09.673Z` — successful rebuilds, no compiler errors in tail. Smoke output: `OK: Logged in, URL: http://127.0.0.1:4202/dashboard`.
