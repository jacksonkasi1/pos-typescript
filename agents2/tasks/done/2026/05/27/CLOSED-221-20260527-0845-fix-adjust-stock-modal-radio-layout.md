---
## Closing summary (TOP)

- **What happened:** Global `.form-group` input styles in `_forms.scss` stretched radio controls in the inventory adjust-stock modal, breaking layout on desktop and phone.
- **What was done:** Limited full-width/min-height rules to text-like inputs; rebuilt the adjust-stock “Adjustment type” section with `fieldset`/`legend` and segmented `.adjust-type-option` buttons bound via `setAdjustmentType()`, with responsive column/row layout in the inventory items component.
- **What was tested:** Tester **PASS** — segment controls on desktop and 375px viewport, `POST /api/inventory/items/3/adjust` 200 for add/remove/waste, front bundle `Application bundle generation complete`, reservations page regression check on `http://127.0.0.1:4202`.
- **Why closed:** All acceptance criteria met; test report overall **PASS**; no API behaviour change required beyond UI fix.
- **Closed at (UTC):** 2026-05-27 09:05
---

# Fix adjust-stock modal radio layout

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/221
- **221**

## Problem / goal

In the inventory **adjust stock** modal, radio inputs for adjustment type are stretched and misaligned because global `.form-group` styles in `_forms.scss` apply `width: 100%` and `min-height: 44px` to all `input` elements, including `type="radio"`. Staff see oversized radio circles and poor layout on desktop and phone. Fix scoped styles (or narrow the global rule to text-like inputs) and improve the “Adjustment type” section structure and optional segmented UI.

## High-level instructions for coder

- Primary files: `front/src/app/inventory/inventory-items/inventory-items.component.ts` (adjust modal ~lines 285–300) and component `.scss`; shared forms: `front/src/.../_forms.scss` (or project path for `.form-group`).
- **Root cause:** `.form-group input { width: 100%; min-height: 44px; … }` affects radios. Prefer scoped overrides under `.radio-group` in the inventory modal, or fix globally with `input:not([type='radio'])` (and similar) for text fields only—match existing form patterns elsewhere.
- Use `fieldset` / `legend` for the “Adjustment type” section title (accessibility).
- **Optional (issue):** replace radios with `.adjust-type-option` card/segment buttons bound to `adjustment_type` if it fits existing UI patterns.
- Translate unit in `.adjust-item-info` via existing `INVENTORY.UNITS.*` keys where applicable.
- **Verify:** open adjust-stock modal on desktop and narrow viewport—aligned options, no stretched circles; `docker logs pos-front` shows `Application bundle generation complete` after edits.
- **Out of scope:** backend inventory APIs, reorder logic, unrelated inventory screens.

## Implementation notes

- **`front/src/styles/_forms.scss`:** Text-like inputs use `input:not([type='radio']):not([type='checkbox'])`; explicit compact styles for radio/checkbox (matches book/reservations patterns).
- **Adjust stock modal:** `fieldset`/`legend` + segmented `.adjust-type-option` buttons via `setAdjustmentType()`; column on phone, row from tablet portrait up.
- Current quantity line already uses `unitKey()` + `INVENTORY.UNITS.*` translate pipe.

## Testing instructions

1. Log in as staff with inventory access (e.g. demo owner on tenant 1).
2. Open **Inventory → Items** (`/inventory/items` or staff inventory route).
3. On any item row, open **Adjust stock**.
4. **Desktop:** Confirm three adjustment options appear as aligned segment buttons (Add / Remove / Waste), not stretched circles; active option has primary highlight; quantity/unit/notes fields unchanged.
5. **Narrow viewport (~375px):** Options stack vertically with full-width tap targets (min-height 44px); no horizontal overflow.
6. Select each type, enter quantity, **Apply** — confirm API success and stock updates as before.
7. **Regression:** Open another form with checkboxes/radios if available (e.g. reservations seating) — radios/checkboxes remain normal size.
8. **Build:** `docker logs --since 5m pos-front 2>&1 | tail -20` shows `Application bundle generation complete` with no TS/Sass errors.

---

## Test report

1. **Date/time (UTC):** 2026-05-27 08:50–08:53 UTC. Log window: `docker logs --since 10m pos-front` (build events ~08:47 UTC).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202`; branch **`development`** (synced via `./scripts/git-sync-development.sh`). Credentials: repo **`.env`** `DEMO_LOGIN_*` (tenant 1 owner).

3. **What was tested:** Adjust-stock modal segmented controls (desktop + 375px), apply adjustment API, reservations radio regression, front bundle build.

4. **Results:**
   - **Desktop segment buttons (3 options, no stretched radios):** **PASS** — three `.adjust-type-option` buttons, no `input[type=radio]` in modal; first button ~133×44px, `flex-direction: row`, active state present.
   - **Narrow viewport stack + tap targets:** **PASS** — 375px width: `flex-direction: column`, tap height 44px, no horizontal overflow.
   - **Apply adjustment (all types selectable, API):** **PASS** — cycled add/remove/waste; `POST /api/inventory/items/3/adjust` → **200**.
   - **Regression (other forms radios/checkboxes):** **PASS** — `/reservations` loaded; no oversized radios detected (no radio inputs on page in current tenant config).
   - **Build (`Application bundle generation complete`, no TS/Sass errors):** **PASS** — latest log line: `Application bundle generation complete. [0.452 seconds] - 2026-05-27T08:47:53.682Z` (earlier transient TS/mixin errors during hot reload resolved before final complete).

5. **Overall:** **PASS**

6. **Product owner feedback:** The adjust-stock flow now uses clear segmented buttons instead of broken oversized radios, which should read well on phone and desktop. Staff can still change type, quantity, and notes and apply as before; no API behaviour change observed in testing.

7. **URLs tested:**
   1. `http://127.0.0.1:4202/login`
   2. `http://127.0.0.1:4202/dashboard`
   3. `http://127.0.0.1:4202/inventory/items` (adjust modal opened twice: desktop + narrow)
   4. `http://127.0.0.1:4202/reservations`

8. **Relevant log excerpts:**
   ```
   Application bundle generation complete. [0.452 seconds] - 2026-05-27T08:47:53.682Z
   Page reload sent to client(s).
   ```
   Puppeteer: `PASS: issue #221 checks` (headless Chrome, `front/scripts` pattern; ephemeral test run, not committed).
   Note: `npm run test:landing-version` reported landing semver **2.0.75** vs package **2.0.85** — pre-existing version display drift, **not** in scope for #221.
