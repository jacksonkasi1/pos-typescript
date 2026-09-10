---
## Closing summary (TOP)

- **What happened:** Marketing sites needed a read-only public menu API; POS had no `GET /api/public/tenants/{tenant_id}/menu` endpoint.
- **What was done:** Added `back/app/public_tenant_menu.py`, wired `GET /public/tenants/{tenant_id}/menu` in `main.py` with i18n, rate limiting, and grouped categories; 11 pytest cases in `test_public_tenant_menu.py`.
- **What was tested:** All local/dev criteria passed (pytest 11/11, curl shape/404/lang, OpenAPI Public tag, table-menu regression, landing 200); production Gustazo (tenant 16) deferred until amvara9 deploy (404 — endpoint not on prod yet).
- **Why closed:** Tester overall **PASS**; acceptance met on development; prod smoke is a deploy-blocker follow-up, not a code failure.
- **Closed at (UTC):** 2026-05-28 22:18
---

# Add public tenant menu API for marketing websites

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/250
- **250**

## Problem / goal

Marketing sites (e.g. Gustazo, tenant_id=16) currently hardcode menus in TypeScript. POS already stores products (name, price, description, category, image) but has no public tenant-scoped menu endpoint. Staff-only `GET /api/products` and table-token `GET /api/menu/{table_token}` are not suitable for external marketing websites. `GET /api/public/tenants/{tenant_id}` exists but returns no menu; `GET /api/public/tenants/{tenant_id}/menu` returns 404 today.

Add a read-only public endpoint so marketing sites can fetch a grouped menu without auth. First consumer: Gustazo (tenant_id=16).

## High-level instructions for coder

- Read issue #250 for product intent only; do not copy secrets or untrusted payloads into code or commits.
- **Backend:** Implement `GET /api/public/tenants/{tenant_id}/menu` (no auth). Optional query `lang` and `Accept-Language` — same i18n behaviour as `GET /menu/{table_token}` in `back/app/main.py` (~line 9735). Reuse product resolution / visibility logic from the table menu where possible (active products, availability window, customer-visible only).
- **Response shape:** Top-level `tenant_id`, `tenant_name`, `currency`, `lang`, and `categories[]` each with `id`, `name`, and `products[]`. Each product: at minimum `id`, `name`, `price_cents`, `price_formatted`, `description`, `category`, `subcategory`, `image_url`, `available`. Do **not** expose cost, supplier, stock, recipes, or other internal fields.
- **Errors / edge cases:** 404 if tenant missing; 200 with `categories: []` if tenant exists but has no visible products. Rate-limit like the public table menu (~30/min per IP).
- **OpenAPI:** Document the new route; add API tests (e.g. under `back/tests/`) covering happy path, missing tenant, empty menu, lang parameter, and that sensitive fields are absent.
- **References:** Existing `GET /public/tenants/{tenant_id}` (~line 934), `GET /menu/{table_token}`, OpenAPI at `/api/openapi.json`. Gustazo uses `posTenantId: 16`.
- **Acceptance:** `curl` against dev/prod without auth returns correct Gustazo names/prices; lang works (es/en/ca minimum); Swagger updated; tests pass. Smoke: landing 200; no regressions on table menu.

## Implementation summary

- **`back/app/public_tenant_menu.py`** — product loading (TenantProduct + legacy Product, same visibility filters as table menu), price formatting, category grouping, image URL resolution.
- **`back/app/main.py`** — `GET /public/tenants/{tenant_id}/menu` with `@public_menu_ip_limit()`, `lang` via `_get_requested_language`, OpenAPI tag **Public**.
- **`back/tests/test_public_tenant_menu.py`** — 11 tests (happy path, 404, empty menu, lang es/ca, inactive catalog item, availability window, image URL, no sensitive fields).

## Testing instructions

