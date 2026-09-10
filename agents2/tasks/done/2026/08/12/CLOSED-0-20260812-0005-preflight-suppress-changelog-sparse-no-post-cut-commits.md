---
## Closing summary (TOP)

- **What happened:** Enhancement preflight falsely raised `SIGNAL changelog_sparse` after a version cut when Unreleased was empty and no code commits landed after the newest version date.
- **What was done:** `scripts/enhancement-reviewer-preflight.sh` now suppresses that SIGNAL (and the doc-drift bump) when post-cut `back/` / `front/src/` commits are zero; the existing 2-day / 48h fresh-cut suppress remains.
- **What was tested:** Readonly preflight passed live no-post-cut suppress, fresh-cut preference, and SIGNAL return with a stale version-date fixture; CHANGELOG restored after fixtures.
- **Why closed:** All pass criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-08-12 00:08
---

# Preflight: suppress changelog_sparse when no commits after version cut

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`SIGNAL changelog_sparse` wakes **008** when `[Unreleased]` is empty and there were many `back/` / `front/src/` commits in 14 days. After a version cut, Unreleased is correctly empty. The 2-day / 48h fresh-cut suppress (from `CLOSED-0-20260722-2120-preflight-changelog-sparse-after-cut`) expires, then the SIGNAL fires again even when **no** code commits landed after the newest `## [X.Y.Z]` date. That is a false positive and creates useless changelog hygiene work for the committer.

## Evidence (008 preflight / review)

- Digest `2026-08-12T00:04:26Z`: `SIGNAL changelog_sparse Unreleased may lag recent code (7 commits, 0 bullets)`
- Newest section: `## [2.1.147] - 2026-08-09`; `front/package.json` is **2.1.147**; Unreleased bullets = 0
- The 14d commits are mostly earlier release cuts (2.1.141–2.1.146) already documented in versioned CHANGELOG sections; Talk to POS is already under **2.1.147**
- `git log --after='2026-08-09'` on `back/` + `front/src/` shows **no** post-cut product commits that need Unreleased bullets
- `changelog_sparse_fresh_cut` in `scripts/enhancement-reviewer-preflight.sh` only checks days ≤ 2 or CHANGELOG touch ≤ 48h — not “commits after version date”
- Do **not** invent Unreleased bullets for this lag; product changelog stays with committer / `.cursor/rules/commit-changelog-version.mdc`

## High-level instructions for coder

- In `scripts/enhancement-reviewer-preflight.sh`, also suppress `SIGNAL changelog_sparse` (and its `G008_DOC_DRIFT` bump) when Unreleased has fewer than 2 bullets **and** there are **zero** `back/` / `front/src/` commits whose commit date is **after** the newest `## [N.N.N] - YYYY-MM-DD` section date (UTC day boundary is fine)
- Keep the existing 2-day / 48h fresh-cut suppress
- Keep informational lines (`changelog_unreleased_bullets`, `changelog_newest_version_date`, optional `changelog_sparse=suppressed (no commits after version date…)`)
- Still emit `SIGNAL changelog_sparse` when Unreleased is sparse **and** at least one code commit exists after the newest version date
- Do not edit product `CHANGELOG.md` `[Unreleased]` in this task
- Pass: readonly preflight with empty Unreleased, newest version older than 2 days, and no post-cut code commits → **no** `SIGNAL changelog_sparse`; add a throwaway post-cut commit on `back/` or `front/src/` in a fixture/test path (or document a manual check) and confirm the SIGNAL returns

## Implementation notes (2026-08-12 UTC)

- Updated `scripts/enhancement-reviewer-preflight.sh`:
  - New helper `code_commits_after_version_date`: counts `back/` + `front/src/` commits strictly after the newest `## [N.N.N] - YYYY-MM-DD` (UTC day boundary = `--since` next calendar day).
  - When Unreleased bullets `< 2` and `code_commits_14d > 5`:
    1. Existing `changelog_sparse_fresh_cut` (≤2 UTC days or 48h touch + 0 bullets) → `changelog_sparse=suppressed (recent version cut; …)`
    2. Else if post-cut code commits == 0 → `changelog_sparse=suppressed (no commits after version date; …)` (no `G008_DOC_DRIFT` bump)
    3. Else → `SIGNAL changelog_sparse` (message includes post-cut count) and `G008_DOC_DRIFT++`
- No product `CHANGELOG.md` / Unreleased edits

## Testing instructions

### What to verify

1. Live repo with empty Unreleased, newest version older than 2 UTC days, and **zero** `back/` / `front/src/` commits after that version date → **no** `SIGNAL changelog_sparse`; emit `changelog_sparse=suppressed (no commits after version date; …)`.
2. Informational lines still appear (`changelog_unreleased_bullets`, `changelog_newest_version_date`).
3. Existing fresh-cut suppress (newest version within 2 UTC days) still wins with `changelog_sparse=suppressed (recent version cut; …)`.
4. When Unreleased is sparse **and** at least one code commit exists after the newest version date → `SIGNAL changelog_sparse` returns (and `G008_DOC_DRIFT` includes +1 for that reason).

