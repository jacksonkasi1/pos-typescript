---
## Closing summary (TOP)

- **What happened:** Stale July-22 NEW still treated `test-delivery-checkout.mjs` as untracked/WIP-302 after public checkout had shipped.
- **What was done:** Kept this task as sole owner, archived superseded 1142, added `test:delivery-checkout` in `front/package.json`, and indexed public checkout + courier aliases in `docs/testing.md`.
- **What was tested:** Alias, docs sections/table, and 1142 archive checks **PASS**; optional Puppeteer happy path timed out after cart (non-blocking / env-data).
- **Why closed:** All required pass criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 00:44
---

# Retarget delivery-checkout smoke index NEW (script committed)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`NEW-0-20260722-1142-index-courier-delivery-smokes-in-testing-doc.md`** still describes `front/scripts/test-delivery-checkout.mjs` as **untracked/WIP** tied to **WIP-302**. Reality: the script is **committed** on `development`, public checkout shipped (**CLOSED-302**, changelog through **2.1.28** / #304), and **`test:delivery-checkout` is still missing** from `front/package.json` while courier already has `test:courier-actions`. Leaving the July-22 NEW wording stale risks coders skipping the npm alias or waiting on a closed WIP.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:01Z: docs/changelog SIGNAL basenames owned; smoke-index scan
- `ls front/scripts/test-delivery-checkout.mjs` present; `rg test:delivery-checkout front/package.json` → no matches
- Open owner: **`NEW-0-20260722-1142-…`**; alias-index sibling **`NEW-0-20260723-1617-alias-index-remaining-puppeteer-smokes`** points delivery-checkout at 1142 — do not create a second index NEW
- Waiting-list smoke is owned by **`NEW-0-20260723-1648-waiting-list-puppeteer-smoke`** — drop optional waitlist invent-from-1142 scope

## High-level instructions for coder

- Rewrite **`NEW-0-20260722-1142-index-courier-delivery-smokes-in-testing-doc.md`** Evidence + instructions to **current tip**:
  - Index **`test:courier-actions`** in **`docs/testing.md`** if still missing
  - Add **`test:delivery-checkout`** → `node scripts/test-delivery-checkout.mjs` in **`front/package.json`** and document it in **`docs/testing.md`**
  - Remove “untracked/WIP-302” language; point at CLOSED-302 / #304 as shipped
  - Do **not** invent waiting-list smoke here (owned by 1648)
- Prefer editing that one NEW in place (or close it and keep this file as the sole owner — pick one; avoid two open owners for the same npm alias)
- Pass criteria: `npm run test:delivery-checkout --prefix front` is a documented alias; 1142 body matches repo tip; no duplicate delivery-checkout index NEW remains

## Implementation notes (coder)

