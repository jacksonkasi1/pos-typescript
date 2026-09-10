---
## Closing summary (TOP)

- **What happened:** Docs for Customers (Invoice) lagged the Operations sidebar move after #290.
- **What was done:** Updated `docs/0017-billing-customers-factura.md` Access to say open **Operations → Customers (Invoice)** (`/customers`), not under Catalog & inventory.
- **What was tested:** Doc Access bullet, unchanged Factura sections, and sidebar/`en.json` cross-check — **PASS** (docs-only; no browser).
- **Why closed:** All pass/fail criteria met; no product code changes required.
- **Closed at (UTC):** 2026-07-26 07:33
---

# Align docs/0017 Customers nav with Operations sidebar

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**Customers (Invoice)** (`/customers`) was moved under the staff sidebar **Operations** group (#290). **`docs/0017-billing-customers-factura.md`** still describes the Customers page without saying where it lives in the grouped nav, so operators looking under Catalog & inventory miss it.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: docs-vs-code / UX polish after `SIGNAL docs_stale` (0017 not in the >90d SIGNAL list but nav drift is real)
- CLOSED-290 / CHANGELOG: Customers under Operations alongside tables and kitchen/bar
- `docs/0017-billing-customers-factura.md` § Customers page — Access/list only; no Operations vs Catalog cue
- Scope: **0017 only** (+ optional one-line `docs/README.md` index if it implies Catalog placement) — no product code

## High-level instructions for coder

- In **`docs/0017-billing-customers-factura.md`** § Customers page, add one sentence: open **Operations → Customers (Invoice)** (`/customers`); not under Catalog & inventory
- Keep the rest of the Factura guide unchanged
- Pass/fail: doc matches current sidebar grouping; no Angular/backend edits

## Implementation notes (coder)

- Updated **Access** under § Customers page in `docs/0017-billing-customers-factura.md`: open **Operations → Customers (Invoice)** (`/customers`); not under Catalog & inventory.
- Confirmed against `front/src/app/shared/sidebar.component.ts` (Customers under Operations) and `NAV.CUSTOMERS` = “Customers (Invoice)” in `en.json`.
- `docs/README.md` Feature guides 0017 row does not imply Catalog placement — left unchanged.

## Testing instructions

### What to verify

- `docs/0017-billing-customers-factura.md` § Customers page states the page is under **Operations → Customers (Invoice)** and not under Catalog & inventory.
- Rest of the Factura guide is unchanged (Print Factura, Backend, i18n, VeriFactu pointer).
- No product code changes (`back/`, `front/`).

### How to test

```bash
# From repo root
rg -n 'Operations → Customers \(Invoice\)|Catalog & inventory' docs/0017-billing-customers-factura.md
# Expect Access bullet to mention Operations → Customers (Invoice) and not Catalog & inventory

# Optional: confirm sidebar still groups /customers under Operations
rg -n 'routerLink="/customers"|GROUP_OPERATIONS|canViewCustomers' front/src/app/shared/sidebar.component.ts
```

### Pass/fail criteria

- **Pass:** Access bullet documents Operations → Customers (Invoice) (`/customers`) and explicitly says not under Catalog & inventory; no Angular/backend edits in this task.
- **Fail:** Nav cue missing, wrong group name/label, or unrelated Factura sections rewritten.

## Test report

1. **Date/time (UTC):** 2026-07-26 07:32:25 – 07:32:35 UTC. Log window N/A (docs-only; no app runtime checks required).
2. **Environment:** Local repo on branch `development` @ `8e7306e3`. Compose up (`pos-front`/`pos-back` healthy). No `BASE_URL` browser run.
3. **What was tested:** Access bullet in `docs/0017-billing-customers-factura.md` § Customers page; rest of Factura sections left intact; sidebar still groups `/customers` under Operations; no `back/`/`front/` edits for this task.
4. **Results:**
   - Access documents **Operations → Customers (Invoice)** (`/customers`) and **not** under Catalog & inventory — **PASS** (`rg` hit line 16; matches working-tree Access bullet).
   - Rest of guide unchanged (Print Factura, Backend, i18n, VeriFactu) — **PASS** (`git diff` shows only the Access line under § Customers page).
   - No product code changes — **PASS** (`git status` clean for `back/` and `front/`; sidebar still has `routerLink="/customers"` under `NAV.GROUP_OPERATIONS`; `NAV.CUSTOMERS` = “Customers (Invoice)” in `en.json`).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators looking for billing customers will now find the correct Operations sidebar path in 0017 instead of hunting under Catalog. The one-line Access update is enough; no product change needed.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification (`rg` + `git diff` + sidebar/`en.json` cross-check). Note: `docs/0017-billing-customers-factura.md` is modified in the working tree but not yet committed; content under test is present and correct.
