---
## Closing summary (TOP)

- **What happened:** Handoff review (**012-feature-coder-handoff**): implementation **not complete** — **`origin/master`** @ **`7a2c2bd5`** still **889** commits behind **`origin/development`** @ **`54961675`**; latest **Deploy to amvara9** run **`24773000757`** still **failure** (marketing artifacts — missing **`MARKETING_ARTIFACT_TOKEN` / `GH_TOKEN`**).
- **Why not UNTESTED:** Testing criterion **(2)** **FAIL** — no green **Deploy to amvara9** on **`master`**; **`development` → `master`** promotion not done.
- **Why archived:** GitHub **#251** is **CLOSED**; successor **#252** is **OPEN** (same scope). Per loop protection, active work moves to **`WIP-252-20260529-1430-push-to-master.md`**, not **WIP-251**.
- **Resume:** Complete **`development` → `master`** merge + green **Deploy to amvara9** under **#252**. Ensure Actions secrets per **`config/marketing-sites.json`**, then re-run or trigger deploy.
- **Closed at (UTC):** 2026-05-29
---

# Push to master

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/251
- **251** (CLOSED — superseded by **#252**)
- **Also tracked:** https://github.com/satisfecho/pos/issues/252 (duplicate “Push to master”; Agent 001 deduped 2026-05-29 — work continues on **WIP-252-…**)
- **Supersedes:** https://github.com/satisfecho/pos/issues/195 (closed; archived as **`CLOSED-195-20260529-1200-push-to-master.md`**)

## Problem / goal

Promote tested work from **`development`** to **`master`** so production (e.g. **amvara9**) can run current code, then confirm **Deploy to amvara9** completed successfully.

Follow **`.cursor/rules/git-development-branch-workflow.mdc`** for merge timing.

## Current state (2026-05-29)

| Check | Value |
|-------|-------|
| **`origin/development`** | **`5496167519e283b8c199f6b478e4467ad1362a3d`** |
| **`origin/master`** | **`7a2c2bd59b2cfb6cbc6a55ac407993494b17256f`** |
| Commits **`master..development`** | **889** |
| Latest **Deploy to amvara9** on **`master`** | **`24773000757`** — **failure** @ **`7a2c2bd`** (2026-04-22) |
| Blocker | Missing **`MARKETING_ARTIFACT_TOKEN` / `GH_TOKEN`** in Actions; marketing artifact fetch failed |

## High-level instructions for coder

- Sync **`development`**: **`./scripts/git-sync-development.sh`**.
- Merge **`development` → `master`** and push **`origin/master`** when allowed (production promotion / issue scope).
- Ensure GitHub Actions secrets include a PAT with **Actions read** on repos in **`config/marketing-sites.json`**, then trigger or re-run **Deploy to amvara9** on **`master`**.
- Verify green deploy via **`gh run list --workflow "Deploy to amvara9" --branch master`** and **`gh run view`**.
- Post summary on **#252** (merged SHA, deploy run id, green/fail).
- See **`docs/0001-ci-cd-amvara9.md`**, **`scripts/deploy-amvara9.sh`**, **`README.md`**.

## Implementation summary (feature coder)

*(Pending — prior partial work documented in archived **CLOSED-195-…**.)*

## Handoff log

- **2026-05-29 (Cursor):** Created from archived **WIP-195** after erroneous handoff loop (400+ duplicate passes). **#195** closed; **#251** open. State unchanged: **889** commits ahead on **`development`**; deploy **`24773000757`** still failed.
- **2026-05-29 (Agent 001):** **#252** opened (same “Push to master” ask). Deduped — no **FEAT-252**; work stayed in this WIP.
- **2026-05-29 (Handoff):** **#251** **CLOSED** on GitHub; **#252** **OPEN**. Criterion **(2)** still **FAIL** — not promoted to **UNTESTED**. Archived here; resume on **`WIP-252-…`**.

## Testing instructions

1. **Git:** After promotion, **`git rev-parse origin/master origin/development`** — tips should match (or **`master`** is intended release SHA).
2. **GitHub Actions:** Latest **Deploy to amvara9** for **`headBranch: master`** is **green** (marketing artifacts, SSH, build/restart, smoke test).
3. **Optional live:** **`https://satisfecho.de/api/health`** returns OK after deploy.
4. **Manual fallback:** Document if **`scripts/deploy-amvara9.sh`** used instead of green CI run.

**Pass criteria:** **`development`** promoted to **`master`** and **Deploy to amvara9** **green** for that commit (or documented manual parity).

**Archive note:** Work continues on **#252** / **`WIP-252-20260529-1430-push-to-master.md`**.