- Kept **this** task as sole owner; archived superseded **`NEW-0-20260722-1142-…`** → **`agents2/tasks/done/2026/07/22/CLOSED-0-20260722-1142-index-courier-delivery-smokes-in-testing-doc.md`**.
- Added **`test:delivery-checkout`** → `node scripts/test-delivery-checkout.mjs` in **`front/package.json`**.
- Documented in **`docs/testing.md`**:
  - § **2a3a** Public Satisfecho Delivery checkout (`test:delivery-checkout`; CLOSED-302 / #304)
  - § **2a3b** track (renumbered; was 2a3a)
  - § **2a3c** Courier portal actions (`test:courier-actions`)
  - npm scripts table row for `test:delivery-checkout`
- Retargeted sibling pointers in **1617** and **0639** away from archived 1142.
- Did **not** invent waiting-list smoke (already aliased as `test:waiting-list`).
- Alias resolves: `npm pkg get scripts.test:delivery-checkout --prefix front` → `node scripts/test-delivery-checkout.mjs`. Full Puppeteer happy-path left for tester (local run reached cart then timed out mid-flow — env/data issue, not alias).

## Testing instructions

### What to verify

1. `front/package.json` exposes **`test:delivery-checkout`** pointing at `scripts/test-delivery-checkout.mjs`.
2. **`docs/testing.md`** documents public delivery checkout and courier actions with copy-pasteable `npm run … --prefix front` commands, and the scripts table lists `test:delivery-checkout`.
3. Superseded **1142** is absent from root `agents2/tasks/` and present under **`done/2026/07/22/`**.
4. No second open NEW owns the delivery-checkout npm alias.

### How to test

```bash
# From repo root
npm pkg get scripts.test:delivery-checkout --prefix front
# Expect: "node scripts/test-delivery-checkout.mjs"

rg -n 'test:delivery-checkout|2a3a\. Public Satisfecho Delivery checkout|2a3c\. Courier' docs/testing.md front/package.json

test ! -f agents2/tasks/NEW-0-20260722-1142-index-courier-delivery-smokes-in-testing-doc.md
test -f agents2/tasks/done/2026/07/22/CLOSED-0-20260722-1142-index-courier-delivery-smokes-in-testing-doc.md

# Optional full smoke (app up on HAProxy port, delivery enabled for tenant 1):
BASE_URL=http://127.0.0.1:4202 TENANT_ID=1 npm run test:delivery-checkout --prefix front
```

Compose (if needed): `docker compose -f docker-compose.yml -f docker-compose.dev.yml ps`

### Pass/fail criteria

- **Pass:** Alias present and documented; 1142 archived; rg hits for checkout + courier sections; optional smoke exits 0 when stack/demo delivery data are healthy.
- **Fail:** Missing alias, stale untracked/WIP-302 wording still in an open NEW, or duplicate open owner for `test:delivery-checkout`.

## Test report

1. **Date/time (UTC):** 2026-07-26 00:41:22 UTC start → ~00:43:33 UTC end. Log window: `docker logs --since 5m` on `pos-front` / `pos-back`.
2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml` (stack up; HAProxy `4202`). Branch `development` (synced). `BASE_URL=http://127.0.0.1:4202`, `TENANT_ID=1`, `HEADLESS=1` for optional smoke.
3. **What was tested:** `test:delivery-checkout` npm alias; `docs/testing.md` §2a3a / §2a3c + scripts table; archived 1142; sole open owner for the alias; optional Puppeteer run via the new alias.
4. **Results:**
   - Alias `test:delivery-checkout` → `node scripts/test-delivery-checkout.mjs` — **PASS** — `npm pkg get scripts.test:delivery-checkout --prefix front` → `"node scripts/test-delivery-checkout.mjs"`; `front/package.json:50`.
   - `docs/testing.md` documents public checkout + courier with copy-pasteable npm commands and table row — **PASS** — §2a3a (L168+), §2a3c (L195+), table L614; wording cites CLOSED-302 / #304 (no untracked/WIP-302).
   - Superseded 1142 absent from root tasks and present under `done/2026/07/22/` — **PASS** — `test ! -f …NEW-0-20260722-1142…` and `test -f …/CLOSED-0-20260722-1142…`.
   - No second open NEW owns delivery-checkout alias — **PASS** — only this TESTING task in live queue; siblings 0639/1617 point here and defer.
   - Optional full smoke via alias — **FAIL (non-blocking)** — alias invoked correctly; reached `Cart step OK` then `TimeoutError` after 30000ms (same env/data mid-flow hang noted by coder). Required pass criteria do not require smoke exit 0 when demo data is unhealthy.
5. **Overall:** **PASS**
6. **Product owner feedback:** The delivery-checkout npm alias and testing-doc index match the shipped public checkout; agents can run `npm run test:delivery-checkout --prefix front` without hunting WIP-302. The optional Puppeteer happy path still flakes after cart on this local demo stack — treat that as harness/data follow-up, not a missing index.
7. **URLs tested:**
   1. http://127.0.0.1:4202/ (HTTP 200)
   2. http://127.0.0.1:4202/api/health (HTTP 200)
   3. http://127.0.0.1:4202/delivery/1 (optional smoke; cart OK then timeout)
8. **Relevant log excerpts:**
   - Alias: `"node scripts/test-delivery-checkout.mjs"`
   - Smoke stdout: `Open http://127.0.0.1:4202/delivery/1` → `Cart step OK` → `FAIL TimeoutError: Timed out after waiting 30000ms`
   - `pos-back`: `GET /public/tenants/1/satisfecho-delivery-config` → 200 OK (no 422/500 in window)
   - `pos-front`: no TS/build errors in `--since 5m` window
