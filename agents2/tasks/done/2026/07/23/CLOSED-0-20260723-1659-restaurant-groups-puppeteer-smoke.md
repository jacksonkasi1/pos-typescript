---
## Closing summary (TOP)

- **What happened:** Restaurant groups Settings UI lacked a dedicated Puppeteer smoke and a `docs/testing.md` index row, so create/join/leave regressions were only catchable by manual QA.
- **What was done:** Added `front/scripts/test-restaurant-groups.mjs`, npm script `test:restaurant-groups`, indexed it in `docs/testing.md`, and added a one-line smoke pointer in `docs/0054-restaurant-groups.md`.
- **What was tested:** Local HAProxy smoke exited 0 (mode: member on tenant 1); `GET /api/restaurant-group` 200; npm + docs discoverability confirmed. Overall PASS.
- **Why closed:** All pass/fail criteria met; no product fix needed from the test run.
- **Closed at (UTC):** 2026-07-25 21:13
---

# Add restaurant-groups Puppeteer smoke + testing.md row

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Restaurant groups (#283) are shipped with Settings UI testids and **`docs/0054-restaurant-groups.md`**, but **`front/scripts/`** has **no** dedicated Puppeteer smoke and **`docs/testing.md`** does not index one. Regressions on create/join/leave or the Settings tab would only be caught by manual QA, unlike paywall / delivery / platform / courier smokes. Sibling **`NEW-0-20260723-1648-waiting-list-puppeteer-smoke`** covers waiting list only — do not merge.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T16:59Z: `SIGNAL docs_stale×14` all owned; `demo_tables_check=ok`; Unreleased=2; NEW backlog≈65 — improvement theme (smoke coverage), not a stale-doc rewrite
- `docs/0054` documents `data-testid="settings-restaurant-group-tab"` / `settings-restaurant-group-section` and create/join/leave flows
- `rg` on `front/package.json` / `front/scripts/`: no `test:restaurant-group*` / `test-restaurant-group*`
- `docs/testing.md`: no restaurant-groups smoke row (groups doc exists; smoke gap remains)

## High-level instructions for coder

- Add a headless Puppeteer script under **`front/scripts/`** that logs in as owner/admin, opens **Settings → Restaurant group**, and asserts the section/tab is visible (create/join UI when not in a group, or member/leave UI when already grouped — keep assertions resilient to either state; prefer demo tenant or documented test tenants)
- Prefer existing testids from **`docs/0054`**; do not invent brittle copy-only selectors
- Add `test:restaurant-groups` (or matching name) to **`front/package.json`** and a short row in **`docs/testing.md`**
- Do **not** rewrite **`docs/0054`** beyond a one-line smoke pointer if useful
- Pass/fail: `npm run test:restaurant-groups --prefix front` exits 0 against local HAProxy; script is discoverable from `docs/testing.md`

## Implementation notes (coder)

- Added `front/scripts/test-restaurant-groups.mjs` (login → `/settings` → `settings-restaurant-group-tab` → assert `settings-restaurant-group-section` with create/join **or** member/leave).
- npm script `test:restaurant-groups` in `front/package.json`.
- Indexed in `docs/testing.md` (section 2a2 + npm table); one-line smoke pointer in `docs/0054-restaurant-groups.md`.
- Local verify 2026-07-25: `BASE_URL=http://127.0.0.1:4202 npm run test:restaurant-groups --prefix front` → exit 0 (mode: member on tenant 1).

## Testing instructions

### What to verify

- Owner/admin can open **Settings → Restaurant group** and the section renders (create/join or member/leave).
- Smoke is discoverable via npm script and `docs/testing.md`.

### How to test

```bash
# Stack up (dev HAProxy), credentials in .env (DEMO_LOGIN_* or LOGIN_*) for owner/admin on TENANT_ID=1
BASE_URL=http://127.0.0.1:4202 npm run test:restaurant-groups --prefix front
# Or: BASE_URL=http://127.0.0.1:4202 TENANT_ID=1 node front/scripts/test-restaurant-groups.mjs
```

Optional: confirm `docs/testing.md` lists `test:restaurant-groups` and `docs/0054` mentions the smoke.

### Pass/fail criteria

- **Pass:** command exits **0**; console shows section OK (mode `create-or-join` or `member`).
- **Fail:** exit **1** (login failure, missing tab/section, raw i18n keys, or page errors).

## Test report

1. **Date/time (UTC):** 2026-07-25T21:13:08Z start → 2026-07-25T21:13:22Z end. Log window: `docker logs --since 5m` around that interval.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; `HEADLESS=1`; `TENANT_ID=1`; branch `development` @ `23f11c30`; credentials from `.env` (`DEMO_LOGIN_*`).
3. **What was tested:** Owner/admin Settings → Restaurant group section (create/join or member/leave); npm script + `docs/testing.md` / `docs/0054` discoverability.
4. **Results:**
   - Smoke exits 0 with section OK — **PASS** — console: `Section OK, mode: member`; `>>> RESULT: Restaurant groups smoke OK`.
   - Restaurant group API/UI reachable — **PASS** — `GET /api/restaurant-group` 200; HAProxy served `restaurant-group-settings.component.ts`.
   - Discoverable via npm + docs — **PASS** — `front/package.json` has `test:restaurant-groups`; `docs/testing.md` section 2a2 + npm table; `docs/0054` smoke pointer present.
5. **Overall:** **PASS**
6. **Product owner feedback:** Restaurant groups Settings smoke is green on local HAProxy for tenant 1 in member mode. Coverage matches the shipped tab/section testids and is indexed for agents and humans. No product fix needed from this run.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (health check HTTP 200)
   2. `http://127.0.0.1:4202/dashboard` (post-login)
   3. `http://127.0.0.1:4202/settings` (Restaurant group tab → section)
8. **Relevant log excerpts (last section):**
   - pos-back: `GET /restaurant-group HTTP/1.1" 200 OK`
   - pos-haproxy: `GET /api/restaurant-group HTTP/1.1` 200; component load for `RestaurantGroupSettingsComponent`
   - pos-front: no TS/NG build errors in window (only pre-existing NG8107 warnings unrelated to this smoke)
