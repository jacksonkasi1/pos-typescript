---
## Closing summary (TOP)

- **What happened:** **WIP-195** was stuck in an erroneous **handoff loop** (400+ identical **`012-feature-coder-handoff`** passes since 2026-05-26). Each pass re-checked git/Actions, found criterion **(2)** still **FAIL** (889 commits **`origin/master..origin/development`**; **Deploy to amvara9** run **`24773000757`** failed on marketing artifacts), and appended another handoff line without progressing the task or handing off to the open successor issue.
- **Why stuck:** Partial **`development` → `master`** promotion in April (**`7a2c2bd`**) never reached current **`development`** tip; deploy failed for missing **`MARKETING_ARTIFACT_TOKEN` / `GH_TOKEN`**. GitHub **#195** was **CLOSED**; successor **#251** is **OPEN** with the same scope.
- **What was done:** Archived **WIP-195** (this file) to stop the loop. Created **`WIP-251-20260529-1200-push-to-master.md`** for ongoing promotion/deploy work on **#251**. Updated **`agents2/012-feature-coder-handoff.md`** with loop-protection rules.
- **Resume:** Complete **`development` → `master`** merge + green **Deploy to amvara9** under **#251** / **`WIP-251-…`**. Ensure Actions secrets per **`config/marketing-sites.json`**, then re-run or trigger deploy.
- **Closed at (UTC):** 2026-05-29
---

# Push to Master

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/195
- **195** (CLOSED — superseded by **#251**)
- **Issue:** https://github.com/satisfecho/pos/issues/251
- **251** (OPEN — active successor; see **`WIP-251-20260529-1200-push-to-master.md`**)

## Problem / goal
Promote tested work from **`development`** to **`master`** so production (e.g. **amvara9**) can run current code. After deploy, confirm the **GitHub Actions** deployment workflow completed successfully (per issue text).

Follow repo branching rules: routine promotion timing vs urgent production fixes — see **`.cursor/rules/git-development-branch-workflow.mdc`**.

## High-level instructions for coder
- Confirm **`development`** is synced with **`origin/development`** and reflects the intended release scope (no accidental WIP).
- Merge **`development` → `master`** only when allowed by team rules (cadence, production-impacting trigger, or explicit urgent/production request on the issue). Align with **`docs/agent-loop.md`**.
- Push **`master`** to **`origin`** when merging for production.
- Deploy to **amvara9** using the documented path (see **`docs/0001-ci-cd-amvara9.md`**, **`scripts/deploy-amvara9.sh`** as referenced in **`README.md`** / **`AGENTS.md`**).
- For “review the success status of the deployment action on GitHub”: open the repo’s **Actions** tab for the relevant workflow run and verify success; capture any failure logs for follow-up without pasting secrets.
- Post a short summary on the issue when promotion/deploy is done (what was merged, whether CI/deploy is green).

## Implementation summary (feature coder)
- **`development`** was synced with **`origin/development`** (already up to date).
- **`master`** was fast-forwarded to **`7a2c2bd`** and pushed to **`origin/master`** (issue explicitly requested production promotion).
- **GitHub Actions — Deploy to amvara9** run **`24773000757`** (triggered by **`master`** push) **failed** at step **Fetch marketing site artifacts**: no **`MARKETING_ARTIFACT_TOKEN` / `GH_TOKEN`**; **`MARKETING_VERIFY_NO_PLACEHOLDERS=1`** failed for slugs **antillana**, **dilruba**, **flamanapolitana**, **gustazo**, **hakone**. Server deploy steps did not run.
- **Follow-up (repo settings):** ensure Actions secrets include a PAT with **Actions read** on every repo listed in **`config/marketing-sites.json`**, then re-run the failed workflow or redeploy.
- **As of 2026-05-29:** **`origin/development`** @ **`54961675`**; **`origin/master`** @ **`7a2c2bd5`**; **889** commits on **`development`** not on **`master`**. Work continues on **#251**.

## Handoff log (condensed)

- **2026-04-22:** Partial promotion to **`7a2c2bd`**; deploy **`24773000757`** **FAIL** (marketing artifacts).
- **2026-05-26 – 2026-05-29:** **`012-feature-coder-handoff`** ran **400+** times; criterion **(2)** unchanged **FAIL**; file grew to ~340k chars of duplicate entries. **#195** **CLOSED**; **#251** **OPEN**. Loop stopped by archiving this task and creating **`WIP-251-…`**.

## Testing instructions

1. **Git:** `git fetch origin && git rev-parse origin/master origin/development`; optional `git merge-base --is-ancestor origin/master origin/development` (exit **0** expected when **`development`** has advanced past **`master`**).
2. **GitHub Actions:** Latest **Deploy to amvara9** run for **`headBranch: master`** — expect **green** through **Fetch marketing site artifacts**, **Set up SSH**, **Build and restart stack on amvara9**, **Smoke test**. Reference run **`24773000757`** until a newer **`master`** run supersedes it. Use **`gh run list --repo satisfecho/pos --workflow "Deploy to amvara9"`** and **`gh run view`**. After **`MARKETING_ARTIFACT_TOKEN` / `GH_TOKEN`** are set per **`config/marketing-sites.json`**, **Re-run failed jobs** or trigger a new **`master`** deploy.
3. **Optional live:** After a **green** deploy, **`https://satisfecho.de/api/health`** (and UI per **`docs/0001-ci-cd-amvara9.md`**).
4. **Manual fallback:** **`scripts/deploy-amvara9.sh`** on the server per **`README.md`** / **`AGENTS.md`** if CI cannot be fixed immediately (document parity if used in place of a green run).

**Criterion (2):** **PASS** only when **§2** shows a **green** **Deploy to amvara9** for the promoted **`master`** commit, or **§4** manual parity is documented. Until then, **wip → untested** is **not** warranted.

**Archive note:** This task was **not** promoted to **UNTESTED** — work moved to **#251** / **`WIP-251-20260529-1200-push-to-master.md`**.
