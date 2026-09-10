---
## Closing summary (TOP)

- **What happened:** La tarea cerraba el ciclo sobre el issue de bump de versión (#70): alinear metadatos de release, `commit-hash` y smoke de landing sin promover `development` → `master` fuera de la política del repo.
- **What was done:** El código quedó documentado en la tarea (versión **2.0.64**, changelog **2.0.64**, aserción localhost en `test:landing-version`, regeneración de `commit-hash.ts`); el tester verificó `package.json`, `get-commit-hash.js`, `test:landing-version` y `test:changelog` — todo **PASS**.
- **What was tested:** Smoke Puppeteer en `http://127.0.0.1:4202`: pie de landing coincide con `front/package.json`; changelog carga correctamente.
- **Why closed:** Criterios de prueba cumplidos (informe del tester: **Overall PASS**).
- **Closed at (UTC):** 2026-03-28 09:56
---

# Bump Version

## GitHub

- **Issue:** https://github.com/satisfecho/pos/issues/70
- **Related (same topic, dedupe — no separate FEAT-):** https://github.com/satisfecho/pos/issues/77

## Problem / goal

The reporter notes many unmerged commits on `development` and asks to bump the version and merge into `master`/`main`. Version and changelog live in this repo per `front/package.json` / `CHANGELOG.md` and team rules in `.cursor/rules/commit-changelog-version.mdc`. Promotion of `development` → `master` is governed by `.cursor/rules/git-development-branch-workflow.mdc` and `docs/agent-loop.md` (not every bump requires an immediate production merge unless criteria there are met).

## High-level instructions for coder

- Review `CHANGELOG.md` `[Unreleased]` and align with what would ship; cut a new `## [X.Y.Z] - YYYY-MM-DD` section when appropriate and bump `front/package.json` / `front/package-lock.json` per project convention.
- Confirm branch state: routine commits stay on `development`; merging to `master` only when the workflow allows (batch cadence, production-urgent, or explicit product request).
- If the issue author expects an immediate production release, capture that explicitly in the issue or verify with the maintainer before merging `master`.
- After changes, run the usual smoke checks from `AGENTS.md` / `docs/testing.md` for anything that touches the built app.

## Implementation (feature coder)

- **Release metadata:** Repo is already at **`2.0.64`** in `front/package.json` / lockfile with **`## [2.0.64] - 2026-03-27`** in `CHANGELOG.md`; further items remain under **`[Unreleased]`** for a future cut.
- **`commit-hash.ts`:** Regenerated with **`node front/scripts/get-commit-hash.js`** so footer semver/hash match the current checkout (avoids stale `version` in the landing bar after a bump).
- **`test:landing-version`:** On **localhost** (`127.0.0.1` / `localhost` / `::1`), the first semver in the landing footer must equal **`front/package.json`** `version`. Mismatch fails fast (with hint to run `get-commit-hash.js`). Remote `BASE_URL` unchanged unless `SKIP_LANDING_PACKAGE_VERSION_CHECK=1`.
- **No `development` → `master` merge** in this task: promotion follows `.cursor/rules/git-development-branch-workflow.mdc`.

## Testing instructions

- **What to verify:** Landing footer semver matches **`front/package.json`** on localhost; `commit-hash.ts` updated when regenerating; Puppeteer smoke still passes.
- **How to test:**
  1. `grep '"version"' front/package.json` — note version (e.g. **2.0.64**).
  2. From repo root: `node front/scripts/get-commit-hash.js` — should write `front/src/environments/commit-hash.ts` with the same `version` and current short git hash when `.git` is available.
  3. With stack up (`docker-compose.yml` + `docker-compose.dev.yml`, HAProxy e.g. **4202**):  
     `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` — exit **0**; log line `Version element text:` must start with the package version.
  4. Optional: `npm run test:changelog --prefix front` — changelog modal still loads.
  5. Against a **remote** host with a different deployed version:  
     `SKIP_LANDING_PACKAGE_VERSION_CHECK=1 BASE_URL=https://… npm run test:landing-version --prefix front`
- **Pass/fail:** Step 3 exit **0** and footer semver equals package.json on localhost; step 2 produces consistent `commit-hash.ts`; step 4 optional **0** or skip.

## Coder completion notes (2026-03-28 UTC)

- Regenerated `commit-hash.ts` (version **2.0.64**, hash **7c920cd** at time of run).
- `test:landing-version` extended with localhost package-version assertion; full smoke run passed against **4202**.

---

## Test report (tester, 2026-03-28)

1. **Date/time (UTC) and log window:** 2026-03-28 ~09:54–09:56 UTC; HAProxy/front logs sampled for `GET /`, login, `/api/changelog` during Puppeteer runs.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL=http://127.0.0.1:4202`**; branch **`development`** (synced); **`HEADLESS=1`** (default for scripts).

3. **What was tested:** Package version **2.0.64** vs landing footer; `get-commit-hash.js` output; `test:landing-version`; optional `test:changelog`.

4. **Results**
   - **Step 1 — `package.json` version 2.0.64:** **PASS** — `grep '"version"' front/package.json` → `"version": "2.0.64"`.
   - **Step 2 — `node front/scripts/get-commit-hash.js`:** **PASS** — wrote `version = '2.0.64'`, `commitHash = '0414761'` (short hash for current `HEAD`). File reverted with `git checkout -- front/src/environments/commit-hash.ts` after verification so the tester leaves no persistent **`front/`** edits.
   - **Step 3 — `test:landing-version`:** **PASS** — exit **0**; stdout `Version element text: 2.0.64 0414761` (semver prefix matches package.json).
   - **Step 4 — `test:changelog`:** **PASS** — exit **0**; `Changelog loaded; content length: 77452`; `>>> RESULT: Changelog (What's new) test passed.`
   - **Step 5 (remote / SKIP check):** **N/A** — not required for pass criteria.

5. **Overall:** **PASS**

6. **Product owner feedback:** La versión mostrada en el pie de la landing coincide con **`package.json`** en localhost y el smoke Puppeteer (landing + navegación + changelog) termina en verde. Tras un bump conviene seguir ejecutando **`get-commit-hash.js`** para alinear hash en el footer con el commit actual.

7. **URLs tested**
   1. `http://127.0.0.1:4202/` (landing, footer version)
   2. `http://127.0.0.1:4202/dashboard` y rutas del sidebar ejercidas por el script (ver salida del test)
   3. Flujo “What’s new” / changelog vía test (sesión autenticada en la misma base URL)

8. **Relevant log excerpts**
   - **Puppeteer:** `Version element text: 2.0.64 0414761`; cierre `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.`
   - **pos-haproxy (muestra):** `GET /?token=…` 101/200 durante landing; `GET /api/changelog HTTP/1.1` **200** (~09:55:26Z).
   - **pos-front:** `Application bundle generation complete. … 2026-03-28T09:54:30.904Z` (build OK en ventana de prueba).

**Loop protection:** N/A

**GitHub (#70):** Si `gh issue comment` / etiquetas fallan por PAT, el closer o un humano pueden sincronizar el issue con este **PASS**.
