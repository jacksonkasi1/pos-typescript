---
## Closing summary (TOP)

- **What happened:** Purchase order status badges on the detail page and help panels did not match the list because detail SCSS was missing `submitted` and `cancelled` variants.
- **What was done:** Extracted all six status badge styles into shared `_purchase-order-status-badges.scss` and `@use`d it from both `purchase-orders.component.scss` and `purchase-order-detail.component.scss`, removing duplicated rules.
- **What was tested:** Tester verified list table, list/detail status-help panels, detail header badges (including submitted/cancelled colors), front bundle rebuild, and app root HTTP 200 — overall **PASS**.
- **Why closed:** All acceptance criteria met; test report **PASS** with no functional regressions.
- **Closed at (UTC):** 2026-05-27 13:52
---

# Unify PO status badge styles on list and detail

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/229
- **229**

## Problem / goal

Purchase order status badges on the **list** (`purchase-orders.component`) and **detail** (`purchase-order-detail.component`) do not share the same styles. The list SCSS defines all statuses (`draft`, `submitted`, `approved`, `partially_received`, `received`, `cancelled`); the detail SCSS is missing **`submitted`** and **`cancelled`**, so those badges on the detail page and in the detail status-help panel look unstyled or inconsistent. Align both surfaces by using one shared badge style source so every status matches the list appearance.

Related context: status help and transitions live in `purchase-order-status.util.ts`; this task is **CSS/SCSS only**.

## High-level instructions for coder

- **Scope:** `front/src/app/inventory/purchase-orders/` — badge appearance on list, detail header, and status-help regions that use `.status-badge.[class]="status"`.
- **Extract shared styles:** Move `.status-badge` variant rules to a single shared partial (e.g. `_purchase-order-status-badges.scss` under the same folder) and `@use`/`@import` it from both `purchase-orders.component.scss` and `purchase-order-detail.component.scss`; remove duplicated blocks so list and detail cannot drift again.
- **Parity:** Ensure detail (and help panel) includes the same variants as the list: at minimum `submitted` and `cancelled`, plus any other statuses from `PurchaseOrderStatus` used in templates.
- **Do not change** status transition logic, API calls, or help-panel copy from prior PO tasks (#225–#226).
- **Verify:** Open PO list and a PO in `submitted` and `cancelled` (or use help panel samples); badges match list colors. Check `docker logs --since 5m pos-front` — bundle completes with no TS/SCSS errors.
- **Out of scope:** New statuses, backend changes, i18n key changes unless new visible strings are required.

## Implementation notes

- Added `_purchase-order-status-badges.scss` with all six PO status variants (`draft`, `submitted`, `approved`, `partially_received`, `received`, `cancelled`).
- Both `purchase-orders.component.scss` and `purchase-order-detail.component.scss` now `@use 'purchase-order-status-badges'`; removed duplicated `.status-badge` blocks from each file.

## Testing instructions

1. Log in as staff with inventory access.
2. Open **Inventory → Purchase orders** (`/inventory/purchase-orders`).
3. Confirm status badges on the list table show correct colors for each status (especially **Submitted** — blue tint, **Cancelled** — red tint).
4. Open the status-help panel (info toggle) on the list — all six sample badges should match the table row styling.
5. Open a PO detail page for orders in **submitted** and **cancelled** status (or any status); header badge colors must match the list.
6. On PO detail, open the status-help panel — badges must match list/detail header styling.
7. **Build:** `docker logs --since 5m pos-front` — `Application bundle generation complete` with no TS/SCSS errors.
8. **Regression:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` returns `200`.

**Automated:** Front bundle rebuild succeeded in Docker after SCSS changes. App root HTTP 200. Landing smoke test failed on unrelated semver footer mismatch (2.0.75 vs package 2.0.85), not this change.

---

## Test report

1. **Date/time (UTC):** 2026-05-27 13:47–13:52 UTC. Log window: `pos-front` `--since 15m`; `pos-back` not required (SCSS-only).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`.
3. **What was tested:** PO list table badges; list status-help panel (six samples); PO detail info-card badge and detail status-help panel; front bundle rebuild; app root HTTP.
4. **Results:**
   - List table badges (cancelled red, received green): **PASS** — `rgb(220, 38, 38)` / `rgba(220, 38, 38, 0.1)` on cancelled rows; received styled consistently.
   - List status-help panel — six badges, submitted blue / cancelled red: **PASS** — submitted `rgb(59, 130, 246)`, cancelled matches list cancelled row colors.
   - Detail page badge matches list for same status: **PASS** — PO #9 cancelled: info-card badge colors identical to list cancelled badge; detail help panel cancelled/submitted tints match list help panel.
   - Detail status-help panel parity: **PASS** — six badges; submitted blue and cancelled red confirmed via computed styles.
   - `docker logs pos-front` — bundle complete, no TS/SCSS errors: **PASS** — `Application bundle generation complete` for `purchase-orders-component` and `purchase-order-detail-component` (2026-05-27T13:47:40Z / 13:47:42Z); grep found no error lines in 15m window.
   - `curl` app root 200: **PASS** — HTTP 200.
5. **Overall:** **PASS**
6. **Product owner feedback:** Shared `_purchase-order-status-badges.scss` removes drift between list and detail. Cancelled and submitted variants now render with the expected red/blue tints on both surfaces and in both help panels. No functional or API changes observed.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/inventory/purchase-orders
   3. http://127.0.0.1:4202/inventory/purchase-orders/9
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.650 seconds] - 2026-05-27T13:47:40.430Z
Lazy chunk files | purchase-orders-component | 72.78 kB
Application bundle generation complete. [0.553 seconds] - 2026-05-27T13:47:42.354Z
Lazy chunk files | purchase-order-detail-component | 54.80 kB
```

Puppeteer evidence (`tmp/test-po-status-badges.mjs`): list help `submitted` color `rgb(59, 130, 246)`; list/detail `cancelled` `rgb(220, 38, 38)`; detail info-card badge matches list for PO #9.
