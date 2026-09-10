---
## Closing summary (TOP)

- **What happened:** `docs/PRINTING.md` read like a shipped LAN print-agent design while nothing was implemented in the app.
- **What was done:** Added a top status banner (design notes / not implemented) and labeled the print-agent section as design-only; no product code changes.
- **What was tested:** Banner and design-only wording verified via `head`/`rg`; `git diff --stat -- back/ front/` empty — **PASS**.
- **Why closed:** All pass criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 05:38
---

# Mark docs/PRINTING.md as design / not implemented

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/PRINTING.md`** describes a restaurant-LAN print agent / WebSocket bridge as if it were the product approach, but there is **no** `/api/print-jobs` (or equivalent) implementation in the running app. Kitchen display docs still point here for “follow-up.” Untouched ~124 days, it sits in the stale-docs SIGNAL and can mislead agents into treating printing as shipped work.

## Evidence (008 preflight / review)

- `stale_doc path=docs/PRINTING.md age_days=124`
- `SIGNAL docs_stale count=14` — **PRINTING.md only**; do not rewrite roadmap/plan docs
- `rg` for print-job / print-agent APIs in `back/` / `front/src/` finds design text in docs only (plus kitchen-display cross-link)
- `docs/0015-kitchen-display.md` already calls physical ticket splitting a **follow-up** via PRINTING.md

## High-level instructions for coder

- At the top of **`docs/PRINTING.md`**, add a short **status** banner: design notes / future options; **not implemented** in current POS; browser/invoice print remains the supported path today
- Optionally retitle or add a one-line entry under Reference in `docs/README.md` so the index says “design notes (unimplemented)”
- Do **not** implement a print agent in this task
- Pass criteria: opening PRINTING.md immediately shows unimplemented/design status; no product code changes

## Implementation notes (coder)

- Added top **Status: design notes / not implemented** banner on `docs/PRINTING.md`; marked the print-agent section as **(design)**.
- Skipped `docs/README.md` index row — owned by sibling **`NEW-0-20260723-1825-index-printing-docs-readme`**.
- No product code changes.

## Testing instructions

### What to verify

- Opening `docs/PRINTING.md` shows unimplemented / design status in the first screenful.
- Body remains design notes only; no claim that a LAN print agent or `/api/print-jobs` is live.
- No `back/` or `front/` changes from this task.

### How to test

```bash
# From repo root
head -n 12 docs/PRINTING.md
rg -n 'Status: design notes|not implemented|/api/print-jobs' docs/PRINTING.md
# Confirm no product diffs for this work:
git diff --stat -- back/ front/
```

### Pass/fail criteria

- **Pass:** Banner present with design/not-implemented wording; supported path (browser/invoice print) mentioned; `git diff` has no `back/`/`front/` files for this task.
- **Fail:** Doc still reads as the current product approach with no status banner, or product code was changed.

## Test report

1. **Date/time (UTC):** 2026-07-26 05:38:13 – 05:38:16 UTC. Log window: N/A (docs-only verification; no container exercise).
2. **Environment:** branch `development` @ `3215359c`; local workspace; compose not required for this task.
3. **What was tested:** Status banner on `docs/PRINTING.md`; design-only body (no live `/api/print-jobs` claim); no `back/`/`front/` product diffs.
4. **Results:**
   - Banner with design/not-implemented wording in first screenful — **PASS** (`head -n 12` shows `Status: design notes / not implemented` and supported browser/invoice print path).
   - Body remains design notes; print-agent section labeled `(design)`; `/api/print-jobs` only as a future polling example — **PASS** (`rg` lines 3–4 banner; line 16 design option).
   - No `back/` or `front/` changes for this task — **PASS** (`git diff --stat -- back/ front/` empty).
5. **Overall:** **PASS**
6. **Product owner feedback:** The printing doc no longer reads as shipped work. Agents and humans see immediately that LAN print agent / print-jobs API are future design only, with browser and invoice print as the supported path today. Safe to leave as-is until a real print-agent feature is scoped.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only checks via `head`/`rg`/`git diff` (no container logs).

