---
## Closing summary (TOP)

- **What happened:** On the products form, absolutely positioned currency prefixes overlapped price digits in narrow `form-group-sm` columns (especially at 125% zoom for EUR tenants).
- **What was done:** Replaced `.price-input` in `_forms.scss` with the flex-based currency cell + borderless inner input (catalog pattern); removed duplicate catalog component styles so both screens share one layout.
- **What was tested:** Puppeteer geometry checks at 100% and 125% zoom, narrow viewport, catalog regression, and front build — all **PASS** (2026-05-27 15:47–15:50 UTC).
- **Why closed:** All acceptance criteria met; tester report **PASS** with no regressions.
- **Closed at (UTC):** 2026-05-27 15:51
---

# Fix overlapping currency symbol on product price inputs

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/231
- **231**

## Problem / goal

On the products form (`products.component.ts`), **Precio** and **Precio de coste** use `.price-input` with an absolutely positioned `.currency` span and left padding on the input (`front/src/styles/_forms.scss`). In narrow `form-group-sm` columns the currency symbol (e.g. €) overlaps the numeric digits (e.g. `0`, `,00`), especially at default and 125% zoom for EUR tenants.

Replace the absolute-prefix pattern with a layout that keeps the symbol and digits visually separated—e.g. the flex-based currency cell + bordered input pattern already used in `catalog.component.ts`—or adjust padding/width so the prefix never intrudes on the value area. Apply consistently to both price fields.

## High-level instructions for coder

- **Scope:** `front/src/app/products/products.component.ts` (template/styles as needed), shared form styles in `front/src/styles/_forms.scss`, and `catalog.component.ts` as the reference for a working currency + input layout.
- **Align with catalog:** Reuse or extract the same structural pattern as catalog (dedicated currency cell, input without left overlap) rather than inventing a third variant unless consolidation is clearly out of scope.
- **Both fields:** Fix **Precio** and **Precio de coste**; confirm tenant currency symbol comes from existing tenant/currency helpers (no hard-coded €).
- **Responsive / a11y:** Verify at default viewport width and **125%** browser zoom; narrow `form-group-sm` columns must not clip or overlap symbol and digits.
- **Regression:** Spot-check other screens that use `.price-input` / `.currency` in `_forms.scss` so a global style change does not break inventory or settings price fields.
- **Build:** After edits, confirm `docker logs --since 5m pos-front` shows `Application bundle generation complete` with no TS/template errors.

## Implementation summary

- Replaced absolute-position `.price-input` styles in `front/src/styles/_forms.scss` with flex-based currency cell + borderless inner input (same pattern as catalog).
- Removed duplicate `.price-input` block from `catalog.component.ts` component styles; catalog now uses the shared global styles.
- No template changes required in `products.component.ts` — both **Precio** and **Precio de coste** already use `.price-input` markup; tenant currency symbol unchanged (`currency()` signal).

## Testing instructions

1. Log in as a staff user with product edit rights on an EUR tenant (e.g. demo tenant).
2. Open **Products** → add or edit a product so the form shows **Precio** and **Precio de coste** in the top row (`form-group-sm` columns).
3. At default browser zoom (~100%), confirm the currency symbol sits in a separate left cell and does **not** overlap digits when the field shows values like `0`, `12.50`, or placeholder text.
4. Set browser zoom to **125%** and repeat step 3 for both price fields.
5. Narrow the viewport (or use responsive mode) until the price columns are at minimum width (~120px); symbol and digits must remain separated with no clipping.
6. Regression: open **Catalog** → add item dialog → **Set price** field uses the same `.price-input` layout and looks correct.
7. Confirm build: `docker logs --since 5m pos-front` shows `Application bundle generation complete` with no TS/template errors.

---

## Test report

1. **Date/time (UTC):** Started 2026-05-27 15:47 UTC; finished 2026-05-27 15:50 UTC. Log window: 15:35–15:50 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development`.
3. **What was tested:** Products form **Precio** / **Precio de coste** currency layout at 100% and 125% zoom, narrow viewport (~400px), catalog add-item price field regression, front build health.
4. **Results:**
   - Login + products form with EUR tenant currency — **PASS** — both `.price-input` fields show `€` in separate flex cell (`currencyPosition: static`, `flexShrink: 0`), values `12.50` and `0` with no bbox overlap (`horizontalGap: 0`, `overlaps: false`).
   - 100% zoom, both price fields — **PASS** — Puppeteer geometry check on 2 inputs, no overlap.
   - 125% zoom (deviceScaleFactor 1.25), both price fields — **PASS** — same geometry check, no overlap.
   - Narrow viewport (400px width, ~120px columns) — **PASS** — both fields remain separated, no clipping/overlap.
   - Catalog add-item **Set price** regression — **PASS** — dialog opened, 1 `.price-input` with `€`, no overlap, value `26.00`.
   - Front build — **PASS** — `docker logs --since 15m pos-front`: `Application bundle generation complete` (15:47:59Z, 15:48:06Z), no TS/template errors.
5. **Overall:** **PASS** (all criteria met).
6. **Product owner feedback:** The flex-based currency cell fix resolves the overlap issue on narrow product price columns. Symbol and digits stay visually separated at default and 125% zoom. Catalog reuses the shared global `.price-input` styles without regression.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/products
   3. http://127.0.0.1:4202/catalog
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.127 seconds] - 2026-05-27T15:47:59.610Z
Application bundle generation complete. [0.554 seconds] - 2026-05-27T15:48:06.088Z
(no TS/template errors in window)
```
