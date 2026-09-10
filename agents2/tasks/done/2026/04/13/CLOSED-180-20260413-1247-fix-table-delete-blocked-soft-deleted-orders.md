---
## Closing summary (TOP)

- **What happened:** Deleting a table failed when orders were only soft-deleted, because `has_orders` still counted rows with `deleted_at` set.
- **What was done:** A migration made `order.table_id` nullable and cleared it for existing soft-deleted orders; soft-delete now unlinks the table, and table delete / `table_has_orders` logic counts only active orders (`deleted_at IS NULL`).
- **What was tested:** Migration to **20260413150000** and `pytest tests/test_delete_table_api.py` — **3 passed**; optional staff UI flow was not re-run.
- **Why closed:** Tester marked overall **PASS**; automated criteria satisfied.
- **Closed at (UTC):** 2026-04-13 12:56
---

# Fix table delete blocked by soft-deleted orders

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/180
- **180**

## Problem / goal
Deleting a table uses `DELETE /tables/{id}`. The backend sets or checks `has_orders` using orders linked by `table_id`. Soft-deleted orders (`DELETE /orders/{id}` sets `deleted_at`) still reference the table, so the guard still counts them and users cannot delete the table after “removing” orders in the UI. Align behavior so soft-deleted orders do not block table deletion, consistently with product expectations for `table_has_orders` and any reassign flow.

## High-level instructions for coder
- In the table-delete path, ensure the “has orders” check only counts **active** orders (e.g. `Order.deleted_at.is_(None)`), **or** clear `order.table_id` when soft-deleting an order—choose one coherent approach across the API.
- Add or extend a test that covers: table with only soft-deleted orders referencing it → table delete should succeed (or document the chosen rule).
- Revisit `table_has_orders` / reassignment flows so they stay consistent with the same definition of “active” vs soft-deleted orders.
- See backend models/routes for `delete_table` and order soft-delete; add pointers to `docs/` if any existing doc describes table/order lifecycle.

## Implementation summary
- **Migration** `back/migrations/20260413150000_order_table_id_nullable_soft_delete_unlink.sql`: `order.table_id` is nullable; existing rows with `deleted_at` set get `table_id = NULL`.
- **`Order.table_id`** is optional in **`back/app/models.py`**; **`DELETE /orders/{id}`** sets **`order.table_id = None`** when soft-deleting.
- **`DELETE /tables/{id}`**: `has_orders` and reassign-only queries filter **`deleted_at IS NULL`**. Reassign moves only active orders.
- **Open-order detection** (tables list, join-tables guard, public menu fallback): queries include **`deleted_at IS NULL`** where they detect active orders by status.
- **Reports / tips:** safe **`session.get(Table, …)`** when **`table_id`** is null.

## Testing instructions
1. **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` (expect version **20260413150000** applied).
2. **Automated:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back sh -c 'cd /app && python3 -m pytest tests/test_delete_table_api.py -q'` (includes **`test_delete_table_succeeds_when_only_soft_deleted_orders_linked`**).
3. **Manual (optional):** Staff UI — create or use a table with an order, soft-delete the order, delete the table — should succeed without **`table_has_orders`** error.

---

## Test report

1. **Date/time (UTC) and log window:** 2026-04-13 12:52–12:54 UTC (migration + pytest run; back container logs had no additional request noise during pytest).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch **development** @ **872d102**; commands run via `docker compose … exec back`.

3. **What was tested:** Per **Testing instructions**: migrate to **20260413150000**; `pytest tests/test_delete_table_api.py` (including soft-deleted-only table delete case). Manual staff UI flow **not** run (marked optional in task).

4. **Results:**
   - Migration reports max version **20260413150000** — **PASS** — Evidence: `Database schema version: 20260413150000` / “Database is up to date”.
   - `pytest tests/test_delete_table_api.py -q` — **PASS** — Evidence: `3 passed in 1.54s`.
   - Optional manual UI — **N/A** (skipped; automated coverage satisfied).

5. **Overall:** **PASS** (no failed criteria).

6. **Product owner feedback:** Soft-deleted orders no longer block table deletion in the API path covered by tests; migration aligns nullable `table_id` with existing deleted rows. Staff UI smoke was not repeated in this run; if anything still surfaces in the floor plan UI, capture steps and reopen.

7. **URLs tested:** **N/A — no browser** (API/pytest only).

8. **Relevant log excerpts (last section)**

```
$ docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate
INFO: Database schema version (max applied): 20260413150000
...
✅ Database schema version: 20260413150000

$ docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back sh -c 'cd /app && python3 -m pytest tests/test_delete_table_api.py -q'
...                                                                      [100%]
3 passed in 1.54s
```
