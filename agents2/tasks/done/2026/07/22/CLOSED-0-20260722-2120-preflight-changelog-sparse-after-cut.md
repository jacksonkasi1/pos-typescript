---
## Closing summary (TOP)

- **What happened:** Enhancement-reviewer preflight was falsely emitting `SIGNAL changelog_sparse` right after a version cut left `[Unreleased]` empty.
- **What was done:** `scripts/enhancement-reviewer-preflight.sh` now suppresses that SIGNAL (and the related `G008_DOC_DRIFT` bump) for a recent version cut or fresh CHANGELOG touch while still printing informational changelog lines.
- **What was tested:** Readonly preflight fixtures — fresh cut suppressed SIGNAL; stale sparse Unreleased still SIGNALed; live digest still showed informational lines. Overall **PASS**.
- **Why closed:** All pass criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-25 23:13
---

# Preflight: do not SIGNAL changelog_sparse right after a version cut

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`scripts/enhancement-reviewer-preflight.sh` emits `SIGNAL changelog_sparse` whenever **[Unreleased]** has fewer than 2 bullets and there were >5 `back/` / `front/src/` commits in 14 days. After a same-day (or recent) `## [X.Y.Z]` cut, Unreleased is **correctly empty**, but the SIGNAL still fires and keeps waking **008**. That false positive also nudged agents to re-open changelog hygiene while a product NEW once owned post-cut Unreleased tracking. **Historical owner** **`NEW-0-20260712-1614-changelog-unreleased-recent-work`** was archived 2026-07-26 as **`done/2026/07/12/CLOSED-0-20260712-1614-changelog-unreleased-recent-work.md`** (further Unreleased = committer/coder when new work lands).

## Evidence (008 preflight / review)

- Digest 2026-07-22T21:19Z: `SIGNAL changelog_sparse Unreleased may lag recent code (13 commits, 0 bullets)` while latest section is **`## [2.1.24] - 2026-07-22`** (same UTC day as the sweep)
- Heuristic only counts Unreleased `- ` bullets vs 14d code commits; it does not look at the newest versioned section date or whether CHANGELOG was just cut
- ~~Open owner for real lag after new work: **`NEW-0-20260712-1614-changelog-unreleased-recent-work.md`** (scoped to post-2.1.24 / WIP-304)~~ — **archived** 2026-07-26 under `done/2026/07/12/`; Unreleased ownership → committer / `.cursor/rules/commit-changelog-version.mdc`

## High-level instructions for coder

- In `scripts/enhancement-reviewer-preflight.sh`, suppress **`SIGNAL changelog_sparse`** (and its `G008_DOC_DRIFT` increment) when **any** of:
  - Newest `## [N.N.N] - YYYY-MM-DD` is within the last **2 calendar days** (UTC), or
  - `CHANGELOG.md` git last-touch is within **48h** and Unreleased has 0 bullets (fresh cut)
- Keep emitting informational lines (`changelog_unreleased_bullets=0`, last touch) for humans
- Optionally still SIGNAL if Unreleased is empty **and** the newest version section is older than 2 days **and** there were code commits after that section’s date
- Do not invent Unreleased bullets in this task; product changelog edits stay with committer/coder (July-12 NEW later archived; do not re-open it)
- Pass criteria: readonly preflight after a same-day cut with empty Unreleased does **not** emit `changelog_sparse`; a deliberately stale empty Unreleased with older version date still can

## Implementation notes (2026-07-25 UTC)

- Updated `scripts/enhancement-reviewer-preflight.sh`:
  - Helpers: `newest_changelog_version_date`, `days_since_ymd`, `changelog_touch_age_hours`, `changelog_sparse_fresh_cut`
  - When `code_commits_14d > 5` and Unreleased bullets `< 2`, emit `changelog_sparse=suppressed (recent version cut; …)` instead of `SIGNAL changelog_sparse` / `G008_DOC_DRIFT++` if newest `## [N.N.N] - YYYY-MM-DD` is within **2 UTC calendar days**, or Unreleased is **0** and CHANGELOG git/mtime touch is within **48h**
  - Always emit informational `changelog_unreleased_bullets`, `changelog_last_touch`, and `changelog_newest_version_date`
- No CHANGELOG / product code edits (per task)
- Local verify: empty-Unreleased fixture with newest version **2026-07-26** → `changelog_sparse=suppressed`; fixture with 1 Unreleased bullet + version **2026-06-01** → `SIGNAL changelog_sparse`

## Testing instructions

### What to verify

