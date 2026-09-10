---
## Closing summary (TOP)

- **What happened:** Issue #196 requested showing the organization name beside the POS brand in the sidebar, with single-line truncation for long names.
- **What was done:** The coder wired tenant display name from `/tenant/settings` into the sidebar/desktop and mobile headers with ellipsis CSS; the tester confirmed behavior against the task.
- **What was tested:** Local Docker stack, `test:landing-version` smoke, sidebar branding, long-name ellipsis, tooltips and aria — overall **PASS**.
- **Why closed:** Tester test report marked overall PASS with all listed checks passing.
- **Closed at (UTC):** 2026-04-27 08:05
---

# Add Organization Name with Text Truncation

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/196
- **196**

## Problem / goal
Show the organization name next to the POS brand in the sidebar logo area (e.g. `POS (Organization Name)`). Long names must not wrap or overlap adjacent UI; truncate with ellipsis within the sidebar layout.

## High-level instructions for coder
- Locate the sidebar / shell branding markup where the logo text is rendered and include the tenant or organization display name as specified in the issue (parenthetical style).
- Apply CSS on the `.logo` (or equivalent) class so long labels stay on one line and truncate with ellipsis: `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`, and a constrained width (`max-width` tuned to the sidebar — issue suggests ~150px as a starting point).
- Prefer existing tenant/org fields and i18n patterns used elsewhere for staff UI; avoid hard-coded placeholder strings in production templates.
- Verify at narrow sidebar widths and with a very long organization name that layout remains stable and readable.

## Implementation summary
- **`ApiService`:** `tenantDisplayName` signal set from **`GET/PUT /tenant/settings`** (`name`); cleared on logout.
- **`SidebarComponent`:** Desktop sidebar `.logo` and mobile `.header-title` render `POS ({{ tenant name }})` when name is non-empty; `brandTitle()` for `title` / `aria-label`.
- **`sidebar.component.scss`:** `.logo-container` flex shrink; `.logo` ellipsis + `max-width: min(150px, 100%)`; `.header-title` ellipsis for narrow top bar.

## Testing instructions
1. Start stack; open staff app (e.g. `http://127.0.0.1:4202`), log in as tenant staff.
2. Ensure **Settings** has **Organization / tenant name** set; reload — sidebar header should show `POS (that name)`. Mobile header should match.
3. Set name to a very long string — single line with ellipsis; hover shows full string via native tooltip.
4. Automated (`.env` with demo login):  
   `SKIP_LANDING_PACKAGE_VERSION_CHECK=1 BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`  
   Expect exit 0 and sidebar nav clicks OK.

---

## Test report

1. **Date/time (UTC):** 2026-04-27 08:02 UTC (session); automated smoke ~07:56–07:57 UTC; extended brand/ellipsis checks ~07:58–08:02 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **BASE_URL** `http://127.0.0.1:4202`; branch **development** (synced via `./scripts/git-sync-development.sh`). Demo login from repo `.env` (tenant=1).
3. **What was tested:** Items in **Testing instructions** plus DOM/CSS checks for `POS (organization)` in `.logo`, native `title` / `aria-label`, and ellipsis when the organization name is very long (then restored original name via Settings save).
4. **Results:**
   - **Stack / reachability:** **PASS** — `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4202/` → 200.
   - **Automated smoke (`test:landing-version`):** **PASS** — exit 0; landing semver check skipped via `SKIP_LANDING_PACKAGE_VERSION_CHECK=1`; login + 16 sidebar routes + 5 inventory sublinks OK.
   - **Sidebar shows `POS (tenant name)` when Settings name is set:** **PASS** — Puppeteer read `#name` = `Cobalto`; `aside.sidebar .logo` innerText `POS (Cobalto)`; `title` / `aria-label` match full brand string.
   - **Long name: single line, ellipsis CSS, tooltip with full string:** **PASS** — Temporarily saved a 200+ character organization name; `scrollWidth` > `clientWidth`, `text-overflow: ellipsis`, `title` contained full long name; then saved original name back successfully.
   - **`pos-front` / `pos-back` logs (test window):** **PASS** — No Angular/TS build errors in front tail; back showed normal 200s; one 409 on a resource during nav (non-fatal; smoke completed).
5. **Overall:** **PASS**
6. **Product owner feedback:** Staff now see the restaurant or organization name next to the POS brand in the sidebar, matching Settings. Very long names stay on one line with ellipsis so the layout does not break; users can still read the full name from the tooltip and assistive attributes. No production deploy was required for this verification (local Docker only).
7. **URLs tested (full):**
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/login?tenant=1`
   3. `http://127.0.0.1:4202/dashboard`
   4. `http://127.0.0.1:4202/my-shift`
   5. `http://127.0.0.1:4202/staff/orders`
   6. `http://127.0.0.1:4202/reservations`
   7. `http://127.0.0.1:4202/guest-feedback`
   8. `http://127.0.0.1:4202/tables`
   9. `http://127.0.0.1:4202/kitchen`
   10. `http://127.0.0.1:4202/bar`
   11. `http://127.0.0.1:4202/customers`
   12. `http://127.0.0.1:4202/products`
   13. `http://127.0.0.1:4202/catalog`
   14. `http://127.0.0.1:4202/reports`
   15. `http://127.0.0.1:4202/working-plan`
   16. `http://127.0.0.1:4202/users`
   17. `http://127.0.0.1:4202/contracts`
   18. `http://127.0.0.1:4202/settings`
   19. `http://127.0.0.1:4202/inventory/items`
   20. `http://127.0.0.1:4202/inventory/suppliers`
   21. `http://127.0.0.1:4202/inventory/purchase-orders`
   22. `http://127.0.0.1:4202/inventory/stock`
   23. `http://127.0.0.1:4202/inventory/reports`
8. **Relevant log excerpts:**  
   - Puppeteer smoke ended with: `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.`  
   - Front (last 5m, errors): none matched `error|TS|NG` in grep.  
   - Extended check: confirmed CSS `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`, `max-width: min(150px, 100%)` on `.logo` before long-name experiment; after long-name save, `scrollWidth` > `clientWidth` and full string present on `title`.
