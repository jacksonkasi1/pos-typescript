---
## Closing summary (TOP)

- **What happened:** Public marketing SEO on satisfecho.de scored poorly (Lighthouse SEO ~82) due to missing meta description, robots.txt (SPA shell), and weak titles/share tags.
- **What was done:** Added per-route SEO service (titles/meta/canonical/OG, noindex for auth), static robots.txt/sitemap.xml/og-image, nginx exact locations, and docs/0055-public-seo.md.
- **What was tested:** Local crawl files, landing/features/login meta, Lighthouse SEO 100, landing smoke — overall PASS; prod recheck deferred until deploy.
- **Why closed:** All local acceptance criteria passed; production verification pending deploy only.
- **Closed at (UTC):** 2026-07-25 15:26
---

# Improve SEO (satisfecho.de / public marketing surfaces)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/307
- **307**

## Problem / goal

Public site SEO for **https://satisfecho.de** scores poorly (PageSpeed Insights mobile report linked in the issue — focus on the **SEO** category, not a full performance rewrite). Goal: improve crawlability and shareability of marketing / public pages so search engines and social previews get correct titles, descriptions, and indexing signals.

**Baseline observations (do not treat as a complete audit):**
- `front/src/index.html` uses a generic `<title>POS - Point of Sale</title>` and has **no** `meta name="description"`, Open Graph / Twitter tags, or canonical link.
- No `robots.txt` or `sitemap.xml` found under `front/`.
- Some routes already call Angular `Title.setTitle` (e.g. delivery checkout); marketing landing / features / book flows may still rely on the static shell title.

Reference report: PageSpeed Insights analysis for `https://satisfecho.de` (mobile) from the issue. Chrome DevTools Lighthouse SEO category is also acceptable for local/prod verification.

## High-level instructions for coder

- Re-read the issue report’s **SEO** findings (and/or run Lighthouse SEO on `https://satisfecho.de` and key public routes: landing `/`, features, book, delivery). List concrete failing audits (e.g. document description, crawlable links, robots, title, viewport — already present).
- Prefer the **smallest** fix set that moves SEO score meaningfully:
  - Meaningful per-route **document titles** and **meta descriptions** for public/marketing pages (Angular `Title` + `Meta`, or equivalent SSR/prerender path if already used — do not invent a new SSR stack unless required).
  - Open Graph / Twitter basic tags (`og:title`, `og:description`, `og:url`, `og:image` if a stable brand image exists) for shareable public URLs.
  - `robots.txt` and a simple `sitemap.xml` (or generated equivalent) covering public marketing URLs; ensure they are served correctly behind HAProxy/nginx in prod.
  - Canonical URLs where duplicate public entry points matter.
- Keep authenticated POS app routes out of aggressive indexing where appropriate (`noindex` for login/staff areas if that matches product intent).
- Do **not** chase Core Web Vitals / large performance refactors under this issue unless an SEO audit item directly depends on it (e.g. blocked crawl from broken links).
- Preserve i18n: if user-facing meta copy is locale-specific, follow existing `front/public/i18n` patterns; English-first meta is OK if that matches current public default.
- Document what changed (short note in `docs/` or README marketing section if one exists); after changes check `pos-front` build logs and smoke the landing page (`test:landing-version` or equivalent).
- Append **Testing instructions** when implementation is complete (PageSpeed/Lighthouse SEO before/after on satisfecho.de + local public routes).

## Implementation notes (coder)

**Baseline (prod `https://satisfecho.de`, Lighthouse mobile SEO):** score **82**. Failures: `meta-description`, `robots-txt` (SPA HTML returned for `/robots.txt`).

**Local after fix:** Lighthouse mobile SEO **100** on `http://127.0.0.1:4202/` (`meta-description` + `robots-txt` pass).

Changes:
- `front/src/index.html` — Satisfecho title, description, OG/Twitter, canonical defaults
- `front/src/app/services/seo.service.ts` + `App` bootstrap — per-route titles/meta/canonical/OG; `noindex` for staff/auth
- `front/public/robots.txt`, `sitemap.xml`, `og-image.png` (1200×630)
- `front/nginx.conf` — exact locations so robots/sitemap never fall through to `index.html`
- `docs/0055-public-seo.md` (+ index in `docs/README.md`)

