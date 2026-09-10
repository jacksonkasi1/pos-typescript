---
## Closing summary (TOP)

- **What happened:** The landing page footer was updated so visitors can open the public **pos** GitHub repository (issue #133).
- **What was done:** A footer link to `https://github.com/satisfecho/pos/` was added with i18n-friendly copy, `data-testid="landing-github"`, and layout that holds on narrow viewports.
- **What was tested:** Front build health, `npm run test:landing-version` (exit 0), and manual checks of href, label, and responsive footer — all **PASS**.
- **Why closed:** Tester **Overall: PASS**; acceptance criteria met.
- **Closed at (UTC):** 2026-04-01 07:22
---

# Update landing page (GitHub link in footer)

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/133

## Problem / goal
Add a link to the public GitHub repository in the landing page footer so visitors can find the **pos** project source (repository: `satisfecho/pos`).

## High-level instructions for coder
- Locate the landing page footer component or template and add a clear link to **`https://github.com/satisfecho/pos/`** (label consistent with existing footer/i18n patterns).
- Ensure styling matches the landing page; avoid breaking layout on small viewports.
- If the app uses **ngx-translate**, add keys under **`front/public/i18n/`** per project i18n rules.

---

## Testing instructions

- **Build:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=80 front` — no Angular/TS errors after save.
- **Smoke:** `cd front && BASE_URL=http://127.0.0.1:4202 npm run test:landing-version` — exit 0.
- **Manual:** Open `/` while logged out; footer shows **Source on GitHub** (or translated label) linking to `https://github.com/satisfecho/pos/` (`data-testid="landing-github"`). Resize viewport — footer wraps without overlap.

---

## Test report

1. **Date/time (UTC):** 2026-04-01T07:19:15Z (start) — **Log window:** front container logs through ~07:20 UTC (same session as `test:landing-version`).

2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; **BASE_URL** `http://127.0.0.1:4202`; branch **development** @ `5e7c91b`.

3. **What was tested:** Build health (front logs), `npm run test:landing-version`, logged-out landing footer: `data-testid="landing-github"`, href, translated label, narrow viewport layout.

4. **Results**
   - **Build / front logs** — Recent tail shows successful `Application bundle generation complete` with no `TS`/`NG`/`Error` compiler lines — **PASS** (see excerpt below).
   - **Smoke (`test:landing-version`)** — Exit code **0**; landing version check and (with env credentials) nav sweep succeeded — **PASS** (elapsed ~44s, ended 2026-04-01T07:20:35Z).
   - **Manual footer** — `[data-testid="landing-github"]` present; `href="https://github.com/satisfecho/pos/"`; visible label **Quellcode auf GitHub** (locale Deutsch) — **PASS** (DevTools evaluate_script on `/`).
   - **Responsive footer** — Viewport **375×667**; footer links wrap as a vertical stack without overlapping main content — **PASS** (spot-check).

5. **Overall:** **PASS**

6. **Product owner feedback:** The public landing footer now surfaces the repository clearly next to existing links, with i18n-friendly copy. The link targets the correct org/repo and is stable for automated checks via `data-testid`.

7. **URLs tested**
   1. `http://127.0.0.1:4202/` (logged out, landing)
   2. `https://github.com/satisfecho/pos/` (href target verified on anchor)

8. **Relevant log excerpts (last section)**

```
pos-front | Application bundle generation complete. [0.009 seconds] - 2026-04-01T07:15:17.544Z
pos-front | Page reload sent to client(s).
```

(Puppeteer run: `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.` — exit_code: 0)

Browser console showed WebSocket `Invalid authentication token` during staff nav after landing; **out of scope** for this landing-only task and did not fail the smoke script.
