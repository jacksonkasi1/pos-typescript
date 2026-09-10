# Push to master

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/266
- **266**
- **Supersedes:** https://github.com/satisfecho/pos/issues/264 (closed 2026-06-04; archived as **`CLOSED-264-20260604-1325-push-to-master.md`**)

## Problem / goal

Promote tested work from **`development`** to **`master`** so production (e.g. **amvara9** / **satisfecho.de**) runs current code, then confirm **Deploy to amvara9** completed successfully on GitHub Actions.

The issue author asks to merge **`development` → `master`** when appropriate and, if deploying to amvara9, verify the deployment workflow succeeded.

Follow **`.cursor/rules/git-development-branch-workflow.mdc`** — this is an explicit production-promotion request.

**Context (2026-06-04):** After sync, **`origin/development`** @ **`729c8e85`** is **2 commits** ahead of **`origin/master`** @ **`e4bc415b`**. Commits to promote include **#265** (normalize translated product category labels to canonical English keys) and the closed-task archive for #264. Prior promotion **#264** deployed **`8739e33f`** successfully (Actions run **26954708996**); latest **`master`** deploy runs (**26957058191**, **26957177362**) succeeded at **`e4bc415b`**.

## High-level instructions for coder

- Confirm **`development`** is green locally (smoke: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → 200; relevant Puppeteer if recent changes touched those flows — e.g. category normalization from #265).
- Merge **`development` → `master`** (merge commit or team-preferred fast-forward), push **`origin/master`**.
- Watch **Deploy to amvara9** for the pushed **`master`** commit; document run URL and conclusion in the task file.
- Verify production: `curl -sf https://www.satisfecho.de/api/health`; optional `BASE_URL=https://www.satisfecho.de npm run test:landing-version` from `front/` (footer version/hash should match deployed commit).
- If deploy fails on amvara9, check **Actions** logs and **`docs/0001-ci-cd-amvara9.md`** (dirty tree, migrations, marketing artifacts) before retrying.
- Append **Testing instructions** when ready for tester; do not skip **wip → untested** flow.

## Implementation notes

- **Local smoke:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → **200**.
- **Merge:** `development` → `master` merge commit **`d81564ed`** pushed to **`origin/master`**.
- **Commits promoted (2):** **#265** — normalize translated product category labels to canonical English keys (`729c8e85`); closed-task archive for #264 (`026fbc7c`).
- **Deploy to amvara9:** https://github.com/satisfecho/pos/actions/runs/26959930339 — **success** (~3m12s). All steps green including smoke test on server.
- **Production checks:**
  - `curl -sf https://www.satisfecho.de/api/health` → `{"status":"ok"}`
  - Landing footer on https://www.satisfecho.de shows **`2.1.4 d81564ed`** (matches deployed commit).
  - `LANDING_VERSION_ONLY=1 BASE_URL=https://www.satisfecho.de npm run test:landing-version` → **PASS**.

## Testing instructions

1. Confirm **`master`** tip is **`d81564ed`**: `git fetch origin && git rev-parse --short origin/master`.
2. Confirm deploy workflow succeeded: open https://github.com/satisfecho/pos/actions/runs/26959930339 (conclusion **success**).
3. Production health: `curl -sf https://www.satisfecho.de/api/health` → `{"status":"ok"}`.
4. Production landing version: load https://www.satisfecho.de/ and verify footer shows **`2.1.4 d81564ed`** (or run `LANDING_VERSION_ONLY=1 BASE_URL=https://www.satisfecho.de npm run test:landing-version` from `front/`).
5. **Category normalization (#265):** On amvara9, run `docker compose exec back python -m pytest back/tests/test_category_normalize.py -q` (or verify products with translated category labels resolve to canonical English keys via staff catalog UI).
6. Optional full landing + login on production: `BASE_URL=https://www.satisfecho.de LOGIN_EMAIL=… LOGIN_PASSWORD=… npm run test:landing-version` from `front/` (needs valid production credentials).

---

## Test report

1. **Date/time (UTC):** 2026-06-04T15:01:00Z – 2026-06-04T15:02:30Z. Log window: production HTTP checks + amvara9 `pos-back` exec (no local Docker stack required for this promotion task).

2. **Environment:** Production **amvara9** / **`https://www.satisfecho.de`**; branch **`master`** @ **`d81564ed`**; deploy confirmed via GitHub Actions run (not fixed sleep). Local repo synced on **`development`** for git checks only.

3. **What was tested:** Master tip commit; **Deploy to amvara9** workflow conclusion; production `/api/health`; landing footer version/hash; category normalization (#265) via pytest on amvara9.

4. **Results:**
   - **`origin/master` tip `d81564ed`:** **PASS** — `git fetch origin && git rev-parse --short origin/master` → `d81564ed`.
   - **Deploy workflow run 26959930339:** **PASS** — `gh run view` → `status: completed`, `conclusion: success`, `headSha: d81564ed…`, updated 2026-06-04T15:01:15Z.
   - **Production health:** **PASS** — `curl -sf https://www.satisfecho.de/api/health` → `{"status":"ok"}`.
   - **Landing version/hash:** **PASS** — `LANDING_VERSION_ONLY=1 BASE_URL=https://www.satisfecho.de npm run test:landing-version` → footer **`2.1.4 d81564ed`**.
   - **Category normalization (#265) on production:** **PASS** — On amvara9, `docker compose exec back python -m pytest tests/test_category_normalize.py -q` → **7 passed** in 3.67s.
   - **Optional full landing + login on production:** **SKIP** — no production staff credentials in repo; not required for promotion sign-off.

5. **Overall:** **PASS**

6. **Product owner feedback:** Production is running merge **`d81564ed`** with health OK and the landing page showing the expected version and commit hash. Category normalization from #265 is verified on amvara9 via the full pytest suite (7 tests). Promotion of #265 and the #264 archive is complete and live.

7. **URLs tested:**
   1. https://www.satisfecho.de/
   2. https://www.satisfecho.de/api/health
   3. https://github.com/satisfecho/pos/actions/runs/26959930339 (deploy workflow — verified via `gh`)

8. **Relevant log excerpts:**
   - Deploy: GitHub Actions run **26959930339** — `conclusion: success`, head **`d81564ed`**, ~3m12s.
   - Production health: `{"status":"ok"}`.
   - Category pytest (amvara9 `pos-back`): `7 passed, 2 warnings in 3.67s`.
   - Landing Puppeteer: `Version element text: 2.1.4 d81564ed…` → **RESULT: Landing page shows version.**
