---
## Closing summary (TOP)

- **What happened:** The create purchase order modal footer **Order total** stayed at 0.00 while line totals updated, because `orderTotal` was a `computed()` that did not depend on reactive form value changes.
- **What was done:** In `purchase-orders.component.ts`, bridged `createForm.valueChanges` into signals with `toSignal(..., startWith(getRawValue()))` and read `createFormValues()` inside the existing `orderTotal` computed so the footer re-sums on every qty/cost/line edit.
- **What was tested:** Staff flow on `http://127.0.0.1:4202` — create PO modal with two lines, qty/cost edits, line removal; footer matched line totals immediately; front bundle for `purchase-orders-component` clean — **PASS** (tester report 2026-05-27 UTC).
- **Why closed:** All acceptance criteria and test report **PASS**; fix fully delivered for issue #223.
- **Closed at (UTC):** 2026-05-27 09:47
---

# Fix purchase order modal footer total stuck at zero

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/223
- **223**

## Problem / goal
On the create purchase order modal (`purchase-orders.component`), per-line totals update when quantity or unit cost changes, but the footer **Order total** stays at **0.00** until unrelated UI changes occur.

Root cause: `orderTotal` is an Angular `computed()` that reads `FormArray` control values via `getItemTotal()`. Reactive form value changes are not signal dependencies, so the computed does not re-run when the user edits qty/cost.

## Implementation summary
- `purchase-orders.component.ts`: bridge `createForm.valueChanges` into signals via `toSignal(..., startWith(getRawValue()))`, and read `createFormValues()` inside the existing `orderTotal` computed so the footer sum re-runs on every form edit (add/remove lines, qty, unit cost, item selection patch).

## High-level instructions for coder
- In `front/src/app/inventory/purchase-orders/purchase-orders.component.ts`, make the footer total react to form edits (issue suggests a method or `valueChanges`).
- Prefer a small fix aligned with existing patterns: e.g. `toSignal`/`valueChanges` on `createForm` or `items` array, a dedicated `signal` updated on `valueChanges`, or a template method that sums line totals (ensure change detection runs on input).
- Keep per-line `getItemTotal(i)` logic consistent with footer sum (cents via `Math.round(qty * costDollars * 100)`).
- Manually verify: open create PO modal, add lines, change quantity and unit cost — footer total must match sum of line totals immediately.
- Check `docker compose … logs front` for a clean bundle after edits; no new i18n keys expected unless copy changes.

## Testing instructions
1. Log in as staff with inventory access; open **Inventory → Purchase orders**.
2. Click **Create purchase order**; select a supplier; **Add item** at least twice.
3. Set quantity and unit cost on each line — confirm each line **Total** and the footer **Order total** update immediately (footer = sum of line totals).
4. Change qty/cost again; add/remove a line — footer must stay in sync without clicking elsewhere.
5. `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=30 front` — no TS/build errors (bundle completed for `purchase-orders-component`).

---

## Test report

1. **Date/time (UTC):** 2026-05-27 09:42–09:46 UTC. Log window: front container logs `--since 15m` through 09:46 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development`.
3. **What was tested:** Create PO modal — line totals vs footer **Order total** on qty/cost edits and after removing a line; front bundle for `purchase-orders-component`.
4. **Results:**
   - Login + open **Inventory → Purchase orders** — **PASS** (owner demo user reached `/inventory/purchase-orders`).
   - Create modal, supplier, two lines, qty/cost — footer equals sum immediately (€40.00 = €31.50 + €8.50) — **PASS**.
   - Change qty on first line — footer updates without extra clicks (€61.00 = €52.50 + €8.50) — **PASS**.
   - Remove one line — footer matches single line (€8.50) — **PASS**.
   - `docker compose … logs front` — **PASS** (`Application bundle generation complete`, `purchase-orders-component` chunk, no TS/build errors in window).
5. **Overall:** **PASS**
6. **Product owner feedback:** The create purchase order modal now shows a correct **Order total** as soon as quantities and unit costs change, matching the line totals users already see. Removing a line updates the footer immediately; no workaround clicks are needed.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/inventory/purchase-orders
8. **Relevant log excerpts:**

```
pos-front  | chunk-MMDPZTNE.js   | purchase-orders-component | 59.43 kB |
pos-front  | Application bundle generation complete. [0.885 seconds] - 2026-05-27T09:39:25.655Z
pos-front  | chunk-L7NEMMLN.js   | purchase-orders-component | 59.82 kB |
pos-front  | Application bundle generation complete. [0.538 seconds] - 2026-05-27T09:39:29.325Z
```

**Evidence:** Puppeteer script `tmp/test-po-modal-total-223.mjs` (local one-off, not committed).
