---
## Closing summary (TOP)

- **What happened:** Preflight kept waking 008 on owned docs/changelog SIGNAL themes while NEW was already deep, so the reviewer kept inventing micro-tasks.
- **What was done:** Added a stamp-only rule to `agents2/008-enhancement-reviewer.md` (reuse preflight deep-NEW / `ENHANCEMENT_NEW_BACKLOG_MAX`, create no tasks when SIGNAL themes are owned and no failing demo SIGNAL; product/demo exception kept) and a one-liner in `docs/agent-loop.md`.
- **What was tested:** Docs/prompt dry-read via `rg` — all three criteria PASS (stamp-only rule + step, agent-loop 008 row, threshold not hard-coded 50-only).
- **Why closed:** All criteria passed.
- **Closed at (UTC):** 2026-07-26 02:25
---

# 008 prompt: stamp-only when SIGNAL themes owned and NEW is deep

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Preflight keeps waking **008** on the same owned **`SIGNAL docs_stale`** / **`changelog_sparse`** lines while **`NEW`≈100+**. The reviewer then invents more README/index/smoke micro-tasks, deepening the backlog. Preflight already has a queued SIGNAL for deep NEW (**`NEW-0-20260722-1433-preflight-signal-deep-new-backlog`**), but **`agents2/008-enhancement-reviewer.md`** does not tell the agent to **stop creating tasks** when themes are owned and the pile is deep.

## Evidence (008 preflight / review)

- Digest 2026-07-23T20:13Z: `weekly_due=no`, `NEW=111`, `G008_SIGNALS=15` all from docs/changelog heuristics; every SIGNAL stale-doc basename already has a root NEW; changelog empty Unreleased after same-day cut (preflight false-positive owned by **CLOSED-0-20260722-2120**; product Unreleased is committer duty — July-12 owner archived as **`done/2026/07/12/CLOSED-0-20260712-1614-changelog-unreleased-recent-work.md`** via **UNTESTED-0-20260723-1138**)
- Same-day 008 runs keep queuing 3 NEW each hour (README rows, smokes, indexes) while older NEWs sit unstarted
- Sibling **`NEW-0-20260722-1433-preflight-signal-deep-new-backlog`** owns preflight SIGNAL only — this task owns **agent prompt behaviour**

## High-level instructions for coder

- Update **`agents2/008-enhancement-reviewer.md`** (and a one-liner in **`docs/agent-loop.md`** if that section describes 008): when **all** of the following hold, append stamp with **`FEAT: 0 | NEW: 0`** and **create no new task files**:
  - `NEW` root count ≥ threshold (suggest **50**, or reuse the preflight deep-NEW threshold once landed)
  - Every `SIGNAL` theme in the digest is already covered by an open root task (or is a known false positive after a same-day changelog cut)
  - No failing demo SIGNAL (`demo_tables_check=fail`, `demo_daily_reset_not_scheduled`)
- Still allow up to 3 tasks when there is a **new unqueued** product/demo finding (explicit exception)
- Do not implement the preflight SIGNAL here; leave that to the sibling NEW
- Pass/fail: dry-read of 008 prompt shows the stamp-only rule; a future 008 run with NEW≥50 and only owned docs/changelog SIGNALs creates 0 tasks

## Coder notes (2026-07-26)

- Reused landed preflight deep-NEW threshold (`PAUSE new_backlog` / `G008_NEW_BACKLOG_PAUSE=1` / `ENHANCEMENT_NEW_BACKLOG_MAX` default **20**), not a separate 50.
- Added **Stamp-only when SIGNAL themes are owned (deep NEW)** under Task creation rules in **`agents2/008-enhancement-reviewer.md`**, plus instruction step 4 (`stamp-only: owned_signals`).
- Exception preserved: new unqueued product/demo finding may still queue ≤3 tasks.
- One-liner added to **008** row in **`docs/agent-loop.md`**.
- Did not change preflight script (sibling CLOSED-0-20260722-1433 owns that).

## Testing instructions

### What to verify

1. **`agents2/008-enhancement-reviewer.md`** documents stamp-only when deep NEW + owned/false-positive SIGNALs + no failing demo SIGNAL, with product/demo exception.
2. **`docs/agent-loop.md`** 008 role row mentions stamp-only for owned signals / PAUSE.
3. Dry-read pass criteria from the task goal are met (no need to run a live 008 cycle for this handoff).

### How to test

```bash
# From repo root
rg -n 'stamp-only: owned_signals|Stamp-only when SIGNAL themes are owned' agents2/008-enhancement-reviewer.md
rg -n 'owned.*SIGNAL|stamp only' docs/agent-loop.md
# Confirm deep-NEW threshold reuse (not a hard-coded 50-only rule):
rg -n 'ENHANCEMENT_NEW_BACKLOG_MAX|PAUSE new_backlog|owned_signals' agents2/008-enhancement-reviewer.md
```

Optional (future 008 run): with `NEW` above threshold and only owned docs/changelog SIGNALs, stamp should be `FEAT: 0 | NEW: 0` (or `paused: new_backlog` / `stamp-only: owned_signals`) and **0** new task files under `agents2/tasks/`.

### Pass/fail criteria

- **Pass:** Prompt has the owned-signals stamp-only rule + instruction order step; agent-loop 008 row mentions it; threshold tied to preflight PAUSE/deep-NEW.
- **Fail:** Rule missing, or 008 still told to always create up to 3 tasks from owned docs/changelog SIGNALs when NEW is deep.

## Test report

1. **Date/time (UTC):** 2026-07-26T02:25:06Z start → 2026-07-26T02:25:20Z end. Log window: N/A for product containers (docs/prompt dry-read only); compose healthy during check.
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`). Compose: `docker-compose.yml` + `docker-compose.dev.yml` (stack up). `BASE_URL`: N/A — no browser. Verification via `rg` dry-read of prompt/docs.
3. **What was tested:** Owned-signals stamp-only rule in `agents2/008-enhancement-reviewer.md`; `docs/agent-loop.md` 008 row; deep-NEW threshold reuse (`ENHANCEMENT_NEW_BACKLOG_MAX` / `PAUSE new_backlog`); product/demo exception; instruction step `stamp-only: owned_signals`.
4. **Results:**
   - Criterion 1 (008 prompt stamp-only + exception + step 4): **PASS** — `rg` hits lines 43, 49 (Exception), 80 (`stamp-only: owned_signals`); threshold at line 45 uses `ENHANCEMENT_NEW_BACKLOG_MAX` default 20 / `PAUSE new_backlog`.
   - Criterion 2 (`docs/agent-loop.md` 008 row): **PASS** — line 58 mentions stamp only for owned SIGNAL themes / PAUSE.
   - Criterion 3 (dry-read pass criteria / threshold not hard-coded 50-only): **PASS** — rule tied to preflight PAUSE/deep-NEW (`ENHANCEMENT_NEW_BACKLOG_MAX`), not a separate 50-only gate.
5. **Overall:** **PASS**
6. **Product owner feedback:** 008 will stop inventing README/index/smoke micro-tasks when NEW is already deep and every SIGNAL theme is owned or a known false positive. The product/demo exception keeps real unqueued findings from being blocked. No live 008 cycle was required for this handoff.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** Docs-only verification; containers were up (`pos-back`/`pos-front` Up). No product code path exercised. Sample `pos-back` during window: `GET /docs` 200 (unrelated traffic).

