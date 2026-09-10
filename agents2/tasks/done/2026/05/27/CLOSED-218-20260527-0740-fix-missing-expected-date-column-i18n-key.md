---
## Closing summary (TOP)

- **What happened:** Purchase order list and detail views showed the raw i18n key `INVENTORY.PURCHASE_ORDERS.EXPECTED_DATE` instead of translated column/label text.
- **What was done:** Templates were aligned to the existing `EXPECTED_DELIVERY` locale key in `purchase-orders.component.ts` and `purchase-order-detail.component.ts`; no new locale JSON keys were required.
- **What was tested:** Staff purchase-order list and detail (EN/DE), create-form label consistency, front bundle rebuild — all **PASS** per tester report (2026-05-27 UTC).
- **Why closed:** All acceptance criteria and testing instructions passed; no `EXPECTED_DATE` references remain under `front/`.
- **Closed at (UTC):** 2026-05-27 07:50
---

# Fix missing expected date column i18n key

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/218
- **218**

## Problem / goal
Purchase order list and detail views reference `INVENTORY.PURCHASE_ORDERS.EXPECTED_DATE`, which is not defined in locale files. Users see the raw key in the table column header (and detail label) while the create form correctly uses `EXPECTED_DELIVERY`. Align templates with an existing key or add the missing key consistently across all `front/public/i18n/*.json` files.

## High-level instructions for coder
- Inspect `front/src/app/inventory/purchase-orders/purchase-orders.component.ts` (table header) and `purchase-order-detail.component.ts` (detail label) for `INVENTORY.PURCHASE_ORDERS.EXPECTED_DATE`.
- Prefer reusing `INVENTORY.PURCHASE_ORDERS.EXPECTED_DELIVERY` (already present in locales) for column header and detail label, unless product copy requires a shorter label like `EXPECTED` — then add that key to every locale file under `INVENTORY.PURCHASE_ORDERS`.
- Do not leave mixed keys (`EXPECTED_DATE` in one place, `EXPECTED_DELIVERY` in another) unless both are defined everywhere.
- Verify translated text (not raw keys) in English and at least one other locale on the purchase orders list and detail views.
- Smoke: `docker logs --since 5m pos-front` shows successful bundle; open **Inventory → Purchase orders** and a PO detail row with an expected date.

## Implementation notes
- Replaced `INVENTORY.PURCHASE_ORDERS.EXPECTED_DATE` with `EXPECTED_DELIVERY` in `purchase-orders.component.ts` (table header) and `purchase-order-detail.component.ts` (detail label). No locale file changes needed.

## Testing instructions
1. Log in as staff with inventory access; open **Inventory → Purchase orders**.
2. Confirm the expected-date **column header** shows translated text (e.g. English: "Expected Delivery Date"), not `INVENTORY.PURCHASE_ORDERS.EXPECTED_DATE`.
3. Open a purchase order that has an expected delivery date; confirm the **detail label** matches the same wording (not a raw i18n key).
4. Switch language (e.g. German or Spanish) and repeat steps 2–3.
5. Create-form label for expected date should still show the same key (`EXPECTED_DELIVERY`) consistently.
6. `docker logs --since 5m pos-front` — no Angular build errors after the change.

---

## Test report

1. **Date/time (UTC):** 2026-05-27 07:45:30 – 07:48:50 UTC. Log window: `docker logs --since 15m pos-front` (build at 07:41:03Z).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`.
3. **What was tested:** Purchase orders list column header, PO detail label, create-modal label, English + German locales, front build logs. Seeded one draft PO (`PO-TEST-218`, id 1) with `expected_date=2026-06-15` so the table renders (empty list hides headers).
4. **Results:**
   - List column header shows translated text, not raw key — **PASS** (`table th` = `EXPECTED DELIVERY DATE` EN; `ERWARTETES LIEFERDATUM` DE; no `INVENTORY.PURCHASE_ORDERS.EXPECTED_DATE` in DOM text).
   - Detail label translated (EN/DE) — **PASS** (detail page includes same label text).
   - German locale repeat — **PASS** (`localStorage` key `pos_language=de`, `document.documentElement.lang=de`).
   - Create form uses `EXPECTED_DELIVERY` — **PASS** (Create PO modal label matches list wording in EN).
   - `grep` codebase: no `EXPECTED_DATE` in `front/` — **PASS**.
   - `docker logs pos-front`: successful rebuild of purchase-order chunks, no TS/NG errors — **PASS**.
5. **Overall:** **PASS**
6. **Product owner feedback:** Staff will see proper “Expected delivery date” wording on purchase order lists and details instead of a raw translation key. The fix reuses an existing locale string, so all languages stay consistent without new JSON keys.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/inventory/purchase-orders
   3. http://127.0.0.1:4202/inventory/purchase-orders/1
   4. http://127.0.0.1:4202/inventory/purchase-orders (DE)
   5. http://127.0.0.1:4202/inventory/purchase-orders/1 (DE)
8. **Relevant log excerpts:**
   ```
   Application bundle generation complete. [0.666 seconds] - 2026-05-27T07:41:03.434Z
   Lazy chunk files | purchase-orders-component | 59.32 kB
   Lazy chunk files | purchase-order-detail-component | 39.21 kB
   Component update sent to client(s).
   ```
