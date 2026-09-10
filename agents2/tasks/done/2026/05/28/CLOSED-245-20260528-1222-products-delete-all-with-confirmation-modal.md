---
## Closing summary (TOP)

- **What happened:** Staff needed a tenant-scoped “Delete all products” flow on `/products` with confirmation; initial implementation hit `tenantproduct_product_id_fkey` on catalog-linked rows.
- **What was done:** Added `DELETE /products/all`, confirmation modal and i18n, `_clear_product_references_before_delete()` for FK cleanup (single + bulk delete), and pytest coverage including a TenantProduct regression test.
- **What was tested:** Retest PASS — 5/5 pytest, clean frontend build, Puppeteer UI (modal, cancel, confirm empties list + banner), live API on tenant 1 with linked rows, kitchen 403, landing smoke 200.
- **Why closed:** All testing criteria passed after FK/reference cleanup fix; feature fully delivered per issue #245.
- **Closed at (UTC):** 2026-05-28 14:06
---

# Products: delete all with confirmation modal

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/245
- **245**

## Problem / goal

Staff on `/products` need a way to remove all menu products for the current tenant in one action, with a clear confirmation step so accidental mass deletion is avoided. The flow should mirror single-product delete rules (tenant scoping, authorization, image cleanup where applicable) and include ES+EN i18n, backend pytest coverage, and a smoke check.

## High-level instructions for coder

- Read issue #245 for product intent only; do not copy secrets or untrusted payloads into code or commits.
- **Backend:** Add a tenant-scoped bulk delete endpoint (e.g. `DELETE /products/all` or equivalent) requiring `PRODUCT_WRITE`, consistent with existing `DELETE /products/{product_id}` in `back/app/main.py`. Reuse the same constraints as single delete (404/403 patterns, image file cleanup via `_delete_product_image_on_disk` if single delete does that). Return a summary payload (e.g. count deleted).
- **Frontend:** On `products.component.ts` / template, add a **Delete all** control visible to users who can delete products (same gate as single delete). Open a confirmation modal with **Cancel** and **Delete all** actions, matching existing single-delete modal styling and patterns (`productToDelete` modal is a reference).
- After confirm, call the bulk endpoint, refresh the product list, and show success/error feedback consistent with the page.
- **i18n:** Add keys for button label, modal title/body, and confirm/cancel to **all** locales under `front/public/i18n/` (minimum ES + EN per issue; follow project rule to update every locale file).
- **Tests:** Add pytest for the bulk endpoint (tenant isolation, auth, empty tenant, deletes multiple products). Run landing smoke and verify `docker logs --since 10m pos-front` shows a clean build after UI changes.
- Do not add unrelated product features; keep scope to bulk delete + confirmation UX.

## Implementation notes

- **Backend:** `DELETE /products/all` in `back/app/main.py` (registered before `DELETE /products/{product_id}`). Returns `{"status": "deleted", "count": N}`. Same `PRODUCT_WRITE` permission as single delete; no on-disk image cleanup (single delete does not either).
- **FK cleanup (2026-05-28):** `_clear_product_references_before_delete()` removes linked `TenantProduct`, `ProductRecipe`, and `ProductQuestion` rows before delete (avoids `tenantproduct_product_id_fkey` 500 and stops `GET /products` from re-creating products from unlinked catalog rows). Used by single and bulk delete.
- **Frontend:** `ApiService.deleteAllProducts()`, header **Delete all** button (when list non-empty and `canEditProducts()`), confirmation modal, success banner with count.
- **i18n:** `DELETE_ALL`, `DELETE_ALL_TITLE`, `DELETE_ALL_CONFIRM`, `DELETE_ALL_BUTTON`, `DELETE_ALL_SUCCESS`, `FAILED_TO_DELETE_ALL` in all `front/public/i18n/*.json` locales.
- **Tests:** `back/tests/test_products_delete_all.py` (4 tests, all passing).

## Testing instructions

