---
## Closing summary (TOP)

- **What happened:** The pricing helper container simulator showed container and serving quantity and unit as four separate stacked fields with redundant unit labels.
- **What was done:** Refactored to two `.qty-unit-pair` rows (container amount, serving size) with inline number + unit select and hints below each pair; updated `PRICING.*` i18n keys and mobile stacking in component SCSS.
- **What was tested:** Manual verification on dev (paired layout, preview refresh, 390px mobile touch targets, DE locale, clean front build logs) — **PASS** (2026-05-27 16:20–16:22 UTC).
- **Why closed:** All acceptance criteria met; tester report **PASS**.
- **Closed at (UTC):** 2026-05-27 16:23
---

# Pricing helper: pair quantity and unit on one row

## GitHub Issues

- **Issue:** https://github.com/satisfecho/pos/issues/233
- **233**

## Problem / goal

In the pricing helper modal (container simulator section), container quantity + unit and serving quantity + unit are separate labeled fields stacked vertically. Users should see each **value + unit** as one coherent control: a single label per pair (e.g. serving size), number input and unit select **inline on one row**, with the field hint **below the pair** (not between qty and unit). Avoid a separate “unit” label when the pair label already describes the group.

## High-level instructions for coder

- Work in **`pricing-helper.component.ts`** (inline template), **`pricing-helper.component.scss`**, and **`front/public/i18n/*.json`** as needed.
- Refactor the four controls in the container section (`ph-cqty` / `ph-cunit`, `ph-sqty` / `ph-sunit`) into two **paired rows**: each row has one primary label, inline number + `<select class="unit-select">`, then **`field-hint`** beneath the row.
- Reuse or extend existing form patterns from **`_forms.scss`** / settings-products where qty+unit sit on one line; keep touch targets and mobile layout readable (`for-phone-only` breakpoints in the component SCSS).
- Update **`PRICING.*`** keys: one label per pair (e.g. container amount, serving size); drop or repurpose redundant “unit only” labels; add/adjust hints so they apply to the pair, not a single sub-field.
- Preserve existing `(ngModel)` bindings and **`scheduleRefresh()`** behavior; no API changes expected.
- After edits, confirm **`docker logs pos-front`** shows **`Application bundle generation complete`** with no TS errors; manually open **Products → Calculate ideal price** and verify both pairs look and behave correctly.

## Implementation notes

- Container simulator: **Container amount** and **Serving size** each use `.qty-unit-pair` with inline number + unit select; hints sit below the row.
- i18n: `CONTAINER_AMOUNT`, `CONTAINER_AMOUNT_HINT`, `SERVING_SIZE`, `SERVING_SIZE_HINT` (removed separate unit-only labels).
- Unit selects use `aria-label` from `INVENTORY.ITEMS.UNIT` for accessibility.

## Testing instructions

1. Log in as staff with product edit rights; open **Products**, edit or create a product.
2. Click **Calculate ideal price**. Switch to **Container simulator** (or open helper without a product).
3. Confirm **Container amount** and **Serving size** each show one label, quantity + unit on one row, and the hint **below** the row (not between qty and unit). No separate “unit” column labels.
4. Change quantity and unit for both pairs; confirm price preview still updates (debounced).
5. Narrow viewport / phone: both pairs stack qty above unit but remain readable; touch targets ≥ 44px.
6. Switch locale (e.g. DE) and confirm pair labels and hints translate.
7. **`docker logs --since 5m pos-front`** — no TS/build errors; **`Application bundle generation complete`** after save.
8. Optional: **`BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`** for baseline smoke.

---

## Test report

1. **Date/time (UTC):** 2026-05-27T16:20:55Z – 2026-05-27T16:22:30Z. Log window: ~16:15–16:22 UTC (`docker logs --since 15m pos-front`).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`.
3. **What was tested:** Pricing helper container simulator — paired qty+unit rows, preview refresh, mobile layout/touch targets, DE locale, front build logs; optional landing smoke.
4. **Results:**
   - **Paired layout (one label, inline qty+unit, hint below):** **PASS** — `.qty-unit-pair` ×2; labels “Container amount” / “Serving size”; `hintAfterRow: true`; `extraUnitLabelCount: 0`; desktop inline (`inlineDesktop: true`).
   - **Preview updates on qty change:** **PASS** — suggested price `€1.50` → `€1.00` after `#ph-cqty` 25 and `#ph-sqty` 150 (debounced).
   - **Mobile (390×844, stacked, touch ≥44px):** **PASS** — unit below qty (`stacked: true`); control heights 45px each.
   - **DE locale (`pos_language=de`):** **PASS** — labels “Behältermenge”, “Portionsgröße”.
   - **Front build logs:** **PASS** — multiple `Application bundle generation complete`; no TS/build errors in window.
   - **Optional landing smoke:** **N/A (not blocking)** — `test:landing-version` reports footer semver `2.0.75` vs package `2.0.85` (unrelated to this task).
5. **Overall:** **PASS**
6. **Product owner feedback:** Container and serving inputs now read as single fields with hints underneath, which matches how staff think about “amount in the keg” vs “per glass.” Layout holds on phone width with tappable controls. German labels load correctly when the app language is switched.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login
   2. http://127.0.0.1:4202/products
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.009 seconds] - 2026-05-27T16:17:06.220Z
(no TS/NG errors in 15m window)
```
