---
## Closing summary (TOP)

- **What happened:** GitHub **#253** requested **`development` → `master`** promotion and a green **Deploy to amvara9** on production.
- **What was done:** Fixed **`.github/workflows/deploy-amvara9.yml`** (`git checkout -f` / `git clean -fd` on amvara9 after dirty-tree deploy failures), merged **`development` → `master`** at **`65f68e92`**, pushed **`origin/master`**, and triggered deploy run **`26710660453`** (**success**, ~2m56s).
- **What was tested:** Tester confirmed merge commit on **`origin/master`**, green **Deploy to amvara9**, live **`/api/health`**, landing version **2.0.86** with git hash **`65f68e92`** — **PASS** (login step optional/out of scope).
- **Why closed:** All pass criteria met; production promotion and deploy verified on **satisfecho.de**.
- **Closed at (UTC):** 2026-05-31 11:02
---

# Push to master

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/253
- **253**
- **Supersedes:** https://github.com/satisfecho/pos/issues/252 (closed 2026-05-29; archived as **`CLOSED-252-20260529-1430-push-to-master.md`**)

## Problem / goal

Promote tested work from **`development`** to **`master`** so production (e.g. **amvara9**) can run current code, then confirm **Deploy to amvara9** completed successfully on GitHub Actions.

The issue author asks to merge **`development` → `master`** when appropriate and, if deploying to amvara9, verify the deployment workflow succeeded.

Follow **`.cursor/rules/git-development-branch-workflow.mdc`** for merge timing (production promotion / explicit push-to-master request).

## Implementation (feature coder)

1. **Root cause of prior deploy failure:** amvara9 server had a dirty working tree (`front/nginx.conf` and marketing-site files) blocking `git checkout` during CI deploy (run **26630264861**). Marketing artifact fetch was already succeeding.
2. **Fix:** `.github/workflows/deploy-amvara9.yml` — use `git checkout -f` and `git clean -fd` after fetch so local server edits do not block reset.
3. **Promotion:** merged **`development` → `master`** (merge commit **`65f68e92`**) and pushed **`origin/master`**.
4. **Deploy:** push triggered **Deploy to amvara9** run **`26710660453`** — **green** (2m56s).

## Current state (after implementation)

| Check | Value |
|-------|-------|
| **`origin/development`** | **`676425f7`** |
| **`origin/master`** | **`65f68e92`** (merge of development + prior La Moca commit) |
| Latest **Deploy to amvara9** on **`master`** | **`26710660453`** — **success** (push, 2026-05-31) |
| Live smoke (coder) | `https://www.satisfecho.de/` 200, `/api/health` 200, `/gustazo/` not placeholder |

## Testing instructions

1. **Git:** `git fetch origin && git rev-parse origin/master origin/development` — **`master`** should be merge commit **`65f68e92`** containing development work; tips need not be identical SHA.
2. **GitHub Actions:** `gh run view 26710660453` — **Deploy to amvara9** **green** (marketing artifacts, SSH, build/restart, smoke test).
3. **Live:** `curl -sf https://www.satisfecho.de/api/health` returns OK.
4. **Optional:** `BASE_URL=https://www.satisfecho.de HEADLESS=1 npm run test:landing-version` from `front/`.

**Pass criteria:** **`development`** promoted to **`master`** and **Deploy to amvara9** **green** for that commit (or documented manual parity).

---

## Test report

**Date/time (UTC):** 2026-05-31T10:59:00Z – 2026-05-31T11:02:00Z  
**Log window:** N/A — production verification via `gh`, `curl`, Puppeteer (no local compose logs for this task).  
**Environment:** `origin/master` / `origin/development` after `./scripts/git-sync-development.sh`; production **`BASE_URL=https://www.satisfecho.de`**.

### What was tested

Promotion of **`development` → `master`**, green **Deploy to amvara9** for merge commit **`65f68e92`**, live health, landing version/hash, Gustazo marketing page.

### Results

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | **`origin/master`** is merge commit **`65f68e92`** containing development work | **PASS** | `git rev-parse origin/master` → `65f68e92cc50f2f8ecc028d27b993419b588c8d6`; merge parents `4fa55922` + `676425f71` (development tip at promotion). `origin/development` now **`419c99b9`** (ahead post-merge — expected). |
| 2 | **Deploy to amvara9** run **`26710660453`** green | **PASS** | `gh run view 26710660453`: `conclusion=success`, `headSha=65f68e92`, duration ~2m56s. URL: https://github.com/satisfecho/pos/actions/runs/26710660453 |
| 3 | Live **`/api/health`** OK | **PASS** | `curl -sf https://www.satisfecho.de/api/health` → `{"status":"ok"}` |
| 4 | Optional landing version test | **PASS** (partial) | `npm run test:landing-version`: landing loads, footer shows **`2.0.86`** and git hash **`65f68e92`** (matches deployed commit). Login step failed (401 — no credentials in env); out of scope for pass criteria. |

### Overall

**PASS** — **`development`** promoted to **`master`** at **`65f68e92`**; **Deploy to amvara9** **green** for that commit; production health and version/hash confirmed.

### Product owner feedback

Production promotion succeeded after the deploy workflow fix (`git checkout -f` / `git clean -fd` on amvara9). The live site reports version **2.0.86** with commit **`65f68e92`**, matching the merged **`master`** tip. Gustazo marketing page serves real content (not a placeholder).

### URLs tested

1. https://www.satisfecho.de/api/health  
2. https://www.satisfecho.de/  
3. https://www.satisfecho.de/gustazo/  
4. https://www.satisfecho.de/ (Puppeteer landing + login attempt)

### Relevant log excerpts

```
# git rev-parse origin/master origin/development
65f68e92cc50f2f8ecc028d27b993419b588c8d6
419c99b92a27ee87d9c4f2907638023bf3df97f3

# gh run view 26710660453
{"conclusion":"success","headSha":"65f68e92cc50f2f8ecc028d27b993419b588c8d6","name":"Deploy to amvara9","status":"completed"}

# curl health
{"status":"ok"}

# test:landing-version (footer)
Version element text: 2.0.86 65f68e92Open source with ♥ from El Masnou (Barcelona) & Los Mochis (Mexico).
```
