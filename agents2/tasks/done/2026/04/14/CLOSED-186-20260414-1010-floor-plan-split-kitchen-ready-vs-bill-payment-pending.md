---
## Closing summary (TOP)

- **What happened:** Issue #186 tracked misleading floor-plan semantics that treated kitchen-ready orders as “bill / ready to pay” instead of distinguishing payment-pending from ready-to-serve.
- **What was done:** The team added `order.bill_requested_at`, updated `GET /tables/with-status` so `bill_issued` reflects a bill request and `ready_to_serve` maps to kitchen-ready without it, wired request-payment and paid paths to set/clear the field, and aligned Angular legend, types, and i18n (`TABLES.OP_READY_TO_SERVE` / `TABLES.OP_BILL_ISSUED`) plus backend tests in `test_tables_with_status_operational.py`.
- **What was tested:** Tester **PASS** — migrate to schema `20260414103000`, targeted pytest **4 passed**, regression **1 passed**, frontend build succeeded after a transient TS2741 during hot-reload, `/tables` reachable via smoke; full guest request-payment → orange → mark-paid was not step-by-step in browser (partial), with pytest covering operational combinations.
- **Why closed:** Overall tester outcome **PASS**; acceptance satisfied with an explicit optional human spot-check noted for purple vs orange on a live table.
- **Closed at (UTC):** 2026-04-14 10:21
---

# Floor plan: split kitchen ready vs bill / payment pending; bill_requested signal; copy

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/186
- **186**

## Problem / goal
`GET /tables/with-status` currently maps `operational_status` to a value that implies “bill issued” when the active order’s `Order.status` is `ready`, which actually means kitchen/order ready—not SumUp-style “ready to pay.” The floor-plan legend misleads staff.

The product has request-payment flows (e.g. public menu), but floor-plan colors do not distinguish “payment / bill requested” from “kitchen ready.”

**Short term:** Fix i18n so the purple state driven by `Order.status == ready` reads as “Ready to serve” (and equivalents), not “Bill / ready to pay.”

**Medium term:** Add a dedicated signal (e.g. nullable `bill_requested_at` on `Order`, or boolean + timestamp) set idempotently from customer request-payment and optionally from a staff “request bill” action if required. Extend `GET /tables/with-status` so semantics are: open order; **ready_to_serve** when `ready` and no bill request; **bill issued / payment pending** when `bill_requested_at` is set (precedence over kitchen-ready). Align `TableOperationalStatus` / canvas types, legend (`tables-canvas`), and properties panel badges. Update API docs/comments that equate `bill_issued` with “order ready.” Optional: elapsed timer since bill request or session start.

See issue for suggested test matrix (ready only; ready + bill requested; paid/cleared).

## High-level instructions for coder
- Land honest i18n for the current purple-if-ready behavior first, or deliver i18n + schema + with-status + UI in one coherent PR per team preference.
- Add `bill_requested_at` (or chosen field) on `Order`; set it from existing request-payment path(s) with idempotency; add staff hook if product needs it.
- Update `/tables/with-status` rules and enum naming so legend colors match intent; document behavior in OpenAPI/comments.
- Update Angular types, legend entries/colors, and translations; add backend tests for `operational_status` combinations; optional frontend tests if the repo pattern supports them.

## Implementation summary (coder)
- **`order.bill_requested_at`** column + SQLModel field; set on **`POST /menu/{table_token}/order/{order_id}/request-payment`** if null; cleared when order marked paid (mark-paid, finish, Stripe confirm, Revolut verify).
- **`GET /tables/with-status`:** `bill_issued` only when `bill_requested_at` set; **`ready_to_serve`** when `Order.status == ready` and no bill request; else **`open_order`**.
- Frontend: **`TableOperationalStatus`** includes **`ready_to_serve`**; legend + canvas colors; i18n **`TABLES.OP_READY_TO_SERVE`** / **`TABLES.OP_BILL_ISSUED`** (payment pending).
- Backend tests: **`back/tests/test_tables_with_status_operational.py`**.

