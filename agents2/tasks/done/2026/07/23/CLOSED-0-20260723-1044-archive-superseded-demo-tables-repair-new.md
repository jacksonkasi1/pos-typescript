---
## Closing summary (TOP)

- **What happened:** Superseded demo-tables repair NEW stayed in the root queue after #305 shipped, inflating NEW backlog and leaving a dead preflight owner pointer.
- **What was done:** Archived the superseded NEW under `done/2026/07/12/` with a Closing summary citing #305 / CLOSED-305, and retargeted the sibling preflight NEW away from that dead owner; no seed/product code changes.
- **What was tested:** Archive path/summary present, preflight wording retargeted, `check_demo_tables` exit 0, no `back/`/`front/` diffs — overall **PASS**.
- **Why closed:** All pass criteria met; queue hygiene complete.
- **Closed at (UTC):** 2026-07-25 22:26
---

# Archive superseded demo-tables repair NEW

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`NEW-0-20260712-1614-repair-demo-tables-t01-t10.md`** is marked superseded by **#305** / **`CLOSED-305-20260723-0621-missing-tables.md`**, but it still sits in the root **NEW** queue. That inflates **NEW≈50**, keeps preflight/meta tasks pointing at a dead owner, and risks a second coder re-touching `seed_demo_tables` after the repair already shipped.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `demo_tables_check=ok`; `SIGNAL docs_stale×14` already owned — investigating queue health under deep NEW backlog
- Root task still present with banner: “Superseded by FEAT-305 / … Do **not** implement again”
- **CLOSED-305** asked to close/supersede that NEW once the FEAT shipped; archive under **`agents2/tasks/done/`** never happened
- Sibling **`NEW-0-20260722-2120-preflight-skip-demo-tables-when-queued.md`** still cites the superseded NEW as the repair owner

## High-level instructions for coder

- Rename **`NEW-0-20260712-1614-repair-demo-tables-t01-t10.md`** → **`CLOSED-0-20260712-1614-repair-demo-tables-t01-t10.md`** (keep original `YYYYMMDD-HHMM-slug`; only change status prefix)
- Prepend a short **Closing summary**: superseded by **#305** / archived CLOSED-305; no separate implementation; `check_demo_tables` now OK
- Move with **`./scripts/move-agent-task-to-done.sh agents2/tasks/CLOSED-0-20260712-1614-repair-demo-tables-t01-t10.md`**
- In **`NEW-0-20260722-2120-preflight-skip-demo-tables-when-queued.md`**, retarget “repair owner” wording to **CLOSED-305** / any future fail + open repair task (do not block that preflight task on this archive)
- Do **not** change `seed_demo_tables` / product seeds; do **not** reopen #305
- Pass criteria: superseded NEW absent from root `agents2/tasks/`; present under `done/2026/07/12/` (or the date folder from its filename); root NEW count drops by 1; `check_demo_tables` still exit 0

## Implementation notes (coder)

- Closed superseded NEW with Closing summary (superseded by **#305** / CLOSED-305; no separate seed work).
- Archived to **`agents2/tasks/done/2026/07/12/CLOSED-0-20260712-1614-repair-demo-tables-t01-t10.md`** via `./scripts/move-agent-task-to-done.sh`.
- Retargeted **`NEW-0-20260722-2120-preflight-skip-demo-tables-when-queued.md`**: live owner = any open root repair task; historical pointer → CLOSED-305 / archived 20260712 NEW.
- No changes to `seed_demo_tables`, product seeds, or #305.
- Verified: `check_demo_tables` exit 0; superseded file absent from root `agents2/tasks/`.

## Testing instructions

### What to verify

1. Superseded repair NEW is **not** in root `agents2/tasks/` as NEW/WIP/UNTESTED/TESTING.
2. Archived file exists at `agents2/tasks/done/2026/07/12/CLOSED-0-20260712-1614-repair-demo-tables-t01-t10.md` with a Closing summary citing #305 / CLOSED-305.
3. Sibling preflight NEW no longer names the 20260712 NEW as the live repair owner; wording points at CLOSED-305 + future open owners.
4. Demo tables check still healthy; no accidental seed/product edits.

### How to test

```bash
# From repo root
test ! -e agents2/tasks/NEW-0-20260712-1614-repair-demo-tables-t01-t10.md
test -f agents2/tasks/done/2026/07/12/CLOSED-0-20260712-1614-repair-demo-tables-t01-t10.md
rg -n 'CLOSED-305|archived|open root' agents2/tasks/NEW-0-20260722-2120-preflight-skip-demo-tables-when-queued.md
# Must not treat the archived NEW as live owner:
! rg -n 'owned by \*\*`NEW-0-20260712-1614-repair-demo-tables' agents2/tasks/NEW-0-20260722-2120-preflight-skip-demo-tables-when-queued.md
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.check_demo_tables
git diff --stat -- back/ front/   # expect empty (no product/seed changes)
```

### Pass/fail criteria

- **Pass:** All checks above succeed; `check_demo_tables` prints OK and exits 0; `git diff` shows no `back/` or `front/` changes from this task.
- **Fail:** Superseded NEW still in root queue, archive missing/wrong path, preflight sibling still cites 20260712 NEW as live owner, `check_demo_tables` non-zero, or unexpected seed/product diffs.

## Test report

1. **Date/time (UTC):** 2026-07-25 22:25:29 – 22:25:34 UTC. Log window: `docker compose … logs --since 5m --tail=20 back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development` (synced via `./scripts/git-sync-development.sh`); no browser (`BASE_URL` N/A).
3. **What was tested:** Archive of superseded demo-tables repair NEW; preflight sibling retarget; `check_demo_tables` health; no accidental `back/`/`front/` seed edits.
4. **Results:**
   - Superseded NEW absent from root queue (no NEW/WIP/UNTESTED/TESTING for `repair-demo-tables-t01-t10`) — **PASS** (`test ! -e agents2/tasks/NEW-0-20260712-1614-repair-demo-tables-t01-t10.md`; no root glob matches).
   - Archive at `agents2/tasks/done/2026/07/12/CLOSED-0-20260712-1614-repair-demo-tables-t01-t10.md` with Closing summary citing #305 / CLOSED-305 — **PASS**.
   - Sibling preflight NEW retargeted: cites CLOSED-305 + open-root future owners; does not treat archived 20260712 NEW as live owner — **PASS** (`rg CLOSED-305|archived|open root`; `! rg 'owned by \`NEW-0-20260712-1614-repair-demo-tables'`).
   - `check_demo_tables` exit 0 — **PASS** (`OK: tenant 1 has T01–T10 with correct seat counts.`).
   - No product/seed diffs in `back/` or `front/` — **PASS** (`git diff --stat -- back/ front/` empty).
5. **Overall:** **PASS**
6. **Product owner feedback:** Queue hygiene is correct: the superseded repair NEW is archived under `done/2026/07/12/` with a clear Closing summary, and the preflight sibling no longer points at a dead owner. Demo tables remain healthy with no seed code churn from this archive-only task. Safe to close.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
$ docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.check_demo_tables
OK: tenant 1 has T01–T10 with correct seat counts.
(exit 0)

$ git diff --stat -- back/ front/
(empty)
```
