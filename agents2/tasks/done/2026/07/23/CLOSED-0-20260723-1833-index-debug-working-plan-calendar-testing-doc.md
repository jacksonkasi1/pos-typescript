---
## Closing summary (TOP)

- **What happened:** Enhancement task to index the working-plan calendar debug helper in `docs/testing.md` so agents do not rediscover it only via `package.json`.
- **What was done:** Documented `npm run debug:working-plan-calendar` in §2b (debug inspector for red/staffing days, not a CI smoke) and in the npm scripts table, with pointers to `test:working-plan` / `test:working-plan-calendar`.
- **What was tested:** Docs `rg` checks and optional live alias run — overall **PASS** (35 calendar cells / 0 red days; schedule APIs 200).
- **Why closed:** All pass/fail criteria met; documentation-only change verified.
- **Closed at (UTC):** 2026-07-26 05:51
---

# Index debug:working-plan-calendar in docs/testing.md

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`front/package.json` already exposes **`debug:working-plan-calendar`** → `debug-working-plan-calendar.mjs` (inspect red/staffing days on the calendar). **`docs/testing.md`** documents other debug helpers (`debug-reservations`, public book) and will soon index **`test:working-plan-calendar`**, but the calendar **debug** alias is missing from the index — agents debugging staffing-day colouring re-discover the script only via package.json.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:33Z: `SIGNAL docs_stale×14` + `changelog_sparse` owned; `demo_tables_check=ok`; unqueued smoke/debug gap
- `npm run debug:working-plan-calendar --prefix front` resolves; script header documents `LOGIN_*` / `BASE_URL`
- `rg` on `docs/testing.md`: no `debug-working-plan-calendar` / `debug:working-plan-calendar`
- Sibling **`NEW-0-20260723-1724-index-working-plan-calendar-smoke-testing-doc`** owns the **test:** alias only — do **not** merge; this task is the **debug:** helper

## High-level instructions for coder

- Add a short **`docs/testing.md`** note (near working-plan / debug-reservations sections) for **`npm run debug:working-plan-calendar --prefix front`** → `scripts/debug-working-plan-calendar.mjs`
- Clarify it is a **debug** inspector (red/staffing days), not a pass/fail smoke; point readers to **`test:working-plan`** / **`test:working-plan-calendar`** for CI-style checks
- Documentation only — do not change the debug script unless the documented command is wrong
- Pass/fail: `rg 'debug:working-plan-calendar|debug-working-plan-calendar' docs/testing.md` hits; a reader can copy-paste a working command from the script header

## Coder notes (2026-07-26)

- Indexed in **`docs/testing.md`** §2b Working plan (debug subsection) and in the **npm scripts** table next to other `debug:*` aliases.
- No product or script changes; sibling **`test:working-plan-calendar`** index left for its own NEW task.

## Testing instructions

### What to verify

- `docs/testing.md` documents **`debug:working-plan-calendar`** as a debug inspector (red/staffing days), not a CI smoke.
- npm table lists `debug:working-plan-calendar` → `scripts/debug-working-plan-calendar.mjs`.
- Copy-paste commands match `front/package.json` / script header (`LOGIN_*` / `DEMO_LOGIN_*`, optional `BASE_URL`, `TENANT_ID`).

### How to test

```bash
rg -n 'debug:working-plan-calendar|debug-working-plan-calendar' docs/testing.md
# Expect hits in §2b and the npm scripts table.

# Optional (app up): confirm alias still resolves
npm run debug:working-plan-calendar --prefix front
# With stack: BASE_URL=http://127.0.0.1:4202 LOGIN_EMAIL=... LOGIN_PASSWORD=...
```

### Pass/fail criteria

- **Pass:** `rg` finds both the §2b note and the npm table row; text states it is not a pass/fail smoke and points to `test:working-plan` / `test:working-plan-calendar` for CI.
- **Fail:** missing alias, or debug helper presented as a required smoke with assert checklist.

## Test report

1. **Date/time (UTC):** 2026-07-26 05:48:39 start → 05:50:13 end. Log window: ~05:49–05:50 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `300678fe`. Docs-only verification + optional live debug script run.
3. **What was tested:** `docs/testing.md` indexes `debug:working-plan-calendar` as a debug inspector (not CI smoke); npm table row; copy-paste env matches `front/package.json` / script header; optional alias run against stack.
4. **Results:**
   - §2b documents debug inspector (red/staffing days), not pass/fail smoke, points to `test:working-plan` / `test:working-plan-calendar` — **PASS** (`docs/testing.md` L249–256: “Debug (inspect red / staffing days — not a pass/fail smoke)”; “For CI-style checks use **test:working-plan** (and **test:working-plan-calendar** when indexed).”)
   - npm scripts table lists alias → `scripts/debug-working-plan-calendar.mjs` with same not-smoke / CI pointer — **PASS** (`docs/testing.md` L671; `rg` hits at L252–253 and L671)
   - Copy-paste commands match package.json / script (`LOGIN_*` / `DEMO_LOGIN_*`, optional `BASE_URL`, `TENANT_ID`) — **PASS** (`front/package.json` `"debug:working-plan-calendar": "node scripts/debug-working-plan-calendar.mjs"`; script reads `LOGIN_*`/`DEMO_LOGIN_*`, `TENANT_ID`, `BASE_URL`)
   - Optional: npm alias resolves and runs against stack — **PASS** (exit 0; printed Calendar debug with 35 cells / 0 red days)
5. **Overall:** **PASS**
6. **Product owner feedback:** The working-plan calendar debug helper is now discoverable from `docs/testing.md` without hunting `package.json`. Agents get a clear split between the inspector and CI smokes. No product regressions observed on the optional live run.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (health check, HTTP 200)
   2. `http://127.0.0.1:4202/login?tenant=1` (debug script login)
   3. `http://127.0.0.1:4202/working-plan` (calendar debug inspect)
8. **Relevant log excerpts:**
```
# npm alias + debug output (exit 0)
> front@2.1.89 debug:working-plan-calendar
> node scripts/debug-working-plan-calendar.mjs
Calendar debug:
  Total cells (excl. header): 35
  Day cells (with number): 31
  Red (staffing issue) cells: 0

# pos-back during debug (schedule APIs 200)
INFO: ... "GET /schedule?from_date=2026-07-01&to_date=2026-07-31 HTTP/1.1" 200 OK
INFO: ... "GET /schedule/planned-vs-actual?from_date=2026-07-01&to_date=2026-07-31 HTTP/1.1" 200 OK
INFO: ... "GET /schedule/compliance-summary?from_date=2026-07-01&to_date=2026-07-31 HTTP/1.1" 200 OK
# pos-front: no compile/error lines in the 10m window
```
