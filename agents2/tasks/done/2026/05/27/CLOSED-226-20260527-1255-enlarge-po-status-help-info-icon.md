# Enlarge PO status help info icon

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/226
- **226**

## Problem / goal

Follow-up to #225 (PO status help panel): the info (ⓘ) control that toggles status help on the purchase order **list** and **detail** pages is too small and hard to tap. Increase the clickable hit area to at least **44×44 px** (touch-friendly) and enlarge the SVG icon to roughly **20–24 px**. Improve contrast and hover/focus styles so the control is clearly visible next to filters and page headers.

## High-level instructions for coder

- **Scope:** `purchase-orders.component` (list) and `purchase-order-detail.component` (detail) — button + icon only; do not change help panel copy or status logic from #225.
- **Hit area:** Minimum **44×44 px** tap target (padding or `min-width`/`min-height` on the button) without breaking layout on narrow viewports.
- **Icon:** Scale SVG (or `mat-icon` if used) to **20–24 px**; keep alignment with adjacent controls.
- **Visual:** Stronger contrast vs background; visible `:hover` / `:focus-visible` (outline or background) per existing inventory/staff patterns.
- **A11y:** Preserve existing `aria-label` / `aria-expanded` from #225; do not remove keyboard support.
- **i18n:** Reuse existing toggle label keys; add keys only if new visible text is required.
- **Verify:** List and detail — icon easy to see and tap; help panel still toggles; `docker logs pos-front` shows successful bundle after edits; quick manual check on mobile-width viewport optional.
- **Out of scope:** Backend changes, new statuses, help panel content changes, unrelated inventory pages.

## Implementation notes

- Enlarged inline SVG from 18×18 to 22×22 in both PO list and detail templates.
- Extended `.status-help-toggle` styles in both component SCSS files: surface background + border for contrast, primary-tinted hover/active (`aria-expanded='true'`) states, and `:focus-visible` ring matching inventory patterns. Hit area remains 44×44 via global `.icon-btn`.

## Testing instructions

1. Log in as staff with inventory access; open **Inventory → Purchase orders** (`/inventory/purchase-orders`).
2. **List page:** Confirm the info (ⓘ) button is visibly larger (~22 px icon) with a bordered 44×44 tap target next to the filters.
3. Click/tap the button — status help panel opens; click again — panel closes. `aria-expanded` toggles (inspect in devtools if needed).
4. Hover and Tab-focus the button — primary-tinted background/border on hover; focus ring visible on keyboard focus.
5. Open any PO detail (`/inventory/purchase-orders/:id`) and repeat steps 2–4.
6. Optional: narrow viewport (~375 px) — button still tappable; layout not broken.
7. Confirm front build: `docker logs --since 5m pos-front 2>&1 | tail -20` — no TS/build errors; bundle generation complete.

---

## Test report

1. **Date/time (UTC):** 2026-05-27 13:03:00 – 13:06:44 UTC. Log window: `docker logs --since 15m pos-front` (compose dev stack).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development` (synced via `./scripts/git-sync-development.sh`); `BASE_URL=http://127.0.0.1:4202`; staff login tenant `1` (demo credentials from repo `.env`).

3. **What was tested:** PO list and detail status-help toggle — 44×44 tap target, ~22 px SVG, bordered contrast, hover/focus styles, `aria-expanded` / panel toggle, mobile-width tap target, front bundle health.

4. **Results:**
   - List: 44×44 button, 22×22 SVG, 1px border — **PASS** (Puppeteer `getBoundingClientRect` + computed styles).
   - List: help panel opens/closes, `aria-expanded` false→true→false — **PASS**.
   - List: hover primary-tinted background — **PASS** (`rgba(211, 82, 51, 0.1)`).
   - List: keyboard focus indicator — **PASS** (outline on focus).
   - Detail (`/inventory/purchase-orders/9`): same metrics and toggle — **PASS** (panel id `po-detail-status-help-panel`).
   - Mobile 375×667: tap target 44×44 — **PASS**.
   - Front build: no TS/build errors in log window — **PASS** (`Application bundle generation complete` for purchase-orders chunks).

5. **Overall:** **PASS**

6. **Product owner feedback:** The info control is now easy to spot and tap on both list and detail without changing help copy. Hover and focus states match other inventory controls. Safe to ship with #225 behaviour unchanged.

7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/inventory/purchase-orders
   3. http://127.0.0.1:4202/inventory/purchase-orders/9

8. **Relevant log excerpts**

```
Application bundle generation complete. [0.737 seconds] - 2026-05-27T12:56:16.129Z
Lazy chunk files | purchase-orders-component | 73.14 kB
Lazy chunk files | purchase-order-detail-component | 54.80 kB
Component update sent to client(s).
```

(grep for `error|failed|TS` in 15m window: no matches)
