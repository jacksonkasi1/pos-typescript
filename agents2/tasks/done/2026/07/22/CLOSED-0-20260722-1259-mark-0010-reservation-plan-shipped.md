---
## Closing summary (TOP)

- **What happened:** Docs still framed `0010` as an unstarted reservation proposal despite shipped core and live guide `0011`.
- **What was done:** Added a shipped-core/design-history banner on `docs/0010-…` pointing to `0011`, reframed later-phase items as backlog, and updated the `docs/README.md` Plans blurb.
- **What was tested:** Docs-only `head`/`rg` checks — banner, backlog framing, and README distinction all **PASS**.
- **Why closed:** All pass/fail criteria met; no further doc edit needed.
- **Closed at (UTC):** 2026-07-26 10:57
---

# Clarify 0010 reservation plan vs shipped product

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0010-table-reservation-implementation-plan.md` still opens as a **proposal** (“proposes a concrete plan for adding table reservation”) and lists later-phase items (email/SMS confirmations, opening-hours enforcement) without a status banner. Reservations and waiting list have shipped; the living operator guide is **`docs/0011-…`**. Readers may think core reservation work is still unstarted.

## Evidence (008 preflight / review)

- Stale plan doc (~129d) adjacent to `SIGNAL docs_stale` sweep (preflight listed 14 paths; 0010 is same age class and still proposal-framed)
- `docs/README.md` Plans: “implementation plan: scope, reference systems, schema, API” — no shipped/historical cue
- Operator guide + waiting list already updated (`docs/0011-…`; closed waiting-list / 008 reservation-guide work)
- Cross-links from 0011 still useful for API detail — keep the doc, clarify role

## High-level instructions for coder

- Edit **only** `docs/0010-table-reservation-implementation-plan.md` and the matching **`docs/README.md`** Plans blurb.
- Add a short top banner: **shipped core / design history** — for guest/staff how-to use **`docs/0011-table-reservation-user-guide.md`** (incl. waiting list); treat remaining “optional later phase” bullets as backlog ideas, not current gaps in the essential scope.
- Do not re-implement reservations or rewrite the full plan; no product code changes.
- Pass/fail: banner + README distinguish 0010 (history/API design) from 0011 (live guide).

## Implementation notes (coder)

- Added top **Shipped core / design history** banner on `docs/0010-table-reservation-implementation-plan.md` pointing to `docs/0011-table-reservation-user-guide.md`; reframed essential scope as shipped and later-phase bullets as backlog ideas.
- Updated `docs/README.md` Plans row for 0010 to mark it historical and point to 0011 for live how-to.
- No product code changes.

## Testing instructions

### What to verify

- `docs/0010-table-reservation-implementation-plan.md` opens with a shipped/history banner that points readers to `docs/0011-table-reservation-user-guide.md`.
- Optional later-phase items are framed as backlog ideas, not open essential gaps.
- `docs/README.md` Plans blurb for 0010 says historical / use 0011 for live guide.

### How to test

```bash
# From repo root
head -n 20 docs/0010-table-reservation-implementation-plan.md
rg -n '0010-table-reservation|0011-table-reservation' docs/README.md
```

No Docker, Puppeteer, or app smoke required (docs-only).

### Pass/fail criteria

- **Pass:** First screenful of 0010 is clearly design history; README distinguishes 0010 (history) from 0011 (live guide); no proposal-only framing at the top.
- **Fail:** Doc still reads as an unstarted proposal, or README still implies 0010 is the live operator guide.

## Test report

1. **Date/time (UTC):** 2026-07-26T10:56:32Z start; finished ~2026-07-26T10:57:00Z. Log window: N/A (docs-only; no container checks).
2. **Environment:** branch `development` (synced); docs-only verification; no compose / BASE_URL.
3. **What was tested:** Shipped/history banner on `docs/0010-…` pointing to `docs/0011-…`; later-phase items as backlog; `docs/README.md` Plans blurb distinguishes 0010 (historical) from 0011 (live guide).
4. **Results:**
   - Banner + 0011 link at top of 0010 — **PASS** — line 3: `> **Shipped core / design history.** … use **[0011-table-reservation-user-guide.md](…)** … backlog ideas, not gaps`
   - Later-phase framed as backlog — **PASS** — Essential scope: “Optional later-phase ideas (backlog, not essential gaps): …”
   - README Plans distinguishes 0010 vs 0011 — **PASS** — `docs/README.md:82` “**historical** design/API plan (core shipped); use **[0011]** for live … how-to”; Quick links / Features point at 0011 for live ops
5. **Overall:** **PASS**
6. **Product owner feedback:** 0010 no longer reads as an unstarted proposal; readers are steered to 0011 for how-to. README Plans row matches that split. No further doc edit needed for this task.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only (`head` / `rg` evidence above).
