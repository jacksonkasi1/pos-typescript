---
## Closing summary (TOP)

- **What happened:** Docs still framed overbooking detection as an unstarted proposal despite the feature already shipping.
- **What was done:** Marked `docs/0025-reservation-overbooking-detection.md` as shipped (banner, live API/UI pointers, historical sections) and aligned the `docs/README.md` Plans blurb; removed the “No code changes yet” claim.
- **What was tested:** Docs-only checks (banner, grep, README row, checker file present, no product path edits) — overall **PASS**.
- **Why closed:** All pass/fail criteria met; tester reported PASS.
- **Closed at (UTC):** 2026-07-26 10:09
---

# Mark 0025 overbooking detection doc as shipped

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0025-reservation-overbooking-detection.md` still opens as a **proposal** (“**No code changes yet** – implementation will follow”). Overbooking detection and prevention have shipped: `GET /reservations/overbooking-report`, create/edit **400** on over capacity, reservations UI indicators, reports summary card, and `check_overbooking_0025` / `tests.test_overbooking_0025`. Agents reading the plan think the feature is unstarted.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` age class (~126d); README Plans row already describes shipped behaviour (“slot capacity, overbooking report, 400 on over capacity”) while the doc body contradicts it
- Code: `get_reservations_overbooking_report` in `back/app/main.py`; `overbooking_slots_count` in `back/app/reports_routes.py`; front reservations + reports UI
- Related open NEW for **seat-math typo** in `0058-test-scenario-one-empty-table.md` — do **not** duplicate that; this task is status framing of the **detection plan** doc only

## High-level instructions for coder

- Edit **only** `docs/0025-reservation-overbooking-detection.md` and the matching **`docs/README.md`** Plans blurb if needed.
- Add a short top banner: **shipped** — point to live API/UI behaviour and the scenario/checker docs (`docs/0058-test-scenario-one-empty-table.md`, `python -m app.seeds.check_overbooking_0025`); treat any remaining “future” bullets as optional polish, not “not implemented”.
- Remove or rewrite the “No code changes yet” claim so it cannot be mistaken for current truth.
- Do not change product overbooking logic; no bulk rewrite of the historical design sections.
- Pass/fail: banner + README agree the feature is live; “No code changes yet” is gone.

## Implementation notes (coder)

- Added **Status: shipped** banner to `docs/0025-reservation-overbooking-detection.md` (report API, 400 prevention, UI/reports, 0058 + `check_overbooking_0025` / unittest pointers).
- Removed “Proposal” / “No code changes yet”; marked §§1–4 as historical; reframed summary table to Before / Shipped.
- Updated `docs/README.md` Plans row for 0025 to say **shipped** and link 0058.
- Docs only — no `back/` / `front/` product changes.

## Testing instructions

### What to verify

- `docs/0025-reservation-overbooking-detection.md` opens as **shipped** (not a proposal); “No code changes yet” is absent.
- Banner points to live API/UI and to 0058 / `check_overbooking_0025`.
- `docs/README.md` Plans blurb for 0025 says **shipped** and agrees with the doc.
- No product overbooking logic changed.

### How to test

```bash
# From repo root
# Banner + no stale claim
head -n 20 docs/0025-reservation-overbooking-detection.md
grep -nE 'No code changes yet|Status: shipped|Proposal' docs/0025-reservation-overbooking-detection.md || true

# README Plans row
grep -n '0025-reservation-overbooking' docs/README.md

# Optional: checker still exists (does not need to run for this docs-only task)
test -f back/app/seeds/check_overbooking_0025.py && echo "checker present"
```

### Pass/fail criteria

- **PASS** if first screenful of 0025 is **Status: shipped** with live pointers; “No code changes yet” is gone; README 0025 blurb says **shipped**; no `back/` / `front/` product edits.
- **FAIL** if the doc still reads as an unstarted proposal, the stale claim remains, or README still omits shipped framing.

## Test report

1. **Date/time (UTC) and log window:** 2026-07-26 10:08:36–10:08:40 UTC. Docs-only verification; no container log window required.
2. **Environment:** Local repo on branch `development` (synced via `./scripts/git-sync-development.sh`). No compose / `BASE_URL` (docs-only).
3. **What was tested:** 0025 shipped banner + live API/UI/0058/checker pointers; absence of “No code changes yet”; README Plans blurb shipped framing; no `back/` / `front/` product edits; checker file present.
4. **Results:**
   - First screenful is **Status: shipped** with live pointers (report API, 400 prevention, UI/reports, 0058 + `check_overbooking_0025`) — **PASS** (`head -n 20` shows banner at line 3).
   - “No code changes yet” absent — **PASS** (`grep -c` → 0).
   - No proposal framing — **PASS** (no `## Proposal` / proposal-as-current-status wording).
   - `docs/README.md` Plans row for 0025 says **shipped** and links 0058 — **PASS** (line 86).
   - Checker module present — **PASS** (`back/app/seeds/check_overbooking_0025.py`).
   - No product overbooking logic changed — **PASS** (`git status` / `git diff --name-only` only `docs/0025-…` and `docs/README.md`).
5. **Overall:** **PASS**
6. **Product owner feedback:** The plan doc no longer misleads agents into thinking overbooking is unstarted. Status banner and README agree the feature is live, with clear pointers to API, UI, and verification helpers. Optional polish vs historical design is called out without sounding like missing work.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only; verification via file content and `git` path check only.