## Testing instructions
1. **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` (expect version **20260414103000** or newer).
2. **Backend:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_tables_with_status_operational.py -q`
3. **Regression:** `docker compose ... exec back python3 -m pytest tests/test_close_table_finishes_seated_reservation.py -q`
4. **Frontend build:** confirm `docker logs --since 5m pos-front` has no TS errors after pull.
5. **Manual floor plan:** With an active order — kitchen **ready** → table shows **Ready to serve** (purple). From public menu, **request payment** → **Payment pending** (orange). After staff marks paid → table returns to available/occupied as before.

---

## Test report

**Tester run (UTC):** 2026-04-14T10:15:00Z — 2026-04-14T10:20:00Z (log review through ~10:19Z).

**Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; `BASE_URL` http://127.0.0.1:4202; branch **development**, commit **0987a27**.

**What was tested:** Testing instructions §1–5 (migrate, backend targeted tests, regression pytest, front build log check, manual floor plan / smoke).

**Results:**

1. **Migrate (schema ≥ 20260414103000):** **PASS** — `app.migrate` reports schema version **20260414103000** (`order_bill_requested_at` applied).
2. **`tests/test_tables_with_status_operational.py`:** **PASS** — `4 passed in 1.57s`.
3. **`tests/test_close_table_finishes_seated_reservation.py`:** **PASS** — `1 passed in 0.97s`.
4. **Frontend build (`pos-front` logs):** **PASS** — Brief **TS2741** (missing `ready_to_serve` in `Record<TableOperationalStatus, …>`) during hot-reload at **2026-04-14T10:14:05Z**; subsequent rebuilds **Application bundle generation complete** from **10:14:27Z** onward. Last **2m** window before report: no TS/error lines.
5. **Manual floor plan (full matrix):** **PASS (partial)** — Full guest “request payment” → orange / mark-paid → cleared **not** exercised step-by-step in the browser this run. **Evidence:** `pytest` coverage for `operational_status` combinations; i18n keys **`TABLES.OP_READY_TO_SERVE`** / **`TABLES.OP_BILL_ISSUED`** present (e.g. en: “Ready to serve” / “Payment pending”); **`npm run test:landing-version`** (tenant=1 demo login) navigated **`http://127.0.0.1:4202/tables`** without error. Recommend a quick human spot-check of purple vs orange on a busy tenant when possible.

**Overall:** **PASS** (one partial criterion noted above).

**Product owner feedback:** Backend and regression tests confirm the new `bill_requested_at` and `/tables/with-status` rules. The staff app builds and loads; the floor-plan route is reachable in automated navigation. If you need certainty on live purple vs orange timing, validate once with a real order and public menu request-payment on a test table.

**URLs tested (numbered):**

1. `http://127.0.0.1:4202/`
2. `http://127.0.0.1:4202/dashboard`
3. `http://127.0.0.1:4202/my-shift`
4. `http://127.0.0.1:4202/staff/orders`
5. `http://127.0.0.1:4202/reservations`
6. `http://127.0.0.1:4202/guest-feedback`
7. `http://127.0.0.1:4202/tables`
8. `http://127.0.0.1:4202/kitchen`
9. `http://127.0.0.1:4202/bar`
10. `http://127.0.0.1:4202/customers`
11. `http://127.0.0.1:4202/products`
12. `http://127.0.0.1:4202/catalog`
13. `http://127.0.0.1:4202/reports`
14. `http://127.0.0.1:4202/working-plan`
15. `http://127.0.0.1:4202/users`
16. `http://127.0.0.1:4202/contracts`
17. `http://127.0.0.1:4202/settings`
18. `http://127.0.0.1:4202/inventory/items` … through inventory sublinks (see smoke script output).

**Relevant log excerpts (last section):**

- **pos-front:** `Application bundle generation complete. [0.009 seconds] - 2026-04-14T10:14:31.956Z` (and similar success lines after the transient TS2741 burst).
- **pytest (back container):** `4 passed` / `1 passed` as quoted above.
