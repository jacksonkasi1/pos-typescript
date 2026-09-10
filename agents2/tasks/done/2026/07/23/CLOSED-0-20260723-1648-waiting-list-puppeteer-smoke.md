---
## Closing summary (TOP)

- **What happened:** Waiting-list feature had no dedicated Puppeteer smoke or `docs/testing.md` index, so regressions relied on manual QA.
- **What was done:** Added `front/scripts/test-waiting-list.mjs`, npm script `test:waiting-list`, and indexed it in `docs/testing.md` (public join + staff Waitlist tab).
- **What was tested:** Local HAProxy smoke passed (exit 0): public POST join 200 + success card; staff GET `/waiting-list` 200 with joined guest listed; npm/docs index present.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 20:09
---

# Add Puppeteer smoke for waiting list (public + staff)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Tenant waiting list shipped (public `/waitlist/:tenantId`, staff Reservations → Waitlist tab, platform public link), but **`front/scripts/`** has **no** dedicated Puppeteer smoke and **`docs/testing.md`** does not index one. Regressions on join/list/status would only be caught by manual QA or pytest, unlike delivery/paywall/platform smokes.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` owned; `demo_tables_check=ok`; Unreleased filled; improvement theme from docs-vs-code scan (shipped feature without front smoke)
- `rg` on `front/scripts/*.mjs` / `front/package.json` / `docs/testing.md`: no waiting-list / waitlist smoke
- Routes/UI exist: `waitlist-public` (`/waitlist/:tenantId`); staff `reservations` viewTab `'waitlist'`; API `GET/POST /waiting-list`, public `POST /public/tenants/{id}/waiting-list`
- Out of scope / do not duplicate: doc-only waitlist branding (**`NEW-0-20260722-1359-align-0028-…`**), SQL table name (**`NEW-0-20260722-1226-postgres-adhoc-sql-waiting-list-table`**), archived user-guide CLOSED task — this task is **smoke + testing.md index only**

## High-level instructions for coder

- Add **`front/scripts/test-waiting-list.mjs`** (or similar) following existing Puppeteer helpers (`puppeteer-headless.mjs`, env `BASE_URL` / `LOGIN_*` / optional `TENANT_ID`)
- Cover at least: (1) public page loads for tenant 1 and accepts a guest join (or clear empty-state + form visible); (2) staff login → Reservations → Waitlist tab lists or refreshes without console/network hard fail
- Prefer idempotent data (unique phone/name suffix) or clean up; do not depend on production-only secrets
- Add `test:waiting-list` (or matching name) to **`front/package.json`** and a short row in **`docs/testing.md`**
- Pass/fail: `npm run test:waiting-list --prefix front` exits 0 against local HAProxy; script is discoverable from `docs/testing.md`

## Implementation notes (coder)

- Added `front/scripts/test-waiting-list.mjs`: public `/waitlist/:tenantId` join with unique `+346` + 8-digit phone / name suffix → success card; staff login (`.env` `DEMO_LOGIN_*` or `LOGIN_*`) → `/reservations` → Waitlist tab → asserts GET `/waiting-list` 200 and guest visible when possible.
- npm script `test:waiting-list` in `front/package.json`.
- Indexed in `docs/testing.md` (section **2a** + scripts table).
- Verified locally: `BASE_URL=http://127.0.0.1:4202 npm run test:waiting-list --prefix front` → exit 0 (2026-07-25).

## Testing instructions

### What to verify

1. Public waitlist page for tenant 1 shows the join form (no raw `WAITLIST.*` keys).
2. Submitting a unique guest name/phone returns HTTP 200 from `POST /api/public/tenants/1/waiting-list` and shows the success card.
3. With demo/staff credentials, `/reservations` → Waitlist tab loads (`GET /api/waiting-list` 200) without page errors; preferably lists the guest just joined.
4. `docs/testing.md` documents `test:waiting-list` (section 2a and scripts index table).
5. `front/package.json` has `"test:waiting-list"`.

### How to test

Stack up via Docker Compose (HAProxy on 4202). From repo root:

```bash
BASE_URL=http://127.0.0.1:4202 npm run test:waiting-list --prefix front
```

Optional: `TENANT_ID=1`, `LOGIN_EMAIL` / `LOGIN_PASSWORD` (or rely on `.env` `DEMO_LOGIN_EMAIL` / `DEMO_LOGIN_PASSWORD`), `HEADLESS=0` to watch.

Confirm docs index:

```bash
rg -n 'test:waiting-list|test-waiting-list' docs/testing.md front/package.json
```

### Pass/fail criteria

- **Pass:** Script exits **0**; public join + success path covered; staff tab covered when credentials present; script discoverable via `npm run test:waiting-list` and `docs/testing.md`.
- **Fail:** Non-zero exit, missing success card / POST failure, staff GET ≥400, raw i18n keys in DOM, or missing npm/docs index.

## Test report

1. **Date/time (UTC):** 2026-07-25 20:09:07–20:09:23 UTC. Log window: `docker logs --since 5m` on `pos-back`, `pos-front`, `pos-haproxy`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; `HEADLESS=1`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Public `/waitlist/1` join form + POST success; staff `/reservations` Waitlist tab + GET `/waiting-list`; npm script and `docs/testing.md` index.
4. **Results:**
   - Public form visible, no raw `WAITLIST.*` keys: **PASS** — script step 1: “Form visible (no raw WAITLIST.* keys)”.
   - Unique guest POST 200 + success card: **PASS** — `Join POST OK, entry id: 49`; HAProxy `POST /api/public/tenants/1/waiting-list` → 200 at 20:09:15.
   - Staff Waitlist tab + GET 200 + guest listed: **PASS** — `Staff waiting-list GET OK: 200`; “Waitlist shows joined guest (Smoke Waitlist 10153143)”; HAProxy `GET /api/waiting-list` → 200 at 20:09:19.
   - `docs/testing.md` indexes `test:waiting-list` (section 2a + scripts table): **PASS** — lines 132–133, 441.
   - `front/package.json` has `"test:waiting-list"`: **PASS** — line 47.
5. **Overall:** **PASS**
6. **Product owner feedback:** Waiting-list smoke is solid: public join and staff Waitlist tab both work against local HAProxy, and the script is easy to find from `docs/testing.md`. Safe to treat as the regression gate for this feature going forward.
7. **URLs tested:**
   1. http://127.0.0.1:4202/waitlist/1
   2. http://127.0.0.1:4202/login (staff)
   3. http://127.0.0.1:4202/dashboard
   4. http://127.0.0.1:4202/reservations (Waitlist tab)
8. **Relevant log excerpts:**
   ```
   pos-back: POST /public/tenants/1/waiting-list HTTP/1.1" 200 OK
   pos-back: GET /waiting-list HTTP/1.1" 200 OK
   pos-haproxy: POST /api/public/tenants/1/waiting-list → 200
   pos-haproxy: GET /api/waiting-list → 200
   npm: >>> RESULT: Waiting list smoke OK (public join + staff tab as applicable)  exit 0
   ```
