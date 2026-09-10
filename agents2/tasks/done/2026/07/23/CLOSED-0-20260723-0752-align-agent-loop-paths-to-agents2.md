---
## Closing summary (TOP)

- **What happened:** `docs/agent-loop.md` still pointed the live agent queue at legacy `agents/tasks/` while work already lived under `agents2/tasks/`.
- **What was done:** Active-queue paths, archive examples, checklist, and orchestrator docs were retargeted to `agents2/tasks/` / `agents2/TASKS-README.md` and `agents2/pos-cursor-loop.sh`, with intentional mac-stats/legacy notes left in place.
- **What was tested:** Docs-only `rg` and path checks — **PASS** (only intentional `agents/tasks` hits remain; live queue uses `agents2/`).
- **Why closed:** All pass criteria met; no product code changes; safe to archive.
- **Closed at (UTC):** 2026-07-26 03:37
---

# Align docs/agent-loop.md task paths to agents2

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Live agent queue and README are **`agents2/tasks/`** / **`agents2/TASKS-README.md`**, but **`docs/agent-loop.md`** still mixes legacy **`agents/tasks/`** paths (tables, archive layout, `gh` comment examples, checklist). New agents following the loop doc create or look for tasks in the wrong tree. Sibling **`NEW-0-20260722-1412-fix-agent-cursor-rules-task-paths`** fixed only **`docs/agent-cursor-rules.md`** and explicitly deferred a full agent-loop rewrite — this task owns that follow-up.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale` basenames already queued; agent-loop path drift is an unqueued theme
- `rg 'agents/tasks' docs/agent-loop.md` — many hits; 008 row correctly says **`agents2/tasks/`** while 001/002/archive sections still say **`agents/tasks/`**
- Orchestrator scripts live under **`agents2/`** (`pos-cursor-loop.sh`); `move-agent-task-to-done.sh` should be documented against the active queue path
- High NEW backlog → keep scope to **path/name corrections + one-line legacy note**, not a redesign of the loop

## High-level instructions for coder

- In **`docs/agent-loop.md`**, replace active-queue references from **`agents/tasks/`** → **`agents2/tasks/`** (and **`agents/tasks/README.md`** → **`agents2/TASKS-README.md`** where it means the live pipeline)
- Keep historical mac-stats / “sources used as basis” wording that intentionally cites upstream `agents/` layouts; add one short note that POS active queue is **`agents2/tasks/`**
- Align archive examples and `move-agent-task-to-done.sh` invocations to **`agents2/tasks/`** (or state the script accepts the path you pass)
- Do **not** edit product code; do **not** reopen **`docs/agent-cursor-rules.md`** unless a cross-link is broken
- Pass/fail: a contributor following agent-loop alone lands on **`agents2/tasks/`**; `rg 'agents/tasks' docs/agent-loop.md` only hits intentional legacy/source mentions

## Implementation notes (coder)

- **`docs/agent-loop.md` only** (no product code; did not edit **`docs/agent-cursor-rules.md`**).
- Added **POS active queue** note after mac-stats sources: live files under **`agents2/tasks/`** / **`agents2/TASKS-README.md`** (symlink note kept short).
- Replaced active-queue **`agents/tasks/`** references (roles table, sync bullet, statuses, token gates, GitHub `gh` example, checklist, archive path) with **`agents2/tasks/`**; pipeline README → **`agents2/TASKS-README.md`**.
- Orchestrator invocations documented as **`./agents2/pos-cursor-loop.sh`** (actual script); layout tree simplified to match **`agents2/`**.
- Left intentional **`agents/tasks`** hits: mac-stats “sources used as basis”, tree comment “adapted from mac-stats…”, and one-line legacy note that **`move-agent-task-to-done.sh`** still accepts **`agents/tasks/…`** via the symlink.

## Testing instructions

### What to verify

A contributor following **`docs/agent-loop.md` alone** is directed to **`agents2/tasks/`** / **`agents2/TASKS-README.md`** for the live queue and archive; remaining **`agents/tasks`** strings are only mac-stats sources or explicit legacy notes.

### How to test

From repo root:

```bash
# Active-queue hits should be gone except intentional legacy/source lines
rg -n 'agents/tasks' docs/agent-loop.md
# expect: mac-stats sources (line ~5), optional "adapted from mac-stats" comment,
#         and legacy move-script note — not roles/sync/checklist directing to agents/tasks/

rg -n 'agents2/tasks' docs/agent-loop.md
# expect: multiple hits (roles, archive, gh example, checklist, active-queue note)

rg -n 'agents2/TASKS-README' docs/agent-loop.md
# expect: ≥1 hit

rg -n 'pos-cursor-loop' docs/agent-loop.md
# expect: orchestrator section uses agents2/pos-cursor-loop.sh

test -f agents2/TASKS-README.md && test -d agents2/tasks
test -x agents2/pos-cursor-loop.sh
```

No Docker / Puppeteer / product smoke required (docs only).

### Pass/fail criteria

- **Pass:** Live-queue / archive / `gh` / checklist paths name **`agents2/tasks/`** (and **`agents2/TASKS-README.md`** where the pipeline README is meant); `rg 'agents/tasks' docs/agent-loop.md` only hits intentional mac-stats or legacy-symlink notes; no product code changes.
- **Fail:** Any role/sync/archive/checklist instruction still treats **`agents/tasks/`** as the POS live queue without a legacy caveat, or **`docs/agent-cursor-rules.md`** / product code were edited out of scope.

## Test report

1. **Date/time (UTC):** 2026-07-26 03:37:06 – 03:37:19 UTC. Log window: N/A (docs-only; no container logs).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`). No Docker / `BASE_URL` (docs verification only).
3. **What was tested:** Contributor-facing paths in `docs/agent-loop.md` point at `agents2/tasks/` / `agents2/TASKS-README.md`; remaining `agents/tasks` strings are intentional legacy/mac-stats; orchestrator path uses `agents2/pos-cursor-loop.sh`; on-disk `agents2/` layout exists; no out-of-scope product / `agent-cursor-rules` edits.
4. **Results:**
   - `rg 'agents/tasks' docs/agent-loop.md` only intentional hits (L5 mac-stats sources, L162 “adapted from mac-stats…”, L182 legacy symlink note for `move-agent-task-to-done.sh`) — **PASS**
   - Live-queue / roles / archive / `gh` / checklist / active-queue note use `agents2/tasks/` (many hits) — **PASS**
   - `rg 'agents2/TASKS-README'` ≥1 (L7, L71, L158, L183, L284, L297) — **PASS**
   - Orchestrator documented as `./agents2/pos-cursor-loop.sh` — **PASS**
   - `test -f agents2/TASKS-README.md && test -d agents2/tasks && test -x agents2/pos-cursor-loop.sh` — **PASS**
   - No edits to `docs/agent-cursor-rules.md`, `back/`, or `front/` in working tree for this change (only `docs/agent-loop.md` modified) — **PASS**
5. **Overall:** **PASS**
6. **Product owner feedback:** Agent-loop doc now steers new contributors to the live `agents2/tasks/` queue without sending them to the legacy tree. Intentional mac-stats / symlink caveats remain clear. Safe to archive after closer review.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification; no Docker services exercised.
