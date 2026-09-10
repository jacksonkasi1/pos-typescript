---
## Closing summary (TOP)

- **What happened:** Staff had no inline guidance for purchase order statuses on the inventory list and detail pages, and the receive-goods modal did not explain partial-receipt behavior.
- **What was done:** Added an info (ⓘ) toggle on the PO list and detail pages that opens a panel describing all six statuses (draft through cancelled), with `STATUS_HELP_*` i18n keys in all nine locales; added `RECEIVE_PARTIAL_HINT` in the receive-goods modal; reused existing `STATUS_*` label keys for badge names.
- **What was tested:** Puppeteer on `http://127.0.0.1:4202` — list/detail info toggle (six statuses, aria-expanded), receive modal partial-receipt hint, Spanish locale via `pos_language`, front build logs clean — **PASS** (tester report 2026-05-27 12:08–12:13 UTC).
- **Why closed:** All acceptance criteria and test report **PASS**; feature fully delivered for issue #225.
- **Closed at (UTC):** 2026-05-27 12:14
---

# Add PO status help panel (info icon)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/225
- **225**

## Problem / goal

Staff need inline guidance for purchase order (PO) statuses on the list and detail pages. Add an info control (ⓘ) that toggles a small panel explaining each status: draft, submitted, approved, partially received, received, cancelled. Reuse existing status label keys (`STATUS_DRAFT`, etc.) for names; add new `INVENTORY.PURCHASE_ORDERS.STATUS_HELP_*` keys for explanations in every locale under `front/public/i18n/` (en, es, de, fr, ca, bg, hi, ur, zh-CN). In the “Receive goods” modal, add a short field hint that receiving less than ordered sets status to partially received.

## High-level instructions for coder

- **Scope:** Option A only — `showStatusHelp` signal + panel in `purchase-orders.component.ts` and `purchase-order-detail.component.ts` with matching SCSS; no new shared component unless necessary.
- **List page:** Info button toggles the help panel; include `aria-label` on the button (i18n).
- **Detail page:** Same pattern as list for consistency.
- **i18n:** Add `INVENTORY.PURCHASE_ORDERS.STATUS_HELP_*` explanation keys for each status in all locale files; use existing `STATUS_*` keys for status names in the panel.
- **Receive modal:** Short hint text (new i18n key) explaining partial receipt → `partially_received` status.
- **Verify:** Toggle panel on list and detail; all locales load keys; receive modal shows hint; `docker logs pos-front` shows `Application bundle generation complete` after edits.
- **Out of scope:** Backend PO status rules, new statuses, shared design-system component unless duplication is excessive.

## Implementation notes

- List and detail pages: info icon toggles `showStatusHelp` panel with all six statuses (badge + `STATUS_HELP_*` text).
- Receive goods modal: `RECEIVE_PARTIAL_HINT` shown above the quantity table.
- i18n: `STATUS_HELP_TITLE`, `STATUS_HELP_TOGGLE`, `STATUS_HELP_*` per status, `RECEIVE_PARTIAL_HINT` in en, es, de, fr, ca, bg, hi, ur, zh-CN.

## Testing instructions

1. Log in as staff with inventory access; open **Inventory → Purchase Orders** (`/inventory/purchase-orders`).
2. Click the **info (ⓘ)** button below the filters; confirm the help panel opens with six statuses (draft through cancelled), each with a badge label and explanation. Click again to collapse; verify `aria-expanded` toggles in devtools if desired.
3. Open any PO detail page; repeat the info toggle and confirm the same panel content and layout.
4. On an **approved** or **partially received** PO, open **Receive goods**; confirm the partial-receipt hint appears above the quantity inputs.
5. Switch UI language (e.g. Settings or browser locale) to **es** or **de**; reload PO list and confirm help strings are translated (no raw i18n keys).
6. `docker logs --since 5m pos-front 2>&1 | tail -20` — expect `Application bundle generation complete` with no TS/NG errors.

---

## Test report

1. **Date/time (UTC):** 2026-05-27 12:08:00–12:13 UTC. Log window: `docker logs --since 10m pos-front` (approx. 12:03–12:13 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`.
3. **What was tested:** PO list/detail status help panel (info toggle, six statuses, aria-expanded), receive modal partial-receipt hint, Spanish locale (`pos_language=es`), front build logs. Puppeteer smoke (HEADLESS=1); PO #9 temporarily set to `approved` with one line item for receive-modal check, then reverted to `cancelled`.
4. **Results:**
   - Login + open purchase orders list — **PASS** — owner login at `/login?tenant=1`; list loads at `/inventory/purchase-orders`.
   - List info toggle opens panel with 6 statuses — **PASS** — `#po-status-help-panel` shows six `.status-help-item` rows with badge + explanation text.
   - List aria-expanded toggle + collapse — **PASS** — `aria-expanded=true` when open, panel removed and `aria-expanded=false` after second click.
   - Detail info toggle same panel — **PASS** — `/inventory/purchase-orders/9`: `#po-detail-status-help-panel` with 6 items (confirmed with 2.5s post-navigation wait).
   - Receive goods partial-receipt hint — **PASS** — on approved PO #9, modal shows `.receive-partial-hint` with translated text (no raw i18n key).
   - Spanish locale help strings — **PASS** — after `localStorage.setItem('pos_language','es')` + reload, sample text `"El pedido se está preparando y aún no se ha enviado al proveedor."`; no `INVENTORY.*` raw keys.
   - Front build logs — **PASS** — multiple `Application bundle generation complete` lines; no TS/NG errors in window.
5. **Overall:** **PASS**
6. **Product owner feedback:** Staff now have an inline glossary for every PO status on both list and detail pages, with accessible toggle semantics. The receive modal clearly explains partial receipt behavior. All nine locale files include the new help keys; Spanish reload works via the standard `pos_language` preference.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/inventory/purchase-orders
   3. http://127.0.0.1:4202/inventory/purchase-orders/9
   4. http://127.0.0.1:4202/inventory/purchase-orders (locale=es via `pos_language`)
8. **Relevant log excerpts:**

```
pos-front | Application bundle generation complete. [0.013 seconds] - 2026-05-27T12:07:38.233Z
pos-front | Application bundle generation complete. [0.012 seconds] - 2026-05-27T12:07:24.123Z
(no TS2345/NG8002 errors in --since 10m window)
```

GitHub #225: verification started 12:08 UTC (`agent:testing`). **PASS** — ready for closer.
