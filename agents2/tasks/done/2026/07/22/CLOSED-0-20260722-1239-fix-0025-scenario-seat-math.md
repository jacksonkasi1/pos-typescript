---
## Closing summary (TOP)

- **What happened:** Docs for the 0025 one-empty-table scenario used a wrong seat formula (`10×4 + 10×2`) that conflicted with the stated 30-seat demo capacity.
- **What was done:** Corrected venue seat math to `5×4 + 5×2 = 30` in `docs/0025-test-scenario-one-empty-table.md` and indexed `check_overbooking_0025` in `docs/testing.md`; no product code changes.
- **What was tested:** Doc formula and testing.md index verified; optional `check_overbooking_0025` exited 0 — overall PASS.
- **Why closed:** All pass criteria met (correct seat math, testing.md bullet, checker success).
- **Closed at (UTC):** 2026-07-26 04:12
---

# Fix 0025 one-empty-table scenario seat math

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0025-test-scenario-one-empty-table.md`** says demo seat total is `10×4 + 10×2 … = 30`. That formula equals **60**, while the parenthetical (T01–T05 = 4, T06–T10 = 2) correctly implies **5×4 + 5×2 = 30**. Agents and testers copying the formula get the wrong capacity for overbooking checks.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — **`docs/0025-test-scenario-one-empty-table.md`** untouched >90d
- Demo table contract (AGENTS.md / `check_demo_tables`): T01–T05 four seats, T06–T10 two seats → **30** seats
- Scenario still points at `python -m app.seeds.check_overbooking_0025` (module exists); **`docs/testing.md`** has no overbooking/0025 entry

## High-level instructions for coder

- Fix the seat arithmetic line in **`docs/0025-test-scenario-one-empty-table.md`** to **`5×4 + 5×2 = 30`** (keep T01–T10 naming)
- Optionally add one line under Test scripts in **`docs/testing.md`** for `docker compose exec back python -m app.seeds.check_overbooking_0025` (and/or the unittest) — do not conflict with **NEW-0-20260722-1142-index-courier-delivery-smokes-in-testing-doc** beyond a single overbooking bullet
- Do not change product overbooking logic unless the checker fails after the doc fix (then file separately)
- Pass criteria: doc math matches demo seat totals; optional testing.md line copy-pastable

## Coder notes

- Fixed venue seat formula in `docs/0025-test-scenario-one-empty-table.md`: `5×4 + 5×2 = 30` (was `10×4 + 10×2`).
- Added Backend / data checks bullet in `docs/testing.md` for `check_overbooking_0025` + unittest; sibling courier-index NEW already CLOSED.
- No product code changes.

## Testing instructions

### What to verify

1. Scenario doc seat math matches demo T01–T10 (5×4 + 5×2 = 30), not the old 10×4+10×2 formula.
2. `docs/testing.md` lists a copy-pastable overbooking 0025 check command.

### How to test

```bash
# Doc math (expect 5×4 + 5×2 = 30; no 10×4 + 10×2):
rg -n '5×4 \+ 5×2|10×4 \+ 10×2' docs/0025-test-scenario-one-empty-table.md

# testing.md index:
rg -n 'check_overbooking_0025' docs/testing.md

# Optional (stack up): automated overbooking scenarios
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.check_overbooking_0025
```

### Pass/fail criteria

- Pass: scenario line uses `5×4 + 5×2 = 30`; no `10×4 + 10×2`; testing.md has `check_overbooking_0025`; optional checker exits 0.
- Fail: wrong formula remains, or testing.md missing the overbooking bullet.

## Test report

1. **Date/time (UTC):** 2026-07-26 04:12:10 – 04:12:20 UTC. Log window: `docker logs --since 5m pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; local stack (HAProxy `:4202`). Doc-only verification + optional in-container seed checker. No browser.
3. **What was tested:** Scenario seat formula in `docs/0025-test-scenario-one-empty-table.md`; overbooking index line in `docs/testing.md`; optional `check_overbooking_0025`.
4. **Results:**
   - Scenario uses `5×4 + 5×2 … = 30` (line 7); no `10×4 + 10×2` — **PASS** (`rg` match only on corrected formula).
   - `docs/testing.md` lists copy-pastable `check_overbooking_0025` (+ unittest) under Backend / data checks (line 715) — **PASS**.
   - Optional checker: `docker compose … exec -T back python -m app.seeds.check_overbooking_0025` — **PASS** (exit 0, silent success).
5. **Overall:** **PASS**
6. **Product owner feedback:** Demo seat capacity docs now match AGENTS.md / `check_demo_tables` (30 seats). Testers can run the overbooking scenario from `docs/testing.md` without inventing the wrong 60-seat total. No product code was in scope.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** Checker runs via `docker compose exec` (no HTTP). `pos-back` during the window showed only routine `GET /docs` 200s; no overbooking/0025 errors. Checker stdout empty on success; exit code 0 twice.

