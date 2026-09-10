---
## Closing summary (TOP)

- **What happened:** `docs/agent-cursor-rules.md` Related still pointed at legacy `agents/tasks/README.md` while the live queue is under `agents2/`.
- **What was done:** Related bullet updated to `agents2/TASKS-README.md` and active queue `agents2/tasks/`, with a short legacy-`agents/tasks/` note; rule catalog left unchanged.
- **What was tested:** Docs-only checks (`rg`, `test -f`, `ls .cursor/rules`) — Related → agents2, README exists, 14 `.mdc` files match table; **PASS**.
- **Why closed:** All pass criteria met; no product/runtime change.
- **Closed at (UTC):** 2026-07-26 08:28
---

# Fix agent-cursor-rules task path (agents2)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/agent-cursor-rules.md` Related section still points at **`agents/tasks/README.md`**, but the active agent pipeline and **008** task queue live under **`agents2/tasks/`** with **`agents2/TASKS-README.md`**. Agents following the catalog land on a stale or wrong README and miss current status conventions.

## Evidence (008 preflight / review)

- Doc age >90d; unqueued while other stale docs were marked (continuation of `docs_stale` sweep)
- Catalog table already lists all 14 `.cursor/rules/*.mdc` files (no missing rule rows)
- Wrong Related link: `agents/tasks/README.md` vs live **`agents2/TASKS-README.md`** / **`agents2/tasks/`**
- Preflight: weekly_due + high NEW backlog → keep this a one-file path fix (no bulk agent-loop rewrite)

## High-level instructions for coder

- Update the Related bullet in **`docs/agent-cursor-rules.md`** to **`agents2/TASKS-README.md`** (task status pipeline) and mention **`agents2/tasks/`** as the active queue if helpful in one line.
- Optionally add a one-line note that legacy **`agents/tasks/`** may still appear in older docs — do **not** rewrite all of **`docs/agent-loop.md`** in this task.
- Pass criteria: Related links resolve to the agents2 README; rule category table unchanged unless a real `.mdc` is missing (verify with `ls .cursor/rules`).

## Coder notes (2026-07-26)

- Updated Related bullet in **`docs/agent-cursor-rules.md`** only: `agents/tasks/README.md` → **`agents2/TASKS-README.md`**, with active queue **`agents2/tasks/`** and a short legacy-`agents/tasks/` clause.
- Rule category table unchanged (14 `.mdc` files). Did not edit **`docs/agent-loop.md`**.

## Testing instructions

### What to verify

- **`docs/agent-cursor-rules.md`** Related section points at **`agents2/TASKS-README.md`** / **`agents2/tasks/`**, not the legacy **`agents/tasks/README.md`** as the active pipeline.
- Category table still lists all current `.cursor/rules/*.mdc` files (14).

### How to test

```bash
# From repo root
rg -n 'agents/' docs/agent-cursor-rules.md
# Expect: Related bullet mentions agents2/TASKS-README.md and agents2/tasks/; optional legacy agents/tasks/ note only
test -f agents2/TASKS-README.md
ls .cursor/rules/*.mdc | wc -l   # expect 14
```

No product/runtime smoke required (docs-only).

### Pass/fail criteria

- **Pass:** Related links resolve to agents2; no active-queue claim for `agents/tasks/README.md`; rule table row count matches `ls .cursor/rules/*.mdc`.
- **Fail:** Still links only to `agents/tasks/README.md` as the live pipeline, or rule catalog rows were removed/changed without a matching `.mdc` change.

## Test report

1. **Date/time (UTC):** start 2026-07-26T08:27:27Z — end 2026-07-26T08:27:44Z. Log window: N/A (docs-only).
2. **Environment:** branch `development` @ `2118d203`; no Docker/compose; no `BASE_URL` (docs-only).
3. **What was tested:** Related links in `docs/agent-cursor-rules.md` point at agents2 task pipeline; category table lists all 14 `.cursor/rules/*.mdc` files; `agents2/TASKS-README.md` exists.
4. **Results:**
   - Related → `agents2/TASKS-README.md` + live queue `agents2/tasks/` (legacy note only): **PASS** — `rg` line 34; no `agents/tasks/README.md` path as active pipeline.
   - `agents2/TASKS-README.md` on disk: **PASS** — `test -f` ok.
   - Rule catalog count = 14 and matches disk: **PASS** — `ls .cursor/rules/*.mdc | wc -l` → 14; table refs match the 14 filenames on disk.
5. **Overall:** **PASS**
6. **Product owner feedback:** Agents landing on the cursor-rules catalog now get the live agents2 task README and queue path instead of the stale agents/tasks link. Catalog rows still match every rule file; no product runtime change needed.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — docs-only verification via `rg` / `ls` / `test -f`.
