---
## Closing summary (TOP)

- **What happened:** Multi-warehouse inventory per tenant (#320) was implemented and verified end-to-end.
- **What was done:** Added tenant-scoped warehouses with migration/API/UI (create warehouses, adjust/receive by location, stock filter); docs and backend tests included.
- **What was tested:** Migration, 6 pytest cases, API warehouse/stock isolation, staff UI (Warehouses, Adjust, Stock Dashboard, PO Receive), landing smoke — overall **PASS**.
- **Why closed:** All acceptance criteria passed.
- **Closed at (UTC):** 2026-07-26 17:15
---

# Multi-warehouse inventory per tenant

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/320
- **320**

## Problem / goal

Inventory today is **single-location** (global SKU count). Staff need **multiple stock locations** per tenant (e.g. main kitchen, cold room, bar) so receive/adjust/moves and purchasing can be tied to a **warehouse**. From umbrella **#52** (“multiple almacenes”); see `docs/0050-github-issue-52-split-plan.md` Issue 1 and `docs/0032-github-issues-roadmap.md`. Non-goals for MVP: full WMS picking, barcode multi-bin.

## High-level instructions for coder

- Add a tenant-scoped **`Warehouse`** (or equivalent) model + migration; optional `warehouse_id` on at least one existing inventory flow (e.g. purchase-order receiving / stock move).
- UX: staff can define ≥1 named warehouse beyond an implicit default; choose warehouse on receive/adjust; stock dashboard filterable by location.
- Align with current Inventory nav / purchase-order / supplier patterns; keep tenant scoping and auth consistent with adjacent endpoints.
- Migrations + backend tests; `CHANGELOG.md` entry; append **Testing instructions**.
- Do not scope full multi-branch central-kitchen logistics in this slice.

## Implementation notes

- Migration `back/migrations/20260726132730_inventory_warehouse.sql`: `warehouse`, `warehouse_stock`; `warehouse_id` on `inventory_batch` / `inventory_transaction`; seeds default **Main** per tenant and backfills existing stock.
- API: `GET/POST /inventory/warehouses`, `PUT/DELETE /inventory/warehouses/{id}`; optional `warehouse_id` on adjust + PO receive; `GET /inventory/stock-levels?warehouse_id=`.
- Front: Inventory → Warehouses; warehouse picker on adjust + receive; stock dashboard location filter.
- Docs: `docs/0061-multi-warehouse-inventory.md`; roadmap/CHANGELOG updated.
- Tests: `back/tests/test_inventory_warehouses.py` (6 passed).

## Testing instructions

1. **Migration:** From repo root with stack up:  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.migrate`  
   Expect schema version includes `20260726132730`.

2. **Backend tests:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_inventory_warehouses.py -q`  
   Expect **6 passed**.

3. **API smoke (owner/admin with inventory):**  
   - `GET /inventory/warehouses` → at least one default **Main**.  
   - `POST /inventory/warehouses` with `{"name":"Cold room","code":"COLD"}` → 200.  
   - Adjust an item with `warehouse_id` for Cold room; `GET /inventory/stock-levels?warehouse_id=<cold_id>` shows the qty there and Main remains unchanged for that item (if it started empty).

4. **UI:** Log in as inventory-capable admin → Inventory → **Warehouses** → create a second warehouse → Items → Adjust Stock → choose warehouse → Stock Dashboard → filter by that warehouse. Open an approved PO → Receive → confirm warehouse selector.

5. **Front health:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` (or current HAProxy port). Confirm front logs show no TS/NG build errors after load.

## Test report

1. **Date/time (UTC):** 2026-07-26T17:11:56Z start → 2026-07-26T17:14:39Z end. Log window: ~17:11–17:15 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development`.
3. **What was tested:** Migration `20260726132730`, pytest `test_inventory_warehouses.py`, API warehouses/create/adjust/stock-levels isolation, staff UI (Warehouses create, Items adjust picker, Stock Dashboard warehouse filter, approved PO Receive warehouse selector), landing smoke + front compile logs.
4. **Results:**
   - Migration includes `20260726132730` (schema at `20260726190000`): **PASS** — migrate listed migration as applied.
   - Pytest 6 passed: **PASS** — `......` in 2.52s.
   - `GET /inventory/warehouses` default Main: **PASS** — `[{"id":145,"name":"Main","code":"MAIN","is_default":true,...}]` HTTP 200.
   - `POST /inventory/warehouses` Cold room: **PASS** — created id `206` (`Cold room 171229` / `COLD171229`) HTTP 200.
   - Adjust + stock-levels isolation: **PASS** — `POST /inventory/items/3/adjust` with `warehouse_id=206` → 200; Cold qty `2.0` for item 3; Main remained `-1.0`.
   - UI Warehouses create: **PASS** — listed Main + Cold; created `Bar UI 030465` via Add Warehouse.
   - UI Items Adjust warehouse picker: **PASS** — options `Main (Default)`, `Bar UI 030465`, `Cold room 171229`.
   - UI Stock Dashboard filter (`/inventory/stock`): **PASS** — select options `All warehouses`, `Main`, `Bar UI 030465`, `Cold room 171229`.
   - UI approved PO Receive warehouse selector: **PASS** — PO 11 approved via API; Receive Goods modal `select#receive_warehouse` with same three warehouses.
   - Landing smoke + front logs: **PASS** — `npm run test:landing-version` RESULT OK; `docker logs --since 10m pos-front` no TS/NG compile errors.
5. **Overall:** **PASS**
6. **Product owner feedback:** Multi-warehouse MVP is usable end-to-end: default Main, named warehouses, adjust and stock filter by location, and receive-into-warehouse on approved POs. Stock dashboard lives at `/inventory/stock` (sidebar “Stock Dashboard”), not `/inventory/stock-dashboard`. Demo tenant still has odd negative Main stock on some catalog-linked items — unrelated to this feature but worth a later cleanup.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/inventory/warehouses
   4. http://127.0.0.1:4202/inventory/items
   5. http://127.0.0.1:4202/inventory/stock
   6. http://127.0.0.1:4202/inventory/purchase-orders
   7. http://127.0.0.1:4202/inventory/purchase-orders/11
   8. http://127.0.0.1:4202/inventory/purchase-orders/11?receive=1
   9. http://127.0.0.1:4202/ (landing smoke)
8. **Relevant log excerpts (last section):**
```
INFO: ... "GET /inventory/warehouses HTTP/1.1" 200 OK
INFO: ... "POST /inventory/warehouses HTTP/1.1" 200 OK
INFO: ... "POST /inventory/items/3/adjust HTTP/1.1" 200 OK
INFO: ... "GET /inventory/stock-levels?warehouse_id=206 HTTP/1.1" 200 OK
INFO: ... "GET /inventory/stock-levels?warehouse_id=145 HTTP/1.1" 200 OK
```
Front: no TS/NG compile errors in the test window.
