---
## Closing summary (TOP)

- **What happened:** Enhancement preflight always woke 008 on `demo_tables_check=fail` even when an open repair-owner task already covered demo-table repair.
- **What was done:** Added `open_demo_tables_repair_owner()` in `scripts/enhancement-reviewer-preflight.sh` so owned fails emit an informational line and skip `SIGNAL` / `G008_DEMO_SIGNALS`; unowned fails keep SIGNAL behaviour; meta-task and doc-only cites are excluded as owners.
- **What was tested:** Owned vs unowned fail paths, meta/doc-only exclusion, and healthy `demo_tables_check=ok` via readonly preflight — overall **PASS**.
- **Why closed:** All pass criteria met; no back/front changes.
- **Closed at (UTC):** 2026-07-25 22:54
---

# Preflight: skip demo_tables_check SIGNAL when repair task is already queued

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Preflight always emits `SIGNAL demo_tables_check=fail` when `check_demo_tables` exits non-zero. When an open root task already owns demo-table repair, every agent-loop tick re-wakes **008** on the same owned failure. (Historical owner **`NEW-0-20260712-1614-repair-demo-tables-t01-t10`** was superseded by **#305** / **`CLOSED-305-20260723-0621-missing-tables.md`** and archived under `done/2026/07/12/` — do not cite that NEW as live owner.) Mirror the queued-docs skip pattern: keep the check output visible, but do not count an owned fail as a wake SIGNAL.

## Evidence (008 preflight / review)

- Digest: `SIGNAL demo_tables_check=fail (run seed_demo_tables)` every run
- Re-check 2026-07-22T21:20Z: still Missing `T05`/`T07`/`T10`, Wrong `T08` seats (expected 2, got 6) — unchanged; root cause documented on the repair NEW (`run()` skips partial tenants)
- Sibling: **`NEW-0-20260722-1433-preflight-skip-queued-stale-docs.md`** already covers `docs_stale` ownership; demo has no equivalent
- Demo-table product repair shipped as **CLOSED-305** (`done/2026/07/23/CLOSED-305-20260723-0621-missing-tables.md`). On a future `check_demo_tables` fail, ownership is whichever open root `{NEW,FEAT,WIP,UNTESTED,TESTING}-*.md` covers demo-table repair (or a new NEW if none). Demo products: historical **`NEW-0-20260722-1320-repair-demo-products-partial-tenant.md`** (may already be archived).

## High-level instructions for coder

- In `scripts/enhancement-reviewer-preflight.sh`, after a failing `check_demo_tables`, **skip** `SIGNAL demo_tables_check=fail` / `G008_DEMO_SIGNALS` increment if any root `agents2/tasks/{NEW,FEAT,WIP,UNTESTED,TESTING}-*.md` already covers demo-table repair (filename or body mentions `check_demo_tables`, `seed_demo_tables`, or `repair-demo-tables`)
- Still print a non-SIGNAL line such as `demo_tables_check=fail (owned by open task …)` so humans see the health status
- If no open owner exists, keep today’s SIGNAL behaviour (e.g. after CLOSED-305 with no new repair NEW, a fresh fail must SIGNAL)
- Do not implement the seed repair in this task; do not revive the archived 20260712 repair NEW
- Pass criteria: with an open repair-owner task present, readonly preflight shows fail as informational and does not increment `G008_DEMO_SIGNALS` / wake-only SIGNAL count for that fail; removing/renaming the owner restores SIGNAL

## Implementation notes (002 coder)

- Added `open_demo_tables_repair_owner()` in `scripts/enhancement-reviewer-preflight.sh`.
- On `check_demo_tables` failure: if an open root repair-owner task exists, emit `demo_tables_check=fail (owned by open task …)` and do **not** increment `G008_DEMO_SIGNALS`; otherwise keep `SIGNAL demo_tables_check=fail (run seed_demo_tables)`.
- Owner match: basename `repair-demo-tables` / `missing-tables`, or demo-tables slug + body markers `check_demo_tables|seed_demo_tables|repair-demo-tables`. Excludes `*preflight-skip-demo-tables*` so this meta-task never owns itself. Doc-only body cites (e.g. seat-math NEW) do not suppress the SIGNAL.
- No seed / `back/` / `front/` changes.

## Testing instructions

### What to verify

1. Failing `check_demo_tables` with an open repair-owner task does **not** emit `SIGNAL demo_tables_check=fail` and does **not** bump `G008_DEMO_SIGNALS` for that fail; emits informational `demo_tables_check=fail (owned by open task …)`.
2. Same fail with **no** open repair owner still emits `SIGNAL demo_tables_check=fail` and increments `G008_DEMO_SIGNALS`.
3. This preflight task (and doc-only cites of `check_demo_tables`) are **not** treated as repair owners.
4. Healthy demo tables still report `demo_tables_check=ok`.

### How to test

From repo root:

```bash
# 1) Owner helper: no owner → empty; with synthetic repair NEW → basename; remove → empty
bash <<'BASH'
set -euo pipefail
ROOT="$(pwd)"
TASKDIR="$ROOT/agents2/tasks"
eval "$(sed -n '/^open_demo_tables_repair_owner()/,/^}/p' scripts/enhancement-reviewer-preflight.sh)"
owner="$(open_demo_tables_repair_owner || true)"
[[ -z "${owner:-}" ]]
TMP="$TASKDIR/NEW-0-20990101-0000-repair-demo-tables-verify-owner.md"
echo '# temp' >"$TMP"
owner="$(open_demo_tables_repair_owner || true)"
[[ "$owner" == "NEW-0-20990101-0000-repair-demo-tables-verify-owner.md" ]]
# Fail-branch messaging must not increment demo signals when owned
G008_DEMO_SIGNALS=0
demo_tables_owner="$owner"
if [[ -n "$demo_tables_owner" ]]; then
  echo "demo_tables_check=fail (owned by open task ${demo_tables_owner})"
else
  G008_DEMO_SIGNALS=$((G008_DEMO_SIGNALS + 1))
fi
[[ "$G008_DEMO_SIGNALS" -eq 0 ]]
rm -f "$TMP"
owner="$(open_demo_tables_repair_owner || true)"
[[ -z "${owner:-}" ]]
echo "owner-helper OK"
BASH

# 2) Readonly preflight (healthy DB): still ok
ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh | grep -E 'demo_tables_check|G008_DEMO_SIGNALS|SIGNAL demo_tables'

# 3) Demo check still healthy (optional)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.check_demo_tables
```

Optional full fail-path: leave a root `NEW-*-repair-demo-tables-*.md` in place, temporarily break tenant-1 seats, re-run readonly preflight, confirm owned line and no `SIGNAL demo_tables_check`, then restore via `python -m app.seeds.seed_demo_tables` and remove the temp NEW.

### Pass/fail criteria

- **Pass:** Owned fail → informational line only, `G008_DEMO_SIGNALS` unchanged by that fail; unowned fail → `SIGNAL demo_tables_check=fail`; preflight meta-task not an owner; `demo_tables_check=ok` when tables healthy.
- **Fail:** Owned fail still SIGNALs / increments demo signals; unowned fail suppressed; or seed/`back`/`front` changed by this task.

## Test report

1. **Date/time (UTC):** start 2026-07-25 22:53:28 UTC; end 2026-07-25 22:53:55 UTC. Log window: ~22:53–22:54 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; local HAProxy `http://127.0.0.1:4202` (no browser). Readonly preflight via `ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh`.
3. **What was tested:** Owned vs unowned `check_demo_tables` fail messaging; meta-task / doc-only exclusion from repair ownership; healthy `demo_tables_check=ok`.
4. **Results:**
   - Owned fail → informational only, no `SIGNAL demo_tables_check`, `G008_DEMO_SIGNALS=0`: **PASS** — broke T08 seats to 6 with temp `NEW-0-20990101-0000-repair-demo-tables-verify-owner.md`; preflight emitted `demo_tables_check=fail (owned by open task NEW-0-20990101-0000-repair-demo-tables-verify-owner.md)`.
   - Unowned fail → `SIGNAL demo_tables_check=fail` and `G008_DEMO_SIGNALS=1`: **PASS** — removed temp NEW; same broken seats; preflight emitted `SIGNAL demo_tables_check=fail (run seed_demo_tables)`.
   - Meta-task / doc-only not owners: **PASS** — `TESTING-*-preflight-skip-demo-tables*` present with empty owner; synthetic seat-math NEW citing `check_demo_tables` did not match.
   - Healthy tables → `demo_tables_check=ok`: **PASS** — after `seed_demo_tables`, check exited 0; readonly preflight `demo_tables_check=ok`, `G008_DEMO_SIGNALS=0`.
   - Scope: no `back/` / `front/` changes for this task: **PASS** — diff only `scripts/enhancement-reviewer-preflight.sh`.
5. **Overall:** **PASS**
6. **Product owner feedback:** Preflight now suppresses the demo-tables wake SIGNAL when a real repair-owner task is open, while still printing the fail for humans. Removing the owner restores the SIGNAL immediately. Safe for the agent loop: this meta-task cannot own itself.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
   ```
   Wrong seat_count: ['T08(expected=2, got=6)']
   demo_tables_check=fail (owned by open task NEW-0-20990101-0000-repair-demo-tables-verify-owner.md)
   G008_DEMO_SIGNALS=0
   SIGNAL demo_tables_check=fail (run seed_demo_tables)
   G008_DEMO_SIGNALS=1
   Tenant 1: updated 1 table(s) seat counts.
   OK: tenant 1 has T01–T10 with correct seat counts.
   demo_tables_check=ok
   G008_DEMO_SIGNALS=0
   ```