1. After a recent version cut with empty (or &lt;2-bullet) Unreleased, preflight does **not** emit `SIGNAL changelog_sparse` and does **not** increment `G008_DOC_DRIFT` for that reason.
2. Informational lines still appear (`changelog_unreleased_bullets`, `changelog_newest_version_date`, and when suppressed `changelog_sparse=suppressed`).
3. A stale cut (newest version date older than 2 UTC days, Unreleased &lt; 2, and not covered by the 48h+0-bullet touch rule) still emits `SIGNAL changelog_sparse`.

### How to test

From repo root (readonly; does not need the app for the changelog heuristic):

```bash
ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh tmp/008-preflight-verify.txt
rg -n 'changelog_|SIGNAL changelog_sparse|G008_DOC_DRIFT' tmp/008-preflight-verify.txt
```

Fresh-cut suppress (optional fixture; restore CHANGELOG afterward):

```bash
cp CHANGELOG.md tmp/CHANGELOG.md.bak
# Strip Unreleased bullets only (keep ## [Unreleased] and latest ## [X.Y.Z] - date within 2 UTC days)
# …then:
ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh tmp/008-fresh-cut.txt
rg -n 'changelog_sparse' tmp/008-fresh-cut.txt
mv tmp/CHANGELOG.md.bak CHANGELOG.md
```

Stale SIGNAL (optional): rewrite newest version date to an old day (e.g. `2026-06-01`) and leave Unreleased with 0–1 bullets; expect `SIGNAL changelog_sparse` when `code_commits_last_14d > 5`.

### Pass/fail criteria

- **Pass:** Fresh cut + Unreleased &lt; 2 → `changelog_sparse=suppressed` present, `SIGNAL changelog_sparse` absent. Stale cut → `SIGNAL changelog_sparse` present. Live digest still prints `changelog_unreleased_bullets` / `changelog_newest_version_date`.
- **Fail:** Same-day (or ≤2 UTC day) cut with empty Unreleased still emits `SIGNAL changelog_sparse`, or stale lag no longer SIGNALs.

## Test report

1. **Date/time (UTC):** 2026-07-25T23:12:07Z start → 2026-07-25T23:12:30Z end. Log window: preflight digests under `tmp/008-*-cut.txt` / `tmp/008-preflight-verify.txt` (readonly script; no app container window required).
2. **Environment:** local repo root on branch `development`; `ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh`; Docker stack up (unused for this heuristic). `BASE_URL` N/A.
3. **What was tested:** Fresh-cut suppress of `SIGNAL changelog_sparse` / no `G008_DOC_DRIFT++` for that reason; informational changelog lines; stale empty/sparse Unreleased still SIGNALs.
4. **Results:**
   - Fresh cut (Unreleased bullets=0, newest version `2026-07-26`) → **PASS** — `changelog_sparse=suppressed (recent version cut; newest=2026-07-26, unreleased=0)`; no `SIGNAL changelog_sparse`; `G008_DOC_DRIFT=13` (same as live baseline, no +1 for sparse).
   - Informational lines → **PASS** — live digest has `changelog_unreleased_bullets=2`, `changelog_newest_version_date=2026-07-26`, `changelog_last_touch=…`; fixtures also emit bullets/date (+ suppressed or SIGNAL).
   - Stale cut (Unreleased bullets=1, newest version rewritten to `2026-06-01`, `code_commits_last_14d=46`) → **PASS** — `SIGNAL changelog_sparse Unreleased may lag recent code (46 commits, 1 bullets)`; `G008_DOC_DRIFT=14` (+1 vs baseline).
5. **Overall:** **PASS**
6. **Product owner feedback:** The false wake after a same-day cut is fixed: empty Unreleased plus a recent `## [X.Y.Z]` date yields suppress, not SIGNAL. Real lag after an older cut still wakes 008. CHANGELOG was restored after fixtures; no product/changelog edits left behind.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
# live
changelog_unreleased_bullets=2 changelog_last_touch=2026-07-26 01:03:48 +0200
changelog_newest_version_date=2026-07-26
G008_DOC_DRIFT=13

# fresh-cut fixture
changelog_unreleased_bullets=0 …
changelog_newest_version_date=2026-07-26
changelog_sparse=suppressed (recent version cut; newest=2026-07-26, unreleased=0)
G008_DOC_DRIFT=13

# stale-cut fixture
changelog_unreleased_bullets=1 …
changelog_newest_version_date=2026-06-01
SIGNAL changelog_sparse Unreleased may lag recent code (46 commits, 1 bullets)
G008_DOC_DRIFT=14
```
