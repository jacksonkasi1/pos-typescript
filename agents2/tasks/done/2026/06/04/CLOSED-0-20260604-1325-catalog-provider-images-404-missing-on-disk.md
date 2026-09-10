---
## Closing summary (TOP)

- **What happened:** Staff Catalog showed broken provider product images because DB `image_filename` refs pointed at files missing under `uploads/providers/.../products/`, causing repeated API 404s.
- **What was done:** Helpers only emit image URLs when files exist; orphan refs can be cleared via seed; catalog/provider/menu paths use the helpers; docs and unit tests added.
- **What was tested:** pytest `test_provider_images.py` (6 passed); orphan cleanup idempotent; catalog smoke Images failed 0 / 94 loaded; no catalog-window provider 404s; no Angular errors — overall PASS.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 18:35
---

# Catalog provider product images return 404 (DB refs, files missing on disk)

## Source
- **Docker logs (pos-haproxy):** 2026-06-04 ~12:53 UTC — repeated **`GET /api/uploads/providers/b18b7fba-74d9-4956-9561-6dca2ea8feaa/products/{uuid}.jpg`** → **404** while staff used catalog.
- **Verified in container:** `ProviderProduct` rows exist with `image_filename` set (e.g. ids **69**, **74**, **92**), but matching files are **not** present under `back/uploads/providers/b18b7fba-74d9-4956-9561-6dca2ea8feaa/products/` (directory has other `.jpg` files only).

## Problem / goal

Staff **Catalog** shows broken images for some provider products because the API serves upload paths that 404 — database references filenames that were never stored (or were lost) locally. This is a standing data/integrity issue, not a one-off compile error.

## High-level instructions for coder

- Reproduce: log in, open **`/catalog`**, note cards with missing images; correlate with haproxy/back **`404`** on `/api/uploads/providers/.../products/*.jpg`.
- Compare DB `ProviderProduct.image_filename` vs files on disk under `uploads/providers/{provider.token}/products/`; quantify orphan refs.
- Prefer the **smallest** fix: e.g. repair seed/import to restore missing files, clear orphan `image_filename` when file absent, or API/UI fallback placeholder (see **`docs/0027-amvara9-menu-images-troubleshooting.md`**, **`docs/0014-provider-portal.md`**).
- Avoid large schema changes unless necessary; preserve tenant scoping and existing upload routes.
- After fix: `docker logs --since 10m pos-front` — no new Angular errors; smoke catalog with `front/scripts/test-catalog.mjs` if credentials available.
- Append **Testing instructions** when implementation is complete.

## Implementation notes (coder)

- Added `back/app/provider_images.py`: `provider_product_image_url` / `provider_product_stored_image_path` only return paths when the file exists; `clear_orphan_provider_product_images` nulls orphan DB refs.
- Seed: `python -m app.seeds.clear_orphan_provider_product_images` (ran locally: cleared PP ids 69, 74, 92).
- Catalog list/detail, provider product list, product backfill / add-from-catalog / public menu image resolution use the helpers so missing files never emit `/uploads/providers/...` URLs.
- Docs: `docs/0027-amvara9-menu-images-troubleshooting.md`, `docs/testing.md`.
- Tests: `back/tests/test_provider_images.py`.

## Testing instructions

### What to verify
- No catalog cards request missing provider image files (no haproxy/back **404** on orphan UUIDs).
- Catalog shows placeholders for products without on-disk images; products with files still load.
- Orphan cleanup is idempotent; checker helpers reject path-traversal filenames.

### How to test
```bash
# From repo root, stack up (dev compose)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python3 -m pytest tests/test_provider_images.py -q

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python3 -m app.seeds.clear_orphan_provider_product_images
# Expect second run: provider_products_cleared=0

# Catalog smoke (needs DEMO_LOGIN_* or LOGIN_* in env)
set -a && source .env && set +a
export LOGIN_EMAIL="${DEMO_LOGIN_EMAIL:-$LOGIN_EMAIL}"
export LOGIN_PASSWORD="${DEMO_LOGIN_PASSWORD:-$LOGIN_PASSWORD}"
BASE_URL=http://127.0.0.1:4202 node front/scripts/test-catalog.mjs
```

### Pass/fail criteria
- **Pass:** pytest exit 0; catalog report shows **Images failed: 0**; cards with files still load (`naturalWidth>0`); cleanup second run clears 0; no new Angular errors in `docker logs --since 10m pos-front`.
- **Fail:** any catalog image element fails to load, or API still returns `image_url` for a provider product whose file is absent under `uploads/providers/{token}/products/`.

## Test report

1. **Date/time (UTC):** start ~2026-07-25 18:34:41 UTC; end ~2026-07-25 18:35:20 UTC. Log window: `docker logs --since 15m` / catalog window ~18:34:50–18:35:00 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** `tests/test_provider_images.py`; orphan cleanup idempotency (`clear_orphan_provider_product_images` ×2); catalog Puppeteer smoke (`front/scripts/test-catalog.mjs`); front/haproxy logs for Angular errors and provider-image 404s.
4. **Results:**
   - pytest `test_provider_images.py`: **PASS** — 6 passed in 0.81s.
   - Orphan cleanup idempotent: **PASS** — both runs `provider_products_cleared=0`, `products_cleared=0`.
   - Catalog images: **PASS** — Total cards 149; Images loaded (naturalWidth>0) 94; Images failed 0; placeholder-only 55.
   - No catalog-window provider-image 404s: **PASS** — haproxy during ~18:34:54 catalog fetches all 200; 0 × `uploads/providers` 404 in catalog window. (One unrelated 404 at 18:33:45 UTC for `2eb949ea-…jpg` before this smoke run — not from catalog cards under test.)
   - Front Angular errors: **PASS** — `docker logs --since 10m pos-front` matched 0 error/TS/NG lines.
5. **Overall:** **PASS**
6. **Product owner feedback:** Catalog no longer requests missing provider product files; cards without on-disk images show placeholders and cards with files still load. Orphan cleanup is clean/idempotent and unit helpers cover path safety. Safe to treat this integrity fix as verified locally.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (login via test script)
   2. `http://127.0.0.1:4202/catalog`
   3. `http://127.0.0.1:4202/api/health` (200)
8. **Relevant log excerpts:**
   - pytest: `6 passed, 1 warning in 0.81s`
   - cleanup: `Orphan provider image cleanup: {'provider_products_cleared': 0, 'products_cleared': 0}` (×2)
   - catalog: `Images failed (no dimensions): 0` / `Images OK: OK`
   - haproxy catalog sample: `GET /api/uploads/providers/.../products/...jpg` → `200` (many); catalog-window provider 404 count: `0`
   - pos-front: no TS/NG/bundle errors in last 10m
