---
## Closing summary (TOP)

- **What happened:** `docs/SECURITY-REVIEW.md` still described public Satisfecho Delivery create without the #304 dual-ID contract (`TenantProduct.id` vs legacy `Product.id`).
- **What was done:** Updated the Public Satisfecho Delivery control-plane row, residual dual-ID risk, Change log 2026-07-23/#304 delta, and cited `test_public_create_accepts_tenant_product_menu_ids`; docs only, no 0053 rewrite.
- **What was tested:** Doc `rg` for TenantProduct/#304/regression cite plus optional pytest regression (1 passed) — overall PASS.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-26 00:54
---

# SECURITY-REVIEW: document TenantProduct IDs on public delivery create (#304)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Public Satisfecho Delivery create now resolves **public-menu `TenantProduct.id` → `Product`** (and still accepts legacy `Product.id`) (#304). **`docs/SECURITY-REVIEW.md`** still describes the surface as “products must belong to that tenant” only and lists `test_public_satisfecho_delivery.py` without the catalog-ID regression. Agents re-auditing delivery may miss the dual-ID contract or reopen a fixed bug.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL changelog_sparse` / post-2.1.28 code scan; #304 shipped and covered in CHANGELOG 2.1.28
- `docs/SECURITY-REVIEW.md` Public Satisfecho Delivery row (~L73): no `TenantProduct` / catalog-id wording; residual risks do not mention dual ID space
- Pytest: `back/tests/test_public_satisfecho_delivery.py` includes TenantProduct create coverage (#304)
- Sibling **`NEW-0-20260723-1724-document-tenantproduct-ids-in-0053-delivery`** owns **feature** doc **0053** only — do **not** merge; this task is SECURITY-REVIEW only
- Prior CLOSED security delta (**CLOSED-0-20260722-1159-…**) predates the #304 fix

## High-level instructions for coder

- In **`docs/SECURITY-REVIEW.md`**, update the Public Satisfecho Delivery control-plane row to state that item IDs may be tenant-scoped **`TenantProduct.id`** (resolved to linked `Product`) or legacy **`Product.id`**, still tenant-bound
- Point tests at the #304 regression case in `back/tests/test_public_satisfecho_delivery.py` (keep existing file cite)
- Optional one-line residual: dual ID space is intentional for catalog menus; do not accept cross-tenant IDs (existing tenant checks remain the control)
- Append a short History / delta line dated 2026-07-23 for the #304 pass
- No product code; no rewrite of **0053** (owned by sibling NEW)
- Pass/fail: `rg -n 'TenantProduct|#304' docs/SECURITY-REVIEW.md` hits the updated row; SECURITY remains a review note, not a pentest

## Coder notes (2026-07-26)

- Updated **Public Satisfecho Delivery** row in `docs/SECURITY-REVIEW.md` with #304 dual-ID contract (`TenantProduct.id` → linked `Product`, or legacy `Product.id`; tenant-bound).
- Cited `test_public_create_accepts_tenant_product_menu_ids` next to the existing test file pointer.
- Added residual-risk bullet on dual ID space; Change log delta for 2026-07-23 / #304.
- Docs only — no product code; **0053** left to sibling NEW.

## Testing instructions

### What to verify

- `docs/SECURITY-REVIEW.md` documents that public delivery create accepts `TenantProduct.id` or `Product.id`, both tenant-scoped (#304).
- Residual risks mention dual ID space; Change log has a 2026-07-23 #304 delta.
- Doc remains a review note (not a pentest claim).

### How to test

From repo root:

```bash
rg -n 'TenantProduct|#304|test_public_create_accepts_tenant_product' docs/SECURITY-REVIEW.md
```

Optional (confirms cited regression still exists; no code change expected):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back \
  python3 -m pytest back/tests/test_public_satisfecho_delivery.py::TestPublicSatisfechoDelivery::test_public_create_accepts_tenant_product_menu_ids -q
```

(Adjust test class path if discovery differs; file is `back/tests/test_public_satisfecho_delivery.py`.)

### Pass/fail criteria

- **Pass:** `rg` hits the Public Satisfecho Delivery row, residual dual-ID bullet, and Change log #304 line; wording matches tenant-bound resolution; no rewrite of `docs/0053-satisfecho-delivery-order-channel.md`.
- **Fail:** Missing `TenantProduct` / `#304` on the delivery control-plane row, or product/0053 edits outside scope.

## Test report

1. **Date/time (UTC):** 2026-07-26 00:53:28 – 00:53:32 UTC. Log window: `pos-back` since `2026-07-26T00:53:00Z`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; no browser (`BASE_URL` N/A). Doc `rg` on host; pytest via `docker compose … exec -T back`.
3. **What was tested:** SECURITY-REVIEW Public Satisfecho Delivery #304 dual-ID wording (`TenantProduct.id` / `Product.id`, tenant-bound); residual dual-ID bullet; Change log 2026-07-23 #304 delta; review-note (not pentest) framing; no 0053 rewrite; optional regression `test_public_create_accepts_tenant_product_menu_ids`.
4. **Results:**
   - Public delivery row documents `TenantProduct.id` / `Product.id` (#304), tenant-bound: **PASS** — `docs/SECURITY-REVIEW.md:73`.
   - Residual dual ID space bullet: **PASS** — `docs/SECURITY-REVIEW.md:83`.
   - Change log 2026-07-23 #304 delta + “Not a penetration test”: **PASS** — `docs/SECURITY-REVIEW.md:138` (intro also states not a pentest).
   - Cite `test_public_create_accepts_tenant_product_menu_ids`: **PASS** — row L73 and Change log L138.
   - No rewrite of `docs/0053-satisfecho-delivery-order-channel.md`: **PASS** — `git status` showed only `docs/SECURITY-REVIEW.md` modified for this scope.
   - Optional pytest regression: **PASS** — `1 passed` in 0.89s.
5. **Overall:** **PASS**
6. **Product owner feedback:** SECURITY-REVIEW now matches the shipped #304 public-menu ID contract so future audits will not miss the dual-ID surface. Residual risk correctly frames the dual space as intentional and still tenant-bound. No product or 0053 churn; safe to close.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
# pytest (pos-back exec)
1 passed, 1 warning in 0.89s

# pos-back (window; no errors related to this doc-only task)
INFO:     … "GET /docs HTTP/1.0" 200 OK
```
