---
## Closing summary (TOP)

- **What happened:** Public marketing needed an About us surface naming Amvara Consulting S.L. on satisfecho.de.
- **What was done:** Added public `/about` with marketing chrome, nav/footer links, SEO/sitemap, i18n for all locales, and company attribution in the footer version bar.
- **What was tested:** i18n parity, HTTP 200 on `/about`, `test:about`, landing-version and landing-provider-links — all PASS (local HAProxy 4202).
- **Why closed:** All pass criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-31 11:37
---

# Add about us (Satisfecho / Amvara Consulting S.L.)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/338
- **338**

## Problem / goal

Public marketing site on **satisfecho.de** needs an **About us** surface that presents the product/company and names **Amvara Consulting S.L.** where appropriate (footer, legal/about copy, or dedicated page — not buried only in unrelated screens).

**Existing patterns to reuse (do not invent a second marketing shell):**
- Landing + `/features` + `/pricing` share marketing chrome and **`app-landing-site-footer`** (`front/src/app/shared/landing-site-footer.component.ts`).
- Legal pages: `/terms`, `/privacy` (routed in `app.routes.ts`).
- Footer Support group already has Contact (`mailto:hello@satisfecho.de`), Terms, Privacy — no About link yet.
- i18n: `LANDING.*` / `LEGAL.*` keys in `front/public/i18n/*.json` (parity required).
- Smoke: `npm run test:landing-version`, `test:landing-provider-links`, `docs/testing.md`, `docs/README.md` (public `/features` note).

## High-level instructions for coder

- Add a public **About us** experience reachable from satisfecho.de (dedicated `/about` route preferred, or an equally clear first-class page linked from landing/features nav and/or footer).
- Include **Amvara Consulting S.L.** as the operating company where users expect company identity (about body and/or footer attribution) — concise, factual; no fabricated history, team bios, or unverified claims.
- Match existing marketing visual language (landing/features/pricing); reuse `app-landing-site-footer` (or shared layout) rather than a one-off shell.
- Wire nav/footer link(s) with `data-testid` suitable for Puppeteer; add ngx-translate keys for **all** locales (run `python3 scripts/check-i18n-locale-parity.py`).
- Keep scope marketing/front-only unless an existing public legal API already supplies company text — do not add backend just for static about copy.
- **Out of scope:** rewriting Terms/Privacy legalese, new contact forms, CMS, or changing tenant-facing restaurant “about” settings.
- **Docs / tests:** brief note in `docs/README.md` or testing.md if a new public URL is added; extend or add a small Puppeteer check (footer/nav → About, company name visible) and landing smoke (`curl` / `test:landing-version`). Append **Testing instructions** when moving to UNTESTED.
- Pass criteria: visitors on satisfecho.de (and local HAProxy) can open About us without login and see Amvara Consulting S.L. named in the appropriate place(s).

## Implementation notes (coder)

- Added public route **`/about`** (`front/src/app/about/about-page.component.ts`) with marketing chrome matching features/pricing and shared `app-landing-site-footer`.
- Footer Support: About link (`data-testid="landing-about"`); version bar company line (`data-testid="landing-company"`) via `LANDING.COMPANY_OPERATOR`.
- Nav About links on landing, features, pricing, and about pages (`LANDING.NAV_ABOUT`).
- SEO entry + `sitemap.xml` for `/about`.
- i18n: `ABOUT_PAGE.*` + landing keys in all locales; parity check passed.
- Smoke: `npm run test:about --prefix front`.

## Testing instructions

App must be up (e.g. HAProxy on **http://127.0.0.1:4202**).

1. **i18n parity:** from repo root, `python3 scripts/check-i18n-locale-parity.py` (expect PASS).
2. **HTTP:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/about` → **200** (no login).
3. **About smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:about --prefix front`  
   Expects footer About → `/about`, hero title translated, **Amvara Consulting S.L.** on page and footer company line.
4. **Landing smokes (regression):**  
   `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`  
   `BASE_URL=http://127.0.0.1:4202 npm run test:landing-provider-links --prefix front`
5. **Manual (optional):** open `/about`, confirm company section and footer Support → About; check another locale via language picker.

Coder pre-check (local): steps 1–4 passed on 2026-07-31.

## Test report

1. **Date/time (UTC):** 2026-07-31 11:35:22 start → 11:36:46 end. Log window: `docker logs --since 15–20m` for `pos-front` / `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `1e27ba65` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** i18n locale parity; HTTP `/about` without login; `test:about` (footer About → company name); landing regression (`test:landing-version`, `test:landing-provider-links`); front build health.
4. **Results:**
   - i18n locale parity — **PASS** (`python3 scripts/check-i18n-locale-parity.py`; all 8 locales OK vs en.json, 2751 leaves).
   - HTTP `GET /about` → 200 (no login) — **PASS** (`curl` → 200).
   - About smoke `npm run test:about` — **PASS** — footer About + company attribution OK; hero “About Satisfecho”; Amvara Consulting S.L. visible on page.
   - Landing `test:landing-version` — **PASS** — version text includes “Operated by Amvara Consulting S.L.”; demo card + login + sidebar OK.
   - Landing `test:landing-provider-links` — **PASS** — provider/login/register/contact/terms/privacy links OK.
   - Front build — **PASS** — repeated `Application bundle generation complete` in window; no TS/NG hard errors (only pre-existing NG8107 warnings).
5. **Overall:** **PASS**
6. **Product owner feedback:** Public `/about` is reachable without login, linked from the marketing footer, and clearly names Amvara Consulting S.L. on the page and in the footer company line. Landing smokes still pass with the new company attribution in the version bar. Ready for closer archive; production/satisfecho.de deploy was not in local Testing instructions.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/about
   3. http://127.0.0.1:4202/login?tenant=1 (landing-version)
   4. http://127.0.0.1:4202/dashboard (and sidebar paths from landing-version)
   5. http://127.0.0.1:4202/provider/register (landing-provider-links)
8. **Relevant log excerpts:**
   - `pos-front`: `Application bundle generation complete. [1.158 seconds] - 2026-07-31T11:33:20.806Z` (and earlier completes); no compile failures in the test window.
   - Puppeteer `test:about`: `>>> RESULT: /about loads; footer About link works; Amvara Consulting S.L. visible.`
   - Puppeteer landing-version: `Version element text: 2.1.142 … Operated by Amvara Consulting S.L. …`
