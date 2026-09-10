---
## Closing summary (TOP)

- **What happened:** Several committed Puppeteer smokes had no `test:*` npm aliases and were missing from `docs/testing.md`, so ops/agents rediscovered them only via tribal knowledge.
- **What was done:** Added six aliases in `front/package.json` (`test:api-docs`, `test:websocket`, `test:amvara9-smoke`, `test:menu-logo`, `test:settings-contact-tax`, `test:staff-menu-link`) and indexed them in `docs/testing.md` with env notes (including production default for amvara9); left delivery-checkout / platform-operator to sibling tasks.
- **What was tested:** All six aliases resolve to the expected scripts; `rg` hits both package.json and testing.md; amvara9 production default documented; no accidental delivery/platform aliases — overall PASS (optional live smokes mostly green; menu-logo logo missing is local demo data).
- **Why closed:** All pass/fail criteria met; tester reported PASS with product-owner feedback.
- **Closed at (UTC):** 2026-07-26 00:16
---

# Alias and index remaining Puppeteer smokes (excl. delivery/platform)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Several committed Puppeteer scripts under **`front/scripts/`** have **no** `test:*` npm alias and are easy to miss next to the indexed suite. Ops and agents re-discover them only via tribal knowledge or closed-task notes. Add aliases + short **`docs/testing.md`** entries for the high-value leftovers — without duplicating open courier/delivery or platform index tasks.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: scripts **without** npm alias include `test-api-docs.mjs`, `test-websocket.mjs`, `test-amvara9-smoke.mjs`, `test-menu-logo.mjs`, `test-settings-contact-tax-dropdown.mjs`, `test-staff-menu-link-puppeteer.mjs` (plus delivery/platform already owned elsewhere)
- **Out of scope here (already queued):**
  - `test-delivery-checkout.mjs` → **`NEW-0-20260722-1142-index-courier-delivery-smokes-in-testing-doc`**
  - `test-platform-operator.mjs` → **`NEW-0-20260723-0639-index-platform-operator-smoke-testing-doc`**
- Sibling **`NEW-0-20260723-1617-index-aliased-smokes-missing-from-testing-doc`** covers five scripts that **already** have aliases — do not re-list those

## High-level instructions for coder

- In **`front/package.json`**, add `test:*` aliases (same style as existing) for at least:
  - `test:api-docs` → `test-api-docs.mjs`
  - `test:websocket` → `test-websocket.mjs`
  - `test:amvara9-smoke` → `test-amvara9-smoke.mjs` (default BASE_URL production; document carefully)
  - `test:menu-logo` → `test-menu-logo.mjs`
  - `test:settings-contact-tax` → `test-settings-contact-tax-dropdown.mjs`
  - `test:staff-menu-link` → `test-staff-menu-link-puppeteer.mjs`
- Index each in **`docs/testing.md`** (table + one-line env notes from each script header: `BASE_URL`, login vars, prod default for amvara9)
- Do not invent new flows; do not touch delivery-checkout or platform-operator aliases (owned by sibling NEWs)
- Pass/fail: `npm run test:<name> --prefix front` resolves for each alias; `docs/testing.md` lists them; `rg` on package.json finds the six scripts

## Coder notes (2026-07-26)

- Added six `test:*` aliases in **`front/package.json`**.
- Indexed in **`docs/testing.md`**: how-to §§10–11e, npm scripts table, coverage summary.
- Left `review-order-edit-puppeteer` as the only “no npm script” callout (owned by sibling NEW).
- Did **not** add delivery-checkout or platform-operator aliases.

## Testing instructions

### What to verify

1. Each of the six npm aliases resolves to the expected script under `front/scripts/`.
2. `docs/testing.md` documents each alias (how-to + npm table) with correct env notes, including that **`test:amvara9-smoke` defaults to production**.
3. No accidental aliases for delivery-checkout or platform-operator.

### How to test

