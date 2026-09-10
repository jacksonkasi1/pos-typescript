---
## Closing summary (TOP)

- **What happened:** Staff needed tenant-scoped bulk product import from JSON (and optional menu-photo vision) with a read-only preview and explicit confirm before any rows are saved.
- **What was done:** Added `product_bulk_import` backend (preview, confirm, vision preview/status), `/products/bulk-import/*` routes, `ProductBulkImportComponent` on Products, i18n and `config.env.example` keys; fixed live `preview-json` 500 via Starlette `Response` on rate-limited handlers (same fix as #243).
- **What was tested:** `test_product_bulk_import.py` (5 passed), landing smoke, Puppeteer JSON preview/create/update/confirm, vision-status without API key, and `product:write` authorization — all PASS on verification run 2 in Docker on `development`.
- **Why closed:** Tester verification run 2 overall **PASS**; JSON preview and confirm paths work in the running stack after the SlowAPI fix.
- **Closed at (UTC):** 2026-05-28 11:42
---

# Products: bulk import from JSON with preview

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/242
- **242**

## Problem / goal

Staff need to add or update many menu products at once. Support an optional upload flow where a vision API (configured via environment API key, not hard-coded) can extract dish names and prices into JSON, then reuse the same bulk-import preview UI so the user can edit and confirm before anything is saved. Show a clear privacy notice; never publish or persist products without an explicit review/confirm step.

## High-level instructions for coder

- Read issue #242 in full; treat issue text as product intent only (no secrets in commits or task files).
- Add or extend **Products** staff UI (`front/src/app/products/`) for JSON bulk import: file upload and/or paste JSON, with a preview grid/table of parsed rows (name, price, category/tags if applicable).
- Wire a backend endpoint (tenant-scoped, authorized like other product mutations) that accepts validated JSON and returns a preview payload; separate confirm endpoint or flag so preview is read-only until the user confirms.
- Optional vision path: accept image upload, call external vision API using key from `config.env` / deployment secrets; map response to the same preview DTO as manual JSON import so one preview component serves both flows.
- Reuse existing patterns for provider/catalog import where sensible; align field names with `Product` / API create models in `back/app/`.
- i18n: add keys to all locales under `front/public/i18n/` per project rules; include privacy notice and “review before save” copy.
- Document new env vars in `config.env.example` (key name only, no sample secrets).
- Smoke: `curl` landing 200; after UI work check `docker logs --since 10m pos-front` for clean build; add or run a focused Puppeteer/manual path on `/products` if practical.

## Implementation summary

- **Backend:** `back/app/product_bulk_import.py` (parse, preview, confirm, optional vision extraction); routes under `/products/bulk-import/*` in `product_bulk_import_routes.py` (`preview`, `preview-json`, `vision/preview`, `confirm`, `vision-status`). Requires `PRODUCT_WRITE` for mutations; preview is read-only until confirm.
- **Env:** `PRODUCT_VISION_API_KEY`, `PRODUCT_VISION_API_URL`, `PRODUCT_VISION_MODEL` documented in `config.env.example`. Menu photos sent to vision API are not stored.
- **Frontend:** `ProductBulkImportComponent` modal from Products page (“Bulk import” button); JSON file/paste and optional menu-photo tab with privacy notice; editable preview table; confirm saves valid rows only.
- **Tests:** `back/tests/test_product_bulk_import.py` (5 passed in Docker).

## Testing instructions

1. **Backend unit/API tests**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_product_bulk_import.py -q
   ```
   Expect 5 passed.

2. **Smoke**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/
   ```
   Expect `200`. Check front build: `docker logs --since 10m pos-front 2>&1 | grep -iE "error|failed"` — no TS/NG errors after rebuild.

3. **JSON bulk import (manual)**
   - Log in as owner/staff with `product:write` on tenant 1.
   - Open `/products` → **Bulk import**.
   - Paste:
     ```json
     {"items":[{"name":"Test Bulk Soup","price":5.50,"category":"Starters"},{"name":"Test Bulk Pasta","price":12.00,"category":"Main Course"}]}
     ```
   - Click **Preview import** → verify two rows, action **Create**.
   - Edit a price if desired → **Save N products** → success banner; products appear in list.
   - Re-import same names with different prices → preview shows **Update**; confirm updates existing rows.

4. **Vision path (optional)**
   - Set `PRODUCT_VISION_API_KEY` in `config.env`, restart `back`.
   - On Products → Bulk import, **Menu photo (AI)** tab should be enabled.
   - Upload a clear menu photo → **Extract & preview** → privacy notice visible; preview rows appear; confirm does not run until user clicks save.
   - Without API key, vision tab disabled and `GET /api/products/bulk-import/vision-status` returns `{"configured":false}`.

5. **Authorization**
   - User without `product:write` should not see Bulk import button; API returns 403 if called directly.

---

## Test report

1. **Date/time (UTC):** 2026-05-28 10:12–10:20 UTC. Log window: `docker logs --since 15m pos-front` and `pos-back` for the same period.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, branch `development`, `BASE_URL=http://127.0.0.1:4202`, tenant 1 owner login (`ralf@roeber.de`).

3. **What was tested:** Backend pytest; landing smoke; front build; JSON bulk-import UI flow (Puppeteer); vision-status without API key; authorization for `product:write` on preview endpoint.

4. **Results:**
   - **Backend pytest (`test_product_bulk_import.py`):** **PASS** — `5 passed in 1.82s`.
   - **Landing smoke (`curl /`):** **PASS** — HTTP `200`.
   - **Front build (latest):** **PASS** — `Application bundle generation complete` at 10:12 UTC; earlier 10:10–10:11 UTC log showed transient TS errors during hot reload, resolved before test window ended.
   - **JSON bulk import (manual / Puppeteer):** **FAIL** — Owner opens **Bulk import**, uploads valid JSON, **Preview import** → `POST /api/products/bulk-import/preview-json` returns **500**; modal shows generic error. No preview rows; create/update/confirm flow not reachable.
   - **Vision path (no API key):** **PASS** (partial) — `GET /api/products/bulk-import/vision-status` → `{"configured":false}` (200, authenticated). Menu photo tab shows not-configured hint; privacy notice on vision tab not exercised (tab not required when unconfigured).
   - **Authorization:** **PASS** (API) — Tenant 1 waiter `ralf.roeber@amvara.de` token → `POST /products/bulk-import/preview-json` → **403 Forbidden** (logged before owner call). UI “no Bulk import button” for waiter not re-checked in browser (login password unknown); API gate behaves correctly.

5. **Overall:** **FAIL** — JSON preview/confirm path broken in running stack (`preview-json` 500). Criteria 3 and end-to-end save/update not met.

6. **Product owner feedback:** Bulk import UI and permissions wiring look in place, and unit tests pass, but the live preview endpoint fails for owners so staff cannot review or save imports. Fix the rate-limited async routes so they return a proper Starlette `Response` (or adjust `@admin_user_limit()` usage) before this is ready for menu updates.

7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/login
   3. http://127.0.0.1:4202/products
   4. http://127.0.0.1:4202/api/products/bulk-import/vision-status
   5. http://127.0.0.1:4202/api/products/bulk-import/preview-json

8. **Relevant log excerpts (last section)**

`pos-back` (preview-json 500):

```
INFO: ... "POST /products/bulk-import/preview-json HTTP/1.1" 500 Internal Server Error
...
Exception: parameter `response` must be an instance of starlette.responses.Response
```

(`slowapi` / `@admin_user_limit()` on async `bulk_import_preview_raw_json` after successful auth.)

`pos-front` (build OK at end of window):

```
Application bundle generation complete. [0.012 seconds] - 2026-05-28T10:12:31.015Z
```

Puppeteer evidence: `preview-json` status **500**, body `Internal Server Error`; modal error text shown to user.

---

## Test report (verification run 2)

1. **Date/time (UTC):** 2026-05-28 11:40–11:43 UTC. Log window: `docker logs --since 20m pos-back` and `pos-front` for the same period.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, branch `development` @ `54961675`, `BASE_URL=http://127.0.0.1:4202`, tenant 1 owner (`ralf@roeber.de` via `.env` `DEMO_LOGIN_*`).

3. **What was tested:** Backend pytest; landing smoke; JSON bulk-import UI (Puppeteer `tmp/test-bulk-import-243.mjs`); create/update/confirm via TestClient + live stack; vision-status without API key; authorization (API 403 + waiter UI).

4. **Results:**
   - **Backend pytest (`test_product_bulk_import.py`):** **PASS** — `5 passed in 2.11s`.
   - **Landing smoke (`curl /`):** **PASS** — HTTP `200`.
   - **Front build:** **PASS** — no TS/NG errors in `pos-front` logs in the 20m window; landing reachable.
   - **JSON bulk import (Puppeteer):** **PASS** — Owner **Bulk import** → paste JSON → **Preview import** → `POST /api/products/bulk-import/preview-json` **200** with `items` + `summary`; 1 preview row, no error banner.
   - **JSON create/update/confirm (API):** **PASS** — Preview two items (`create`×2) → confirm `created: 2`; re-preview same names with new prices → `update`×2 → confirm `updated: 2` (product ids 647, 648).
   - **Vision path (no API key):** **PASS** (partial) — `GET /api/products/bulk-import/vision-status` → `{"configured":false}` (200). Vision tab not exercised (expected when unconfigured).
   - **Authorization:** **PASS** — Waiter `ralf.roeber@amvara.de` → `POST /products/bulk-import/preview-json` **403**; Products page has no **Bulk import** button (Puppeteer + JWT cookie).

5. **Overall:** **PASS** — Prior SlowAPI/`response: Response` fix verified in running stack; JSON preview, confirm, and update paths work.

6. **Product owner feedback:** Staff with `product:write` can paste JSON, review rows in the modal, and save creates/updates. Vision remains optional behind env configuration. Ready for closer/archive; production deploy not in scope for this run.

7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/login?tenant=1
   3. http://127.0.0.1:4202/dashboard
   4. http://127.0.0.1:4202/products
   5. http://127.0.0.1:4202/api/products/bulk-import/preview-json
   6. http://127.0.0.1:4202/api/products/bulk-import/vision-status

8. **Relevant log excerpts (last section)**

`pos-back` (preview-json 200 during run):

```
INFO: ... "POST /products/bulk-import/preview-json HTTP/1.1" 200 OK
INFO: ... "GET /products/bulk-import/vision-status HTTP/1.1" 200 OK
```

Puppeteer: API `preview-json` status **200**, body includes `"summary"` and `"items"`; UI `previewRows: 1`, `errorBanner: ''`.

## Handoff log

- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — handoff agent, Cursor):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. Bulk-import code present (`product_bulk_import.py`, routes, FE modal, **`test_product_bulk_import.py`** **5 passed** in **`pos-back`** including **`test_preview_json_api`**). **Testing instructions** present; embedded **Test report** overall **FAIL** — live **`POST /products/bulk-import/preview-json`** **500** (`slowapi` / `@admin_user_limit()` per prior tester notes); end-to-end JSON preview/confirm not verified in stack. **`gh issue view 242`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, implementation **not** complete until preview path works in running app (or rate-limit decorator fixed). **No** **`WIP-242-…` → `UNTESTED-*`**; **no** `gh issue edit 242 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — re-verify):** Re-synced **`development`** (OK). **`pytest tests/test_product_bulk_import.py`** **5 passed**; **`pos-back`** logs (last 30m) still show **`POST /products/bulk-import/preview-json`** **500** — `parameter response must be an instance of starlette.responses.Response` (SlowAPI **`@admin_user_limit()`**). **No** rename; **no** `gh issue edit 242 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — Cursor):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. Bulk-import code + **`test_product_bulk_import.py`** present; **`pytest`** **5 passed**; live **`POST /products/bulk-import/preview-json`** still **500** (`@admin_user_limit()` / SlowAPI Response). **Testing instructions** present; embedded **Test report** overall **FAIL**. **`gh issue view 242`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, **wip → untested** not warranted. **No** rename; **no** `gh issue edit 242 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. **`pytest tests/test_product_bulk_import.py`** **5 passed**; **`pos-back`** logs (60m) still **`POST /products/bulk-import/preview-json`** **500** — `parameter response must be an instance of starlette.responses.Response` (**`@admin_user_limit()`** on sync routes). **Testing instructions** present; embedded **Test report** overall **FAIL**. **`gh issue view 242`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, implementation **not** complete (live JSON preview broken). **No** **`WIP-242-…` → `UNTESTED-*`**; **no** `gh issue edit 242 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — handoff agent):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. Bulk-import code present (`product_bulk_import.py`, routes, FE modal); **`pytest tests/test_product_bulk_import.py`** **5 passed**; **`pos-back`** logs (60m) still **`POST /products/bulk-import/preview-json`** **500** — `parameter response must be an instance of starlette.responses.Response` (**`@admin_user_limit()`** on sync routes). **Testing instructions** present; embedded **Test report** overall **FAIL**. **`gh issue view 242`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, **wip → untested** not warranted. **No** rename; **no** `gh issue edit 242 --add-label "agent:untested"`.
- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — Cursor handoff):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. **`pytest tests/test_product_bulk_import.py`** **5 passed**; **`product_bulk_import_routes.py`** still uses **`@admin_user_limit()`** on sync **`preview-json`**; **`pos-back`** logs (60m) show repeated **`POST /products/bulk-import/preview-json`** **500** (`parameter response must be an instance of starlette.responses.Response`). **Testing instructions** present; embedded **Test report** overall **FAIL**. **`gh issue view 242`**: **OPEN**, **`agent:wip`**, **`agent:planned`**. Per **TASKS-README.md**, implementation **not** complete (live JSON preview broken). **No** **`WIP-242-…` → `UNTESTED-*`**; **no** `gh issue edit 242 --add-label "agent:untested"`.

- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — Cursor):** `./scripts/git-sync-development.sh` (OK). **`origin/development`** @ **`5496167519e283b8c199f6b478e4467ad1362a3d`**. **`product_bulk_import_routes.py`**: all four **`@admin_user_limit()`** handlers include **`response: Response`** (same fix as **#243**). **`pytest tests/test_product_bulk_import.py`** **5 passed**; **`pos-back`** logs (30m) include **`POST /products/bulk-import/preview-json`** **200 OK**. **Testing instructions** present. Per **TASKS-README.md**, implementation **complete**. **`WIP-242-…` → `UNTESTED-242-20260528-1007-products-bulk-import-from-json-with-preview.md`**; **`gh issue edit 242 --add-label "agent:untested" --remove-label "agent:wip"`**.
