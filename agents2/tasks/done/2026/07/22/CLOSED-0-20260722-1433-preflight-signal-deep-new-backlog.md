---
## Closing summary (TOP)

- **What happened:** Deep NEW task queues did not emit a preflight `SIGNAL task_backlog`, so weekly 008 sweeps kept adding doc-hygiene NEWs while older work sat unstarted.
- **What was done:** Preflight now emits `SIGNAL task_backlog new=…` (and increments `G008_TASK_SIGNALS`) when NEW exceeds the threshold (default 20), keeps existing `PAUSE new_backlog`, and prints a soft `hint new_queue` below threshold.
- **What was tested:** Readonly preflight PASS for deep NEW (SIGNAL+PAUSE+flags) and simulated under-threshold (hint only; no NEW SIGNAL/PAUSE); WIP+TESTING SIGNAL path unchanged.
- **Why closed:** All pass criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-26 01:58
---

# Preflight: SIGNAL when NEW task backlog is deep

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

008 guidance says to defer large **FEAT-*** when the queue is heavy, but preflight only emits `SIGNAL task_backlog` for **WIP+TESTING > 8**. A deep **NEW** pile (currently **36**) does not signal, so weekly sweeps keep adding more doc-hygiene NEWs while demo repair and other older NEWs sit unstarted. Operators and the agent loop need an explicit backlog pause signal.

## Evidence (008 preflight / review)

- Digest: `NEW=36 FEAT=0 WIP=1 UNTESTED=0 TESTING=0` — no `SIGNAL task_backlog`
- Code: only `wip_n + testing_n > 8` increments `G008_TASK_SIGNALS`
- Same-day 008 runs already queued dozens of NEW doc-status tasks; SIGNAL `docs_stale` / `demo_tables_check` remain owned by earlier NEWs

## High-level instructions for coder

- In `scripts/enhancement-reviewer-preflight.sh`, when `NEW` root task count exceeds a threshold (suggest **20**, document in a one-line comment), emit e.g. `SIGNAL task_backlog new=${new_n} (prefer drain NEW before more FEAT/doc tasks)` and increment `G008_TASK_SIGNALS`
- Optionally print a soft hint in the task-queue section even below threshold; SIGNAL only above threshold
- Do not auto-delete or close tasks; signal only
- Align wording with existing WIP+TESTING backlog SIGNAL
- Pass criteria: with NEW≥20, readonly preflight shows the new SIGNAL; with NEW low, it does not

## Implementation notes (2026-07-26)

- Preflight already had **`PAUSE new_backlog`** / **`G008_NEW_BACKLOG_PAUSE`** (threshold **`ENHANCEMENT_NEW_BACKLOG_MAX`**, default 20) wired into **`agents2/pos-cursor-loop.sh`** and **`008-enhancement-reviewer.md`**. Left that intact.
- Added **`SIGNAL task_backlog new=${new_n}`** and increment **`G008_TASK_SIGNALS`** when `NEW >` threshold (same block as PAUSE).
- Soft **`hint new_queue`** when `0 < NEW ≤` threshold (no SIGNAL / no pause).
- No task auto-delete/close.

## Testing instructions

### What to verify

1. Deep **NEW** queue (>20 by default) produces **`SIGNAL task_backlog new=…`**, increments **`G008_TASK_SIGNALS`**, and still emits **`PAUSE new_backlog`**.
2. When NEW is at/under threshold, digest shows soft **`hint new_queue`** only — no NEW backlog SIGNAL and **`G008_NEW_BACKLOG_PAUSE=0`**.
3. Existing **`SIGNAL task_backlog wip+testing=…`** path is unchanged.

### How to test

From repo root (readonly; does not append stamp):

