---
## Closing summary (TOP)

- **What happened:** Agents following `docs/testing.md` missed the dedicated `/working-plan/calendar` Puppeteer smoke already wired as `test:working-plan-calendar`.
- **What was done:** Documented `test:working-plan-calendar` in section 2b and the npm scripts table, with env notes and a clear distinction from week-view `test:working-plan`; no product code changes.
- **What was tested:** `rg` confirmed section + table coverage; optional HEADLESS Puppeteer run passed (exit 0, no console errors) — overall PASS.
- **Why closed:** All pass/fail criteria met; tester Test report PASS.
- **Closed at (UTC):** 2026-07-26 10:00
---

# Index working-plan-calendar smoke in testing.md

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`front/package.json` already exposes **`test:working-plan-calendar`** (`test-working-plan-calendar.mjs`), which opens **`/working-plan/calendar`** directly and fails on console errors. **`docs/testing.md`** only documents **`test:working-plan`** (week view + in-page calendar switch). Agents following the testing index miss the dedicated calendar-route smoke.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale` / changelog_sparse basenames already owned; unqueued smoke gap scan
- `npm run test:working-plan-calendar --prefix front` resolves; script header documents `BASE_URL`, login, `TENANT_ID`
- `rg` on `docs/testing.md`: calendar grid mentioned under `test:working-plan` only — no `test:working-plan-calendar` row
- Out of scope: sibling **`NEW-0-20260723-1617-*`** alias/index tasks (do not re-list those scripts)

## High-level instructions for coder

- Add a short **`docs/testing.md`** entry (npm table + one-line env notes) for **`test:working-plan-calendar`** → `scripts/test-working-plan-calendar.mjs`
- Clarify how it differs from **`test:working-plan`**: direct `/working-plan/calendar` load + console-error fail (not only week-grid asserts)
- No new product code; do not invent a second calendar flow
- Pass/fail: `docs/testing.md` lists the alias; `rg 'test:working-plan-calendar' docs/testing.md` hits

## Coder notes (2026-07-26)

- Updated **`docs/testing.md`** section **2b**: added **Calendar route smoke** for `test:working-plan-calendar` (direct `/working-plan/calendar`, console-error fail) vs `test:working-plan` (week + in-page switch).
- npm scripts table: added **`test:working-plan`** and **`test:working-plan-calendar`** rows; debug blurb no longer says “when indexed”.
- No product code changes.

## Testing instructions

### What to verify

- `docs/testing.md` documents **`test:working-plan-calendar`** with env notes and how it differs from **`test:working-plan`**.
- The front npm scripts table lists **`test:working-plan-calendar`** → `scripts/test-working-plan-calendar.mjs`.

### How to test

```bash
# From repo root
rg 'test:working-plan-calendar' docs/testing.md
# Expect hits in section 2b (commands + asserts) and in the npm scripts table.

# Optional (app up + schedule-access creds): confirm alias still runs
BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:working-plan-calendar --prefix front
```

### Pass/fail criteria

- **Pass:** `rg 'test:working-plan-calendar' docs/testing.md` finds the section and the table row; text distinguishes direct calendar URL + console-error fail from week-view `test:working-plan`.
- **Fail:** alias missing from table or no difference called out vs `test:working-plan`.

## Test report

1. **Date/time (UTC):** 2026-07-26 09:59:18–09:59:40 UTC. Log window: `docker logs --since 5m` from ~09:59:27Z.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** `docs/testing.md` indexes `test:working-plan-calendar` (section 2b + npm table) with env notes and distinction from `test:working-plan`; optional Puppeteer alias run.
4. **Results:**
   - `rg 'test:working-plan-calendar' docs/testing.md` hits section 2b (Calendar route smoke) and npm scripts table row → **PASS** (lines ~249–258, ~684).
   - Text distinguishes direct `/working-plan/calendar` + console-error fail vs week-view `test:working-plan` → **PASS**.
   - Table maps `test:working-plan-calendar` → `scripts/test-working-plan-calendar.mjs` → **PASS**.
   - Optional: `HEADLESS=1 npm run test:working-plan-calendar --prefix front` → **PASS** (exit 0; “no console errors”).
5. **Overall:** **PASS**
6. **Product owner feedback:** The testing index now surfaces the dedicated calendar-route smoke so agents won’t miss it when only reading `docs/testing.md`. Difference from the week-view smoke is explicit. Optional live run confirmed the alias still works against local HAProxy.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/working-plan/calendar
8. **Relevant log excerpts (last section):**
   - Front/back `--since 5m`: no Angular/TS build errors or API 500s during the window (only routine `/docs` 200s on back).
   - Puppeteer: `>>> RESULT: /working-plan/calendar smoke test passed (no console errors).`
