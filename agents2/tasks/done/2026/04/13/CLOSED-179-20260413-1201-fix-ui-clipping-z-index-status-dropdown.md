---
## Closing summary (TOP)

- **What happened:** Orders **status** dropdowns were clipped or covered by adjacent order cards (stacking / overflow), blocking staff from seeing or clicking actions.
- **What was done:** Layering was fixed so open menus render in a high stacking layer (`z-index` 10000), cards get **`status-dropdown-open`** when a line-item menu is open, and verification confirmed hit targets and visibility on busy lists.
- **What was tested:** Tester ran Puppeteer on dev **`http://127.0.0.1:4202`**: order footer and line-item dropdowns above the next card, optional **`test:landing-version`** — **all PASS** (report **2026-04-13 12:07:30 UTC**).
- **Why closed:** All testing criteria met; overall **PASS**.
- **Closed at (UTC):** 2026-04-13 12:09
---

# Fix UI clipping and z-index overlap on status dropdown

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/179
- **179**

## Problem / goal
In **Orders**, the per-order **status** dropdown (`.status-dropdown` in the orders UI) is visually wrong: options can sit **under** the next card’s badges (e.g. “Pendiente”) or be **clipped** by a parent, so actions like “Retroceder”, “Avanzar”, “Listo” are hard to see or use. The report suggests a **stacking context** problem and/or **`overflow: hidden`** on an ancestor, despite a high z-index on the dropdown.

## High-level instructions for coder
- Inspect **orders** view markup/CSS for `.status-dropdown` and its ancestors (overflow, transform, isolation, stacking).
- Fix layering so the open menu reliably appears **above** adjacent cards and is not clipped; prefer minimal CSS/HTML changes aligned with existing patterns (e.g. portal/overlay, raising stacking context when open, or adjusting `overflow` only where safe).
- Manually verify on a busy Orders list: open the status menu on several rows and confirm all options are visible and clickable.
- If relevant, note any follow-up for docs or i18n; keep scope to this visual bug.

## Testing instructions

1. Start the dev stack (e.g. HAProxy on **4202**). Log in as staff and open **Orders** (`/staff/orders`).
2. With **at least two** active order cards visible, open the **order** footer status dropdown on the upper card; confirm all options (e.g. go back / forward) sit **above** the next card and are fully clickable (no badges from the card below covering the menu).
3. Open a **line item** status dropdown on an order that has another card below it; confirm the same—the card must stay visually on top while the item menu is open (this path previously did not apply `status-dropdown-open`).
4. Smoke (optional): `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`

---

## Test report

1. **Date/time (UTC):** 2026-04-13 — verification started ~12:06 UTC; report finalized **2026-04-13 12:07:30 UTC**. Log window for container checks: ~12:03–12:08 UTC.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; HAProxy **`BASE_URL=http://127.0.0.1:4202`**. Git branch **`development`**, commit **`39eb4c2`**.

3. **What was tested:** Items 1–4 from **Testing instructions** above (Orders page, order footer + line-item status dropdowns, optional landing smoke).

4. **Results:**
   - **Dev stack reachable on 4202 / staff login / Orders page:** **PASS** — `HEADLESS=1` Puppeteer flows reached `/staff/orders` and exercised dropdowns.
   - **Order footer status dropdown above adjacent card (clickable, not covered):** **PASS** — `document.elementsFromPoint` at center of a footer dropdown action hit a node inside the open `.status-dropdown` (not the card below); computed `z-index` **10000** on the dropdown.
   - **Line item `.item-status-dropdown` + `.status-dropdown-open` on card:** **PASS** — line-item menu opened; first `.order-card` had class **`status-dropdown-open`**; same hit-test **PASS** with `z-index` **10000**.
   - **Optional smoke `test:landing-version`:** **PASS** — exit code 0; ended **2026-04-13T12:06:50.737Z** (see landing script output: “Landing version OK; demo login (tenant=1) OK; sidebar nav OK”).

5. **Overall:** **PASS** (all criteria met).

6. **Product owner feedback:** Status menus on Orders now paint in a consistent high stacking layer so staff can change order and line status without the next card’s badges blocking clicks. Automated checks matched the reported fix (high z-index and correct hit targets). No production URL was required for this scope.

7. **URLs tested (numbered):**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/staff/orders`
   3. `http://127.0.0.1:4202/` (landing smoke / nav)

8. **Relevant log excerpts:** `pos-front` (UTC ~12:03): `Application bundle generation complete. [0.784 seconds] - 2026-04-13T12:03:13.449Z` — no build errors in window. No backend errors required for this UI verification.
