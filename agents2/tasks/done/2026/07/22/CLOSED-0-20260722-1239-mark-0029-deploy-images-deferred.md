---
## Closing summary (TOP)

- **What happened:** Docs still labeled the 0029 image/registry deploy plan as “Todo (next month)” after that window had passed.
- **What was done:** Status-only update: 0029 header and `docs/README.md` index row set to Deferred / not scheduled, with pointers to live deploy docs 0001 / 0004; plan body unchanged.
- **What was tested:** `rg`/`test -f` verification PASS — no imminent “next month” status; deferred markers and 0001/0004 links present; no product/deploy script changes.
- **Why closed:** All pass criteria met (docs-only deferral verified).
- **Closed at (UTC):** 2026-07-26 07:10
---

# Mark deploy-via-images plan (0029) as deferred

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0029-deployment-images-plan-next-month.md`** and its **`docs/README.md`** index row still say **“Todo (next month)”** from March 2026. Production deploy on amvara9 remains build-on-server (see **0001** / **0004**); the “next month” window has passed, so the index misleads operators into thinking image/registry deploy is imminent.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — **`docs/0029-deployment-images-plan-next-month.md`** untouched >90d
- `docs/README.md` Plans table: “**Todo (next month):** Deploy via images…”
- 0029 header: **Status: Todo plan (next month)**; related live ops docs (**0001**, **0004**) still describe current compose/build deploy

## High-level instructions for coder

- Status-only edit: set 0029 header (and README index blurb) to **Deferred / not scheduled** (or equivalent), noting current deploy path remains documented in **0001** / **0004**
- Do **not** implement registry/two-slot deploy in this task; do not rewrite the plan body
- Pass criteria: docs index no longer claims “next month”; reader is pointed at current deploy docs

## Implementation notes (coder)

- `docs/0029-deployment-images-plan-next-month.md`: status → **Deferred / not scheduled**; added **Current deploy path** line pointing at **0001** / **0004**; title softened to “deferred plan”. Plan body left unchanged.
- `docs/README.md` Deployment table row: **Deferred / not scheduled** + links to current deploy docs. No product code.

## Testing instructions

### What to verify

Docs no longer present image/registry deploy as an imminent “next month” todo; readers are pointed at the live amvara9 deploy path.

### How to test

```bash
# From repo root
rg -n 'Todo \(next month\)|Todo plan \(next month\)' docs/README.md docs/0029-deployment-images-plan-next-month.md
# Expect: no matches in header / README index (body checklist heading may still say “next month”)

rg -n 'Deferred / not scheduled' docs/README.md docs/0029-deployment-images-plan-next-month.md
# Expect: hits in both files

# Links resolve (files exist)
test -f docs/0001-ci-cd-amvara9.md && test -f docs/0004-deployment.md && echo OK
```

### Pass/fail criteria

- **Pass:** README 0029 row and 0029 header say deferred/not scheduled; both point at **0001** / **0004**; no registry/two-slot implementation; plan body not rewritten.
- **Fail:** Index still says “Todo (next month)” as the status, or product/deploy scripts were changed.

## Test report

1. **Date/time (UTC):** start 2026-07-26 07:10:13 UTC; end 2026-07-26 07:10:25 UTC. Log window N/A (docs-only).
2. **Environment:** local repo on branch `development` (synced via `./scripts/git-sync-development.sh`); no Docker/browser required.
3. **What was tested:** Docs no longer present image/registry deploy as an imminent “next month” todo; readers pointed at live amvara9 deploy path (**0001** / **0004**); no registry/two-slot implementation; plan body not rewritten.
4. **Results:**
   - No `Todo (next month)` / `Todo plan (next month)` in README index or 0029 header — **PASS** (`rg` returned no matches in those status contexts; only remaining “next month” is body checklist heading `## Summary checklist (next month)`, allowed).
   - `Deferred / not scheduled` in both files — **PASS** (`docs/README.md:32`, `docs/0029-…:3`).
   - Points at **0001** / **0004** — **PASS** (Current deploy path line + README row links; `test -f` → OK).
   - No registry/two-slot product/deploy script work for this task — **PASS** (status-only header/index edit in `01538ff8`; plan body unchanged).
5. **Overall:** **PASS**
6. **Product owner feedback:** Index and 0029 header correctly mark the images plan as deferred and send operators to the live compose/build deploy docs. No false “next month” urgency remains in the status lines. Safe to close.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — docs verification only; evidence is `rg`/`test -f` output above.

