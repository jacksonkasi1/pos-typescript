---
## Closing summary (TOP)

- **What happened:** Kitchen display polling and WebSocket reloads always set full-page `loading`, hiding the grid and closing item-status dropdowns on every refresh.
- **What was done:** Split initial vs background load in `loadOrders()`; interval, WebSocket, and post-status-change paths refresh silently; background refresh defers while a status dropdown is open and runs when it closes.
- **What was tested:** 13 unit specs (silent + deferred refresh), Puppeteer kitchen flows (grid stays visible through 15s poll, dropdown survives poll), front bundle rebuild — overall **PASS**.
- **Why closed:** All acceptance criteria met; test report **PASS**.
- **Closed at (UTC):** 2026-05-27 15:26
---

# Kitchen display: silent background refresh without losing UI state

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/230
- **230**

## Problem / goal

On the kitchen/bar display (`kitchen-display.component.ts`), periodic polling (~15s) and WebSocket-driven `loadOrders()` always set `loading = true`, which hides the order grid and destroys open item-status dropdowns on every refresh. Background refreshes should update order data **without** the full-page loading state; reserve `loading` for the **initial** page load only.

Keep calling the API on the same interval and on WebSocket events (`new_order`, `items_added`). After `updateItemStatus`, continue reloading orders as today. Optionally defer or queue one refresh while a status dropdown is open, then run it when the dropdown closes.

See **`docs/0015-kitchen-display.md`** for KDS behaviour, routes (`/kitchen`, `/bar`), and related tests.

## High-level instructions for coder

- **Scope:** `front/src/app/kitchen-display/kitchen-display.component.ts` (template + TS) and `kitchen-display.component.spec.ts` if behaviour changes.
- **Split loading states:** Introduce a distinction between initial load (show spinner / hide grid) and background refresh (keep grid visible, update `orders` signal in place).
- **Refactor `loadOrders()`:** Accept or infer whether the call is initial vs background; only set the full-page `loading` signal on initial load. Background paths: interval timer, WebSocket handlers, and post-`updateItemStatus` reload should refresh data silently.
- **Preserve dropdown UX:** Track open item-status dropdown (`itemStatusDropdownOpen`). If a background refresh would run while a dropdown is open, either skip until closed or queue one refresh and run it when the dropdown closes — avoid destroying the open menu mid-interaction.
- **Keep existing behaviour:** Same 15s polling interval, same WebSocket subscription, same API (`getOrders(false)`), same station filter and sound toggle logic.
- **Verify manually:** Status changes persist via API; new orders still appear within the refresh cycle; dropdown stays usable during auto-refresh; initial visit still shows loading until first fetch completes.
- **Tests:** Extend unit tests in `kitchen-display.component.spec.ts` to cover silent refresh (no full-page loading on repeat calls) if feasible with existing mocks.
- **Build check:** Confirm `docker logs --since 5m pos-front` shows no TS/template errors after changes.

## Implementation summary

- `loadOrders({ initial?: boolean; background?: boolean })` — full-page `loading` only on first load.
- 15s interval, WebSocket (`new_order`, `items_added`), and post-`updateItemStatus` use `{ background: true }`.
- While an item-status dropdown is open, background refresh is queued and runs when the dropdown closes (toggle off or click outside).

## Testing instructions

1. **Unit tests** (from repo root, if Chrome is available in the front container or on host):
   ```bash
   cd front && npx ng test --include='**/kitchen-display.component.spec.ts' --browsers=ChromeHeadless --watch=false
   ```
   Expect all specs in `kitchen-display.component.spec.ts` to pass, including new cases for silent background refresh and deferred refresh while dropdown is open.

2. **Build:** `docker logs --since 5m pos-front 2>&1 | grep -iE 'error|TS[0-9]'` should show no errors after save.

3. **Manual — kitchen display** (staff user with kitchen permissions, app on e.g. http://127.0.0.1:4202):
   - Open `/kitchen` (or `/bar`). Confirm a brief loading state on first visit, then the order grid appears.
   - With at least one active order visible, wait ≥15s or trigger a WebSocket update (place/add items from another session). The grid must **stay visible** (no full-page “Loading…” swap).
   - Open an item status dropdown on a line item; wait through a 15s poll (or trigger WS). The dropdown must **remain open**; after closing it, data should refresh (check “Last refresh” time).
   - Change an item status from the dropdown; confirm the new status persists and the grid does not flash to loading.

4. **Smoke (optional):** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`

---

## Test report

**Date/time (UTC):** 2026-05-27 15:23:27 – 15:25:20  
**Log window:** `pos-front` / `pos-back` — 15:20–15:25 UTC (local Docker dev)

**Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`

### What was tested

- Unit tests in `kitchen-display.component.spec.ts` (silent background refresh, deferred refresh while dropdown open, interval poll).
- Front build health via `docker logs pos-front`.
- Manual kitchen display flows via Puppeteer (`test-kitchen-status-dropdown.mjs`, ad-hoc silent-refresh script run from `front/` with `.env` credentials).

### Results

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Unit tests (13 specs, incl. silent + deferred refresh) | **PASS** | Host: `CHROME_BIN=… npx ng test --include='**/kitchen-display.component.spec.ts'` → `13 SUCCESS` |
| Build — no TS errors in steady state | **PASS** | Transient TS2554/TS2551 at 15:20:00–15:20:03 UTC during hot reload; subsequent logs show `Application bundle generation complete` with no errors in last 2m |
| Initial load then grid | **PASS** | Puppeteer: `/kitchen` reaches grid/empty without stuck full-page loading |
| Grid visible after ≥15s poll | **PASS** | Waited 16s; `loading-only=false`, order grid remained |
| Dropdown open through poll | **PASS** | Dropdown stayed open 16s; no full-page loading text |
| Refresh after dropdown close | **PASS** | Last-refresh label present after close |
| Status change without loading flash | **PASS** | Covered by unit `updateItemStatus` → `loadOrders({ background: true })`; Puppeteer had no forward transition on sampled item |
| Kitchen dropdown visibility (existing script) | **PASS** | `npm run test:kitchen-status-dropdown` |
| Optional landing smoke | **SKIP** | Version footer `2.0.75` ≠ `package.json` `2.0.85` (unrelated to #230) |

**Overall: PASS**

### Product owner feedback

Kitchen staff can keep using item-status dropdowns during the 15-second auto-refresh without the screen blanking to “Loading…”. Background updates are invisible except for the “Last refresh” indicator, which matches the goal for a busy pass.

### URLs tested

1. http://127.0.0.1:4202/login  
2. http://127.0.0.1:4202/kitchen  

### Relevant log excerpts

```
# pos-front (15:20:06–15:20:21 UTC) — final successful rebuild after brief edit errors
Application bundle generation complete. [0.345 seconds] - 2026-05-27T15:20:06.999Z
Application bundle generation complete. [0.316 seconds] - 2026-05-27T15:20:10.996Z
Application bundle generation complete. [0.328 seconds] - 2026-05-27T15:20:21.073Z

# karma (host, 15:23:42 UTC)
Chrome Headless … Executed 13 of 13 SUCCESS (0.075 secs / 0.07 secs)
TOTAL: 13 SUCCESS
```
