---
## Closing summary (TOP)

- **What happened:** First-slice end-user customer accounts (register/login/verify/orders home) were implemented and handed off for verification.
- **What was done:** Shipped `customer` table + `/customer/*` API and SPA routes with a separate `customer_access_token`; docs/CHANGELOG/tests updated; MFA, self-serve invoices, and order auto-link deferred.
- **What was tested:** Migrate, 7 pytest, API smoke (401/201), Puppeteer register→login→empty orders, staff Factura intact, front build — overall **PASS** (email verify skipped when PUBLIC_APP_BASE_URL unset).
- **Why closed:** All pass criteria for the agreed first slice passed.
- **Closed at (UTC):** 2026-07-31 12:06
---

# Signup enhance (end-user customer accounts)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/340
- **340**

## Problem / goal

**End-user customer accounts** are not shipped: registration, login, email verification, MFA, account-based order history, and customer-facing self-serve invoices. Staff **Factura CRM** (`/customers`) and fiscal invoice on orders are already live — do **not** conflate or rebuild that path.

Design notes (historical / partial status): **`docs/0002-customer-features-plan.md`**. Treat detailed schema sections as design input; align with current models, auth, and mail patterns in the live codebase.

## High-level instructions for coder

- Read **`docs/0002-customer-features-plan.md`** (status banner + auth/order/invoice sections) and map against what already exists (staff Billing Customers / Factura vs missing end-user portal).
- Deliver a **first vertical slice** of end-user customer signup/login (and email verification if mail infra allows), then order history and self-serve invoices only if the slice is stable — prefer incremental shippable steps over a big-bang of MFA + invoices in one WIP.
- Keep **Customer** identity separate from restaurant **User** (staff/owner); tenant-safe linking of orders to customers; no cross-tenant reads.
- Reuse existing auth, mail, and i18n patterns; do not invent a second staff CRM. MFA is in the plan but may follow as a later task if core register/login/verify lands first — note deferrals in the task file.
- **Out of scope:** rewriting staff Factura CRM; changing SaaS restaurant signup/paywall (`docs/0052`) unless a shared auth primitive is strictly required.
- **Docs / tests:** update `docs/0002` status if behavior ships; add or extend Puppeteer/API smoke for the customer flow; append **Testing instructions** when moving to UNTESTED.
- Pass criteria: a clear end-user path exists (or is documented as the agreed first slice) for customer registration/login without relying on staff accounts; staff Factura remains intact.

## Security note (001)

Issue body summarized for product intent only; no secrets copied.

## Implementation notes (010)

### Shipped (first slice)

- Migration `back/migrations/20260731114840_add_end_user_customer.sql`: table `customer`, nullable `order.customer_id`.
- Model `Customer` (distinct from `User` and `BillingCustomer`); API under `/customer/*` (`customer_routes.py`).
- Auth cookie `customer_access_token` (JWT `type=customer`); does not reuse staff `access_token`.
- Endpoints: `POST /customer/register`, `POST /customer/token`, `POST /customer/logout`, `GET /customer/me`, `GET /customer/verify-email`, `POST /customer/resend-verification`, `GET /customer/orders`.
- SPA: `/customer/register`, `/customer/login`, `/customer/verify-email`, `/customer` (guarded home with empty/list orders + resend verify).
- Email verification via global SMTP + `PUBLIC_APP_BASE_URL` (same pattern as password reset); if unset, register still succeeds with `verification_email_sent: false`.
- Docs: `docs/0002` status banner, `docs/testing.md`, `AGENTS.md` Key URLs, CHANGELOG Unreleased.
- Tests: `back/tests/test_customer_accounts.py` (7), `npm run test:customer-register-login`.

### Deferred (follow-up tasks)

- MFA / TOTP for customers.
- Self-serve tax invoices / PDF.
- Auto-attach `customer_id` on public menu / delivery order create when customer cookie present.
- Customer profile edit (business_name, tax_id, address) UI beyond fields stored on model.

