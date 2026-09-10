---
## Closing summary (TOP)

- **What happened:** Staff Satisfecho Delivery create/edit on `/staff/orders` had pytest coverage but no Puppeteer UI smoke.
- **What was done:** Added `front/scripts/test-staff-delivery.mjs`, npm alias `test:staff-delivery`, and a short row in `docs/testing.md` for the staff happy path (create + edit delivery metadata).
- **What was tested:** Local smoke on `BASE_URL=http://127.0.0.1:4202` passed (create order id 2338, edit 200; alias/docs via `rg`); overall **PASS**.
- **Why closed:** All pass/fail criteria met; tester handed off for archive.
- **Closed at (UTC):** 2026-07-25 21:57
---

# Add Puppeteer smoke for staff Satisfecho Delivery create/edit

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Staff can create and edit first-party **Satisfecho Delivery** orders on **`/staff/orders`** (channel, address, phone, courier assign) — shipped and covered by pytest — but there is **no** Puppeteer smoke for that staff UI path. Public **`test-delivery-checkout.mjs`** and courier **`test:courier-actions`** do not exercise staff create/edit. Regressions in the staff form or channel badge only show up manually.

## Evidence (008 preflight / review)

- SIGNAL docs/changelog themes already queued; product gap from Jul delivery commits (**2.1.24+** staff UI, **#299** closed)
- `front/scripts/`: `test-delivery-checkout.mjs` (public), `test-courier-actions.mjs` — no `test-staff-delivery*.mjs`
- `rg 'staff.*delivery|satisfecho-delivery' front/scripts/*.mjs` → public/courier only
- Open index/alias tasks cover public delivery + platform; none own a **staff** delivery smoke
- NEW backlog is deep — keep this to a **small** smoke (happy path), not a full FEAT rewrite

## High-level instructions for coder

- Add **`front/scripts/test-staff-delivery.mjs`** (or similar) that logs in as demo staff/admin, opens orders, creates (or opens) a Satisfecho Delivery order with address/phone, optionally assigns/clears courier if UI allows, and asserts channel badge / success without console errors
- Add **`test:staff-delivery`** alias in **`front/package.json`** and a short row in **`docs/testing.md`** (env: `BASE_URL`, `LOGIN_EMAIL` / `LOGIN_PASSWORD`)
- Reuse patterns from `test-delivery-checkout.mjs` / `test-courier-actions.mjs`; do not duplicate public checkout or courier Mine-tab coverage
- Pass/fail: `BASE_URL=http://127.0.0.1:4202 npm run test:staff-delivery --prefix front` exits 0 with credentials; docs list the alias

## Coder notes (2026-07-25)

- Added `front/scripts/test-staff-delivery.mjs`: login → `/staff/orders` → New delivery order (address/phone/customer + product + optional courier) → POST `/orders/satisfecho-delivery` → Delivery tab channel badge/address → Edit delivery phone → PUT `/orders/{id}/delivery`.
- npm alias `test:staff-delivery` in `front/package.json`.
- Documented under **2a3** and npm alias table in `docs/testing.md`.
- Local run: `BASE_URL=http://127.0.0.1:4202 npm run test:staff-delivery --prefix front` → **PASS** (create id observed, edit 200).

## Testing instructions

### What to verify

- Staff can create a Satisfecho Delivery order from `/staff/orders` and see it on the Delivery tab with channel badge.
- Staff can edit delivery metadata (phone) and the list reflects the change.
- `test:staff-delivery` is listed in `docs/testing.md` and `front/package.json`.

### How to test

```bash
# App up via HAProxy (dev overlay), credentials from .env DEMO_LOGIN_* or LOGIN_*
BASE_URL=http://127.0.0.1:4202 npm run test:staff-delivery --prefix front

# Or explicit:
BASE_URL=http://127.0.0.1:4202 TENANT_ID=1 \
  LOGIN_EMAIL=… LOGIN_PASSWORD=… \
  npm run test:staff-delivery --prefix front
```

Optional: `HEADLESS=0` to watch the browser. Confirm docs:

```bash
rg -n 'test:staff-delivery|test-staff-delivery' front/package.json docs/testing.md
```

### Pass/fail criteria

- **Pass:** Script exits **0**; logs include create OK and edit OK; no raw `ORDERS.*` i18n keys on the orders UI; `rg` finds the npm alias and testing.md section/row.
- **Fail:** Login stuck on `/login`, missing New delivery button, create/edit HTTP ≥400, channel badge/address missing, or script/docs alias absent.

## Test report

1. **Date/time (UTC):** 2026-07-25 21:56:11 start → 21:56:38 end. Log window: ~15m before end.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development`; `HEADLESS=1`; `TENANT_ID=1`; credentials via `DEMO_LOGIN_*` / `LOGIN_*` from env.
3. **What was tested:** Staff Satisfecho Delivery create + edit smoke (`npm run test:staff-delivery`); docs/alias presence via `rg`.
4. **Results:**
   - Create delivery order from `/staff/orders` + Delivery tab channel badge/address — **PASS** (order id 2338; script: “Delivery list shows Satisfecho Delivery / address”; back: `POST /orders/satisfecho-delivery` 200).
   - Edit delivery phone reflected on list — **PASS** (script: “Edit OK: 200”, “Updated phone visible”; back: `PUT /orders/2338/delivery` 200).
   - `test:staff-delivery` in `front/package.json` and `docs/testing.md` — **PASS** (`rg` hits package.json:46; testing.md:159–160, 472).
   - Script exit 0 / create+edit OK in output — **PASS** (`>>> RESULT: Staff Satisfecho Delivery smoke OK (create + edit)`).
5. **Overall:** **PASS**
6. **Product owner feedback:** Staff delivery create/edit now has an automated UI smoke covering the happy path that pytest alone missed. Alias and docs are discoverable for future agent/human runs. Ready for closer archive.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login (staff login)
   2. http://127.0.0.1:4202/dashboard (post-login)
   3. http://127.0.0.1:4202/staff/orders (create/edit Satisfecho Delivery)
8. **Relevant log excerpts:**
   - pos-back: `POST /orders/satisfecho-delivery HTTP/1.1" 200 OK`
   - pos-back: `PUT /orders/2338/delivery HTTP/1.1" 200 OK`
   - pos-front: no TS/NG build failures in window (only pre-existing NG8107 optional-chain warnings)
   - script stdout: `Create OK, order id: 2338` / `Edit OK: 200` / `RESULT: Staff Satisfecho Delivery smoke OK`

**GitHub:** Issue **0** / none — no issue labels or comments updated.
