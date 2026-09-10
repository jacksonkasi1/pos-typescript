---
## Closing summary (TOP)

- **What happened:** Enhancement reviewer flagged a smoke gap for the public `/features` marketing page.
- **What was done:** Added `front/scripts/test-features.mjs`, wired `test:features` in `front/package.json`, and documented it in `docs/testing.md`.
- **What was tested:** Puppeteer smoke against `http://127.0.0.1:4202/features` exited 0 (hero, 4 categories, nav/CTA; HTTP 200; no pageerror); alias and docs index verified.
- **Why closed:** All pass/fail criteria met; tester overall PASS; no product-code follow-up.
- **Closed at (UTC):** 2026-07-25 22:35
---

# Add Puppeteer smoke for public /features

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`/features`** is a public marketing surface linked from the landing nav, but there is no Puppeteer script or `test:*` alias. Regressions (blank page, missing hero, broken i18n keys, footer/nav) only show up manually. Sibling landing smokes (`test:landing-version`, `test:landing-provider-links`) do not open `/features`.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:03Z: smoke-gap follow-on; demo_tables_check=ok
- `rg 'features' front/package.json docs/testing.md front/scripts/*.mjs` → no dedicated features smoke (only landing “features” section / i18n keys elsewhere)
- Related open: **`FEAT-0-20260723-1903-refresh-public-features-page-jul-capabilities`** (content), **`NEW-0-20260723-1903-document-public-features-page`** (docs) — do **not** merge; this task owns the smoke harness only

## High-level instructions for coder

- Add `front/scripts/test-features.mjs` (headless Puppeteer, same BASE_URL autodetection pattern as other public smokes): open `/features`, assert hero title (or a stable `FEATURES_PAGE` / visible heading), at least one category section, and nav link back to `/` or register CTA present; fail on pageerror / bad HTTP
- Add `test:features` in **`front/package.json`** and a short row in **`docs/testing.md`**
- No login required; optional language switch assert is nice-to-have only
- Pass/fail: `BASE_URL=http://127.0.0.1:4202 npm run test:features --prefix front` exits 0; docs list the alias

## Coder notes (2026-07-25)

- Added `front/scripts/test-features.mjs` (public, no login; BASE_URL auto-detect 4203/4202/4200).
- Asserts `.features-page`, translated `.features-hero__title`, ≥1 `.features-category`, brand `/` and/or register CTA; fails on `pageerror` or HTTP ≥400 for `/features`.
- Alias `test:features` in `front/package.json`; documented under Landing page + npm scripts table in `docs/testing.md`.
- Local run: exit 0 against `http://127.0.0.1:4202` (hero “Everything Satisfecho offers”, 4 categories).

## Testing instructions

### What to verify

- Public `/features` smoke exists and passes against the running app.
- `npm run test:features` is wired and listed in `docs/testing.md`.

### How to test

```bash
# App up via HAProxy (dev overlay), e.g. port 4202
BASE_URL=http://127.0.0.1:4202 npm run test:features --prefix front
# Or: BASE_URL=http://127.0.0.1:4202 node front/scripts/test-features.mjs
```

Optional doc check: `rg -n 'test:features|test-features' front/package.json docs/testing.md`

### Pass/fail criteria

- **Pass:** command exits 0; logs show hero title, ≥1 category, home/register nav OK; no pageerror.
- **Fail:** non-zero exit, missing shell/title/categories, raw `FEATURES_PAGE.*` in DOM, or bad HTTP/pageerror.

## Test report

1. **Date/time (UTC):** 2026-07-25T22:34:29Z start → 2026-07-25T22:34:32Z end. Log window: ~2026-07-25T22:29Z–22:34Z (`docker logs --since 5m`).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; HAProxy `http://127.0.0.1:4202`; branch `development` @ `82da74e3`; `HEADLESS=1`.
3. **What was tested:** Public `/features` Puppeteer smoke (`test:features` / `test-features.mjs`); alias + docs index in `front/package.json` and `docs/testing.md`.
4. **Results:**
   - Smoke exits 0 with hero/categories/nav: **PASS** — `Hero title: Everything Satisfecho offers`, `Category sections: 4`, brand home OK, register CTA OK; no pageerror.
   - `test:features` wired in package.json: **PASS** — `front/package.json:22` `"test:features": "node scripts/test-features.mjs"`.
   - Documented in `docs/testing.md`: **PASS** — landing section (~266–267) and npm scripts table row (~483).
   - HTTP `/features`: **PASS** — HAProxy `GET /features` → 200 during smoke (`22:34:29`–`22:34:30`).
5. **Overall:** **PASS**
6. **Product owner feedback:** The public features page now has a first-class smoke that catches blank shell, missing hero/i18n, or broken nav without a login. Alias and testing.md row make it discoverable next to other landing smokes. Safe to close; no product-code follow-up from this harness task.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/features`
8. **Relevant log excerpts (last section):**
   - Smoke stdout: `>>> RESULT: /features loads with hero, categories, and nav/CTA.` exit 0.
   - HAProxy: `GET /features HTTP/1.1` → 200 at `25/Jul/2026:22:34:29.943`.
   - pos-front: no TS/Angular build errors in window (only unrelated NG8107 optional-chain warnings on menu template).
   - pos-back: no features-related errors in window.
