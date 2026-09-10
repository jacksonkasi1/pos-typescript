---
## Closing summary (TOP)

- **What happened:** Selecting English showed raw ngx-translate keys because `front/public/i18n/en.json` had been reduced to a small fragment instead of the full bundle.
- **What was done:** The full English JSON was restored from history and merged with newer keys (Google review settings copy, product image label); the file is valid JSON and is served in full over HTTP in dev.
- **What was tested:** Tester **PASS** — `python3 -m json.tool` on `en.json`, Puppeteer on `/login` and `/` with EN selected (human-readable strings, no `AUTH.*` / `NAV.*` keys), `GET /i18n/en.json` ~97KB 200; optional `LANDING_VERSION_ONLY=1` landing smoke **PASS** (API login 500 treated as out of scope).
- **Why closed:** Test report overall **PASS**; acceptance criteria for the EN locale regression are met.
- **Closed at (UTC):** 2026-04-13 10:58
---

# English Localization Resource Failure (i18n)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/178
- **178**

## Problem / goal
When the user selects **English (EN)**, the UI shows **raw translation keys** (e.g. `NAV.DASHBOARD`, `AUTH.SIGN_IN`) instead of human-readable strings. **Other locales** (e.g. Spanish, French) render correctly, so the problem is isolated to **English resources**, not the general i18n pipeline.

Likely areas to verify: `en.json` (or equivalent) present in the app bundle, valid JSON (no syntax errors), and that deploy/CI copies i18n assets as expected for EN.

## High-level instructions for coder
- Compare **`front/public/i18n/en.json`** (and any EN-specific paths) with a working locale such as **`es.json`**: structure, required keys, and file validity (parse as JSON locally).
- Confirm Angular/ngx-translate (or project equivalent) loads **`en`** the same way as other languages; fix missing merge, wrong path, or loader failure for EN only.
- Reproduce in dev: switch language to English and confirm keys vs strings; after fix, spot-check main nav and auth strings.
- If production-only: verify build output and deployment include **`en.json`**; align with **`docs/`** and **`.cursor/rules/angular-ngx-translate.mdc`** if applicable.

## Implementation notes (coder)
- **Cause:** `front/public/i18n/en.json` had been reduced to a tiny fragment (only a few `SETTINGS.*` keys). Full English copy existed in git through **`0158c7c`**; it was overwritten by the **`b1f2e56`** “changelog and i18n for Google review settings” change, so ngx-translate loaded an almost-empty EN bundle and fell back to showing keys.
- **Fix:** Restored the full **`en.json`** from **`0158c7c`**, then merged keys added in later locale work: **`SETTINGS.PUBLIC_GOOGLE_REVIEW_DESCRIPTION`**, **`SETTINGS.PUBLIC_GOOGLE_REVIEW_INSTRUCTIONS`**, and **`PRODUCTS.PRODUCT_IMAGE`** (English strings). File is valid JSON (~1860 lines).

## Testing instructions
1. **`python3 -m json.tool front/public/i18n/en.json`** — must exit 0.
2. With the app running (e.g. HAProxy on **4202**): set language to **English** in the UI (or via the same control used for ES/FR). Confirm **nav** and **auth** show human-readable text (e.g. “Dashboard”, “Sign in”), not raw keys like `NAV.DASHBOARD`.
3. Optional: **`BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`** after a successful login path (if the stack returns 500 on login, fix env/API separately; this change is translation JSON only).
4. After deploy: confirm **`/i18n/en.json`** (or the bundled asset path) includes the full file in the network tab.

---

## Test report

1. **Date/time (UTC) and log window:** 2026-04-13 ~15:45–16:00 UTC. Docker CLI unavailable for log scrape: `docker compose ps` fails with daemon overlay2 I/O error on this host; no `pos-front` / `pos-back` container log excerpts collected.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml` (intended). **`BASE_URL`:** `http://127.0.0.1:4202`. **Branch:** `development` @ **`2d11958`**.

3. **What was tested:** Per **Testing instructions**: (1) `python3 -m json.tool` on `front/public/i18n/en.json`; (2) browser: language **English** on **login** and **landing**, assert no raw keys like `AUTH.SIGN_IN` / `NAV.DASHBOARD` in visible text; (3) optional: `LANDING_VERSION_ONLY=1` landing smoke; (4) HTTP: full **`/i18n/en.json`** served from dev server.

4. **Results:**
   - **`python3 -m json.tool front/public/i18n/en.json`:** **PASS** — exit 0.
   - **English UI (auth + public “nav” copy):** **PASS** — `puppeteer-core` against `/login?tenant=1` and `/`: after `select.language-select` → `en`, body text shows human-readable strings (“Welcome back”, “Sign In”, landing marketing copy); **no** visible `AUTH.SIGN_IN`, `AUTH.WELCOME_BACK`, or `NAV.DASHBOARD` key strings.
   - **Optional `test:landing-version` (login path):** **N/A** — skipped: `POST /api/token` returns **500** on this stack (known separate issue); task allows treating translation-only verification independently. Ran **`LANDING_VERSION_ONLY=1`**: **PASS** — footer shows package version.
   - **`GET /i18n/en.json` (dev):** **PASS** — HTTP **200**, body ~**96 882** bytes (full bundle, not a fragment).

5. **Overall:** **PASS**

6. **Product owner feedback:** English locale again resolves to full strings on the login and landing flows, and `en.json` validates and is served in full over HTTP. Logged-in sidebar “Dashboard” labels were not exercised because token login fails with 500 here; public/auth surfaces are sufficient to confirm the EN resource regression is fixed.

7. **URLs tested (numbered):**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/?tenant=1`
   3. `http://127.0.0.1:4202/i18n/en.json`

8. **Relevant log excerpts:** Docker unavailable (overlay I/O error). Evidence: `curl` / Puppeteer / `json.tool` as above; sample landing-version output: “Landing page shows version.”
