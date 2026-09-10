# Delivery marketplace integrations under Settings (admin)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/198
- **198**

## Problem / goal
Expose third-party delivery marketplace connectivity under **Settings → Integrations** (admin), not as a separate top-level staff navigation entry. Support multiple providers (e.g. Uber Eats, Glovo, Deliveroo): per-provider connection status, credential handling **server-side only**, test connection, optional store linkage, catalog/menu mapping between external items and POS products/modifiers, and operational visibility (webhook/API event log with import errors). Architecture should be **provider-agnostic UI** with **pluggable backend adapters** so new brands reuse the same patterns. Ingested orders must flow through the **existing POS order and kitchen pipeline** for MVP—no parallel silo.

## High-level instructions for coder
- Add or extend Settings (admin) with an **Integrations** area dedicated to delivery marketplaces; align layout and navigation with existing settings patterns.
- Implement secure storage and use of credentials on the **backend**; avoid exposing secrets to the browser beyond what is required for OAuth or similar documented flows.
- Provide per-provider surfaces for: connection state, credentials/setup, **test connection**, optional store linkage, mapping UI for external catalog ↔ POS catalog, and logs for inbound events and mapping/import failures.
- Design backend **adapter interfaces** per provider brand; shared routes/services where possible so new adapters plug in without duplicating the whole UI.
- Ensure routed-in orders normalize into the same **Order** model and kitchen/service flow already used elsewhere; verify multi-tenant scoping matches adjacent tenant APIs.
- Add testing appropriate to scope: targeted API tests and/or Puppeteer smoke if a stable entry path exists; document manual verification steps for integrations that need external sandbox credentials.

## Testing instructions

1. **Migrate:** From repo root with Docker dev stack up:  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate`
2. **Unit tests:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m pytest tests/test_delivery_credentials.py tests/test_delivery_adapters.py -q`
3. **UI (admin):** Open **Settings** → **Integrations**. Expand a provider (e.g. Uber Eats). Enter credentials JSON `{"api_key":"test"}` (stub requires non-empty `api_key`), save, run **Test connection** (expect success). Optionally set external store id. Add at least one **catalog mapping** (external item id → POS product), save mappings. Enable the integration and **copy webhook URL**.
4. **Webhook ingest:** `POST` JSON to the copied URL (same shape as stub):  
   `{"external_order_ref":"demo-1","customer_name":"Demo","lines":[{"external_item_id":"<your mapped sku>","quantity":1}]}`  
   Expect **200** and a new row in **Recent events**. Confirm **Orders** shows a new order with table label **Delivery** and kitchen pipeline items.
5. **Smoke:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → **200** (when stack is up).

## Test report

1. **Date/time (UTC) and log window**  
   - **Verification:** 2026-04-27T11:12Z–11:14Z (approx.).  
   - **Logs:** `docker logs pos-back` (tail ~40) for webhook failure window.

2. **Environment**  
   - **Compose:** `docker-compose.yml` + `docker-compose.dev.yml`.  
   - **`BASE_URL`:** `http://127.0.0.1:4202` (HAProxy).  
   - **Branch:** `development` (synced via `./scripts/git-sync-development.sh` before edits).

3. **What was tested (from “What to verify”)**  
   - (1) `python -m app.migrate`  
   - (2) `pytest tests/test_delivery_credentials.py tests/test_delivery_adapters.py`  
   - (3) Admin Integrations flow — exercised via **authenticated tenant API** (owner user `ralf@roeber.de`, JWT from container) equivalent to UI: upsert Uber Eats credentials `{"api_key":"test"}`, test connection, external store id, catalog mapping `demo-sku-7` → product `7`, enable integration, webhook URL from API response. **Interactive browser session not run** (`config.env` has no `DEMO_LOGIN_*`; UI route documented as `http://127.0.0.1:4202/settings?section=delivery-integrations`).  
   - (4) `POST` webhook ingest with mapped SKU (stub payload).  
   - (5) Landing smoke `curl` HTTP code.

4. **Results**

   | Criterion | Result | Evidence |
   |---|---|---|
   | 1. Migrate | **PASS** | Schema at **20260427120000**; “Database is up to date”. |
   | 2. Unit tests | **PASS** | `4 passed in 0.06s`. |
   | 3. UI / admin Integrations | **PARTIAL** | API: `PUT /tenant/delivery-integrations` (Uber Eats), `POST .../1/test` → `{"ok":true,...}`, `PUT .../1/mappings` → `{"ok":true,"count":1}`, enable integration — **PASS**. Full click-through in browser **not executed** (no scripted login env). |
   | 4. Webhook ingest | **PASS** | After handoff fix: load products with **`session.get(Product, id)`** + tenant check (avoids **`Row`** from **`exec(select(...)).first()`**). `POST` webhook → **200**, order created; **`pytest`** delivery tests **4 passed**. |
   | 5. Smoke `/` | **PASS** | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → **200**. |