1. **Backend:** From repo root:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_products_delete_all.py -q
   ```
   Expect 4 passed.

2. **Frontend build:** `docker logs --since 5m pos-front 2>&1 | tail -20` — confirm `Application bundle generation complete` with no TS errors.

3. **Manual UI** (owner/admin on `/products` with at least one product):
   - **Delete all** appears in the page header next to Bulk import / Add product.
   - Click **Delete all** → modal shows count and warning; **Cancel** closes without changes.
   - Confirm **Delete all** → list empties; green success banner shows deleted count.
   - Kitchen/read-only user: no **Delete all** button (same as single delete).

4. **API:** `DELETE /api/products/all` with owner bearer token returns `count`; other tenant’s products unchanged (see pytest).

5. **Smoke:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → `200`. (Landing version test may fail if footer hash not rebuilt after version bump — unrelated to this feature.)

---

## Test report

**Date/time (UTC):** 2026-05-28 12:24–12:30 UTC  
**Log window:** `pos-back`, `pos-front` — `--since 15m` through report time  
**Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`  
**GitHub:** Verification started; label `agent:testing` on #245.

### What was tested

Per **Testing instructions** §1–5: pytest bulk-delete suite, frontend build logs, Puppeteer UI on `/products` (owner), landing smoke, API behaviour on demo tenant with linked `tenantproduct` rows.

### Results

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 1. Backend pytest `test_products_delete_all.py` (4 passed) | **PASS** | `4 passed in 3.39s` (isolated test DB, no `tenantproduct` FK refs) |
| 2. Frontend build clean | **PASS** | `Application bundle generation complete` — no TS errors in `pos-front` tail |
| 3a. **Delete all** in header when products exist | **PASS** | Puppeteer: `.btn-delete-all` visible with 18 products |
| 3b. Modal count + warning; Cancel unchanged | **PASS** | Modal title/body shown count 18; after Cancel API count still 18 |
| 3c. Confirm → empty list + success banner | **FAIL** | After confirm, `/api/products` count still 18; no empty list |
| 3d. Kitchen/read-only: no button | **PASS** (pytest) | `test_delete_all_requires_product_write` → 403; UI not re-run (same `canEditProducts()` gate as single delete) |
| 4. API `DELETE /products/all` returns `count` on real tenant | **FAIL** | `DELETE /products/all` → **500** `IntegrityError`: `tenantproduct_product_id_fkey` |
| 5. Landing smoke HTTP 200 | **PASS** | `curl` → `200` |

### Overall: **FAIL**

Failed: **3c** (confirm does not delete on demo data), **4** (bulk delete 500 when products are referenced by `tenantproduct`). Pytest passes only because the test database does not create `TenantProduct` rows linked to `Product.id`.

### Product owner feedback

The confirmation UX (button, modal copy with count, cancel) is in place and matches the spec. Bulk delete cannot complete on a typical tenant that has catalog-linked products: the server returns 500 and the list stays unchanged. The coder should unlink or delete dependent `TenantProduct` rows (and any other FKs) before deleting `Product` rows, consistent with how single-product delete should behave on linked data, then add a regression test that creates a `TenantProduct` with `product_id` set.

### URLs tested

1. `http://127.0.0.1:4202/login` (post-login redirect)
2. `http://127.0.0.1:4202/products`

### Relevant log excerpts

```
pos-back  | INFO:     ... "DELETE /products/all HTTP/1.1" 500 Internal Server Error
pos-back  | sqlalchemy.exc.IntegrityError: (psycopg.errors.ForeignKeyViolation) update or delete on table "product" violates foreign key constraint "tenantproduct_product_id_fkey" on table "tenantproduct"
pos-back  | DETAIL:  Key (id)=(10) is still referenced from table "tenantproduct".
```

```
pos-front | Application bundle generation complete. [0.011 seconds] - 2026-05-28T12:25:08.647Z
```

---

## Test report (retest)

