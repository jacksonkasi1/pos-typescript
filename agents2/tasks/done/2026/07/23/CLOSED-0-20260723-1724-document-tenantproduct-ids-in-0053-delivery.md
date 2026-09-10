---
## Closing summary (TOP)

- **What happened:** Docs for Satisfecho Delivery public/staff create did not state dual `product_id` semantics (`TenantProduct.id` → `Product` plus legacy `Product.id`) after #304.
- **What was done:** Updated `docs/0053-satisfecho-delivery-order-channel.md` with API and Public UI notes on dual ID resolve, tenant scoping, and pointers to the regression pytest / `test:delivery-checkout`.
- **What was tested:** `rg` confirmed TenantProduct wording in API and Public UI; optional pytest `test_public_create_accepts_tenant_product_menu_ids` passed; no product-code diffs — overall **PASS**.
- **Why closed:** All pass/fail criteria met; docs-only task fully delivered.
- **Closed at (UTC):** 2026-07-26 01:30
---

# Document TenantProduct menu IDs in Satisfecho Delivery doc

## GitHub Issues
- **Issue:** (none — enhancement reviewer) — related shipped fix #304
- **0**

## Problem / goal

Public Satisfecho Delivery create now accepts **public-menu `TenantProduct.id`** values (maps to linked `Product`) as well as legacy **`Product.id`** (#304). **`docs/0053-satisfecho-delivery-order-channel.md`** describes the public create API and cart UI but does not state line-ID semantics, so the next agent may re-open a “Product not found” bug that is already fixed.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL changelog_sparse` after 2.1.28 cut (Unreleased empty; #304 in **[2.1.28]**); docs_stale SIGNAL basenames already queued
- Closed **`CLOSED-304-…-resolve-tenantproduct-ids-satisfecho-delivery-checkout`**: `_resolve_product_lines` + regression pytest
- `rg` on `docs/0053`: no `TenantProduct` / catalog-id note under API or Public UI
- Do not re-implement product code; documentation only

## High-level instructions for coder

- In **`docs/0053-satisfecho-delivery-order-channel.md`**, add a short bullet (API and/or Public UI) that public (and staff) Satisfecho Delivery create item IDs resolve **`TenantProduct` → `Product`** for the tenant, and still accept **`Product.id`**
- Optional one-liner pointer to pytest `test_public_create_accepts_tenant_product_menu_ids` / `test:delivery-checkout` when those are indexed
- No bulk rewrite of 0053; no code changes
- Pass/fail: `rg -n 'TenantProduct' docs/0053-satisfecho-delivery-order-channel.md` finds the note

## Coder notes (2026-07-26)

- Added **Item `product_id` (#304)** under API in `docs/0053-satisfecho-delivery-order-channel.md` (TenantProduct → Product + legacy Product.id; tenant-bound; pytest + `test:delivery-checkout` pointers).
- Noted under Public UI that `/delivery/:tenantId` cart posts `TenantProduct.id`.
- No product code changes.
- Spot-checked: `tests/test_public_satisfecho_delivery.py -k test_public_create_accepts_tenant_product_menu_ids` → 1 passed in Docker.

## Testing instructions

### What to verify

- `docs/0053-satisfecho-delivery-order-channel.md` documents that staff and public Satisfecho Delivery create accept tenant-scoped **`TenantProduct.id`** (resolved to linked `Product`) and legacy **`Product.id`**.
- Public UI section mentions cart lines use public-menu catalog ids.
- No unrelated product-code diffs in this task.

### How to test

```bash
# From repo root
rg -n 'TenantProduct' docs/0053-satisfecho-delivery-order-channel.md

# Optional regression (behaviour already shipped #304; docs-only task)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python3 -m pytest tests/test_public_satisfecho_delivery.py \
  -k test_public_create_accepts_tenant_product_menu_ids -q

# Optional UI smoke (stack up; BASE_URL e.g. http://127.0.0.1:4202)
# npm run test:delivery-checkout --prefix front
```

### Pass/fail criteria

- **Pass:** `rg` finds `TenantProduct` under both API and Public UI wording; doc states dual ID resolve and tenant scoping; no product code required for this task.
- **Fail:** Note missing, only one create path mentioned, or doc implies TenantProduct-only / Product-only without the dual-ID behaviour.

## Test report

1. **Date/time (UTC):** 2026-07-26 01:29:52 – 01:30:05 UTC. Log window: `docker logs --since 10m` for `pos-back` / `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development` (synced); `BASE_URL` http://127.0.0.1:4202 (landing HTTP 200). Docs-only verification + optional pytest in `pos-back`.
3. **What was tested:** `docs/0053` documents dual `product_id` resolve (`TenantProduct.id` → `Product` and legacy `Product.id`) for staff and public create; Public UI notes cart posts catalog ids; no product-code changes for this task; optional regression pytest.
4. **Results:**
   - Doc API bullet states dual ID resolve + tenant scoping — **PASS** (`rg` line 21: staff and public create; TenantProduct → Product or Product.id; cross-tenant must not resolve).
   - Doc Public UI mentions cart catalog ids — **PASS** (`rg` line 41: cart posts `TenantProduct.id`; create accepts that or legacy `Product.id`).
   - No unrelated product-code diffs — **PASS** (`git diff --name-only HEAD -- back/ front/` empty; only `docs/0053-…` + task file).
   - Optional regression pytest — **PASS** (`test_public_create_accepts_tenant_product_menu_ids` → 1 passed in 0.82s).
5. **Overall:** **PASS**
6. **Product owner feedback:** Docs now make the #304 dual-ID contract explicit for both API and `/delivery/:tenantId`, which should stop false “Product not found” reopenings. Pointers to the pytest and `test:delivery-checkout` are enough for the next agent. No further product work needed for this task.
7. **URLs tested:**
   1. http://127.0.0.1:4202/ (smoke HTTP 200 only; no browser flow required)
8. **Relevant log excerpts:**
   - pytest: `1 passed, 13 deselected, 1 warning in 0.82s`
   - `pos-front` (10m): no TS/bundle errors
   - `curl` landing: `200`