## Testing instructions

1. **Migrate (if needed):** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` — expect `20260731114840_add_end_user_customer`.
2. **Backend pytest:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_customer_accounts.py -q`  
   Expect **7 passed**.
3. **API smoke:**  
   `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/api/customer/me` → **401**.  
   `curl -s -X POST http://127.0.0.1:4202/api/customer/register -H 'Content-Type: application/json' -d '{"email":"cust-test-$(date +%s)@amvara.de","password":"testpass123","full_name":"T"}'` → **201** with `email_verified: false`.
4. **Puppeteer:**  
   `BASE_URL=http://127.0.0.1:4202 npm run test:customer-register-login --prefix front` → **PASS** (register → login → empty orders).
5. **Staff Factura intact:** open `/customers` as staff (existing login) — still Billing Customers CRM; must not require end-user `Customer` cookie.
6. **Optional email verify:** with `PUBLIC_APP_BASE_URL` and SMTP set, register and open the emailed `/customer/verify-email?token=…` link; `/customer` should show email verified.
7. **Front build:** `docker logs --since 10m pos-front` — no TS/NG compile errors after customer pages load.

## Test report

1. **Date/time (UTC):** 2026-07-31 12:04:14 start → 12:05:08 end. Log window: `pos-back` / `pos-front` `--since 15m` around verification.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `f156fd7d`.
3. **What was tested:** Testing instructions §1–7 (migrate, pytest, API smoke, Puppeteer customer register/login, staff Factura `/customers`, optional email verify, front build).
4. **Results:**
   - Migrate `20260731114840_add_end_user_customer`: **PASS** — `Database is up to date (version 20260731114840)`.
   - Backend pytest `tests/test_customer_accounts.py`: **PASS** — `7 passed` in 2.71s.
   - API `GET /api/customer/me` unauthenticated: **PASS** — HTTP **401** `{"detail":"Not authenticated"}`.
   - API `POST /api/customer/register`: **PASS** — HTTP **201**, `email_verified: false`, `verification_email_sent: false` (PUBLIC_APP_BASE_URL unset).
   - Puppeteer `test:customer-register-login`: **PASS** — Register OK → Login → `/customer` → empty orders.
   - Staff Factura `/customers`: **PASS** — staff login → `/customers` (Customers Invoice CRM); `access_token` present, no `customer_access_token`; `GET /billing-customers` 200.
   - Optional email verify: **SKIP** — `PUBLIC_APP_BASE_URL` unset locally; register correctly skips send (warning in back logs). Not a fail for this slice.
   - Front build: **PASS** — latest `Application bundle generation complete` (11:57:13Z); customer routes load; mid-edit TS2339 noise ~11:51 cleared before verification. NG8107 warnings only on unrelated `menu.component.html`.
5. **Overall:** **PASS**
6. **Product owner feedback:** First end-user customer slice is usable: register/login/home with separate cookie from staff, orders empty-state wired, and staff Billing Customers untouched. Email verification is correctly deferred when base URL/SMTP are missing; MFA, self-serve invoices, and auto-link on public orders remain follow-ups as noted in the task.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/api/customer/me
   3. http://127.0.0.1:4202/api/customer/register
   4. http://127.0.0.1:4202/customer/register
   5. http://127.0.0.1:4202/customer/login
   6. http://127.0.0.1:4202/customer
   7. http://127.0.0.1:4202/login
   8. http://127.0.0.1:4202/dashboard
   9. http://127.0.0.1:4202/customers
8. **Relevant log excerpts:**
   ```
   pos-back: GET /customer/me → 401 Unauthorized
   pos-back: POST /customer/register → 201 Created (verification email skipped: PUBLIC_APP_BASE_URL unset)
   pos-back: POST /customer/token → 200; GET /customer/me → 200; GET /customer/orders → 200
   pos-back: GET /billing-customers → 200 OK
   pos-front: Application bundle generation complete. [1.338 seconds] - 2026-07-31T11:57:13.212Z
   ```
