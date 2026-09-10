---
## Closing summary (TOP)

- **What happened:** Public `/features` was live but missing from README / docs indexes, so contributors rediscovered it only via changelog or Angular routes.
- **What was done:** Added short pointers in root `README.md` (Features + Access Points) and `docs/README.md` (Quick links + Feature guides stub); no new `docs/00xx-*.md` and no product-code changes.
- **What was tested:** `rg` confirmed `/features` in both indexes; optional `test:features` and live `/features` → 200 passed — overall **PASS**.
- **Why closed:** All pass/fail criteria met (index pointers present, no unnecessary guide file, product code unchanged).
- **Closed at (UTC):** 2026-07-26 04:47
---

# Document public /features page in README / docs index

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Public **`/features`** has been live since **2.1.8** (landing nav + “View all features”), but **`README.md`** / **`docs/README.md`** never mention the route. Contributors and operators looking for “where do we list product capabilities for prospects?” miss it and rediscover only via changelog or Angular routes.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:03Z: follow-on after SIGNAL docs owned; not a bulk `docs/*.md` rewrite
- `rg '/features|Features page' README.md docs/README.md` → no hits (changelog/ROADMAP may mention; main indexes do not)
- Route: `front/src/app/app.routes.ts` → `features.component.ts`; landing links in `landing.component.ts`
- Sibling **`FEAT-0-20260723-1903-refresh-public-features-page-jul-capabilities`** owns grid content — this task is **index/pointer only**

## High-level instructions for coder

- Add a short pointer (one row or bullet) in **`README.md`** and/or **`docs/README.md` Quick links / Feature guides** stating public marketing features list at **`/features`** (no login)
- Optionally note it shares the landing footer component; do not create a large new `docs/00xx-*.md` unless a one-paragraph stub is clearly better than a README row
- Pass/fail: `rg '/features' README.md docs/README.md` hits; no product code changes required

## Implementation notes (coder)

- Root **`README.md`**: Features row **Public features (marketing)** (`/features`, no login, landing nav + shared landing site footer); Access Points row `http://localhost:4202/features`
- **`docs/README.md`**: Quick links row for `/features`; Feature guides stub (no new `docs/00xx-*.md`) pointing at README + `test:features`
- No product code changes

## Testing instructions

### What to verify

- Root **`README.md`** and **`docs/README.md`** mention the public marketing route **`/features`** (no login).
- No new large feature guide file was required; pointers only.
- Product code under `back/` / `front/` unchanged for this task.

### How to test

```bash
# From repo root
rg -n '/features' README.md docs/README.md
rg -n 'Public features|landing-site-footer|landing site footer' README.md docs/README.md

# Optional live smoke (app up on HAProxy port):
BASE_URL=http://127.0.0.1:4202 npm run test:features --prefix front
```

### Pass/fail criteria

- **Pass:** `rg '/features' README.md docs/README.md` hits both files; Features and Access Points (or Quick links / Feature guides) clearly describe the public marketing list; optional `test:features` still green if run.
- **Fail:** Either index still omits `/features`, or a large new `docs/00xx-*.md` was added without need, or product code was changed for this index-only task.

## Test report

1. **Date/time (UTC):** 2026-07-26T04:46:35Z – 2026-07-26T04:46:46Z (log window). Start after rename UNTESTED → TESTING.
2. **Environment:** branch `development` @ `ec96fa8f`; compose `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; HEADLESS=1 for Puppeteer.
3. **What was tested:** README / docs index pointers for public marketing `/features` (no login); no large new `docs/00xx-*.md`; no product-code changes for this index-only task; optional `test:features` smoke.
4. **Results:**
   - `rg '/features' README.md docs/README.md` hits both files — **PASS** (README Features L78 + Access Points L145; docs Quick links L20 + Feature guides L60).
   - Features / Access Points / Quick links / Feature guides clearly describe public marketing list (no login) — **PASS**.
   - No new large public-features guide under `docs/` — **PASS** (`ls docs/ | rg -i 'public.?features|marketing.?features'` empty; Feature guides row is a stub pointer).
   - Product code unchanged for this task — **PASS** (`git diff origin/development --stat` only `README.md` +2 / `docs/README.md` +2; no `back/` / `front/` in that diff).
   - Optional `BASE_URL=http://127.0.0.1:4202 npm run test:features --prefix front` — **PASS** (EXIT 0; hero “Everything Satisfecho offers”, 4 category sections, nav/CTA OK). Live `curl` `/features` → 200.
5. **Overall:** **PASS**
6. **Product owner feedback:** Contributors can now find the prospect-facing capabilities page from the main indexes without digging through changelog or Angular routes. The README Features + Access Points rows and the docs Quick links / Feature guides stub are enough; no extra guide file was needed. Smoke confirms `/features` still loads with hero, categories, and CTAs.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/features
8. **Relevant log excerpts:**
   - HAProxy: `GET /features HTTP/1.1` → 200 (04:46:39Z and 04:46:43Z).
   - Puppeteer: `>>> RESULT: /features loads with hero, categories, and nav/CTA.` EXIT 0.
   - pos-front: no build errors in the test window.