### How to test

From repo root (readonly; no app required for the changelog heuristic):

```bash
ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh tmp/008-preflight-live.txt
rg -n 'changelog_|SIGNAL changelog_sparse|G008_DOC_DRIFT' tmp/008-preflight-live.txt
```

Expect (when Unreleased is empty and no post-cut code commits, as on 2026-08-12 after **2.1.147** / 2026-08-09):

- `changelog_sparse=suppressed (no commits after version date; …)`
- no `SIGNAL changelog_sparse`

SIGNAL path (fixture; restore CHANGELOG afterward):

```bash
cp CHANGELOG.md tmp/CHANGELOG.md.bak
# Rewrite newest version date to an older day so real history has post-cut commits, e.g.:
#   ## [2.1.147] - 2026-07-01
ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh tmp/008-preflight-stale-with-commits.txt
rg -n 'SIGNAL changelog_sparse|G008_DOC_DRIFT' tmp/008-preflight-stale-with-commits.txt
mv tmp/CHANGELOG.md.bak CHANGELOG.md
```

Fresh-cut still preferred (optional): set newest version date to today UTC; expect `changelog_sparse=suppressed (recent version cut; …)`.

### Pass/fail criteria

- **Pass:** No post-cut code commits + sparse Unreleased → suppress line present, `SIGNAL changelog_sparse` absent. Post-cut commits exist + sparse Unreleased (and not covered by fresh-cut) → `SIGNAL changelog_sparse` present. Fresh-cut path unchanged. Informational changelog lines still print. CHANGELOG restored after fixtures.
- **Fail:** Live empty-Unreleased / no-post-cut case still emits `SIGNAL changelog_sparse`, or real post-cut lag no longer SIGNALs, or fresh-cut suppress breaks.

## Test report

1. **Date/time (UTC):** 2026-08-12 00:07:16–00:07:29 UTC. Log window: N/A — script-only preflight (no app containers required for changelog heuristic).
2. **Environment:** branch `development` @ `710f7fd1`; repo root; `ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh`; outputs under `tmp/008-preflight-*.txt`. No `BASE_URL` / Docker app stack.
3. **What was tested:** Live empty-Unreleased / no-post-cut suppress; informational changelog lines; fresh-cut suppress still preferred; SIGNAL + `G008_DOC_DRIFT` when post-cut code commits exist (CHANGELOG date fixtures; restored after each run).
4. **Results:**
   - Live no-post-cut suppress: **PASS** — `tmp/008-preflight-live.txt` has `changelog_sparse=suppressed (no commits after version date; newest=2026-08-09, unreleased=0)`; no `SIGNAL changelog_sparse`; `G008_DOC_DRIFT=0`.
   - Informational lines: **PASS** — `changelog_unreleased_bullets=0` and `changelog_newest_version_date=2026-08-09` present on live run.
   - Fresh-cut suppress: **PASS** — newest header set to `2026-08-12`; `changelog_sparse=suppressed (recent version cut; newest=2026-08-12, unreleased=0)`; no SIGNAL; `G008_DOC_DRIFT=0`; CHANGELOG restored.
   - SIGNAL when post-cut commits exist: **PASS** — newest header set to `2026-07-01`; `SIGNAL changelog_sparse Unreleased may lag recent code (7 commits, 0 bullets, 151 after 2026-07-01)`; `G008_DOC_DRIFT=1`; CHANGELOG restored (`## [2.1.147] - 2026-08-09` intact; `git diff --stat -- CHANGELOG.md` clean).
5. **Overall:** **PASS**
6. **Product owner feedback:** The false-positive after a version cut is gone when no code lands after the newest section date. Real lag still raises `SIGNAL changelog_sparse` and bumps doc drift. Fresh-cut suppress still wins when the newest version date is within two UTC days.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
# live
changelog_unreleased_bullets=0 changelog_last_touch=2026-08-09 18:28:34 +0200
changelog_newest_version_date=2026-08-09
changelog_sparse=suppressed (no commits after version date; newest=2026-08-09, unreleased=0)
G008_DOC_DRIFT=0

# stale version date fixture
changelog_newest_version_date=2026-07-01
SIGNAL changelog_sparse Unreleased may lag recent code (7 commits, 0 bullets, 151 after 2026-07-01)
G008_DOC_DRIFT=1

# fresh-cut fixture
changelog_newest_version_date=2026-08-12
changelog_sparse=suppressed (recent version cut; newest=2026-08-12, unreleased=0)
G008_DOC_DRIFT=0
```
