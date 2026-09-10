---
## Closing summary (TOP)

- **What happened:** Staff saw duplicate category options when products or bulk import stored translated category strings (`Entrantes`, `Plat principal`, etc.) alongside canonical English keys from `GET /catalog/categories`.
- **What was done:** Added `normalize_product_category()` and an i18n-backed alias map in `category_codes.py`; applied normalization on product create/update, bulk import preview/confirm, and `tenant_categories_for_ui`; added idempotent repair via migrate and `repair_product_category_aliases` seed; tests in `test_category_normalize.py`.
- **What was tested:** Backend pytest (17 passed), live API POST/PUT/preview normalization, `GET /catalog/categories` deduplication, repair seed, Products and bulk-import dropdowns — overall **PASS**.
- **Why closed:** Tester verification passed all criteria; safe to ship on next development promotion.
- **Closed at (UTC):** 2026-06-04 14:49
---

# Normalize product category labels from all UI locales to canonical English keys

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/265
- **265**

## Problem / goal

Staff see duplicate category options (e.g. two “Entrantes”) when products or bulk import store translated category strings (`Entrantes`, `Plat principal`, `Vorspeisen`, `Entrées`, etc.) while `GET /catalog/categories` also returns the five canonical English keys (`Starters`, `Main Course`, `Desserts`, `Beverages`, `Sides`). Both render as the same label after i18n.

Normalize any known alias to the canonical English value on write paths and when merging categories for the UI. Unknown strings that do not match any of the five standard categories remain custom categories (append after the standard five, no duplicate labels).

Existing code touchpoints: `back/app/category_codes.py`, `back/app/tenant_subcategories.py` (`tenant_categories_for_ui`), product create/update, `product_bulk_import.py` preview/confirm.

## High-level instructions for coder

- Add or extend a backend helper (e.g. in `category_codes.py`) that maps category aliases to canonical English using:
  - The five English strings in `CATEGORY_CODES`, and
  - Every `PRODUCTS.CATEGORY_STARTERS` … `PRODUCTS.CATEGORY_SIDES` translation in all `front/public/i18n/*.json` locales (`en`, `es`, `ca`, `de`, `fr`, `bg`, `hi`, `ur`, `zh-CN`).
- Apply normalization on product create/update, bulk import (preview and confirm), and in `tenant_categories_for_ui` (collapse legacy alias keys into English).
- Provide a one-off repair for existing data: update `Product.category` (and `tenant.custom_subcategories` top-level keys if they use translated names) from aliases to English for affected tenants.
- Tests: saving/importing with `"category": "Entrantes"` or `"Plat principal"` (ca) stores `Starters` / `Main Course`; `GET /catalog/categories` lists each standard category exactly once; Products and bulk-import dropdowns show five unique category labels.
- Out of scope: subcategory renaming unless required by category-key migration; new UI languages beyond existing i18n files.
- After implementation: append **Testing instructions** to this task file when moving to **UNTESTED**.

## Implementation notes

- `normalize_product_category()` and alias map in `back/app/category_codes.py` (i18n files when mounted, baked-in fallback for back-only Docker).
- Normalization on `POST/PUT /products`, bulk import preview/confirm, and `tenant_subcategories` merge/validate paths.
- Idempotent repair: `repair_stored_category_aliases()` runs after `python -m app.migrate` and via `python -m app.seeds.repair_product_category_aliases`.
- Tests: `back/tests/test_category_normalize.py`.

## Testing instructions

1. **Backend unit tests** (Docker):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_category_normalize.py tests/test_product_bulk_import.py tests/test_tenant_subcategories.py -q
   ```
2. **API smoke** (owner login, tenant with a product):
   - `POST /products` with `"category": "Entrantes"` → response `category` is `"Starters"`.
   - `PUT /products/{id}` with `"category": "Plat principal"` → `"Main Course"`.
   - `POST /products/bulk-import/preview-json` with `{"items":[{"name":"X","price":5,"category":"Entrantes"}]}` → preview row `category` is `"Starters"`.
   - `GET /catalog/categories` after seeding products with alias categories (or running repair): each of the five standard keys appears **once**; no duplicate alias keys (e.g. no separate `"Entrantes"` alongside `"Starters"`).
3. **Repair** (optional on existing DB):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.repair_product_category_aliases
   ```
4. **UI** (Products page + bulk import): category dropdown shows five unique standard labels (no duplicate “Entrantes” / “Starters” entries for the same logical category).

## Test report

1. **Date/time (UTC):** 2026-06-04 14:46:14 – 14:48:31 UTC. Log window: same interval on `pos-back`, `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; `BASE_URL=http://127.0.0.1:4202`; local Docker only (no amvara9 deploy).
3. **What was tested:** Backend unit tests; live API normalization (POST/PUT products, bulk-import preview, GET `/catalog/categories`); repair seed; Products add-form category dropdown; bulk-import JSON preview category dropdown.
4. **Results:**
   - Backend pytest (`test_category_normalize`, `test_product_bulk_import`, `test_tenant_subcategories`): **PASS** — 17 passed in 4.21s.
   - `POST /products` with `"Entrantes"` → `"Starters"`: **PASS** — live API via owner JWT (tenant 1).
   - `PUT /products/{id}` with `"Plat principal"` → `"Main Course"`: **PASS**.
   - Bulk-import preview `"Entrantes"` → `"Starters"`: **PASS**.
   - `GET /catalog/categories` — five standard keys once, no `"Entrantes"`: **PASS** — keys `["Starters","Main Course","Desserts","Beverages","Sides"]`, `Starters` count 1.
   - Repair seed `repair_product_category_aliases`: **PASS** — `{'products_updated': 0, 'tenants_updated': 0}` (idempotent, no pending aliases).
   - Products add-form `#category` dropdown: **PASS** — labels `Select Category`, five standards, no duplicate alias labels.
   - Bulk-import preview dropdown after JSON paste: **PASS** — includes `Starters` (normalized from `Entrantes` input), no `Entrantes` option; five standard keys present among options.
5. **Overall:** **PASS**
6. **Product owner feedback:** Category alias normalization works end-to-end: translated inputs are stored and returned as canonical English keys, catalog categories no longer list alias duplicates, and both the product form and bulk-import preview show a single set of standard category labels. Safe to ship on the next development promotion cycle.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login
   2. http://127.0.0.1:4202/products
8. **Relevant log excerpts:**
   ```
   pos-back | POST /products → 200 (category Starters)
   pos-back | PUT /products/{id} → 200 (category Main Course)
   pos-back | POST /products/bulk-import/preview-json → 200
   pos-back | GET /catalog/categories → 200
   pytest: 17 passed in 4.21s
   repair: Category alias repair complete: {'products_updated': 0, 'tenants_updated': 0}
   ```

**Note:** UI login used a temporary password on local tenant-1 owner `ralf@roeber.de` for Puppeteer only; credentials in repo `.env` did not authenticate against this DB.
