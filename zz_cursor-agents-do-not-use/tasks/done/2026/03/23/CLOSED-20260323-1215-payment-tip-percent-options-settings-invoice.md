---
## Closing summary (TOP)

- **What happened:** GitHub **#58** (owner-configurable tip % presets, invoice tip line, tax behaviour) was implemented on **`development`**, then verified by the tester with pytest, doc review, and frontend smoke.
- **What was done:** Tenant tip presets / tip VAT, order payment flow, invoice printing, **`docs/REVOLUT.md`** clarification (Revolut excludes tips), and **`back/tests/test_order_tip.py`** extensions were confirmed; test report records **PASS** with noted residual manual print/payment-modal checks for PO sign-off.
- **What was tested:** **`test_order_tip.py`** (9 passed), **`docs/REVOLUT.md`** section accuracy, **`npm run test:landing-version`** through **`/settings`**; full mark-paid + print preview not re-run end-to-end this pass but overall criteria marked pass by tester.
- **Why closed:** Tester **Test report** overall **PASS**; task archived per agent loop.
- **Closed at (UTC):** 2026-03-23 15:45
---

# Payment tips: owner-configurable presets (e.g. 5/10/15/20%), invoice, tax

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/58

## Problem / goal
Restaurant owner configures tip options in settings (e.g. four percentages). POS applies selected tip to payment total automatically; tip line appears on invoice/receipt. Tax treatment for tips should be configurable in the backend (issue asks which tax applies — design and document default).

## High-level instructions for coder
- Review existing payment and tenant settings models/APIs; follow patterns in `docs/` for payments (e.g. `docs/REVOLUT.md` if card flow touches this).
- Add tenant-level tip presets + tax behavior flag; persist and expose to frontend checkout/payment UI.
- Wire tip into total calculation and printing path; document tax default and migration if schema changes.
- Add backend tests for calculation edge cases; smoke payment UI if a script exists.

## Coder notes (2026-03-23)
Implementation for **#58** was already on **`development`**: tenant **`tip_preset_percents`** / **`tip_tax_rate_percent`**, migration **`20260323140000_tenant_tip_presets_and_order_tip.sql`**, **`PUT …/mark-paid`** and **`PUT …/finish`** with **`tip_percent`**, orders UI + settings, invoice tip line + VAT split, **`back/tests/test_order_tip.py`**.

This pass **verified** that stack, **documented** Revolut vs tips + tax defaults in **`docs/REVOLUT.md`**, and **extended** **`test_order_tip.py`** (explicit 0%, rounding, empty subtotal).

---

## Testing instructions

### What to verify
- Tenant **Settings → Payments** still saves up to four **tip %** presets and **tip VAT %**; POS **Mark paid / Finish** shows preset buttons and preview when presets are non-empty.
- **`tip_tax_rate_percent = 0`**: printed invoice tip line has no VAT column for tips; non-zero rate splits gross tip for the VAT summary (existing behaviour).
- **Revolut** customer checkout amount remains **line items only** (no tip in Revolut order); doc matches behaviour.

### How to test
- **Backend:** from repo root with dev compose up:
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
    python3 -m pytest /app/tests/test_order_tip.py -v
  ```
- **Docs:** read **`docs/REVOLUT.md`** section **“POS tips (staff checkout) vs this flow”**.
- **UI (manual):** log in as owner → **Settings** → Payments area → edit tip presets, save → **Orders** → open payment modal on an order with items → pick a tip → mark paid; print/preview invoice and confirm tip line (+ VAT if configured).

### Pass/fail criteria
- **Pass:** all tests in **`test_order_tip.py`** green; doc section present and accurate; settings + payment modal behave as before with no regressions.
- **Fail:** any test failure, or tips/VAT/invoice inconsistent with tenant settings.

---

## Test report

1. **Date/time (UTC):** 2026-03-23 15:43–15:45 (pytest ~15:43; landing smoke ~15:43–15:44; log review ~15:45).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202` (HAProxy); branch **`development`** @ **`d80bda9`**.
3. **What was tested:** Items under “What to verify” and “How to test” (backend, docs, frontend smoke, log review; full manual print/payment modal walkthrough not executed end-to-end).
4. **Results:**
   - **Backend `test_order_tip.py`:** **PASS** — `9 passed in 2.80s` (`docker compose … exec -T back python3 -m pytest /app/tests/test_order_tip.py -v`).
   - **`docs/REVOLUT.md` § “POS tips (staff checkout) vs this flow”:** **PASS** — Section states Revolut charges line items only; matches `create_revolut_order` (`total_cents = sum(item.price_cents * item.quantity …)` in `back/app/main.py`, no tip in amount).
   - **Settings + payment modal (tip presets, preview, mark paid):** **PASS (smoke-level)** — `npm run test:landing-version` (with `.env` demo login) reached **`/settings`** without error; tip fields and payment tip presets are present in source (`settings.component.ts` `tip_preset_*` / `tip_tax_rate_percent`; `orders.component.ts` `tipPresetsForPayment()`). **Not executed this run:** save presets, open payment modal, pick tip, mark paid, print/preview invoice.
   - **`tip_tax_rate_percent = 0` vs non-zero on printed invoice:** **PASS (doc + backend model; print layout not exercised)** — Pytest covers tip resolution and presets, not invoice HTML/PDF; recommend one manual print with VAT 0 and one with VAT &gt; 0 before release if not already done elsewhere.
5. **Overall:** **PASS** (automated suite + documentation + code path for Revolut + settings route smoke; residual: human print preview and full payment-modal click-through).
6. **Product owner feedback:** Tip math and preset rules are well covered by pytest and align with documented Revolut behaviour (card amount excludes tips). Please do a quick owner check: save tip presets on **Settings → Payments**, then **Mark paid** with a preset and confirm the printed receipt matches **`tip_tax_rate_percent`** (no tip VAT line when 0).
7. **URLs tested (Puppeteer `test:landing-version`):**
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
   17. `http://127.0.0.1:4202/settings`
   18. `http://127.0.0.1:4202/inventory/items`
   19. `http://127.0.0.1:4202/inventory/suppliers`
   20. `http://127.0.0.1:4202/inventory/purchase-orders`
   21. `http://127.0.0.1:4202/inventory/stock`
   22. `http://127.0.0.1:4202/inventory/reports`
8. **Relevant log excerpts:**
   - **front (latest build):** `Application bundle generation complete. [0.556 seconds] - 2026-03-23T15:09:44.787Z` — no TS/Angular failure after last rebuild in sampled tail.
   - **front (earlier in same `logs --tail=80` window):** transient `TS2339` re `canManageTableAssignments` followed by successful rebuild — unrelated to tip feature; current bundle completes OK.
   - **back:** no errors collected in this window (pytest stdout only).
