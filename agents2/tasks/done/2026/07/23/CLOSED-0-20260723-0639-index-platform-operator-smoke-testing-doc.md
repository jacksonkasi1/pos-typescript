---
## Closing summary (TOP)

- **What happened:** Enhancement to index the existing platform operator Puppeteer smoke so agents/humans can discover it like other smokes.
- **What was done:** Added `test:platform-operator` in `front/package.json` and documented it in `docs/testing.md` (section 2a3d, scripts table, coverage) with env/seed and link to `docs/0015-platform-operator-portal.md`.
- **What was tested:** Readonly `rg` found the alias in both files; live smoke on `BASE_URL=http://127.0.0.1:4202` passed (login, dashboard metrics, tenant delivery link). Overall **PASS**.
- **Why closed:** All pass/fail criteria met; no product code changes needed.
- **Closed at (UTC):** 2026-07-26 02:07
---

# Index platform operator Puppeteer smoke in testing.md + npm script

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`front/scripts/test-platform-operator.mjs` already exists (login → `/platform` metrics) and was used to verify the platform portal, but **`docs/testing.md`** and **`front/package.json`** do not list it. Agents and humans cannot discover the smoke the way they do for paywall, courier, or delivery scripts.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `rg` on `docs/testing.md` and `front/package.json` — no `platform-operator` / `test:platform` entries
- Script present: `front/scripts/test-platform-operator.mjs` (defaults `PLATFORM_OPERATOR_EMAIL` / `PLATFORM_OPERATOR_PASSWORD`; seed via `python -m app.seeds.ensure_platform_operator`)
- Sibling hygiene for courier/delivery checkout: **`UNTESTED/CLOSED-0-20260723-1801-retarget-delivery-checkout-smoke-index`** (supersedes archived 1142) — do not merge; this task is platform-only
- Related enhancement (separate): **`FEAT-0-20260723-0639-platform-operator-delivery-public-link.md`** may extend the smoke later; indexing the current script should not wait on that FEAT

## High-level instructions for coder

- Add an npm script alias in **`front/package.json`** (e.g. `test:platform-operator` → `node scripts/test-platform-operator.mjs`), matching existing `test:*` style
- Index the script in **`docs/testing.md`** (table + short how-to): `BASE_URL`, `PLATFORM_OPERATOR_EMAIL` / `PLATFORM_OPERATOR_PASSWORD`, and seed command `docker compose … exec back python -m app.seeds.ensure_platform_operator`
- Point to **`docs/0015-platform-operator-portal.md`** (or **0055** if renumbered) for portal overview
- Do not invent a new smoke in this task unless the index reveals the script is broken — then fix minimally
- Pass/fail: `npm run test:platform-operator --prefix front` is documented; `docs/testing.md` lists it; readonly grep finds the alias

## Implementation notes (coder)

- Added `test:platform-operator` in `front/package.json` → `node scripts/test-platform-operator.mjs`
- Indexed in `docs/testing.md`: section **2a3d**, npm scripts table, coverage summary; links `docs/0015-platform-operator-portal.md`
- No script changes required — existing smoke passed after `ensure_platform_operator`

## Testing instructions

### What to verify

- `front/package.json` exposes `test:platform-operator`
- `docs/testing.md` documents how-to, env, seed, and table/coverage rows
- Smoke still passes against a running local stack

### How to test

```bash
# Readonly index check
rg -n 'test:platform-operator' front/package.json docs/testing.md

# Seed + smoke (stack up on 4202)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T \
  -e PLATFORM_OPERATOR_EMAIL=platform-test@amvara.de \
  -e PLATFORM_OPERATOR_PASSWORD=test-platform-ops-123 \
  back python -m app.seeds.ensure_platform_operator

BASE_URL=http://127.0.0.1:4202 npm run test:platform-operator --prefix front
```

### Pass/fail criteria

- **PASS:** `rg` finds the alias in both files; npm script runs; console shows `OK: platform operator login and dashboard` and tenant delivery link OK
- **FAIL:** missing alias/docs, or smoke exits non-zero / cannot discover script via `npm run`

## Test report

1. **Date/time (UTC):** 2026-07-26 02:06:37–02:06:45 UTC. Log window: `docker logs --since 5m` on pos-back / pos-front / pos-haproxy.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`). `HEADLESS=1`. Operator seed: `PLATFORM_OPERATOR_EMAIL=platform-test@amvara.de`.
3. **What was tested:** npm alias `test:platform-operator` in `front/package.json`; `docs/testing.md` section 2a3d + scripts table + coverage row; live Puppeteer smoke after `ensure_platform_operator`.
4. **Results:**
   - `rg` finds alias in `front/package.json` and `docs/testing.md` — **PASS** (`package.json:54`, `testing.md:214`, `:695`, coverage `:812`).
   - Docs how-to/env/seed/`docs/0015` — **PASS** (section 2a3d lines 209–219).
   - Smoke via `npm run test:platform-operator --prefix front` — **PASS** (exit 0; `OK: platform operator login and dashboard`; `OK: tenant detail delivery link → http://127.0.0.1:4202/delivery/3722`).
5. **Overall:** **PASS**
6. **Product owner feedback:** Platform operator smoke is discoverable the same way as paywall/courier scripts. Indexing looks complete; no product code changes needed. Agents can find and run this check without digging into `front/scripts/`.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (health 200)
   2. `http://127.0.0.1:4202/api/health` (200)
   3. `http://127.0.0.1:4202/platform/login` (smoke)
   4. `http://127.0.0.1:4202/platform` (dashboard metrics via smoke)
   5. `http://127.0.0.1:4202/platform/tenants/3722` (tenant detail via smoke)
   6. `http://127.0.0.1:4202/delivery/3722` (public delivery link asserted by smoke)
8. **Relevant log excerpts:**
   ```
   pos-back: POST /token?scope=platform 200; GET /platform/me 200; GET /platform/metrics 200; GET /platform/tenants 200; GET /platform/tenants/3722 200
   seed: Updated platform operator: platform-test@amvara.de
   smoke stdout: OK: platform operator login and dashboard
   smoke stdout: OK: tenant detail delivery link → http://127.0.0.1:4202/delivery/3722
   ```
