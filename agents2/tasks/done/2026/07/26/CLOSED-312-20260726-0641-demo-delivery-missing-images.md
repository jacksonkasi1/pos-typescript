---
## Closing summary (TOP)

- **What happened:** Public Satisfecho Delivery at `/delivery/1` showed broken product images because the client requested bare `/uploads/...` URLs that HAProxy routed to the front (404), while files existed and `/api/uploads/...` already worked.
- **What was done:** Prefixed delivery `productImageUrl()` with `apiUrl` (like public-menu), omitted missing-on-disk `image_url` in the public tenant menu API, extended delivery checkout smoke + pytest, and promoted/deployed through **2.1.97** to amvara9.
- **What was tested:** Local and production `test:delivery-checkout` PASS (images via `/api/uploads/`, no bare-`/uploads` 404s); pytest `test_public_tenant_menu.py` 15 passed; landing **2.1.97** / amvara9 `f2c58558`.
- **Why closed:** All pass/fail criteria met after deploy; Overall **PASS**.
- **Closed at (UTC):** 2026-07-26 07:24
---

# Demo delivery missing images

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/312
- **312**

## Problem / goal

Public Satisfecho Delivery at **https://satisfecho.de/delivery/1** shows broken product images. Local HAProxy logs in the same window show repeated **404** for:

- `/uploads/1/products/7637d8f9-1d71-40ae-8760-ca2599537ec5.jpg`
- `/uploads/providers/5ceaad6e-0966-492a-a059-60d19602cf6a/products/20b89c63-db42-4967-b858-5ddc70a71ffb.jpg`

Likely causes (investigate; do not assume one): DB `image_filename` pointing at missing files under `back/uploads/`, demo products not linked to catalog images, or routing/static serving for nested `/uploads/...` paths (see **`docs/0027-amvara9-menu-images-troubleshooting.md`**). Delivery menu should show real images or clear placeholders — not broken `<img>` URLs.

Related ops/seeds: `seed_demo_products`, `link_demo_products_to_catalog`, `clear_orphan_provider_product_images` (indexed in **`docs/testing.md`**). Delivery surface: **`docs/0053`** / public `/delivery/{tenantId}`. Prior archive on catalog orphans: `CLOSED-0-20260604-1325-catalog-provider-images-404-missing-on-disk.md`.

## High-level instructions for coder

- Reproduce on production (`/delivery/1`) and local HAProxy (`http://127.0.0.1:4202/delivery/1`); note which image URLs 404 and whether files exist on disk under `back/uploads/`.
- Trace how public delivery product payloads set image URLs (tenant product vs provider catalog). Prefer fixing seed/link/orphan cleanup or deploy bootstrap so demo tenant 1 has consistent images after reset/deploy — avoid one-off manual file copies that drift again.
- If refs point at missing files, clear orphans or re-link via existing seeds; if files exist but HTTP 404, follow **`docs/0027-amvara9-menu-images-troubleshooting.md`** (explicit upload routes / HAProxy path).
- Confirm both local and production delivery pages load images (or intentional placeholders) without 404 spam in HAProxy logs.
- Add or extend a smoke (Puppeteer or seed check) so demo delivery images stay covered; append **Testing instructions**.
- Do **not** invent a parallel log **`NEW-`** for the same 404s — this FEAT owns the incident.

## Implementation notes (coder)

**Root cause:** Delivery `productImageUrl()` returned paths starting with `/` unchanged. Browser requested bare `/uploads/...`, HAProxy routed to **front** → 404. Files were on disk; `/api/uploads/...` already returned 200 locally and on prod for current menu images. Public menu already prefixed `environment.apiUrl`.

**Changes:**
- `front/src/app/delivery/delivery-checkout.component.ts` — prefix `/uploads/...` with `apiUrl` (same as public-menu).
- `back/app/public_tenant_menu.py` — omit `image_url` when the file is missing on disk (placeholders instead of 404 spam).
- `front/scripts/test-delivery-checkout.mjs` — assert `/api/uploads` srcs + no bare-/uploads 404s; fill postal when required.
- Docs: `docs/testing.md`, `docs/0027-amvara9-menu-images-troubleshooting.md`.
- Tests: `back/tests/test_public_tenant_menu.py` (missing vs existing file).

## Handoff log

- **Handoff (`012-feature-coder-handoff.md`, 2026-07-26 06:58 UTC, Cursor):** `./scripts/git-sync-development.sh` (OK). **#312** **OPEN**, labels **`agent:planned`**, **`agent:wip`**. Fix is on **`origin/development`** @ **`01538ff8`** (Release **2.1.95**); **`01538ff8` not on `origin/master`** (tip still **`522369e2`** / **2.1.92**); latest **Deploy to amvara9** predates this fix; production landing still **2.1.92**. Embedded **Test report** **Overall: FAIL** (criterion **#4** production images). **Remain WIP** — **no** `WIP-312-…` → `UNTESTED-*`; **no** `gh issue edit 312 --add-label "agent:untested"`. Deploy-blocker per **012** / **`docs/agent-loop.md`**: feature coder must promote **`development` → `master`** + green **Deploy to amvara9**, then re-hand off (or archive per Deploy-blocker archive if cycling continues).