1. **Backend unit tests** (from repo root, back container running):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_public_tenant_menu.py -q
   ```
   Expect **11 passed**.

2. **Local dev curl** (no auth):
   ```bash
   curl -s "http://127.0.0.1:4202/api/public/tenants/1/menu?lang=en" | jq .
   curl -s "http://127.0.0.1:4202/api/public/tenants/999999/menu"   # expect 404
   curl -s "http://127.0.0.1:4202/api/public/tenants/1/menu?lang=es" # price_formatted uses comma
   ```

3. **Gustazo (tenant 16)** on production when deployed:
   ```bash
   curl -s "https://www.satisfecho.de/api/public/tenants/16/menu?lang=es" | jq .
   ```
   Verify product names/prices match staff menu; no `cost_cents`, `ingredients`, or supplier fields.

4. **OpenAPI:** Confirm route appears at `/api/docs` under **Public** — `GET /public/tenants/{tenant_id}/menu`.

5. **Regression — table menu:** Existing table menu still works (e.g. demo table token from tenant 1):
   ```bash
   # obtain a table token from DB or /api/public/tenants/1, then:
   curl -s "http://127.0.0.1:4202/api/menu/{table_token}?lang=en" | jq '.products | length'
   ```

6. **Landing smoke:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → **200** (version footer test may fail if package.json version ≠ baked COMMIT_HASH; unrelated to this change).

---

## Test report

1. **Date/time (UTC):** 2026-05-28 22:17:45 – 22:18:03 UTC (log window ~22:17–22:18 UTC).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `26818758`.

3. **What was tested:** All six Testing instructions — pytest suite, local curl (tenant 1 / 404 / lang es), OpenAPI route, table-menu regression, landing smoke; production Gustazo curl (deploy-blocker check).

4. **Results:**

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 1. Backend unit tests (11 passed) | **PASS** | `pytest tests/test_public_tenant_menu.py -q` → `11 passed in 0.82s` |
| 2a. Local menu tenant 1 (shape, no auth) | **PASS** | HTTP 200; `tenant_id`, `tenant_name`, `currency`, `lang`, `categories` present; empty categories OK for tenant 1 |
| 2b. Missing tenant 404 | **PASS** | `GET /api/public/tenants/999999/menu` → HTTP 404 |
| 2c. Lang es / price_formatted comma | **PASS** (pytest) | Local tenant 1 has no visible products; `test_lang_query_es_formats_price_with_comma` asserts `3,50`; curl es returns `lang: es` |
| 3. Gustazo tenant 16 on production | **N/A — deploy blocker** | `https://www.satisfecho.de/api/public/tenants/16/menu?lang=es` → HTTP 404 `{"detail":"Not Found"}` (endpoint not on amvara9 yet; feature on `development` only). Re-verify after `master` deploy per agent-loop deploy-blocker policy. |
| 4. OpenAPI / Public tag | **PASS** | `/api/openapi.json` path `/public/tenants/{tenant_id}/menu` GET, tags `["Public"]` |
| 5. Table menu regression | **PASS** | `GET /api/menu/0a57107e-0927-45bc-bf70-cfc06669caa0?lang=en` → HTTP 200, valid menu payload |
| 6. Landing smoke | **PASS** | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → `200` |

5. **Overall:** **PASS** (local/dev verification complete; production Gustazo deferred until amvara9 deploy — not a code failure).

6. **Product owner feedback:** The public menu endpoint is implemented correctly on local Docker: grouped categories, i18n lang support, no sensitive fields in tests, and existing table menu unchanged. Marketing sites can integrate against this API once the change is promoted to production; Gustazo (tenant 16) should be smoke-tested on satisfecho.de after the next deploy.

7. **URLs tested:**
   1. `http://127.0.0.1:4202/api/public/tenants/1/menu?lang=en`
   2. `http://127.0.0.1:4202/api/public/tenants/999999/menu`
   3. `http://127.0.0.1:4202/api/public/tenants/1/menu?lang=es`
   4. `http://127.0.0.1:4202/api/openapi.json`
   5. `http://127.0.0.1:4202/api/menu/0a57107e-0927-45bc-bf70-cfc06669caa0?lang=en`
   6. `http://127.0.0.1:4202/`
   7. `https://www.satisfecho.de/api/public/tenants/16/menu?lang=es` (404 — not deployed)

8. **Relevant log excerpts (pos-back, UTC window):**

```
INFO:     172.30.0.6:44050 - "GET /public/tenants/1/menu?lang=en HTTP/1.1" 200 OK
INFO:     172.30.0.6:44060 - "GET /public/tenants/999999/menu HTTP/1.1" 404 Not Found
INFO:     172.30.0.6:44070 - "GET /public/tenants/1/menu?lang=es HTTP/1.1" 200 OK
INFO:     172.30.0.6:48704 - "GET /menu/0a57107e-0927-45bc-bf70-cfc06669caa0?lang=en HTTP/1.1" 200 OK
```
