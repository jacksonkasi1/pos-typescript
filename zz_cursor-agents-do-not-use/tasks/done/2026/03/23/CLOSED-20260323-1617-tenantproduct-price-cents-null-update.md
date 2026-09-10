---
## Closing summary (TOP)

- **What happened:** PostgreSQL logged `UPDATE tenantproduct SET price_cents = NULL` violating **`tenantproduct.price_cents`** NOT NULL (distinct from the earlier **`orderitem.price_cents`** INSERT incident).
- **What was done:** A **`Session.before_flush`** guard coerces **`TenantProduct.price_cents`** from provider/linked product or raises **`InvalidRequestError`** if no fallback exists; **`PUT /tenant-products/{id}`** uses **`exclude_unset`** so explicit JSON **`price_cents: null`** does not clear the column; menu/catalog paths copy or backfill price where needed; **`test_tenant_product_price_not_null.py`** plus related menu-order tests were added.
- **What was tested:** Pytest **`test_tenant_product_price_not_null.py`** and **`test_menu_order_line_price_fallback.py`** in Docker — **10 passed**, overall **PASS** per the task test report.
- **Why closed:** Tester recorded **PASS** against all stated pass/fail criteria; no open verification gaps.
- **Closed at (UTC):** 2026-03-23 16:24
---

# TenantProduct `price_cents` cleared to NULL (DB NOT NULL violation)

## Source

- **Service:** `pos-postgres`
- **UTC window:** after prior log review (`2026-03-23T16:04:01Z`); errors at **2026-03-23 16:08:07.691–16:08:07.960 UTC** (pid **49844**).
- **Representative lines:**
  - `ERROR:  null value in column "price_cents" of relation "tenantproduct" violates not-null constraint`
  - `STATEMENT:  UPDATE tenantproduct SET price_cents = NULL WHERE id = $1`
  - `DETAIL:  Failing row contains (…, Pozole, …)` (multiple rows / ids)

This is separate from the earlier **`orderitem.price_cents`** INSERT incident (tracked in `done/` as **CLOSED-20260323-1604-…**): here the failing statement is an **UPDATE** that sets **`tenantproduct.price_cents`** to **NULL**.

## High-level instructions for coder

- Find every code path that issues **`UPDATE tenantproduct … SET price_cents = NULL`** (or ORM equivalent that persists NULL). Decide whether NULL should ever be allowed; schema says **NOT NULL**, so the app must not send that update.
- Trace what user/API flow triggered this (likely menu/catalog sync, product edit, or import) around **16:08 UTC**; align with **`pos-back`** request logs for the same window if needed.
- Fix by either: (1) stop clearing **`price_cents`** when a price is unknown—keep previous value or compute a new non-null price; or (2) if “no price” is valid product policy, that would require a schema/migration change (prefer fixing the writer unless product explicitly allows nullable menu prices).
- Add or extend tests so **`tenantproduct`** rows are never updated to NULL **`price_cents`** when the column is NOT NULL.

## Implementation notes (coder, 2026-03-23)

- **`Session.before_flush` guard** (`back/app/main.py`): Any `TenantProduct` in `new`/`dirty` with `price_cents is None` is coerced via `_price_cents_from_tenant_product_row` (provider product → linked product). If nothing resolves, flush raises **`InvalidRequestError`** so PostgreSQL never sees `UPDATE tenantproduct SET price_cents = NULL`.
- **`PUT /tenant-products/{id}`:** Uses `model_dump(exclude_unset=True)` so an **explicit JSON `price_cents: null`** does not clear the column (NOT NULL); only non-null values apply.
- **Menu order shadow `Product` link:** When linking a catalog-only `TenantProduct` to a new `Product`, copy **`link_price`** onto the row if `price_cents` was missing in memory.
- **`GET /products` backfill:** When creating a `Product` from a `TenantProduct` without `product_id`, selling price uses **`_price_cents_from_tenant_product_row`** if the row has no price in memory; skip creating that `Product` if still unresolved.
- **Tests:** `back/tests/test_tenant_product_price_not_null.py` (Postgres `TestClient` + flush guard + PUT null).

---

## Testing instructions

### What to verify

- Flushing a `TenantProduct` with `price_cents=None` in memory does **not** emit a NULL `price_cents` when provider or linked product can supply a price.
- **`PUT /tenant-products/{id}`** with **`{"price_cents": null}`** leaves the stored selling price unchanged.
- Flush fails with **`InvalidRequestError`** when a `TenantProduct` would persist with null price and no fallback chain exists.

### How to test

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python3 -m pytest /app/tests/test_tenant_product_price_not_null.py \
  /app/tests/test_menu_order_line_price_fallback.py -v
```

### Pass/fail criteria

- **Pass:** Both pytest modules exit **0** (10 tests total with the two files above).
- **Fail:** Any failure in those modules, or PostgreSQL **`tenantproduct.price_cents`** null violations on menu/catalog flows after deploy.

---

## Test report

1. **Date/time (UTC) and log window:** Started **2026-03-23T16:23:42Z**; verification completed within ~3s (pytest run).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** N/A (no browser); branch **`development`**, commit **`b9d6f42`**.
3. **What was tested:** As in “What to verify” plus menu-order price fallback coverage from the second module (task “How to test” command).
4. **Results:**
   - Flush coerces `price_cents` when provider/linked product can supply a price — **PASS** — `test_before_flush_coalesces_price_from_provider_product` passed.
   - **`PUT /tenant-products/{id}`** with **`{"price_cents": null}`** leaves stored price unchanged — **PASS** — `test_put_explicit_null_price_does_not_clear_db` passed.
   - Flush raises when no fallback — **PASS** — `test_before_flush_raises_when_no_price_fallback` passed.
   - Menu-order fallback / finalize behaviour (related regression guard) — **PASS** — six tests in `test_menu_order_line_price_fallback.py` passed.
5. **Overall:** **PASS** (all criteria covered by green tests; no failed criteria).
6. **Product owner feedback:** Automated tests now assert that `tenantproduct.price_cents` is never persisted as NULL under NOT NULL when a fallback exists, and that explicit API null does not wipe the column. Operators should no longer see DB constraint errors from this UPDATE path; production should be monitored briefly after deploy for any remaining edge flows not covered by tests.
7. **URLs tested:** **N/A — no browser** (backend pytest only per instructions).
8. **Relevant log excerpts:**

```
============================== 10 passed in 1.69s ==============================
tests/test_tenant_product_price_not_null.py::...::test_before_flush_coalesces_price_from_provider_product PASSED
tests/test_tenant_product_price_not_null.py::...::test_before_flush_raises_when_no_price_fallback PASSED
tests/test_tenant_product_price_not_null.py::...::test_put_explicit_null_price_does_not_clear_db PASSED
tests/test_tenant_product_price_not_null.py::...::test_put_updates_price_when_sent PASSED
(+ 6 passed in test_menu_order_line_price_fallback.py)
```
