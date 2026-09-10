---
## Closing summary (TOP)

- **What happened:** Stamp-only dirty trees under agents2 were creating noisy chore commits for time-of-last-review / last-scan files (#313).
- **What was done:** Committer local path now skips stamp-only trees (no add/commit/push); 040-committer and docs/agent-loop document the contract; stamps may still bundle with real work.
- **What was tested:** Stamp-only → no commit (PASS); gitignore for 001/008 stamps (PASS); mixed tree does not take stamp-only skip (PASS); docs/#313 contract strings present (PASS). Overall PASS.
- **Why closed:** All testing criteria passed; product-owner feedback confirms stamp-only chore noise is gone.
- **Closed at (UTC):** 2026-07-26 07:46
---

# Commit frequency for time-of-last-review.txt

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/313
- **313**

## Problem / goal

Stamp / scan files under **`agents2/`** (especially **`time-of-last-review.txt`** and related **`last-scan.json`**) should **not** produce standalone git commits when nothing else changed. Noise from **`chore(agents2): update 001 reviewer time-of-last-review stamp`** (often only **`agents2/005-marketing-repos-reviewer/time-of-last-review.txt`** + **`agents2/008-enhancement-reviewer/last-scan.json`**) pollutes history.

Desired: append stamps locally as today; **commit them only together with real code/docs/task changes**, or leave them uncommitted / gitignored when the tree is stamp-only.

## High-level instructions for coder

- Inspect **`committer_try_local_stamp_only`** / allowlist in **`agents2/pos-cursor-loop.sh`** and any parallel rules in **`agents2/040-committer.md`** — this path currently commits stamp-only trees by design.
- Change behavior so a **stamp-only** dirty tree does **not** create a commit (skip local stamp commit; leave files local / gitignored as appropriate). Prefer documenting the skip in **`docs/agent-loop.md`** if the committer contract changes.
- Keep stamps writable for agents (001/005/008 still append). If a file must stay tracked (e.g. marketing stamp), only stage it when the same commit already includes non-stamp product/docs/task work — or gitignore + stop force-tracking if that matches team intent.
- Confirm **`agents2/001-gh-reviewer/time-of-last-review.txt`** and **`agents2/008-enhancement-reviewer/time-of-last-review*.txt`** remain gitignored (already in root **`.gitignore`**); do not re-introduce force-add of ignored stamps.
- Smoke: with only stamp files dirty, committer/local path should exit without a new commit; with real changes + stamps, one normal commit may still include stamps if that remains useful — do not invent stamp-only chore commits.
- Append **Testing instructions** for the tester (how to simulate stamp-only vs mixed tree).

## Implementation notes (coder)

- **`committer_try_local_stamp_only`** in **`agents2/pos-cursor-loop.sh`** now **skips** (no `git add` / `git commit` / push) when the dirty tree is allowlist-only; leaves stamps uncommitted and does not invoke cursor-agent.
- **`agents2/040-committer.md`**: explicit “do not commit stamp-only” rule; may still bundle stamps with real work.
- **`docs/agent-loop.md`** + **`CHANGELOG.md` `[Unreleased]`** updated for the contract change.
- Tracked stamps (005 `time-of-last-review.txt`, 008 `last-scan.json`) remain tracked; 001/008 `time-of-last-review*.txt` stay gitignored (no force-add).

## Testing instructions

1. **Stamp-only → no commit**
   - Ensure branch is **`development`**.
   - Make only stamp/scan paths dirty, e.g. touch/append:
     - `agents2/005-marketing-repos-reviewer/time-of-last-review.txt`
     - `agents2/008-enhancement-reviewer/last-scan.json`
   - Confirm `git diff --name-only HEAD` lists **only** allowlisted stamp paths (no `back/`, `front/`, tasks, docs, etc.).
   - Record `HEAD_BEFORE=$(git rev-parse HEAD)`.
   - Run: `AGENT_GIT_SYNC=0 ./agents2/pos-cursor-loop.sh committer`
   - **Pass:** log contains `stamp-only dirty tree — leave uncommitted`; `git rev-parse HEAD` equals `$HEAD_BEFORE`; no new `chore(agents2): … stamp` commit.
   - **Fail:** HEAD advances or a stamp-only chore commit appears.

2. **Gitignore still in force**
   - Run: `git check-ignore -v agents2/001-gh-reviewer/time-of-last-review.txt agents2/008-enhancement-reviewer/time-of-last-review.txt agents2/008-enhancement-reviewer/time-of-last-review.archive.txt`
   - **Pass:** all three are ignored by root `.gitignore`.
   - Confirm `agents2/pos-cursor-loop.sh` no longer contains `chore(agents2): update 001 reviewer time-of-last-review stamp`.

3. **Mixed tree → normal committer path (not stamp-only skip)**
   - With stamps dirty **and** at least one non-stamp change (e.g. a doc or task file), run committer (or inspect allowlist): `committer_paths_all_local_stamp_allowlist` must be false / log must **not** show the stamp-only skip before cursor/manual commit.
   - **Pass:** non-stamp work can still be committed; stamps **may** be included in that same commit (optional), but there is no stamp-only chore commit.
   - Dry docs check: `rg -n 'stamp-only dirty tree|Do not commit stamp-only|#313' agents2/pos-cursor-loop.sh agents2/040-committer.md docs/agent-loop.md`

## Test report

1. **Date/time (UTC):** 2026-07-26T07:44:35Z start → 2026-07-26T07:45:41Z end. Log window: N/A for product containers (agent-loop / git only).
2. **Environment:** branch `development` @ `f56aa12a` (+ uncommitted #313 implementation in main tree). Stamp-only / mixed e2e in isolated `git worktree` `tmp/313-wt` on throwaway branch `tmp/313-stamp-test` (committed implementation there as `8b523a57`, then removed). `AGENT_GIT_SYNC=0`. No `BASE_URL` / compose app smoke required.
3. **What was tested:** (1) stamp-only dirty tree → no commit; (2) gitignore for 001/008 stamp txts + absence of old 001 stamp chore commit message; (3) mixed stamp+doc tree does not take stamp-only skip; docs/#313 contract strings present.
4. **Results:**
   - Stamp-only → no commit: **PASS** — log `stamp-only dirty tree — leave uncommitted`; `HEAD` unchanged `8b523a57…`.
   - Gitignore still in force: **PASS** — all three paths ignored by root `.gitignore`; no `chore(agents2): update 001 reviewer time-of-last-review stamp` in `pos-cursor-loop.sh`.
   - Mixed tree → not stamp-only skip: **PASS** — with stamps + `docs/agent-loop.md` dirty and `AGENT_COMMITTER_USE_CURSOR=0`, log shows cursor skip for non-stamp work (not stamp-only skip); HEAD unchanged (no stamp-only chore commit).
   - Docs contract: **PASS** — `rg` hits in `pos-cursor-loop.sh`, `040-committer.md`, `docs/agent-loop.md` for stamp-only / #313.
5. **Overall:** **PASS**
6. **Product owner feedback:** Stamp-only reviewer noise is gone: allowlist-only dirty trees leave stamps local and never invent chore stamp commits. Mixed trees still reach the normal committer path so real work can bundle stamps later. Contract is documented in the committer agent prompt and agent-loop docs.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:**
```
----- committer (local: stamp-only dirty tree — leave uncommitted; no cursor-agent)
## tmp/313-stamp-test
 M agents2/005-marketing-repos-reviewer/time-of-last-review.txt
 M agents2/008-enhancement-reviewer/last-scan.json

----- committer (skip cursor-agent: AGENT_COMMITTER_USE_CURSOR=0 — non-stamp changes need manual commit or set AGENT_COMMITTER_USE_CURSOR=1)
## tmp/313-stamp-test
 M agents2/005-marketing-repos-reviewer/time-of-last-review.txt
 M agents2/008-enhancement-reviewer/last-scan.json
 M docs/agent-loop.md
```
