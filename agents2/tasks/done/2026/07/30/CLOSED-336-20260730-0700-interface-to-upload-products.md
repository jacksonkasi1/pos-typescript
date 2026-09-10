---
## Closing summary (TOP)

- **What happened:** Staff product bulk import gained CSV/TSV upload (plus optional AI header mapping) through the existing preview→confirm pipeline.
- **What was done:** Added `POST /products/bulk-import/preview-csv`, header aliases, staff CSV/TSV tab, docs/0062 update, and tests — no second write path.
- **What was tested:** Backend pytest (24 passed), i18n parity, landing smoke, staff CSV preview→confirm and alias/unknown-column cases; AI mapping correctly 503 without vision key. Overall PASS.
- **Why closed:** Pass criteria met; tester report PASS.
- **Closed at (UTC):** 2026-07-30 07:24
---

# Interface to upload products (multi-format + AI mapping)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/336
- **336**

## Problem / goal

Staff want to **upload products in various formats** and have the system (including AI where useful) map them into the tenant `Product` rows. The issue asks for a thoughtful approach (how others solve catalog ingest) and then a concrete product path — not a greenfield importer alongside what we already have.

**Already in tree (reuse, do not duplicate):**
- Staff **Products → bulk import**: JSON paste/file + optional **menu-photo vision** → read-only **preview** → explicit **confirm** (`front/.../product-bulk-import.component`, `POST /products/bulk-import/*`, `back/app/product_bulk_import.py` / `product_bulk_import_routes.py`). Changelog: #242, #244.
- Backend **`parse_products_csv`** already maps a fixed column set into bulk-import items; migration CLI `python -m app.seeds.import_products_csv` + `docs/0062-pos-migration-import.md` (#321).
- Vision path needs `PRODUCT_VISION_*` / related settings when configured.

**Likely gap:** staff UI may not expose CSV (and other messy exports) as first-class upload into the same preview pipeline; unknown/vendor column names are rejected today; free-form files still need a safe AI → preview → confirm flow.

## High-level instructions for coder

- **Do not** invent a second product-write path. Extend **Products → bulk import** (preview + confirm + create/update-by-name). Keep tenant scoping and existing rate limits.
- **Brief approach note** (in this task or a short `docs/` section): how common POS/menu tools do ingest (strict CSV map vs AI column mapping vs vision from photos/PDFs); recommend **one** approach for Satisfecho that builds on current preview/confirm + vision.
- **Inventory current UX/API:** what formats the staff dialog already accepts (JSON / image vision); whether CSV upload hits an API or only the migration CLI; document the gap clearly.
- **Implement the highest-value gap** (prefer one coherent MVP):
  - Staff upload of **CSV** (and, if cheap, similar tabular text) into the existing preview/confirm flow; reuse `parse_products_csv` / shared validation.
  - Optional **AI-assisted mapping** for non-canonical headers or messy paste (map → same `ProductBulkImportItemIn` shape), still requiring human preview before confirm — never auto-write without confirm.
  - Do **not** silently ignore unknown columns; show clear preview errors or a mapping step.
- **Out of scope for this FEAT unless already trivial:** full Excel/.xlsx parser stack, historical orders/customers/tables (see #321 / docs/0062 non-goals), provider catalog import, image files as product photos in the same bulk row (single-product image upload already exists).
- **Security:** no secrets from the issue body; do not log raw uploaded menus with PII; vision/AI keys stay in `config.env` / settings patterns already used for product vision.
- **Docs / tests:** update `docs/0062-pos-migration-import.md` and/or a short products bulk-import note if behaviour changes; add or extend backend tests for any new parse/map path; smoke staff Products → bulk import (preview then confirm) and landing/`curl` 200. Append **Testing instructions** when moving to UNTESTED.
- Pass criteria: staff can upload at least one additional practical format (CSV or AI-mapped tabular) through preview → confirm into tenant products, with clear docs of what is supported vs CLI-only.

## Implementation notes (coder)

**Inventory (before):** Staff dialog = JSON + vision only. CSV lived only in CLI (`import_products_csv`) + `parse_products_csv`; unknown columns hard-failed with no staff path.

**Approach (docs/0062):** One pipeline — parse → preview → confirm. Strict map + aliases by default; optional AI header map when vision configured; vision for photos. No second write path.

**Shipped:**
- `POST /products/bulk-import/preview-csv` `{ csv, use_ai_mapping }` → same preview model → existing confirm.
- CSV/TSV sniff (`,`, `\t`, `;`); `CSV_HEADER_ALIASES`; unknown columns still error unless AI mapping maps/drops them explicitly.
- Staff UI tab **CSV / TSV** (file + paste + optional AI checkbox).
- Docs + CHANGELOG; tests extended.

## Testing instructions

1. **Backend unit/API tests** (Docker):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
     python3 -m pytest tests/test_import_products_csv.py tests/test_product_bulk_import.py -q
   ```
   Expect all passed (aliases, TSV, `preview-csv` API, unknown columns → 400, AI without key → 503).

2. **i18n parity:**
   ```bash
   python3 scripts/check-i18n-locale-parity.py
   ```
   Expect PASS.

3. **Landing smoke:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4202/
   # expect 200
   cd front && BASE_URL=http://127.0.0.1:4202 npm run test:landing-version
   ```

4. **Staff UI — Products → Bulk import → CSV / TSV:**
   - Log in as tenant owner/admin with product write.
   - Paste sample:
     ```text
     name,price,category
     CSV Bulk Test Dish,9.50,Starters
     ```
     Preview → confirm → dish appears on Products.
   - Alias check: `producto,precio` headers should preview without rename.
   - Unknown column (e.g. `sku`) without AI → clear error listing columns.
   - With `PRODUCT_VISION_API_KEY` set: enable AI mapping on a CSV with an extra SKU column; preview should succeed or report unmapped columns; confirm still required before writes.

5. **Front build:** `docker logs --since 10m pos-front` — no TS/NG compile failures after the change.

## Test report

1. **Date/time (UTC):** 2026-07-30 07:15:49 start → 07:22:51 end. Log window: ~07:08–07:22 UTC (includes brief front rebuild after coder save).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`). Staff login: tenant 1 via `.env` `DEMO_LOGIN_*` (cookie session).
3. **What was tested:** Backend pytest CSV/bulk-import; i18n parity; landing HTTP + `test:landing-version`; staff Products → Bulk import → CSV/TSV (unknown column, canonical preview→confirm, alias headers); API AI mapping without vision key; front compile health.
4. **Results:**
   - Backend pytest (`test_import_products_csv.py`, `test_product_bulk_import.py`): **PASS** — 24 passed in 3.63s.
   - i18n locale parity: **PASS** — all 8 locales OK vs en.json (2723 leaves).
   - Landing `curl` 200: **PASS** — HTTP 200.
   - `npm run test:landing-version`: **PASS** — version 2.1.140; login + sidebar OK.
   - Staff CSV unknown column `sku` (UI): **PASS** — preview-csv 400; banner lists `sku`.
   - Staff CSV canonical paste → preview → confirm: **PASS** — preview-csv 200; confirm 200 `created:1` product_ids `[4140]`; product present via `/api/products`.
   - Staff alias headers `producto,precio`: **PASS** — preview-csv 200; preview input name set without error.
   - AI mapping with `PRODUCT_VISION_API_KEY` set: **N/A** — key not configured in this env. Without key / `use_ai_mapping:true`: **PASS** — HTTP 503 `product_vision_not_configured` (matches pytest expectation).
   - Front build (`docker logs pos-front`): **PASS** — transient TS2551 at 07:08:15 (method missing mid-save) then `Application bundle generation complete` at 07:08:17 and 07:09:41; no later TS/NG failures; UI flows worked.
5. **Overall:** **PASS**
6. **Product owner feedback:** Staff can upload CSV/TSV through the same preview→confirm path as JSON, with clear errors for unknown columns and Spanish header aliases working without rename. Optional AI mapping correctly refuses when vision is not configured instead of writing silently. Ready for closer archive; enable `PRODUCT_VISION_API_KEY` later if you want live AI-header checks.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/login?tenant=1
   3. http://127.0.0.1:4202/dashboard
   4. http://127.0.0.1:4202/products
   5. http://127.0.0.1:4202/my-shift (landing-version sidebar)
   6. http://127.0.0.1:4202/staff/orders (landing-version sidebar)
8. **Relevant log excerpts:**
   - `pos-front`: `Application bundle generation complete. [1.954 seconds] - 2026-07-30T07:08:17.386Z` (after brief TS2551 at 07:08:15).
   - `pos-back`: `POST /products/bulk-import/preview-csv` 400 then 200; `POST /products/bulk-import/confirm` 200 OK during Puppeteer staff flow.
