---
## Closing summary (TOP)

- **What happened:** Public delivery-track Puppeteer smoke existed after #306 / 2.1.32 but had no npm alias or `docs/testing.md` entry.
- **What was done:** Added `test:delivery-track` in `front/package.json` and documented §2a3a plus script table in `docs/testing.md` (invalid-token / error-state only, cites `docs/0053`).
- **What was tested:** `rg` hits for the alias in both files; live smoke on `http://127.0.0.1:4202` exited 0 with track not-found/missing OK — overall PASS.
- **Why closed:** All pass/fail criteria met; tester reported PASS with product-owner feedback.
- **Closed at (UTC):** 2026-07-25 23:21
---

# Alias and index public delivery-track Puppeteer smoke

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**2.1.32 / #306** shipped `front/scripts/test-delivery-track.mjs` for the token-gated customer track page, but there is **no** `test:delivery-track` npm alias and **`docs/testing.md`** does not list it. Agents and ops rediscover the script only via the closed #306 task notes. Courier already has `test:courier-actions`; public checkout indexing is owned elsewhere — track is a separate committed smoke.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T21:03Z: SIGNAL `docs_stale` / `changelog_sparse` basenames owned; Unreleased empty post-**2.1.32** cut (false positive); `demo_tables_check=ok`; NEW≈115
- New product surface after last stamp-only run: `git show 7f6d2578` added `test-delivery-track.mjs`
- `rg test:delivery-track front/package.json docs/testing.md` → no matches; `test:courier-actions` exists
- Sibling **`NEW-0-20260722-1142-…`** / **`NEW-0-20260723-1801-retarget-delivery-checkout-smoke-index`** own **checkout** + courier index only — do **not** merge; this task is **track** only
- Sibling **`NEW-0-20260723-1933-fix-delivery-checkout-cart-step-harness`** is checkout harness behavior — do not merge

## High-level instructions for coder

- Add **`test:delivery-track`** → `node scripts/test-delivery-track.mjs` in **`front/package.json`**
- Document one short row in **`docs/testing.md`** (public `/delivery/:tenantId/track` invalid-token / error-state smoke; cite `docs/0053-satisfecho-delivery-order-channel.md`)
- Do not rewrite 1142/1801 or invent a happy-path paid-order track flow unless trivial; keep this smoke as the committed invalid-token check
- Pass/fail: `npm run test:delivery-track --prefix front` is documented; `rg test:delivery-track docs/testing.md front/package.json` hits

## Coder notes (2026-07-25)

- Added `test:delivery-track` npm script in `front/package.json` (next to courier/staff delivery aliases).
- Documented § **2a3a** in `docs/testing.md` plus npm script table row; cites `docs/0053`; invalid-token / error-state only (no happy-path invent).
- Verified: `rg test:delivery-track docs/testing.md front/package.json` hits; `BASE_URL=http://127.0.0.1:4202 npm run test:delivery-track --prefix front` passed.

## Testing instructions

### What to verify

- `front/package.json` exposes `test:delivery-track` → `node scripts/test-delivery-track.mjs`.
- `docs/testing.md` documents the alias (section + script table) for public `/delivery/:tenantId/track` invalid-token smoke, with a pointer to `docs/0053-satisfecho-delivery-order-channel.md`.
- Running the alias against a live stack reaches the track page error/not-found state without raw `DELIVERY_TRACK.*` keys.

### How to test

```bash
rg -n 'test:delivery-track' docs/testing.md front/package.json
# Expect hits in both files.

# App up via docker compose (dev HAProxy on 4202):
BASE_URL=http://127.0.0.1:4202 npm run test:delivery-track --prefix front
```

Compose reference: `docker compose -f docker-compose.yml -f docker-compose.dev.yml`.

### Pass/fail criteria

- **Pass:** `rg` finds `test:delivery-track` in both `docs/testing.md` and `front/package.json`; smoke exits 0 and logs track not-found/missing OK (or equivalent translated error state).
- **Fail:** missing npm alias or testing.md row; smoke times out, shows raw i18n keys, or exits non-zero.

## Test report

1. **Date/time (UTC):** start 2026-07-25T23:21:15Z, end 2026-07-25T23:21:21Z. Log window: ~5m around that interval (`docker logs --since 5m`).
2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; HAProxy `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh` before claim). `/` and `/api/health` both HTTP 200.
3. **What was tested:** npm alias `test:delivery-track`, docs indexing in `docs/testing.md` (§2a3a + script table + `docs/0053` pointer), and live invalid-token track smoke without raw `DELIVERY_TRACK.*` keys.
4. **Results:**
   - `rg test:delivery-track` in `front/package.json` and `docs/testing.md` — **PASS** (`package.json:50` script; `testing.md:173` section command + `:533` table row; §2a3a cites `docs/0053-satisfecho-delivery-order-channel.md`).
   - `BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:delivery-track --prefix front` — **PASS** (exit 0; “Track page shows not-found / missing state OK”; “OK delivery track smoke”).
   - No raw i18n keys / smoke failure — **PASS** (script asserts translated not-found/missing; exit 0).
5. **Overall:** **PASS**
6. **Product owner feedback:** The delivery-track smoke is discoverable via the same npm alias pattern as courier, and the testing doc row matches the committed invalid-token scope. Ops/agents can run it without digging closed #306 notes. No production deploy was required for this docs/alias task.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (health probe, 200)
   2. `http://127.0.0.1:4202/api/health` (200)
   3. `http://127.0.0.1:4202/delivery/1/track?order_id=1&public_order_token=invalid` (Puppeteer smoke)
8. **Relevant log excerpts:**
   - pos-back: `GET /public/orders/1/delivery-status?public_order_token=invalid` → `404 Not Found` (expected for invalid token).
   - pos-haproxy: `GET /delivery/1/track?order_id=1&public_order_token=invalid` → 200; `GET /api/public/orders/1/delivery-status?public_order_token=invalid` → 404.
   - pos-front: no delivery-track build errors in window (unrelated MenuComponent NG8107 warnings only).