**Date/time (UTC):** 2026-05-28 13:58–14:05 UTC  
**Log window:** `pos-back`, `pos-front` — `--since 15m` through report time  
**Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`  
**GitHub:** Retest after `_clear_product_references_before_delete()`; label `agent:testing` on #245.

### What was tested

Per **Testing instructions** §1–5 (retest): pytest (5 tests incl. FK regression), frontend build, Puppeteer UI on `/products` (owner cookie auth), live API on tenant 1 with catalog-linked `TenantProduct` rows, kitchen 403, landing smoke.

### Results

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 1. Backend pytest `test_products_delete_all.py` (5 passed) | **PASS** | `5 passed in 3.80s` incl. `test_delete_all_unlinks_tenant_product_fk` |
| 2. Frontend build clean | **PASS** | `Application bundle generation complete` @ 2026-05-28T13:44:09Z — no TS errors |
| 3a. **Delete all** in header when products exist | **PASS** | Puppeteer: `.btn-delete-all` visible with 10 products |
| 3b. Modal count + warning; Cancel unchanged | **PASS** | Modal title “Delete all products”; after Cancel API count still 10 |
| 3c. Confirm → empty list + success banner | **PASS** | After confirm API count 0; banner “10 products deleted.”; button hidden |
| 3d. Kitchen/read-only: no button | **PASS** | Live API: kitchen user `DELETE /products/all` → **403**; pytest `test_delete_all_requires_product_write` |
| 4. API `DELETE /products/all` on tenant with FK-linked rows | **PASS** | Tenant 1: 3 `TenantProduct` links, `DELETE` → **200** `{"status":"deleted","count":18}` then `GET /products` → 0 |
| 5. Landing smoke HTTP 200 | **PASS** | `curl` → `200` |

### Overall: **PASS**

All criteria pass after FK/reference cleanup. Bulk delete works on demo tenant with catalog-linked products.

### Product owner feedback

Staff can safely remove the entire menu in one step: the confirmation modal shows the product count, cancel leaves data intact, and confirm clears the list with a clear success message. The earlier database constraint error on linked catalog rows is resolved; owners with write access can use this on real tenants without a server error.

### URLs tested

1. `http://127.0.0.1:4202/` (smoke)
2. `http://127.0.0.1:4202/products` (owner UI flow)

### Relevant log excerpts

```
pos-back  | INFO:     ... "DELETE /products/all HTTP/1.1" 200 OK
```

```
pos-front | Application bundle generation complete. [1.939 seconds] - 2026-05-28T13:44:09.643Z
```

## Handoff log

- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — Cursor):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. UI + **`DELETE /products/all`** + pytest suite present in working tree; **`delete_all_products`** still deletes **`Product`** rows without clearing **`TenantProduct.product_id`** FKs — embedded **Test report** criteria **(3c)** and **(4)** **FAIL** (`tenantproduct_product_id_fkey`). **Testing instructions** present. **`gh issue view 245`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, implementation **not** complete (bulk delete must work on catalog-linked products). **No** **`WIP-245-…` → `UNTESTED-*`**; **no** `gh issue edit 245 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass):** Re-synced **`development`** (OK). Re-read **`delete_all_products`** in **`main.py`** (4160–4167): bulk loop **`session.delete(product)`** only — no **`TenantProduct.product_id`** unlink. Embedded **Test report** criteria **(3c)** / **(4)** **FAIL** unchanged. **`gh issue view 245`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. **No** rename; **no** `gh issue edit 245 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — handoff agent):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. **`delete_all_products`** (4160–4167) still **`session.delete(product)`** only — no **`TenantProduct.product_id`** unlink/delete. Embedded **Test report** criteria **(3c)** / **(4)** **FAIL** unchanged. **`gh issue view 245`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, **wip → untested** not warranted. **No** rename; **no** `gh issue edit 245 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. Re-read **`delete_all_products`** (4154–4167): bulk loop still **`session.delete(product)`** without clearing **`TenantProduct`** FK refs. Criteria **(3c)** / **(4)** **FAIL** unchanged. **`gh issue view 245`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. **No** **`WIP-245-…` → `UNTESTED-*`**; **no** `gh issue edit 245 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — Composer):** `./scripts/git-sync-development.sh` (OK). **`delete_all_products`** (4154–4167) unchanged — **`session.delete(product)`** only; **`delete_product`** (4170–4188) same pattern. Embedded **Test report** **FAIL** on **(3c)**/**(4)** still applies. **`gh issue view 245`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, **wip → untested** not warranted. **No** rename; **no** `gh issue edit 245 --add-label "agent:untested"`.
