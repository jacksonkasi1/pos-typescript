---
## Closing summary (TOP)

- **What happened:** Public delivery-checkout Puppeteer smoke falsely passed the cart step on menu “View cart / Ver carrito” copy, then failed with `Could not open address step from cart`.
- **What was done:** Hardened `front/scripts/test-delivery-checkout.mjs` to wait for `ul.delivery-cart-list` and click `.delivery-actions button.btn-primary` for Continue to address.
- **What was tested:** Local smoke on tenant 1 (`BASE_URL=http://127.0.0.1:4202`) — Cart step OK, Order create OK (id 2040), public-menu delivery CTA OK; overall PASS (exit 0).
- **Why closed:** All pass/fail criteria met; harness no longer false-passes on menu cart copy.
- **Closed at (UTC):** 2026-07-25 18:48
---

# Fix public delivery-checkout Puppeteer cart → address harness

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Public Satisfecho Delivery create is fixed (#304) and covered by pytest, but **`front/scripts/test-delivery-checkout.mjs`** still **FAIL**s after “Cart step OK” with **`Could not open address step from cart`**. The cart assertion is a false positive: `/cart|…|carrito/` matches menu copy like **View cart / Ver carrito**, so the script never waits for the real cart step and then cannot find a Continue/address `button.btn-primary`. Agents keep citing this smoke as pass/fail for delivery work while the harness is broken.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:33Z: SIGNAL `docs_stale` / `changelog_sparse` already owned; `demo_tables_check=ok`; follow-on from closed **`CLOSED-304-…-resolve-tenantproduct-ids-satisfecho-delivery-checkout`** Test report (Puppeteer FAIL, harness flake, not create 400)
- Script: `front/scripts/test-delivery-checkout.mjs` (~L89–108) — cart regex then `button.btn-primary` Continue/address loop
- Alias/index owned elsewhere: **`NEW-0-20260722-1142-…`**, **`NEW-0-20260723-1801-retarget-delivery-checkout-smoke-index`** — do **not** merge; this task is **harness behavior only**
- Staff UI smoke is **`NEW-0-20260723-1918-staff-satisfecho-delivery-puppeteer-smoke`** — out of scope

## High-level instructions for coder

- Harden cart-step detection: wait for a cart-step-specific selector or copy that cannot match the menu “View cart” control (e.g. cart line list / cart-step container / Continue control that appears only after navigation)
- Then click Continue/address and keep address → create → pay assertions; keep public-menu delivery CTA check
- Do not weaken create assertions; do not invent new product UI
- Pass/fail: `BASE_URL=http://127.0.0.1:4202 TENANT_ID=1 node front/scripts/test-delivery-checkout.mjs` exits 0 on a tenant with at least one menu item (no `Could not open address step from cart`)

## Implementation notes (coder)

- Updated `front/scripts/test-delivery-checkout.mjs` only (harness; no product UI changes).
- After clicking `button.delivery-cart-btn`, wait for `ul.delivery-cart-list` (cart step only; does not match menu “View cart”).
- Click `.delivery-actions button.btn-primary` (Continue to address) instead of scanning all `button.btn-primary` by label.
- Local verify 2026-07-25: `BASE_URL=http://127.0.0.1:4202 TENANT_ID=1 node front/scripts/test-delivery-checkout.mjs` → PASS (Cart step OK, Order create OK, public-menu CTA OK).

## Testing instructions

### What to verify
- Public delivery checkout smoke advances menu → real cart step → address → create order → pay UI, then confirms public-menu delivery CTA.
- Script must not report a false “Cart step OK” while still on the menu (View cart / Ver carrito), and must not fail with `Could not open address step from cart`.

### How to test
```bash
# App up via docker compose (HAProxy :4202)
BASE_URL=http://127.0.0.1:4202 TENANT_ID=1 node front/scripts/test-delivery-checkout.mjs
```
Tenant 1 needs at least one public menu item (demo products). Optional: `HEADLESS=0` to watch the browser.

### Pass/fail criteria
- **Pass:** exit 0; logs include `Cart step OK`, `Order create OK`, `public-menu delivery CTA OK`, `PASS`.
- **Fail:** exit non-zero; `Could not open address step from cart`; create HTTP ≠ 200; missing public-menu `/delivery/` CTA; raw `DELIVERY_CHECKOUT.*` i18n keys on page.

## Test report

1. **Date/time (UTC):** 2026-07-25T18:47:16Z start → 2026-07-25T18:47:27Z end. Log window: `docker logs --since 2026-07-25T18:47:00Z`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; `TENANT_ID=1`; `HEADLESS=1`; branch `development` @ `8698ac59`.
3. **What was tested:** Public delivery checkout smoke: menu → real cart step (`ul.delivery-cart-list`) → address → create order → pay UI; public-menu `/delivery/` CTA. Confirmed harness no longer false-passes on “View cart / Ver carrito”.
4. **Results:**
   - Cart step reaches real cart (not menu copy); no `Could not open address step from cart` — **PASS** (stdout: `Cart step OK`; exit 0)
   - Address → create order HTTP 200 with id/token — **PASS** (`Order create OK (id= 2040 )`; back: `POST /public/tenants/1/satisfecho-delivery` 200)
   - Public-menu delivery CTA — **PASS** (`public-menu delivery CTA OK`)
   - Overall script — **PASS** (exit 0, final `PASS`)
5. **Overall:** **PASS**
6. **Product owner feedback:** The delivery-checkout Puppeteer harness now waits for the cart-step list before Continue, so agents can trust this smoke again for public Satisfecho Delivery. Create and public-menu CTA checks still hold on local demo tenant 1.
7. **URLs tested:**
   1. http://127.0.0.1:4202/delivery/1
   2. http://127.0.0.1:4202/menu/1 (public-menu CTA check)
8. **Relevant log excerpts:**
   ```
   # script stdout
   Open http://127.0.0.1:4202/delivery/1
   Cart step OK
   Order create OK (id= 2040 )
   public-menu delivery CTA OK
   PASS

   # pos-back
   POST /public/tenants/1/satisfecho-delivery HTTP/1.1" 200 OK

   # pos-haproxy
   GET /delivery/1 HTTP/1.1" 200
   POST /api/public/tenants/1/satisfecho-delivery HTTP/1.1" 200
   ```
   pos-front: no TS/NG errors in window.
