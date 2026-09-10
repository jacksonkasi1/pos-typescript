---
## Closing summary (TOP)

- **What happened:** Owners needed tenant-scoped “personal” suppliers outside the global catalog, including the ability to edit them and keep global/catalog providers protected from restaurant PATCHes.
- **What was done:** Added `PATCH /providers/{id}` for personal providers only (`PersonalProviderUpdate`), 403 for global providers; Settings → Providers **Edit provider** modal (name, URL, phone, email, active); backend coverage in `tests/test_personal_providers_api.py` (isolation, duplicate name, global patch).
- **What was tested:** Six pytest cases, `test:settings-providers`, `test:landing-version`, and add→edit→save→reload on Settings → Providers — **all PASS** per test report.
- **Why closed:** Tester overall **PASS**; all stated pass/fail criteria met.
- **Closed at (UTC):** 2026-03-23 15:25
---

# Make restaurant owner add personal providers

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/25

## Problem / goal
A restaurant may use a supplier not present in the global/provider catalog. Owners need to **add their own providers** and **link them to products**, including non-menu items (e.g. toilet paper) that are not “on sale” in the usual sense.

## High-level instructions for coder
- Review existing provider catalog, `ProviderProduct`, and owner vs provider roles in `docs/` and code.
- Specify permissions: tenant-scoped custom providers vs platform providers; avoid breaking provider portal assumptions.
- Allow creating/linking tenant-specific provider records and attaching products (including internal or non-sale inventory use cases if applicable).
- Cover listing, edit, and product linkage in API + owner UI; add tests for authorization and data isolation between tenants.

## Coder notes (2026-03-23)
- **Already in repo:** `GET/POST /providers`, `GET/POST /providers/{id}/products` for personal providers (`Provider.tenant_id`); Settings → Providers tab (add provider, add product with optional category / “on sale” = `availability`).
- **This pass:** `PATCH /providers/{id}` for **personal** providers only (`PersonalProviderUpdate` in `models.py`); global providers **403** from this route. Settings UI: **Edit provider** modal (name, URL, phone, email, active). Tests: **`back/tests/test_personal_providers_api.py`** (cross-tenant 404/403, duplicate name 409, global patch 403).

---

## Testing instructions

### What to verify
- Owners/admins can **edit** a personal provider from **Settings → Providers** and changes persist after reload.
- **PATCH** rejects editing catalog (global) providers from the restaurant API; other tenants cannot read, patch, list products, or add products on another tenant’s personal provider.

### How to test
- **Backend (Docker):**  
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_personal_providers_api.py -v`
- **Frontend smoke:** App up on HAProxy (e.g. `http://127.0.0.1:4202`).  
  `BASE_URL=http://127.0.0.1:4202 npm run test:settings-providers --prefix front`  
  (requires `.env` with `DEMO_LOGIN_EMAIL` / `DEMO_LOGIN_PASSWORD` or `LOGIN_*` for tenant 1). Optionally open Settings → Providers and use **Edit provider** on a personal row.
- **General regression:**  
  `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`

### Pass/fail criteria
- All **6** tests in `test_personal_providers_api.py` pass.
- **test:settings-providers** passes; manual check: **Edit provider** opens, save succeeds, list refreshes.
- **test:landing-version** passes; `docker compose … logs --tail=80 front` shows no Angular/TS build errors after changes.

---

## Test report

1. **Date/time (UTC)** and log window: **2026-03-23 ~15:19–15:26 UTC** (pytest, Puppeteer, compose logs sampled immediately after).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL=http://127.0.0.1:4202`**; branch **`development`**, commit **`91c784b`**; credentials from repo **`.env`** (`DEMO_LOGIN_*` / `LOGIN_*`, tenant 1).

3. **What was tested:** Personal provider **PATCH** authorization/isolation (**What to verify**); Settings → Providers smoke; landing regression; **Edit provider** modal save + persistence (via add-then-edit Puppeteer flow after initial tenant had zero personal rows).

4. **Results:**
   - **6/6 pytest** `tests/test_personal_providers_api.py` — **PASS** — `6 passed in 3.00s`.
   - **`npm run test:settings-providers`** — **PASS** — Providers section + Add provider present; login → `/settings` OK.
   - **`npm run test:landing-version`** — **PASS** — `exit_code: 0`, “Landing version OK; demo login OK; sidebar nav OK.”
   - **Edit provider UI (add personal provider → edit name → save → full reload → name still in table)** — **PASS** — console: `PASS: add personal provider, edit, save, persist after reload`.
   - **Front logs (no blocking TS/Angular errors at check time)** — **PASS** — `docker compose … logs --tail=25 front | grep -iE 'error|TS[0-9]|failed'` → no matches; note: older **`tail=80`** had a transient **TS2339** on `tables-canvas` followed by successful **`Application bundle generation complete`** (unrelated to this task’s Settings/providers code path).

5. **Overall:** **PASS** (all criteria met).

6. **Product owner feedback:** Owners can add a personal provider and edit it from Settings; API tests confirm global providers cannot be patched from the restaurant API and other tenants cannot access another tenant’s personal providers. Recommend keeping **`test:settings-providers`** extended later to click **Edit** when a fixture provider exists, so CI covers the modal without relying on ad-hoc scripts.

7. **URLs tested:**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/dashboard`
   3. `http://127.0.0.1:4202/settings` (Providers tab)
   4. `http://127.0.0.1:4202/` (landing test)
   5. Sidebar targets from **test:landing-version** (`/my-shift`, `/staff/orders`, `/reservations`, `/guest-feedback`, `/tables`, `/kitchen`, `/bar`, `/customers`, `/products`, `/catalog`, `/reports`, `/working-plan`, `/users`, `/settings`, inventory subroutes under `/inventory/…`)

8. **Relevant log excerpts:**
   - **back (pytest):** `tests/test_personal_providers_api.py::… PASSED` ×6; `6 passed in 3.00s`.
   - **front (compose):** `Application bundle generation complete. [0.556 seconds] - 2026-03-23T15:09:44.787Z` (recent successful build before verification window); grep of last 25 lines: no `ERROR` / `TSnnnn` / `failed`.
