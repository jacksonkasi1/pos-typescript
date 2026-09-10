---
## Closing summary (TOP)

- **What happened:** Handoff review (**012-feature-coder-handoff**): implementation **not complete** — **`origin/master`** @ **`4fa55922`** still **893** commits behind **`origin/development`** @ **`6c5366e8`**; latest **Deploy to amvara9** run **`26624263512`** still **failure** @ **`4fa55922`** (marketing artifacts — **Fetch marketing site artifacts** step).
- **Why not UNTESTED:** Testing criterion **(2)** **FAIL** — no green **Deploy to amvara9** on **`master`**; full **`development` → `master`** promotion not done (only partial push: La Moca marketing-site registration commit on **`master`**).
- **Why archived:** GitHub **#252** is **CLOSED** (2026-05-29); no open successor issue for same scope. Per loop protection, **WIP-252** archived — do not keep active task on closed issue.
- **Resume:** Open a new issue (or re-open) for **`development` → `master`** promotion + green **Deploy to amvara9**. Ensure Actions secrets (**`MARKETING_ARTIFACT_TOKEN` / `GH_TOKEN`**) per **`config/marketing-sites.json`**, merge **`development` → `master`**, then verify deploy green.
- **Closed at (UTC):** 2026-05-29
---

# Push to master

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/252
- **252** (CLOSED — 2026-05-29; no open successor)
- **Supersedes:** https://github.com/satisfecho/pos/issues/251 (closed; archived as **`CLOSED-251-20260529-1200-push-to-master.md`**)
- **Also related:** https://github.com/satisfecho/pos/issues/195 (closed; archived as **`CLOSED-195-20260529-1200-push-to-master.md`**)

## Problem / goal

Promote tested work from **`development`** to **`master`** so production (e.g. **amvara9**) can run current code, then confirm **Deploy to amvara9** completed successfully.

Follow **`.cursor/rules/git-development-branch-workflow.mdc`** for merge timing.

## Current state (2026-05-29)

| Check | Value |
|-------|-------|
| **`origin/development`** | **`6c5366e8fa93b34dc8a0c0faadb06f6a6c1cc5e9`** |
| **`origin/master`** | **`4fa55922dbd8fe155e329fe225158fead1401017`** |
| Commits **`master..development`** | **893** |
| Latest **Deploy to amvara9** on **`master`** | **`26624263512`** — **failure** @ **`4fa55922`** (2026-05-29) |
| Blocker | **Fetch marketing site artifacts** failed; likely missing **`MARKETING_ARTIFACT_TOKEN` / `GH_TOKEN`** in Actions |

## High-level instructions for coder

- Sync **`development`**: **`./scripts/git-sync-development.sh`**.
- Merge **`development` → `master`** and push **`origin/master`** when allowed (production promotion / issue scope).
- Ensure GitHub Actions secrets include a PAT with **Actions read** on repos in **`config/marketing-sites.json`**, then trigger or re-run **Deploy to amvara9** on **`master`**.
- Verify green deploy via **`gh run list --workflow "Deploy to amvara9" --branch master`** and **`gh run view`**.
- Post summary on linked issue (merged SHA, deploy run id, green/fail).
- See **`docs/0001-ci-cd-amvara9.md`**, **`scripts/deploy-amvara9.sh`**, **`README.md`**.

## Implementation summary (feature coder)

*(Pending — partial **`master`** push only: **`4fa55922`** “Register La Moca marketing site…”. Full **`development` → `master`** promotion and green deploy not done.)*

## Handoff log

- **2026-05-29 (Handoff):** Created from archived **WIP-251** / **CLOSED-251-…** after **012-feature-coder-handoff** review. **#251** closed; **#252** open. State unchanged: **889** commits ahead on **`development`**; deploy **`24773000757`** still failed. **Not** promoted to **UNTESTED** (criterion **(2)** **FAIL**).
- **2026-05-29 (Handoff):** **#252** **CLOSED** on GitHub. **`origin/master`** advanced to **`4fa55922`** (partial); **`development`** @ **`6c5366e8`** still **893** commits ahead. Deploy **`26624263512`** **failure** (marketing artifacts). **Not** promoted to **UNTESTED** (criterion **(2)** **FAIL**). Archived here; resume via new issue when promotion/deploy is retried.

## Testing instructions

1. **Git:** After promotion, **`git rev-parse origin/master origin/development`** — tips should match (or **`master`** is intended release SHA).
2. **GitHub Actions:** Latest **Deploy to amvara9** for **`headBranch: master`** is **green** (marketing artifacts, SSH, build/restart, smoke test).
3. **Optional live:** **`https://satisfecho.de/api/health`** returns OK after deploy.
4. **Manual fallback:** Document if **`scripts/deploy-amvara9.sh`** used instead of green CI run.

**Pass criteria:** **`development`** promoted to **`master`** and **Deploy to amvara9** **green** for that commit (or documented manual parity).

**Criterion (2):** **PASS** only when **§2** shows a **green** **Deploy to amvara9** for the promoted **`master`** commit, or **§4** manual parity is documented. Until then, **wip → untested** is **not** warranted.

**Archive note:** No open GitHub issue tracks this scope; open/re-open an issue before creating a new **WIP-** task.