- **Coder (002, 2026-07-26 ~07:19 UTC):** Resumed WIP (no NEW product tasks; remaining NEW are docs hygiene). Synced `development`. Local `test:delivery-checkout` **PASS**. Merged **`development` → `master`** (`f2c58558`, through **2.1.97** incl. **2.1.95** image fix) and pushed. **Deploy to amvara9** [30192580940](https://github.com/satisfecho/pos/actions/runs/30192580940) **success**. amvara9 `HEAD` **`f2c58558`**, landing **2.1.97**. Production `BASE_URL=https://satisfecho.de` `test:delivery-checkout` **PASS** (`Product images OK (7 via /api/uploads/, no bare-/uploads 404s)`). pytest `tests/test_public_tenant_menu.py` **15 passed**. Handing off **WIP → UNTESTED**.

## Testing instructions

### What to verify

- Public Satisfecho Delivery product images load via **`/api/uploads/...`** (not bare `/uploads/...`) on local HAProxy and production.
- Missing-on-disk image filenames yield placeholders (no `image_url`), not broken `<img>` 404 spam.
- Landing app-version on production is **≥ 2.1.95** (currently **2.1.97** after promote).

### How to test

1. **Local smoke (required):**
   ```bash
   BASE_URL=http://127.0.0.1:4202 TENANT_ID=1 npm run test:delivery-checkout --prefix front
   ```
   Expect: `Product images OK (... via /api/uploads/, no bare-/uploads 404s)`, then cart/order create PASS.

2. **Manual local:** Open `http://127.0.0.1:4202/delivery/1`. Product images should load. HAProxy should **not** log 404 for bare `GET /uploads/...` on that page load.

3. **Backend unit:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_public_tenant_menu.py -q
   ```

4. **Production (required — was the prior FAIL):**
   ```bash
   BASE_URL=https://satisfecho.de TENANT_ID=1 npm run test:delivery-checkout --prefix front
   ```
   Confirm landing meta `app-version` **2.1.97** (or later) and amvara9 `git rev-parse --short HEAD` matches promoted merge (coder saw **`f2c58558`**). Deploy run: https://github.com/satisfecho/pos/actions/runs/30192580940

### Pass/fail criteria

- Local + production Puppeteer: **PASS** with images via `/api/uploads/` and zero bare-`/uploads` 404s from the page.
- pytest public tenant menu: all green.
- Production no longer serves the pre-fix client that requested bare `/uploads/...` for delivery products.

## Prior test report (pre-deploy — Overall FAIL; superseded)

- **Date/time (UTC):** 2026-07-26 06:49:16 start → 06:50:06 end
- **Environment:** local OK; production still **2.1.92** / `522369e2` (fix not deployed)
- **Results:** Local 1–3 PASS; production criterion **#4 FAIL** (bare `/uploads` 404s). See handoff log above for post-deploy coder re-check (**PASS**).

## Test report

- **Date/time (UTC):** 2026-07-26 07:22:51 start → 07:23:30 end (log window: HAProxy/front/back since ~07:22Z)
- **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch **`development`** @ **`fe64316a`**; local **`BASE_URL=http://127.0.0.1:4202`**; production **`BASE_URL=https://satisfecho.de`** (also checked `https://www.satisfecho.de`). Deploy ready signal: GHA run [30192580940](https://github.com/satisfecho/pos/actions/runs/30192580940) **success** (updatedAt 2026-07-26T07:21:16Z); amvara9 `HEAD` **`f2c58558`**, `front/package.json` **2.1.97**; landing meta `app-version` **2.1.97**.
- **What was tested:** Delivery product images via `/api/uploads/…` (not bare `/uploads/…`) locally and on production; missing-file handling covered by pytest; production client ≥ 2.1.95.
- **Results:**
  1. Local `npm run test:delivery-checkout` — **PASS** — `Product images OK (7 via /api/uploads/, no bare-/uploads 404s)`; cart + order create OK (id=2357).
  2. Manual local `/delivery/1` — **PASS** — browser: 7 `<img>` srcs under `/api/uploads/…`, `bareUploads=[]`; sample images `naturalWidth` 800/1920; HAProxy since 07:22Z: no bare `GET /uploads/…` 404s on that load.
  3. `pytest tests/test_public_tenant_menu.py` — **PASS** — 15 passed.
  4. Production `test:delivery-checkout` — **PASS** — `Product images OK (7 via /api/uploads/, no bare-/uploads 404s)`; order id=265; landing **2.1.97** / amvara9 **`f2c58558`**.
- **Overall:** **PASS**
- **Product owner feedback:** Demo delivery images now load through the API upload path on both local HAProxy and satisfecho.de; the pre-fix bare-`/uploads` breakage is gone on the live 2.1.97 client. Guests should see real product photos instead of broken image icons.
- **URLs tested:**
  1. `http://127.0.0.1:4202/delivery/1`
  2. `http://127.0.0.1:4202/` (landing HTTP 200 preflight)
  3. `https://satisfecho.de/delivery/1`
  4. `https://www.satisfecho.de/` (app-version 2.1.97)
  5. `https://satisfecho.de/api/health` → `{"status":"ok"}`
- **Relevant log excerpts (last section):**
  - Local Puppeteer: `Product images OK (7 via /api/uploads/, no bare-/uploads 404s)` / `PASS`
  - Prod Puppeteer: same + `Order create OK (id= 265 )` / `PASS`
  - pytest: `15 passed … in 1.16s`
  - HAProxy (tester window): `GET /delivery/1` 200; no bare `/uploads/` 404 after 07:22Z (earlier 07:18:57 bare-`/uploads` 404s predate this verification / look like stale client)
  - GHA deploy 30192580940: `conclusion=success`, `headSha=f2c5855888c7…`