```bash
# From repo root — alias resolution (should print script path / run command; exit 0 on resolve):
npm run test:api-docs --prefix front --dry-run
npm run test:websocket --prefix front --dry-run
npm run test:amvara9-smoke --prefix front --dry-run
npm run test:menu-logo --prefix front --dry-run
npm run test:settings-contact-tax --prefix front --dry-run
npm run test:staff-menu-link --prefix front --dry-run

# Index presence:
rg -n 'test:api-docs|test:websocket|test:amvara9-smoke|test:menu-logo|test:settings-contact-tax|test:staff-menu-link' front/package.json docs/testing.md

# Optional smoke (stack up; do NOT run amvara9 against prod unless intended):
BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:api-docs --prefix front
```

### Pass/fail criteria

- **Pass:** All six `npm run test:<name> --prefix front` resolve; `rg` hits both `front/package.json` and `docs/testing.md` for each name; amvara9 docs mention production default; delivery-checkout / platform-operator still unaliased by this task.
- **Fail:** Missing alias, missing doc row, or wrong script mapping.

## Test report

1. **Date/time (UTC):** 2026-07-26 00:13:55 – 00:15:24 UTC. Log window: `docker logs --since 15m` for pos-front / pos-back (no relevant front/back errors in that window for this docs/alias check).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); local compose assumed up for optional smokes; `BASE_URL=http://127.0.0.1:4202` for local runs; `test:amvara9-smoke` used default `https://www.satisfecho.de`.
3. **What was tested:** Six `test:*` alias → script mappings; `docs/testing.md` how-to + npm table (+ coverage) for each; production default note for amvara9; absence of delivery-checkout / platform-operator aliases.
4. **Results:**
   - Six aliases resolve to expected scripts — **PASS** — `npm pkg get scripts.test:* --prefix front` and `front/package.json` lines 56–61 map to `test-api-docs.mjs`, `test-websocket.mjs`, `test-amvara9-smoke.mjs`, `test-menu-logo.mjs`, `test-settings-contact-tax-dropdown.mjs`, `test-staff-menu-link-puppeteer.mjs`.
   - `docs/testing.md` indexes each alias (how-to §§ + npm table + coverage) — **PASS** — `rg` hits both files for all six names; §11c states **Default `BASE_URL` is `https://www.satisfecho.de`**.
   - No accidental delivery-checkout / platform-operator aliases — **PASS** — no `"test:delivery-checkout"` / `"test:platform-operator"` in `front/package.json`.
   - Optional runtime (not pass/fail for this task): `test:api-docs` PASS; `test:websocket` PASS; `test:amvara9-smoke` PASS (prod); `test:menu-logo` reported logo missing on local demo data (env/data, not alias/doc defect).
5. **Overall:** **PASS**
6. **Product owner feedback:** The six leftover Puppeteer smokes are now discoverable via `npm run test:*` and the testing doc, with a clear production warning on `test:amvara9-smoke`. Sibling delivery/platform alias work remains correctly out of scope. Note that npm’s `--dry-run` on this toolchain still executes scripts—use `npm pkg get` when you only need resolution.
7. **URLs tested:**
   1. http://127.0.0.1:4202/api/docs
   2. http://127.0.0.1:4202/ (login + /staff/orders for websocket)
   3. https://www.satisfecho.de/api/health
   4. https://www.satisfecho.de/
   5. https://www.satisfecho.de/login
   6. https://www.satisfecho.de/book/1
   7. http://127.0.0.1:4202/menu/0a57107e-0927-45bc-bf70-cfc06669caa0 (optional menu-logo; logo not present in local data)
8. **Relevant log excerpts:**
   - `npm pkg get`: each of six `test:*` → expected `node scripts/….mjs`.
   - Optional: `>>> RESULT: API docs at /api/docs load successfully.`
   - Optional: `>>> RESULT: amvara9 smoke test passed (API + landing + login + book).` with `BASE_URL: https://www.satisfecho.de`.
   - pos-back / pos-front `--since 15m`: no error/exception lines relevant to this verification.

