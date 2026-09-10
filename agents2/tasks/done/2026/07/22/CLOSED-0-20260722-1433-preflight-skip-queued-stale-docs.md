---
## Closing summary (TOP)

- **What happened:** Preflight kept emitting `SIGNAL docs_stale` for docs already covered by open NEW tasks, waking 008 with duplicate noise.
- **What was done:** Preflight now treats stale docs owned by open root tasks as `docs_stale_owned` (still logs `stale_doc … owned by open task`) and only SIGNALs / bumps `G008_DOC_DRIFT` for unqueued stale stems.
- **What was tested:** Readonly preflight with current queue (`docs_stale_owned=13`, no SIGNAL, `G008_DOC_DRIFT=0`); hiding PRINTING owners re-SIGNALed; owner helper smoke passed — overall PASS.
- **Why closed:** All pass criteria met; no product UI impact.
- **Closed at (UTC):** 2026-07-26 01:12
---

# Preflight: skip docs_stale SIGNAL when already queued

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Preflight emits `SIGNAL docs_stale` for every `docs/*.md` with mtime older than 90 days while code moved. That count stays high even after 008 has already queued per-doc **NEW-0-…** tasks, so the agent loop keeps waking 008 and the reviewer is tempted to invent more doc-status work. With **NEW≈36** already, duplicate SIGNAL noise is harmful.

## Evidence (008 preflight / review)

- Digest: `SIGNAL docs_stale count=14` listing the same basenames (0023, 0018, 0029, 0050, 0025, 0014, 0033, 0019, PRINTING, 0013, 0024, 0007, 0032, 0026, …)
- All 14 SIGNAL basenames already have matching root tasks under `agents2/tasks/NEW-0-20260722-*.md` (verified this run); remaining >90d docs also covered
- Preflight loop: `find docs … | head -20` ages files with no check against open tasks

## High-level instructions for coder

- In `scripts/enhancement-reviewer-preflight.sh`, when classifying a stale doc, **skip** (or count separately as informational) if any root `agents2/tasks/{NEW,FEAT,WIP,UNTESTED,TESTING}-*.md` filename or body already mentions that basename (e.g. `0026-haproxy-ssl-amvara9` / `PRINTING`)
- Keep emitting plain `stale_doc path=…` lines optional for humans; only the **SIGNAL docs_stale** / `G008_DOC_DRIFT` increment should ignore already-queued basenames
- Still SIGNAL truly unqueued stale docs
- Dry-run readonly preflight: with current queue, `SIGNAL docs_stale count` should drop toward 0 (or only list unqueued leftovers)
- Pass criteria: readonly preflight no longer reports `docs_stale` for basenames already owned by open tasks; unqueued stale docs still signal

## Implementation notes (002 coder)

- Added `open_stale_doc_owner()` in `scripts/enhancement-reviewer-preflight.sh`.
- Per stale `docs/*.md`: still emit `stale_doc path=…`; if an open root task owns the stem, append `(owned by open task …)` and count under `docs_stale_owned` (no `SIGNAL` / no `G008_DOC_DRIFT++`).
- Unowned stale docs still increment `stale_docs` and emit `SIGNAL docs_stale count=…` / bump `G008_DOC_DRIFT`.
- Owner match: filename contains stem, or body mentions `docs/<stem>` / `<stem>.md` (case-insensitive fixed-string). Excludes `*preflight-skip-queued-stale-docs*` so this meta-task never owns itself. Casual bare tokens like `PRINTING` without path/`.md` do not suppress.
- No `back/` / `front/` changes.

## Testing instructions

### What to verify

1. With the current open queue covering the usual stale basenames, readonly preflight does **not** emit `SIGNAL docs_stale` for those owned stems and does **not** bump `G008_DOC_DRIFT` for them; emits `stale_doc … (owned by open task …)` plus `docs_stale_owned count=…`.
2. When an owner task for a stale stem is removed/hidden, that stem appears as a plain `stale_doc` and contributes to `SIGNAL docs_stale` / `G008_DOC_DRIFT`.
3. This meta-task filename does not count as an owner for other stems via its own body.

### How to test

From repo root on `development`:

