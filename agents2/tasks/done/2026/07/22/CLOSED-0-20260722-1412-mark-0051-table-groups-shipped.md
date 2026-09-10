---
## Closing summary (TOP)

- **What happened:** Docs-only task to mark `docs/0051-table-groups-mvp.md` as a shipped behavioural reference so agents stop treating join/unjoin as unfinished MVP.
- **What was done:** Added a Status (shipped) banner, softened MVP wording, and updated the `docs/README.md` Feature guides row for 0051 (still distinguishes 0054); no floor-plan product changes.
- **What was tested:** Docs checks passed — banner and README shipped wording present; `back/`/`front/` diffs empty (Overall PASS).
- **Why closed:** All pass criteria met; tester Overall PASS.
- **Closed at (UTC):** 2026-07-26 12:06
---

# Mark 0051 table groups MVP as shipped reference

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0051-table-groups-mvp.md` describes join/unjoin floor-plan behaviour without a **shipped** status. Join/unjoin, combined seats, and reservation pool rules are in production (multiple closed issues). Without a banner, agents may re-propose table-group MVP work or treat the doc as an unfinished design.

## Evidence (008 preflight / review)

- Doc age >90d; unqueued in prior 008 sweeps (deferred after SIGNAL top-14)
- Shipped context: closed tasks for join UX, compact tiles, layout restore on join failure (`docs/0051` referenced there)
- Floor plan `/tables/canvas` join/unjoin and reservation capacity rules remain the operator contract

## High-level instructions for coder

- Add a top **Status (shipped)** banner: join/unjoin on the canvas, per-table QR tokens, and reservation pool semantics are live; keep the rest as the behavioural reference.
- Soften any “MVP / future” wording that implies core join is unfinished (one short note for true follow-ups only if already implied — no new epic).
- Index in **`docs/README.md`** if missing or if it reads like an unimplemented plan.
- Pass criteria: first screenful says shipped reference; no floor-plan product changes in this task.

## Implementation notes (coder)

- Added **Status (shipped)** banner at top of **`docs/0051-table-groups-mvp.md`**: join/unjoin, combined seats, reservation pool, per-table QR tokens live; behavioural reference only; points away from unfinished-MVP reading; distinguishes **0054**.
- Retitled H1 from “MVP behaviour” → “behaviour”; softened customer-menu bullet (removed **MVP:** label; noted separate QR orders are by design).
- Updated **`docs/README.md`** Feature guides row for 0051 to **shipped** reference (index row already present from sibling index task).
- No product / floor-plan code changes.

## Testing instructions

### What to verify
- First screenful of **`docs/0051-table-groups-mvp.md`** states **Status (shipped)** and does not imply core join/unjoin is unfinished.
- **`docs/README.md`** Feature guides blurb for 0051 says **shipped** reference and still distinguishes **0054**.
- No floor-plan / product code changes in this task.

### How to test
```bash
# From repo root
rg -n 'Status \(shipped\)' docs/0051-table-groups-mvp.md
head -n 20 docs/0051-table-groups-mvp.md
rg -n '0051-table-groups-mvp' docs/README.md
test -f docs/0051-table-groups-mvp.md
# Optional: confirm no accidental product edits
git diff --stat -- back/ front/
```

### Pass/fail criteria
- **Pass:** Banner present; README marks shipped reference; no `back/` / `front/` diffs from this work.
- **Fail:** Doc still reads as open MVP plan, or README still implies unimplemented join/unjoin.

## Test report

- **Date/time (UTC):** 2026-07-26 12:05:31 UTC start; completed ~12:06 UTC. Log window: N/A (docs-only).
- **Environment:** branch `development` @ `e846f0d3`; local repo filesystem checks (no Docker / browser). Compose: N/A. `BASE_URL`: N/A.
- **What was tested:** Status (shipped) banner and wording in `docs/0051-table-groups-mvp.md`; Feature guides row for 0051 in `docs/README.md` (shipped + 0054 distinction); no `back/` / `front/` product diffs.

### Results
- First screenful has **Status (shipped)** and does not imply unfinished join/unjoin — **PASS** — `docs/0051-table-groups-mvp.md` L3 banner; H1 is “behaviour”; body treats join as live operator contract.
- `docs/README.md` Feature guides blurb says **shipped** reference and distinguishes **0054** — **PASS** — line 65: “(**shipped** reference) … not restaurant multi-location groups ([0054]…)”.
- No floor-plan / product code changes — **PASS** — `git diff --stat -- back/ front/` empty.

### Overall: **PASS**

### Product owner feedback
0051 now reads clearly as a shipped behavioural reference rather than an open MVP plan, which should stop agents from re-proposing core join/unjoin work. The README index matches that signal and keeps 0054 (restaurant groups) distinct. No product surface needed verification for this docs-only task.

### URLs tested
N/A — no browser

### Relevant log excerpts (last section)
N/A — docs-only verification; commands: `rg -n 'Status \(shipped\)'`, `head -n 20 docs/0051-table-groups-mvp.md`, `rg -n '0051-table-groups-mvp' docs/README.md`, `git diff --stat -- back/ front/` (empty).
