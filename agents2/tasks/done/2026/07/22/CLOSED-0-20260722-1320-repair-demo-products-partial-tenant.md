---
## Closing summary (TOP)

- **What happened:** Demo product seed skipped tenants that already had any products, so partial menus (e.g. tenant 1 with catalog-only rows) never got the default DEMO_PRODUCTS set.
- **What was done:** Updated `seed_demo_products.run()` to repair tenants missing any DEMO name (idempotent, no deletes) and added `check_demo_products` plus docs indexes in AGENTS.md / docs/testing.md.
- **What was tested:** Partial repair, catalog retention, checker exit 0/1, seed idempotency, and optional `test-demo-data.mjs` — overall PASS (2026-07-25).
- **Why closed:** All pass criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 18:57
---

# Repair demo products seed for partial tenants + checker

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Tenant 1 demo hygiene assumes a usable menu for Take Away / public menu / `test-demo-data.mjs` (≥10 products). **`seed_demo_products.run()`** only seeds tenants with **zero** products — same class of bug as **`NEW-0-20260712-1614-repair-demo-tables-t01-t10`**. Locally tenant 1 has **7** catalog-import products and **none** of the ten `DEMO_PRODUCTS` names, so the seeder prints “already have products” and never fills the default demo menu. There is a **`check_demo_tables`** module but **no `check_demo_products`**.

## Evidence (008 preflight / review)

- Sibling SIGNAL: `demo_tables_check=fail` (tables task already queued); products gap found while investigating demo seeds
- `docker compose … exec back` count: tenant 1 products **7**; missing all of Enchiladas…Coffee from `DEMO_PRODUCTS` in `back/app/seeds/seed_demo_products.py`
- `_seed_tenant_products` already creates **by missing name**; `run()` never calls it when the tenant has any product row
- Docs: `AGENTS.md` Demo products; `docs/testing.md` seed/check tables section (products seed only, no checker)

## High-level instructions for coder

- Fix **`seed_demo_products.run()`** so tenants missing any `DEMO_PRODUCTS` name (at least tenant **1**) get `_seed_tenant_products`, not only empty tenants. Keep idempotent; do not delete existing catalog/wine/beer rows
- Add **`back/app/seeds/check_demo_products.py`** (exit 0 when tenant 1 has all `DEMO_PRODUCTS` names, or a clear documented minimum aligned with `test-demo-data.mjs`)
- One-line index under demo seeds in **`docs/testing.md`** / **`AGENTS.md`** Demo products section for the new checker
- Pass criteria: after seed, checker exits **0**; tenant 1 still retains existing non-demo products; `test-demo-data.mjs` product count threshold still met when credentials available
- Append **Testing instructions** when implementation is complete
- Related but separate: **`NEW-0-20260712-1614-repair-demo-tables-t01-t10`** (tables only) — do not merge unless implementing both in one PR intentionally

## Implementation notes (coder)

- **`seed_demo_products.run()`** now repairs every tenant missing any `DEMO_PRODUCTS` name (same pattern as `seed_demo_tables`); never deletes existing rows.
- Added **`back/app/seeds/check_demo_products.py`** (tenant 1 must have all `DEMO_PRODUCT_NAMES`).
- Indexed checker in **`AGENTS.md`** (Demo products) and **`docs/testing.md`** (Backend / data checks).
- Local verify (2026-07-25): before seed tenant 1 had 7 catalog products / checker exit 1; after seed created 10 demo names → 17 total, catalog 7 kept; checker exit 0; second seed run no-ops.

## Testing instructions

### What to verify

1. `seed_demo_products` fills missing `DEMO_PRODUCTS` names on tenants that already have other products (partial menus).
2. Existing non-demo/catalog products on tenant 1 are not deleted.
3. `check_demo_products` exits 0 when all demo names are present.
4. Seed is idempotent (second run creates nothing).
5. Optional: `test-demo-data.mjs` still sees ≥10 products for tenant 1.

### How to test

From repo root (stack up: `docker compose -f docker-compose.yml -f docker-compose.dev.yml`):

```bash
# Expect exit 0 after a successful seed
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.seed_demo_products
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.check_demo_products

# Idempotent re-run (should print “already have the full demo product set”)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.seed_demo_products

# Optional Puppeteer (≥10 products + tables + /book/1)
# BASE_URL=http://127.0.0.1:4202 LOGIN_EMAIL=… LOGIN_PASSWORD=… node front/scripts/test-demo-data.mjs
```

### Pass/fail criteria

- **Pass:** `check_demo_products` exit **0**; tenant 1 retains prior catalog/import product rows; second `seed_demo_products` creates **0** new rows for tenants already complete.
- **Fail:** checker exit 1 (missing demo names); catalog products removed; or seeder still skips tenants that already have any product row.

## Test report

1. **Date/time (UTC):** 2026-07-25 18:56:36 – 18:57:04 UTC. Log window: `docker logs --since 15m pos-back` / `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development`.
3. **What was tested:** Partial-tenant demo product repair via `seed_demo_products`, catalog retention, `check_demo_products`, seed idempotency, optional `test-demo-data.mjs`.
4. **Results:**
   - Partial menu repair (missing DEMO name filled): **PASS** — deleted `Coffee` on tenant 1 (16 products); seed printed `Tenant 1: created 1 demo products.`; Coffee restored; total 17.
   - Catalog/non-demo products retained: **PASS** — all 7 prior names still present (`Barocco D.O.C. Puglia`, `Benvenuti al Sud!`, `Due.Zero`, `Il 4 Napoletano`, `La Bestiale`, `Amstel Radler`, `Café americano`).
   - `check_demo_products` exit 0 when complete: **PASS** — after seed: `OK: tenant 1 has all 10 demo products (17 total products).` (exit 0); after delete: exit 1 with `Missing … ['Coffee']`.
   - Seed idempotent: **PASS** — second run: `All tenants already have the full demo product set. Nothing to seed.`
   - Optional `test-demo-data.mjs`: **PASS** — Products (≥10): OK (27); Tables OK (21); `/book/1` OK.
5. **Overall:** **PASS**
6. **Product owner feedback:** Demo product seed now repairs partial catalogs the same way tables do, so tenant 1 keeps wine/beer/catalog rows and still gets the full default menu. The new checker makes deploy/ops verification trivial (exit 0/1). Safe to close.
7. **URLs tested:**
   1. http://127.0.0.1:4202/ (HTTP 200)
   2. http://127.0.0.1:4202/book/1
   3. http://127.0.0.1:4202/dashboard (after login in `test-demo-data.mjs`)
8. **Relevant log excerpts:**
   - Seed repair: `Tenant 1: created 1 demo products.` / `Done.`
   - Checker fail then pass: `Missing demo products for tenant 1: ['Coffee']` → `OK: tenant 1 has all 10 demo products (17 total products).`
   - Idempotent: `All tenants already have the full demo product set. Nothing to seed.`
   - Puppeteer: `Products (≥10): OK (27)` / `>>> RESULT: Demo data in place.`
   - `pos-back` (window): WatchFiles reload for `seed_demo_products.py` / `check_demo_products.py`; no traceback during seed/check.