```bash
# Deep NEW (current queue should be >20): expect SIGNAL + PAUSE + G008_TASK_SIGNALS≥1
ENHANCEMENT_PREFLIGHT_READONLY=1 ./scripts/enhancement-reviewer-preflight.sh 2>/dev/null \
  | sed -n '/=== Task queue/,/^$/p;/G008_TASK_SIGNALS=/p;/G008_NEW_BACKLOG_PAUSE=/p'

# Simulate “NEW low” by raising threshold: expect hint, no SIGNAL/PAUSE
ENHANCEMENT_PREFLIGHT_READONLY=1 ENHANCEMENT_NEW_BACKLOG_MAX=999 \
  ./scripts/enhancement-reviewer-preflight.sh 2>/dev/null \
  | sed -n '/=== Task queue/,/^$/p;/G008_TASK_SIGNALS=/p;/G008_NEW_BACKLOG_PAUSE=/p'
```

### Pass/fail criteria

- **Pass:** First command shows `SIGNAL task_backlog new=` and `PAUSE new_backlog`; `G008_NEW_BACKLOG_PAUSE=1`. Second command shows `hint new_queue` and no `SIGNAL task_backlog new=`; `G008_NEW_BACKLOG_PAUSE=0`.
- **Fail:** Deep NEW has PAUSE only (no SIGNAL), or SIGNAL fires when NEW is at/under threshold.

## Test report

1. **Date/time (UTC):** 2026-07-26 01:57:29–01:57:38 UTC. Log window: N/A (script-only; no container changes).
2. **Environment:** repo root readonly preflight (`ENHANCEMENT_PREFLIGHT_READONLY=1`); branch `development` @ `caf44de3`; compose/BASE_URL N/A.
3. **What was tested:** Deep NEW SIGNAL+PAUSE+`G008_TASK_SIGNALS`; at/under-threshold soft `hint new_queue` without NEW SIGNAL/PAUSE; existing `wip+testing` SIGNAL path still present.
4. **Results:**
   - Deep NEW (>20) → `SIGNAL task_backlog new=…`, `PAUSE new_backlog`, `G008_TASK_SIGNALS≥1`, `G008_NEW_BACKLOG_PAUSE=1`: **PASS** — observed `NEW=69`, `SIGNAL task_backlog new=69`, `PAUSE new_backlog`, `G008_TASK_SIGNALS=1`, `G008_NEW_BACKLOG_PAUSE=1`.
   - NEW at/under threshold (simulated `ENHANCEMENT_NEW_BACKLOG_MAX=999`) → soft hint only, no NEW SIGNAL, pause=0: **PASS** — `hint new_queue NEW=69 … SIGNAL/PAUSE at >999`; no `SIGNAL task_backlog new=`; `G008_TASK_SIGNALS=0`; `G008_NEW_BACKLOG_PAUSE=0`.
   - Existing `SIGNAL task_backlog wip+testing=…` unchanged: **PASS** — block still at `wip_n + testing_n > 8` in `scripts/enhancement-reviewer-preflight.sh`; current `WIP+TESTING=0+1` correctly does not emit that SIGNAL.
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators now get an explicit digest SIGNAL when the NEW pile is deep, not only a PAUSE flag, so weekly 008 sweeps can stop piling doc-hygiene NEWs. Soft hint under the threshold is useful without waking the loop. No task auto-close behavior — signal-only as intended.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
# Deep NEW (default threshold 20)
NEW=69 FEAT=0 WIP=0 UNTESTED=0 TESTING=1 CLOSED=0
SIGNAL task_backlog new=69 (prefer drain NEW before more FEAT/doc tasks)
PAUSE new_backlog NEW=69 (threshold=20; create 0 NEW/FEAT until drain — main coder 002)
G008_TASK_SIGNALS=1
G008_NEW_BACKLOG_PAUSE=1

# Simulated NEW under threshold (ENHANCEMENT_NEW_BACKLOG_MAX=999)
NEW=69 FEAT=0 WIP=0 UNTESTED=0 TESTING=1 CLOSED=0
hint new_queue NEW=69 (prefer drain NEW before more FEAT/doc tasks; SIGNAL/PAUSE at >999)
G008_TASK_SIGNALS=0
G008_NEW_BACKLOG_PAUSE=0
```
