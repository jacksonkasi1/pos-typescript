---
## Closing summary (TOP)

- **What happened:** Enhancement-reviewer follow-up to mark the working-plan implementation plan doc as historical so agents use the living `0021` guide.
- **What was done:** Coder verified `docs/0060-working-plan-implementation-plan.md` already has a Historical / pre-build banner pointing to `docs/0021-working-plan.md` (work from the 0021 renumber task); no further edits required.
- **What was tested:** Docs-only checks passed — banner present, living guide exists, no `back/`/`front/` product changes.
- **Why closed:** All pass criteria met; duplicate of already-shipped docs work.
- **Closed at (UTC):** 2026-07-26 13:18
---

# Mark 0021 working-plan implementation plan as historical

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0060-working-plan-implementation-plan.md` (formerly `docs/0021-working-plan-implementation-plan.md`) still needed a **historical / pre-build** banner so agents do not treat it as open backlog. The living guide is **`docs/0021-working-plan.md`**.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` continuation — this basename was **not** in the top-14 list but is >90d and unqueued (earlier 008 runs deferred it)
- Code live: `front/src/app/working-plan/`, schedule APIs, `test:working-plan`; sibling doc `docs/0021-working-plan.md` already has status
- **Path update (2026-07-26):** duplicate `0021-` prefix fixed by **`WIP`/`UNTESTED-0-20260723-1714-renumber-duplicate-doc-prefix-0021-working-plan`** — file is now **`docs/0060-working-plan-implementation-plan.md`**; that task also added the historical banner. Prefer **verify-and-close** (or cancel as duplicate) rather than re-editing.

## High-level instructions for coder

- **If banner already present** on **`docs/0060-working-plan-implementation-plan.md`** (points to **`docs/0021-working-plan.md`**): no product/docs edit required — move this task to **UNTESTED** with verify-only testing instructions, or cancel if policy allows.
- Otherwise add a short top banner: **historical / pre-build** — working plan is shipped; use **`docs/0021-working-plan.md`** for current behaviour and ops.
- Do **not** re-open BetterShift integration or rewrite the evaluation narrative; do **not** re-renumber (0060 is taken).
- Pass criteria: first screenful points readers to the living 0021 guide; no product code changes.

## Coder notes (2026-07-26)

- Verified **`docs/0060-working-plan-implementation-plan.md`**: first content block is a blockquote **Historical / pre-build** pointing to **`docs/0021-working-plan.md`**.
- Living guide **`docs/0021-working-plan.md`** exists and describes current behaviour.
- No product or docs edits required (duplicate of work already done by the 0021 renumber task).

## Testing instructions

### What to verify

- `docs/0060-working-plan-implementation-plan.md` opens with a **historical / pre-build** banner.
- The banner links (or clearly points) readers to **`docs/0021-working-plan.md`** as the living guide.
- No product code under `back/` / `front/` was changed for this task.

### How to test

From repo root:

```bash
# Banner present and points at living guide
head -n 5 docs/0060-working-plan-implementation-plan.md

# Living guide exists
test -f docs/0021-working-plan.md && echo OK

# Optional: confirm no accidental product diffs for this handoff
git status --short back/ front/
```

### Pass/fail criteria

- **Pass:** First screenful of `0060` includes **Historical / pre-build** (or equivalent) and references `0021-working-plan.md`; `docs/0021-working-plan.md` exists; no required product changes left open.
- **Fail:** Banner missing, does not point to `0021-working-plan.md`, or file still looks like open backlog without status.

## Test report

1. **Date/time (UTC):** 2026-07-26 13:17:28 – 13:17:45 UTC. Log window: N/A (docs-only verification; no container exercise).
2. **Environment:** branch `development` @ `dfcb3798`; local repo root; no compose / no `BASE_URL` (docs check only).
3. **What was tested:** Historical banner on `docs/0060-working-plan-implementation-plan.md`; pointer to living guide `docs/0021-working-plan.md`; no product code changes under `back/` / `front/` for this handoff.
4. **Results:**
   - Banner **Historical / pre-build** on first screenful of `0060` — **PASS** — `head -n 5` shows blockquote: `> **Historical / pre-build.** … Use **[0021-working-plan.md](0021-working-plan.md)** …`
   - Banner points to living guide `0021-working-plan.md` — **PASS** — relative link `0021-working-plan.md` present in banner.
   - Living guide file exists — **PASS** — `test -f docs/0021-working-plan.md` → `LIVING_GUIDE=OK`.
   - No required product changes under `back/` / `front/` — **PASS** — `git status --short back/ front/` empty.
5. **Overall:** **PASS**
6. **Product owner feedback:** The implementation-plan doc is correctly marked historical and readers are steered to the living 0021 guide. No further docs or product work is needed for this enhancement-reviewer follow-up; safe to archive after closing review.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only; no `pos-front` / `pos-back` activity required.

