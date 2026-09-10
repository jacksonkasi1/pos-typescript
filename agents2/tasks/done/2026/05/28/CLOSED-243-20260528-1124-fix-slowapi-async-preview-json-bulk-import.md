---
## Closing summary (TOP)

- **What happened:** `POST /api/products/bulk-import/preview-json` returned 500 under `@admin_user_limit()` because slowapi could not inject rate-limit headers without a Starlette `Response` on async handlers.
- **What was done:** Added `response: Response` to all four rate-limited bulk-import route handlers in `product_bulk_import_routes.py` (`/preview`, `/preview-json`, `/vision/preview`, `/confirm`).
- **What was tested:** Pytest `test_product_bulk_import.py` (5 passed), live preview-json with rate-limit headers, Products bulk-import JSON tab UI, and regression on preview/confirm — all PASS in Docker on `development`.
- **Why closed:** All acceptance criteria met; preview-json returns 200 and unblocks #242 browser flow.
- **Closed at (UTC):** 2026-05-28 11:32
---

# Fix slowapi on async preview-json bulk import (500 Response type)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/243
- **243**
- **Blocks:** https://github.com/satisfecho/pos/issues/242 (bulk import preview unusable in browser until this is fixed)

## Problem / goal

`POST /api/products/bulk-import/preview-json` returns **500** in Docker when called from the Products bulk-import UI. Backend log: `parameter 'response' must be an instance of starlette.responses.Response` — `@admin_user_limit()` (slowapi) on an **async** preview route in `product_bulk_import_routes.py`. Pytest `test_product_bulk_import.py` can pass while the rate-limited async integration path still fails.

**Done when:** Preview returns **200** for `{"items":[{"name":"Test","price":5.5}]}` in Docker; manual Products import modal JSON preview works; tester can re-verify **#242** flow.

## High-level instructions for coder

- Inspect `back/app/product_bulk_import_routes.py` — `@admin_user_limit()` on async `preview-json` (and any sibling routes with the same pattern).
- Align with working limited routes elsewhere (e.g. `pricing_routes.py`, `inventory_routes.py`, sync handlers or explicit `JSONResponse` returns noted in `main.py` comments for slowapi).
- Pick one consistent fix: remove limiter from read-only preview if acceptable; make the handler **sync** like other limited routes; or return a proper `JSONResponse` / fix slowapi+async compatibility.
- Re-test in Docker: authenticated `POST /products/bulk-import/preview-json` and the Products bulk-import modal JSON tab.
- Run `docker compose … exec back python3 -m pytest tests/test_product_bulk_import.py -q`.
- Coordinate with **`WIP-242-*`** — this is the runtime blocker for preview in the browser; do not duplicate unrelated bulk-import feature work.

## Implementation notes

- Root cause: `@admin_user_limit()` with `headers_enabled=True` requires a Starlette `Response` instance for header injection. Bulk-import routes returned Pydantic models without a `response: Response` parameter (unlike `inventory_routes.py` / `pricing_routes.py`).
- Fix: Added `response: Response` to all four `@admin_user_limit()` handlers in `back/app/product_bulk_import_routes.py` (`/preview`, `/preview-json`, `/vision/preview`, `/confirm`).

## Testing instructions

1. **Backend pytest**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_product_bulk_import.py -q
   ```
   Expect: 5 passed.

2. **Live API (rate limit path)**
   - Log in as a user with `product:write` (e.g. tenant owner).
   - `POST /api/products/bulk-import/preview-json` with body `{"items":[{"name":"Test","price":5.5}]}`.
   - Expect **200** and preview JSON (not 500). Optional: response includes `X-RateLimit-*` headers.

3. **UI (#242 unblock)**
   - Products → bulk import → JSON tab → paste `{"items":[{"name":"Test","price":5.5}]}` → Preview.
   - Expect preview table with one valid row; no server error toast.

4. **Regression**
   - Confirm `/preview`, `/vision/preview` (if vision configured), and `/confirm` still work after import preview.


## Handoff log

- **Handoff (`012-feature-coder-handoff.md`, 2026-05-28, user `012` pass — Cursor):** **`UNTESTED-243-…`** already on disk with **Testing instructions** and **Implementation notes** (`response: Response` on limited bulk-import routes). **`pytest tests/test_product_bulk_import.py`** **5 passed**; live **`preview-json`** **200** in **`pos-back`** logs. **`gh issue edit 243 --add-label "agent:untested" --remove-label "agent:wip"`** (labels were still **`agent:wip`**).

---

## Test report

1. **Date/time (UTC):** 2026-05-28 11:29–11:31 UTC. Log window: `docker logs --since 20m pos-back` and `pos-front` for the same period.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, branch `development` @ `54961675`, `BASE_URL=http://127.0.0.1:4202`, tenant 1 owner context (JWT minted in `pos-back` for API; browser session via cookie auth on `/products`).

3. **What was tested:** Full **Testing instructions** — pytest suite; live `POST /products/bulk-import/preview-json` with rate-limit headers; Products bulk-import JSON tab UI (Puppeteer); regression via pytest confirm/preview cases; landing smoke.

4. **Results:**
   - **Backend pytest (`test_product_bulk_import.py`):** **PASS** — `5 passed in 1.91s`.
   - **Live API `preview-json` (rate-limited path):** **PASS** — HTTP **200**, body includes `items` + `summary`; `X-RateLimit-Limit` **2000** (direct back) / **500** (via HAProxy UI path), `X-RateLimit-Remaining` decremented. No 500 / SlowAPI Response error.
   - **UI JSON preview (#242 unblock):** **PASS** — `/products` → Bulk import → paste `{"items":[{"name":"Test","price":5.5}]}` → Preview → **1** preview table row, no error banner; network `POST …/preview-json` **200**.
   - **Regression (`/preview`, `/confirm`; vision N/A):** **PASS** — `test_confirm_api_creates_products` and `test_build_preview_create_and_update` passed; `vision-status` **200** `{"configured":false}` (vision path not configured, as expected).
   - **Landing smoke:** **PASS** — `curl /` → **200**.

5. **Overall:** **PASS** — SlowAPI + `response: Response` fix verified in Docker; preview-json no longer returns 500; UI preview works.

6. **Product owner feedback:** The bulk-import JSON preview is usable again: owners can paste JSON, see a review table, and proceed without a server error. Issue **#242** end-to-end save/update can be re-tested now that the rate-limited preview path is fixed.

7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/login?tenant=1
   3. http://127.0.0.1:4202/products
   4. http://127.0.0.1:4202/api/products/bulk-import/vision-status
   5. http://127.0.0.1:4202/api/products/bulk-import/preview-json

8. **Relevant log excerpts (last section)**

`pos-back` (preview-json now 200; earlier 500 in window from pre-fix / unauthenticated calls):

```
INFO: ... "POST /products/bulk-import/preview-json HTTP/1.1" 200 OK
INFO: ... "POST /products/bulk-import/preview-json HTTP/1.1" 200 OK
```

`pos-front`: no TS/NG build errors in the 20m window (grep empty).

Puppeteer: `OVERALL: PASS` — API and UI preview-json **200**, `previewRows: 1`.