5. **Overall:** **PASS** (implementation ready for tester)  
   - Webhook path fixed in **`delivery_order_service.create_order_from_delivery_payload`** (handoff pass **2026-04-27**). Re-run **Testing instructions** items 3–4 in UI/browser if desired; **`agent:untested`** labels issue for tester queue.

6. **Product owner feedback**  
   Migrations and unit tests pass; admin APIs for credentials, test connection, mappings, and enabling the integration behave as expected. Marketplace webhook ingest creates POS order lines once products resolve as **`Product`** instances (fixed).

7. **URLs tested**  
   1. `http://127.0.0.1:4202/` (smoke).  
   2. `http://127.0.0.1:4202/api/tenant/delivery-integrations` (PUT, GET-style via upsert response).  
   3. `http://127.0.0.1:4202/api/tenant/delivery-integrations/1/test` (POST).  
   4. `http://127.0.0.1:4202/api/tenant/delivery-integrations/1/mappings` (PUT).  
   5. `http://127.0.0.1:4202/api/public/webhooks/delivery/<ingest_token>` (POST — **200** after fix).  
   6. Documented Integrations UI: `http://127.0.0.1:4202/settings?section=delivery-integrations` (not loaded in browser this run).

8. **Relevant log excerpts (last section)**  
   - Prior **FAIL** run: `AttributeError: price_cents` on **`Row`** — resolved by **`session.get(Product, pid)`** in **`create_order_from_delivery_payload`**.

---

## Test report (tester agent — independent verification)

1. **Date/time (UTC) and log window**  
   - **Verification:** 2026-04-27T11:21Z–11:24Z (approx.).  
   - **Logs reviewed:** `docker logs pos-back` (grep `webhooks/delivery`, `delivery-integrations`); `docker logs pos-front` (tail — confirm bundle **complete** after earlier transient TS errors at 11:08Z).

2. **Environment**  
   - **Compose:** `docker-compose.yml` + `docker-compose.dev.yml`.  
   - **`BASE_URL`:** `http://127.0.0.1:4202` (HAProxy).  
   - **Branch / HEAD:** `development` @ `500846ee`.

3. **What was tested**  
   Per **Testing instructions**: migrate; pytest `tests/test_delivery_credentials.py` `tests/test_delivery_adapters.py`; admin **Settings → Integrationen → Lieferplattform-Integrationen** (browser); cookie-authenticated API flow (upsert Uber Eats credentials `{"api_key":"test"}`, test connection, mappings `demo-sku-7` → product **7**, enable integration); `POST` public webhook (stub payload); landing smoke; **Bestellungen** UI for **Delivery** label on created order.

4. **Results**

   | # | Criterion | Result | Evidence |
   |---|-----------|--------|----------|
   | 1 | Migrate | **PASS** | `Database is up to date (version 20260427120000)`. |
   | 2 | Unit tests | **PASS** | `4 passed in 0.07s`. |
   | 3 | Settings → Integrations (admin UI) | **PASS** | Chromium session: logged in as demo owner → `…/settings?section=delivery-integrations` shows **Lieferplattform-Integrationen**, Uber Eats expanded: masked credentials JSON, **Verbindung testen**, webhook URL, mapping row **demo-sku-7** → **Pozole (#7)**, **Letzte Ereignisse** includes `webhook_order`. |
   | 4 | Webhook ingest → order | **PASS** | `POST …/public/webhooks/delivery/<token>` → HTTP **200**; DB order **708** has `delivery_integration_id=1`, customer **Demo**; API events latest type **webhook_order**. |
   | 5 | Orders UI — table label **Delivery** | **PASS** | `/staff/orders`: card **#708** shows static text **Delivery**, line item **Pozole**. |
   | 6 | Smoke `/` | **PASS** | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → **200**. |

5. **Overall:** **PASS** — all Testing instructions satisfied in this run.

6. **Product owner feedback**  
   Delivery marketplace integrations behave end-to-end on the dev stack: configuration lives under Settings as intended, webhook ingest creates a normal staff-visible order labeled **Delivery**, and recent events surface in the integration panel. No blocker found for merging the feature from a QA perspective.

7. **URLs tested (numbered)**  
   1. `http://127.0.0.1:4202/login`  
   2. `http://127.0.0.1:4202/dashboard`  
   3. `http://127.0.0.1:4202/settings?section=delivery-integrations`  
   4. `http://127.0.0.1:4202/staff/orders`  
   5. `http://127.0.0.1:4202/` (smoke)  
   6. `http://127.0.0.1:4202/api/token?tenant_id=1` (login — cookie auth for API checks; no token printed)

8. **Relevant log excerpts**  
   - **pos-back:** `POST /tenant/delivery-integrations/1/test HTTP/1.1" 200 OK`; `POST /public/webhooks/delivery/… HTTP/1.1" 200 OK` (latest ingest for this session). Earlier **500** lines exist for older webhook attempts before fix — superseded by **200** on current verification.  
   - **pos-front:** `Application bundle generation complete` (e.g. 2026-04-27T11:09:07.550Z) — dev server healthy after rebuild.

**Rename:** `TESTING-` → **`CLOSED-`** (PASS).