```bash
mkdir -p tmp
ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh tmp/008-preflight-stale-docs.txt
rg -n 'stale_doc|docs_stale_owned|SIGNAL docs_stale|G008_DOC_DRIFT=' tmp/008-preflight-stale-docs.txt

# Owner helper smoke
bash <<'BASH'
set -euo pipefail
TASKDIR="$(pwd)/agents2/tasks"
eval "$(sed -n '/^open_stale_doc_owner()/,/^}/p' scripts/enhancement-reviewer-preflight.sh)"
owner="$(open_stale_doc_owner PRINTING || true)"
[[ -n "$owner" ]]
owner="$(open_stale_doc_owner 'ZZZ-not-a-real-doc-stem-xyz' || true)"
[[ -z "${owner:-}" ]]
echo OWNER_HELPER_OK
BASH
```

Optional unowned check (hide printing owners, then restore):

```bash
OWNER=agents2/tasks/NEW-0-20260722-1213-printing-doc-design-status.md
INDEX=agents2/tasks/NEW-0-20260723-1825-index-printing-docs-readme.md
mv "$OWNER" agents2/tasks/done/_tmp-hide-printing-owner.md
[[ -f "$INDEX" ]] && mv "$INDEX" agents2/tasks/done/_tmp-hide-index-printing.md
ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh tmp/008-preflight-unowned.txt
rg -n 'PRINTING|SIGNAL docs_stale|G008_DOC_DRIFT=' tmp/008-preflight-unowned.txt
mv agents2/tasks/done/_tmp-hide-printing-owner.md "$OWNER"
[[ -f agents2/tasks/done/_tmp-hide-index-printing.md ]] && mv agents2/tasks/done/_tmp-hide-index-printing.md "$INDEX"
```

`BASE_URL` / Docker: not required for this heuristic (compose may run demo checks if `back` is up; ignore those lines).

### Pass/fail criteria

- **Pass:** Current queue → `docs_stale_owned count>0`, no `SIGNAL docs_stale` for owned stems (or `count` only of unqueued leftovers); hiding PRINTING owners → `SIGNAL docs_stale count≥1` and `G008_DOC_DRIFT≥1`.
- **Fail:** Owned stems still increment `SIGNAL docs_stale` / `G008_DOC_DRIFT`, or unqueued stale docs never SIGNAL.

## Test report

1. **Date/time (UTC):** start 2026-07-26 01:11:59 UTC; end 2026-07-26 01:12:18 UTC. Log window N/A for product containers (script-only); preflight digests `tmp/008-preflight-stale-docs.txt` and `tmp/008-preflight-unowned.txt`.
2. **Environment:** branch `development` @ `530e81b2`; repo root; `ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh`; compose stack up (demo checks ran, ignored for pass/fail). `BASE_URL` N/A.
3. **What was tested:** Owned-queue stale-doc SIGNAL suppression; unowned PRINTING re-SIGNAL after temporarily hiding owner tasks; meta-task does not own stems via its body/filename.
4. **Results:**
   - Owned queue suppresses SIGNAL / G008 for covered stems: **PASS** — `docs_stale_owned count=13`; 13× `stale_doc … (owned by open task …)`; no `SIGNAL docs_stale`; `G008_DOC_DRIFT=0`.
   - Unowned stale stem still SIGNALs: **PASS** — after hiding `NEW-0-20260722-1213-printing-doc-design-status.md` (+ index), `stale_doc path=docs/PRINTING.md` (no owned suffix); `SIGNAL docs_stale count=1`; `G008_DOC_DRIFT=1`; owners restored.
   - Meta-task not an owner: **PASS** — with PRINTING owners hidden, PRINTING still unowned despite this task’s body; owner helper: `PRINTING` → `NEW-0-20260722-1213-printing-doc-design-status.md`, fake stem empty; `OWNER_HELPER_OK`.
5. **Overall:** **PASS**
6. **Product owner feedback:** Preflight noise for already-queued stale docs is gone (`G008_DOC_DRIFT=0` with the current NEW queue). Unqueued drift still wakes 008, so the reviewer is not blind. Safe to close; no product UI impact.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
# owned run
docs_stale_owned count=13 (open tasks already cover these basenames; not SIGNAL)
G008_DOC_DRIFT=0
# unowned PRINTING (owners temporarily hidden, then restored)
stale_doc path=docs/PRINTING.md age_days=128
SIGNAL docs_stale count=1 (docs/*.md untouched >90d while code moved)
G008_DOC_DRIFT=1
OWNER_HELPER_OK
```
