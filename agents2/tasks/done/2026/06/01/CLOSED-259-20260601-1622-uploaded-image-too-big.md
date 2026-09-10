# Uploaded image too big

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/259
- **259**

## Problem / goal
On `/products`, uploading an image larger than the current 2MB limit returns HTTP 400 with `{"detail":"File too large. Max size: 2MB"}` (visible in the network tab) but the user does not see that message in the UI.

Two goals from the issue:
1. **Surface upload errors in the UI** so staff understand why an upload failed (not only in DevTools).
2. **Raise the upload limit to 5MB** and rely on existing server-side image optimization to store the smallest practical file after upload.

## Implementation summary
- **`back/app/main.py`:** `MAX_IMAGE_SIZE` raised to 5MB (all upload routes use this constant; `optimize_image()` unchanged).
- **`front/src/app/shared/image-upload-limits.ts`:** Shared `MAX_IMAGE_UPLOAD_BYTES` / `MAX_IMAGE_UPLOAD_MB` for frontend checks.
- **`front/src/app/products/products.component.ts`:** Inline `error-banner` inside add/edit form; client-side size check before upload; i18n hints/errors; API `detail` still shown when present.
- **`front/src/app/settings/settings.component.ts`:** Logo upload uses shared 5MB limit + `COMMON.IMAGE_FILE_TOO_LARGE`.
- **i18n:** `COMMON.IMAGE_FILE_TOO_LARGE`, `PRODUCTS.IMAGE_UPLOAD_HINT`, `SETTINGS.UPLOAD_LOGO_HINT` updated to 5MB in all nine locales.
- **`CHANGELOG.md`**, **`ROADMAP.md`** updated.

## Testing instructions

1. **Backend limit (optional):** With stack running, confirm product image upload accepts a ~3–4MB JPEG and rejects >5MB with HTTP 400 and body `File too large. Max size: 5MB`.
2. **Products UI — too large:** Log in as owner/admin, open **Products**, edit an existing product, choose an image **>5MB**. Expect a red error banner **inside the form** (not only in DevTools) with the size message; no successful upload.
3. **Products UI — OK size:** Upload a **3–4MB** JPEG on an existing product. Expect success, preview updates, and stored file size smaller than original (optimization).
4. **Products UI — API error:** If backend returns 400 with `detail`, confirm that text appears in the form error banner.
5. **Settings logo:** **Settings → Business profile**, try logo **>5MB** — inline error via i18n; **<5MB** still works.
6. **Regression:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → 200; `docker logs --since 5m pos-front` shows no Angular build errors after changes.

---

## Test report

**Date/time (UTC):** 2026-06-01 16:25–16:28 UTC (log window: 16:20–16:28 UTC)

**Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `6d7701a0`; tenant 1 owner via repo `.env` `DEMO_LOGIN_*` (Puppeteer form login).

**What was tested:** All six criteria from Testing instructions — backend 5MB limit, Products UI size/error banners, Settings logo upload, regression.

**Results:**

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Backend accepts ~3.5MB, rejects >5MB | **PASS** | `POST /api/products/873/image` with 3.5MB JPEG → HTTP 200; 6MB → HTTP 400 `{"detail":"File too large. Max size: 5MB"}` |
| 2 | Products UI >5MB inline error | **PASS** | Puppeteer: banner `"File must be smaller than 5 MB."` in `.error-banner.form-inline-error` inside edit form; no upload |
| 3 | Products UI 3–4MB success + optimization | **PASS** | Puppeteer: 3.5MB upload HTTP 200; real 8000×8000 JPEG (160630 B) stored as 21886 B after `optimize_image()` |
| 4 | Products UI shows API `detail` | **PASS** | Invalid `.txt` upload → HTTP 400; banner `"Invalid file type. Allowed: image/avif, image/jpeg, image/png, image/webp"` |
| 5 | Settings logo >5MB error; <5MB OK | **PASS** | `/settings?section=general`: 5.3MB → toast `"File must be smaller than 5 MB."`; 1×1 PNG → preview `data:image/png;base64,…` |
| 6 | Regression landing + front build | **PASS** | `curl` → 200; `pos-front` logs show successful bundle builds after 16:24 UTC (earlier TS2304 during WIP resolved before test window end) |

**Overall:** **PASS**

**Product owner feedback:** Staff now see clear, in-form feedback when an image is too large or rejected by the API, instead of only a silent failure in DevTools. The 5MB cap is consistent across Products and Settings (logo), with server-side compression still shrinking real photos substantially after upload.

**URLs tested:**
1. http://127.0.0.1:4202/login?tenant=1
2. http://127.0.0.1:4202/dashboard
3. http://127.0.0.1:4202/products
4. http://127.0.0.1:4202/settings?section=general

**Relevant log excerpts:**

```
# pos-front (16:24 UTC) — build healthy after changes
Application bundle generation complete. [0.593 seconds] - 2026-06-01T16:24:37.950Z
Page reload sent to client(s).

# pos-back via curl — 6MB rejection
{"detail":"File too large. Max size: 5MB"}
HTTP:400
```
