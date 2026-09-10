---
## Closing summary (TOP)

- **What happened:** Purchase order Create PO modal dropdown placeholders referenced a missing i18n key (`INVENTORY.COMMON.SELECT`), so users could see the raw key instead of translated text.
- **What was done:** Replaced `INVENTORY.COMMON.SELECT` with the existing `COMMON.SELECT` key on supplier and line-item `<select>` placeholders in `purchase-orders.component.ts` (two occurrences).
- **What was tested:** Front build clean; EN and ES supplier and line-item placeholders show `-- Select --` / `-- Seleccionar --` with no raw key visible — **Overall: PASS**.
- **Why closed:** Tester report **Overall: PASS**; product owner feedback confirms safe to ship with inventory PO flows.
- **Closed at (UTC):** 2026-05-26 15:17
---

# Fix purchase order select placeholder i18n

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/216
- **216**

## Problem / goal
Purchase-order dropdown placeholders reference a missing i18n key `INVENTORY.COMMON.SELECT`, so the placeholder may show the raw key or fall back incorrectly. Fix by using the existing `COMMON.SELECT` key (or add the missing key consistently across all locale files if that is the preferred pattern).

## High-level instructions for coder
- Inspect `front/src/app/inventory/purchase-orders/purchase-orders.component.ts` (and template if placeholders live there) for `INVENTORY.COMMON.SELECT` or similar placeholder bindings on `<select>` elements.
- Replace with `COMMON.SELECT` (or another key that already exists in all `front/public/i18n/*.json` files). Prefer reusing an existing common key over duplicating a new one in every locale.
- If the team standard is to keep `INVENTORY.COMMON.SELECT`, add that key to every locale file under `front/public/i18n/` with appropriate translations — but only if `COMMON.SELECT` cannot be used cleanly.
- Verify placeholders render translated text (not the key string) in at least English and one other locale (e.g. Spanish).
- Smoke: `docker logs --since 5m pos-front` shows successful bundle; open purchase orders and confirm select placeholders display correctly.

## Implementation summary
- Replaced `INVENTORY.COMMON.SELECT` with `COMMON.SELECT` on supplier and line-item `<select>` placeholders in `purchase-orders.component.ts` (2 occurrences).

## Testing instructions
1. Confirm front build: `docker logs --since 5m pos-front 2>&1 | tail -20` — expect "Application bundle generation complete" with no TS errors.
2. Log in as staff, open **Inventory → Purchase orders**.
3. Click **Create PO**; verify supplier dropdown shows `-- Select --` (EN) or `-- Seleccionar --` (ES), not the raw key `INVENTORY.COMMON.SELECT`.
4. Add a line item; verify the inventory-item dropdown placeholder is likewise translated.
5. Optional locale check: switch UI language to Spanish and repeat steps 2–4.

---

## Test report

1. **Date/time (UTC):** 2026-05-26 15:12–15:15 UTC (log window ~15:00–15:15 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development`.
3. **What was tested:** Front build health; purchase-order Create PO modal supplier and line-item `<select>` placeholders in English and Spanish; absence of raw i18n key strings.
4. **Results:**
   - Front build completes without TS errors (latest build at 15:12:31 UTC): **PASS**
   - EN supplier placeholder `-- Select --`: **PASS** (Puppeteer: `supplierPlaceholder: "-- Select --"`)
   - EN line-item placeholder `-- Select --`: **PASS** (Puppeteer: `itemPlaceholder: "-- Select --"`)
   - ES supplier placeholder `-- Seleccionar --`: **PASS**
   - ES line-item placeholder `-- Seleccionar --`: **PASS**
   - No raw key `INVENTORY.COMMON.SELECT` or `COMMON.SELECT` visible in UI: **PASS**
5. **Overall:** **PASS**
6. **Product owner feedback:** Purchase order dropdown placeholders now show proper translated text in both English and Spanish instead of a missing i18n key. The fix reuses the existing `COMMON.SELECT` key consistently on supplier and item selects. Safe to ship with inventory PO flows.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/inventory/purchase-orders (EN + ES, Create PO modal)
8. **Relevant log excerpts:**
   - `Application bundle generation complete. [0.370 seconds] - 2026-05-26T15:12:31.292Z` (pos-front, final successful build in window)
   - Puppeteer exit 0; both locales: `supplierOk: true`, `itemOk: true`, `noRawKey: true`
