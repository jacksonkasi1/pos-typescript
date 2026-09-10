---
## Closing summary (TOP)

- **What happened:** Docs index still described the multi-agent loop as using an `agents/` layout while the live queue is `agents2/tasks/`.
- **What was done:** Updated only the `docs/README.md` Reference row for `agent-loop.md` to say `agents2/tasks/` + prompts, with a short legacy-`agents/` note; left `docs/agent-loop.md` to sibling tasks.
- **What was tested:** Docs-only `rg` / `test -f` checks — PASS (agents2 wording, no active `agents/` layout claim, link and file OK).
- **Why closed:** All pass/fail criteria met; tester overall PASS with product-owner feedback that no further change is needed for this scope.
- **Closed at (UTC):** 2026-07-26 09:23
---

# Fix docs/README agent-loop blurb to agents2

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/README.md`** Reference row for **`agent-loop.md`** still says the multi-agent workflow uses an **`agents/`** layout. The live queue is **`agents2/tasks/`** (see open path-alignment NEWs for `agent-loop.md` / `AGENTS.md`). Contributors scanning the docs index keep landing on the wrong mental model even after those siblings land.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: docs_stale SIGNAL basenames already owned; path-drift scan under NEW backlog ≈71
- `docs/README.md` line ~84: “`agents/` layout” in the agent-loop description
- Related open (do **not** duplicate their scopes): **`NEW-0-20260723-0752-align-agent-loop-paths-to-agents2`** (body of agent-loop.md), **`NEW-0-20260723-1138-align-agents-md-task-paths-to-agents2`**

## High-level instructions for coder

- In **`docs/README.md`** only, change the agent-loop row blurb from **`agents/`** → **`agents2/`** (or “`agents2/tasks/` + prompts”) in one short phrase
- Optional: add that legacy **`agents/`** may appear in older notes — one clause max
- Do **not** rewrite **`docs/agent-loop.md`** here (owned by sibling NEW)
- Pass/fail: `rg 'agents/' docs/README.md` has no active-queue “layout” claim; agent-loop row still links `agent-loop.md`

## Coder notes (2026-07-26)

- Updated **Reference** row for `agent-loop.md` in `docs/README.md` only: blurb now says `agents2/tasks/` + prompts, with a short legacy-`agents/` clause.
- Did not edit `docs/agent-loop.md` (sibling scope).

## Testing instructions

### What to verify

- Docs index Reference row for the multi-agent loop no longer claims an active `agents/` layout; it points contributors at `agents2/tasks/` (+ prompts).
- The row still links to `agent-loop.md`.
- Any remaining `agents/` hit in `docs/README.md` is only the optional legacy note, not “layout” as the live queue.

### How to test

From repo root:

```bash
rg -n 'agents/' docs/README.md
rg -n 'agents2/tasks' docs/README.md
rg -n '\[agent-loop\.md\]' docs/README.md
test -f docs/agent-loop.md
```

No product/Docker/Puppeteer run required (docs index only).

### Pass/fail criteria

- **Pass:** Reference blurb mentions `agents2/tasks/` (or equivalent); no “`agents/` layout” active-queue claim; `[agent-loop.md](agent-loop.md)` link present; `docs/agent-loop.md` exists.
- **Fail:** Blurb still says live workflow uses `agents/` layout, or the agent-loop link is broken/removed.

## Test report

1. **Date/time (UTC):** 2026-07-26 09:23:10 UTC — log window N/A (docs-only; no containers).
2. **Environment:** branch `development` @ `1edc4fad`; no compose/`BASE_URL` (docs index only).
3. **What was tested:** `docs/README.md` Reference row for agent-loop: live queue wording (`agents2/tasks/` + prompts), no active `agents/` layout claim, link to `agent-loop.md`, file exists.
4. **Results:**
   - Blurb mentions `agents2/tasks/` (+ prompts) — **PASS** — `rg` line 96: `` `agents2/tasks/` + prompts ``
   - No active-queue “`agents/` layout” claim — **PASS** — only remaining `agents/` hit is legacy clause: “legacy `agents/` may appear in older notes”
   - `[agent-loop.md](agent-loop.md)` link present — **PASS** — rows 13 and 96
   - `docs/agent-loop.md` exists — **PASS** — `test -f` succeeded
5. **Overall:** **PASS**
6. **Product owner feedback:** Docs index now steers contributors to the live `agents2/tasks/` queue without implying the old `agents/` layout is current. The optional legacy note is clear and does not confuse the active path. No further change needed for this scope.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification via `rg` / `test -f` from repo root.
