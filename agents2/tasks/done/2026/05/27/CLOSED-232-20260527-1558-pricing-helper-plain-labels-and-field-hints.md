# Pricing helper: plain labels and field hints

## GitHub Issues

- **Issue:** https://github.com/satisfecho/pos/issues/232
- **232**

## Problem / goal

The pricing helper modal should use plain, readable labels with contextual help instead of overloading every control with info icons. Add **`PRICING.*_HINT`** translation strings and visible **field-hint** text under key inputs; show a dynamic hint under pricing strategy tabs; optionally collapse advanced fields into **“More options”**; add a short example line at the top of the modal. Reserve **ⓘ** (info icon) for strategy/details only—not every field. Match existing **field-hint** styling from settings/products.

## High-level instructions for coder

- Review **`pricing-helper.component.ts`**, template, and **`pricing-helper.component.scss`**; align with field-hint patterns used in settings/products (e.g. **`field-hint`** class in **`_forms.scss`**).
- Add **`PRICING.*_HINT`** keys in all locale files under **`front/public/i18n/`** (per **`.cursor/rules/angular-ngx-translate.mdc`**).
- Wire hints under container cost/qty, serving size, target margin/pour-cost, and other primary inputs; keep labels short without per-field ⓘ.
- Add dynamic hint copy that updates when the user switches pricing strategy tabs.
- Optional: group secondary/advanced inputs behind a collapsed **“More options”** section.
- Add a concise example line at the top of the modal (translated).
- After edits, confirm **`docker logs pos-front`** shows **`Application bundle generation complete`** with no TS errors; smoke-test opening the pricing helper from products.

## Implementation notes

- Added translated **`PRICING.EXAMPLE_LINE`** below the modal header.
- **`field-hint`** copy under container cost/qty, serving size, mode tabs, and advanced fields (waste, extra cost, rounding).
- Dynamic **`targetStrategyHintI18n()`** hint under pricing strategy segments; **ⓘ** only on strategy section title (`STRATEGY_INFO`).
- Advanced section collapsed behind **More options** toggle (`advancedOpen` default false).
- New keys in all **`front/public/i18n/*.json`** locales.

## Testing instructions

1. Log in as staff with product edit rights; open **Products**, edit or create a product.
2. Click **Calculate ideal price** (pricing helper). Confirm:
   - Example line appears under the title.
   - **Pricing strategy**: **ⓘ** on section title shows strategy help (tooltip/aria-label); switching Pour cost / Margin / Markup updates the hint below the tabs.
   - **Container simulator** mode (or standalone helper): hints under container price, quantity, and serving size.
   - **More options** expands/collapses waste, extra fixed cost, and rounding with hints.
3. Switch locale (e.g. DE) and confirm hints and example line translate.
4. **`docker logs --since 5m pos-front`** — no TS/build errors; **`Application bundle generation complete`** after save.
5. Optional: **`BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`** for baseline smoke.

---

## Test report

1. **Date/time (UTC):** Started 2026-05-27 16:00 UTC; finished 2026-05-27 16:06 UTC. Log window: 15:55–16:06 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`.
3. **What was tested:** Pricing helper from Products edit — example line, strategy ⓘ + tab hints, container simulator hints, More options collapse, DE locale, front build.
4. **Results:**
   - Login + open pricing helper from product edit — **PASS** — dialog opens via **Calculate ideal price** (`.pricing-ideal-btn`).
   - Example line under title — **PASS** — `PRICING.EXAMPLE_LINE` visible: “Example: a €50 container, 200 ml servings…”
   - Strategy ⓘ on section title only — **PASS** — `.strategy-info-btn` present with `aria-label`/`title` from `PRICING.STRATEGY_INFO`; no per-field ⓘ on container inputs.
   - Strategy tab hint updates (Pour cost → Margin) — **PASS** — pour hint mentions ingredient cost; margin tab shows “Margin is profit divided by menu price…”
   - Container simulator mode hints — **PASS** — after **Container simulator** tab, 11 `.field-hint` elements including container total/qty and serving qty.
   - More options expand/collapse — **PASS** — `.more-options-toggle` `aria-expanded` false→true; `#ph-waste`, extra cost, rounding visible with hints.
   - DE locale (`pos_language=de`) — **PASS** — example: “Beispiel: 50 € Behälter, 200 ml Portionen…”
   - Front build — **PASS** — final state: `Application bundle generation complete` @ 2026-05-27T16:01:40.995Z (transient TS errors during hot-reload at 16:00:06–16:00:20 resolved before test window end).
   - Optional landing smoke — **N/A** — `test:landing-version` reports semver footer drift (2.0.75 vs package 2.0.85); unrelated to #232.
5. **Overall:** **PASS** (all task criteria met).
6. **Product owner feedback:** The pricing helper is easier to scan: a short example at the top, hints under the fields that matter, and advanced options tucked behind **More options**. Strategy help stays on the section title with a hint that changes when you switch tabs. German copy loads correctly for the same keys.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login
   2. http://127.0.0.1:4202/products
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.013 seconds] - 2026-05-27T16:01:40.995Z
Page reload sent to client(s).
(transient during save: TS2339 modeHintI18n/targetStrategyHintI18n — resolved by 16:00:22Z)
```