Prod score on satisfecho.de will update after deploy (static assets + nginx snippet).

## Testing instructions

1. **Static crawl files (local):**
   ```bash
   curl -sI http://127.0.0.1:4202/robots.txt   # content-type text/plain; body starts with User-agent
   curl -sI http://127.0.0.1:4202/sitemap.xml  # XML, not HTML
   curl -sI http://127.0.0.1:4202/og-image.png # image/png
   ```
2. **Landing meta (local):** open `/` — title contains `Satisfecho`; `meta[name=description]` present; `og:image` points at `/og-image.png`.
3. **Route SEO:** `/features` → title `Features — Satisfecho`; `/login` → `meta[name=robots]=noindex,nofollow`.
4. **Lighthouse SEO (local):** Chrome DevTools Lighthouse → SEO on `http://127.0.0.1:4202/` — expect **~100** (meta-description + robots.txt pass). Baseline on prod was **82**.
5. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` (already passed in coder run).
6. **After deploy to satisfecho.de:** re-run PageSpeed Insights / Lighthouse SEO; confirm `/robots.txt` is plain text (not the SPA shell) and SEO category improves vs baseline 82.

## Test report

1. **Date/time (UTC):** 2026-07-25 15:24:30 – 15:25:25 UTC (log window: `docker logs --since 15m pos-front`).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (SEO changes present in working tree; not yet on `master` / amvara9).
3. **What was tested:** Static crawl files (`robots.txt`, `sitemap.xml`, `og-image.png`); landing title/description/OG; `/features` title; `/login` noindex; Lighthouse mobile SEO; landing smoke; spot-check prod only to confirm deploy not live yet.
4. **Results:**
   - Static crawl files — **PASS** — `robots.txt` `content-type: text/plain`, body starts with `User-agent: *`; `sitemap.xml` `text/xml` with `<urlset>`; `og-image.png` `image/png` (30329 bytes).
   - Landing meta — **PASS** — title `Satisfecho — Open-source restaurant platform`; `meta[name=description]` present; `og:image` resolves to `…/og-image.png`.
   - Route SEO `/features` — **PASS** — `document.title` = `Features — Satisfecho`.
   - Route SEO `/login` — **PASS** — `meta[name=robots]=noindex,nofollow`.
   - Lighthouse SEO (local mobile) — **PASS** — SEO category **100**; `meta-description` and `robots-txt` audits score 1.
   - Smoke `test:landing-version` — **PASS** — `>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
   - Prod satisfecho.de (step 6) — **SKIPPED (pending deploy)** — `/robots.txt` still returns SPA HTML (`content-type: text/html`, title `POS - Point of Sale`); last Deploy to amvara9 run is older (2026-07-23). SEO fix not on production yet.
5. **Overall:** **PASS** (local criteria 1–5). Criterion 6 deferred until commit → promote → amvara9 deploy; re-check `/robots.txt` is plain text and SEO > baseline 82 on `https://satisfecho.de`.
6. **Product owner feedback:** Local marketing SEO is in good shape: crawl files serve correctly, titles/descriptions/OG work, staff login is noindex, and Lighthouse SEO is 100. Production still shows the old shell until this change is deployed — that is expected, not a local regression.
7. **URLs tested:**
   1. http://127.0.0.1:4202/robots.txt
   2. http://127.0.0.1:4202/sitemap.xml
   3. http://127.0.0.1:4202/og-image.png
   4. http://127.0.0.1:4202/
   5. http://127.0.0.1:4202/features
   6. http://127.0.0.1:4202/login
   7. https://satisfecho.de/robots.txt (pre-deploy spot-check only)
   8. https://satisfecho.de/ (pre-deploy spot-check only)
8. **Relevant log excerpts:**
   ```
   Application bundle generation complete. [0.317 seconds] - 2026-07-25T15:22:52.675Z
   Page reload sent to client(s).
   ```
   No TypeScript/Angular build errors in the test window (only pre-existing NG8107 optional-chain warnings in `menu.component.html`).
