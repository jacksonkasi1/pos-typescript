---
## Closing summary (TOP)

- **What happened:** Demo waiting-list seeding had no exit 0/1 check, so regressions could leave Waitlist empty while `demo_tables_check=ok`.
- **What was done:** Added `check_demo_waiting_list` (≥1 waiting, ≥1 notified), documented in AGENTS.md and docs/testing.md, and wired a soft preflight SIGNAL.
- **What was tested:** Seeded state exit 0, empty table exit 1, restore exit 0; docs/preflight pointers and `check_demo_tables` still OK — overall PASS.
- **Why closed:** All pass/fail criteria met; no UI/API changes; no GitHub issue (0).
- **Closed at (UTC):** 2026-07-25 19:38
---

# Assert demo waiting-list entries in seed check

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Tenant 1 now seeds a waiting-list sample queue on reset (**2.1.31** / `seed_demo_waiting_list`), but **`check_demo_tables`** (and 008 preflight) only verify T01–T10. A regression that skips waiting-list seeding still reports `demo_tables_check=ok`, so staff Waitlist and public `/waitlist/1` can go empty until a human notices.

## Evidence (008 preflight / review)

- Digest 2026-07-23T20:26Z: `demo_tables_check=ok`; waiting-list seed shipped; live DB has 4 `waiting_list_entry` rows for tenant 1
- `docs/testing.md` documents **seed** `seed_demo_waiting_list` but no exit 0/1 **check** module
- Sibling **`NEW-0-20260723-2004-check-demo-satisfecho-delivery-orders`** owns the Delivery order assertion — this task owns the **waiting-list** assertion only
- CLOSED-2014 seed task is archived; no open task covers `check_demo_waiting_list`

## High-level instructions for coder

- Add `python -m app.seeds.check_demo_waiting_list` (or extend an existing demo check) that asserts tenant 1 has ≥ the seed minimum (e.g. ≥1 `waiting` and ≥1 `notified`, or ≥4 total matching `DEMO_ENTRIES`) after a normal demo state; exit 0/1
- Document the one-liner next to the Demo waiting list seed bullet in **`docs/testing.md`** and the Demo reset blurb in **`AGENTS.md`**
- Optional: call the check from **`scripts/enhancement-reviewer-preflight.sh`** as a soft SIGNAL when it fails (do not block if back container is down)
- Pass/fail: after `reset_demo_data`, check exits 0; with all tenant-1 waiting-list rows deleted, exits 1; no product UI changes

## Implementation notes (coder)

- Added **`back/app/seeds/check_demo_waiting_list.py`** (`MIN_WAITING=1`, `MIN_NOTIFIED=1`).
- Documented in **`AGENTS.md`** (Demo orders/reservations/waiting-list reset blurb) and **`docs/testing.md`** (Backend / data checks).
- Wired soft SIGNAL in **`scripts/enhancement-reviewer-preflight.sh`** (`demo_waiting_list_check=ok|fail|skipped`); does not block when back is down.
- Verified locally: seeded state → exit 0 (3 waiting, 1 notified); delete all tenant-1 rows → exit 1; `seed_demo_waiting_list` restore → exit 0.

## Handoff log

- **Handoff (`012-feature-coder-handoff.md`, 2026-07-25 19:36 UTC, Cursor):** `./scripts/git-sync-development.sh` (OK). Issue **0** (no GitHub issue). Implementation complete per **TASKS-README.md**: `check_demo_waiting_list.py`, AGENTS.md + docs/testing.md, preflight soft SIGNAL, **Testing instructions** present. **Rename** `WIP-0-…` → `UNTESTED-0-…` (replaced incomplete stub UNTESTED without Testing instructions). **No** `gh issue edit` / **`agent:untested`** (issue **0**).

## Testing instructions

### What to verify

- New module `python -m app.seeds.check_demo_waiting_list` exits **0** when tenant 1 has ≥1 `waiting` and ≥1 `notified` row, and **1** when those minima are missing (e.g. empty table).
- Docs mention the check next to the waiting-list seed; preflight emits `demo_waiting_list_check=…`; no UI/product API changes.

### How to test

```bash
# From repo root, stack up (docker-compose.yml + docker-compose.dev.yml)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.seed_demo_waiting_list
# (or reset_demo_data if you prefer a full reseed)

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.check_demo_waiting_list
# expect exit 0 and "OK: tenant 1 has … waiting, … notified"

# Negative: delete all tenant-1 waiting-list rows, then re-check (expect exit 1)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python - <<'PY'
from sqlmodel import Session, select
from app.db import engine
from app.models import WaitingListEntry
with Session(engine) as session:
    rows = session.exec(select(WaitingListEntry).where(WaitingListEntry.tenant_id == 1)).all()
    for r in rows:
        session.delete(r)
    session.commit()
    print("deleted", len(rows))
PY

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.check_demo_waiting_list
# expect exit 1

# Restore demo
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.seed_demo_waiting_list

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.check_demo_waiting_list
# expect exit 0

# Docs + preflight pointer
rg -n check_demo_waiting_list AGENTS.md docs/testing.md scripts/enhancement-reviewer-preflight.sh
```

### Pass/fail criteria

- **Pass:** check exit 0 after seed/reset; exit 1 with zero (or missing-status) waiting-list rows; `rg check_demo_waiting_list` hits AGENTS.md, docs/testing.md, and preflight; `check_demo_tables` still OK after restore.
- **Fail:** check always exits 0, wrong status filter, or docs/preflight missing.

## Test report

1. **Date/time (UTC):** 2026-07-25T19:37:54Z start → 2026-07-25T19:38:13Z end. Log window: `docker logs --since 10m pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; no browser (`BASE_URL` N/A).
3. **What was tested:** `check_demo_waiting_list` exit 0/1 around seed/delete/restore; docs + preflight pointers; `check_demo_tables` still OK after restore.
4. **Results:**
   - Check exit 0 with seeded minima (≥1 waiting, ≥1 notified): **PASS** — `OK: tenant 1 has 3 waiting, 1 notified waiting-list entries (total=4).` exit=0
   - Check exit 1 after deleting all tenant-1 rows: **PASS** — `Missing demo waiting-list entries… waiting=0… notified=0… total=0` exit=1
   - Restore via `seed_demo_waiting_list` then check exit 0: **PASS** — seeded 4 entries; check OK again exit=0
   - Docs/preflight mention check: **PASS** — `rg` hits `AGENTS.md:192`, `docs/testing.md:445`, `scripts/enhancement-reviewer-preflight.sh` (module path + `demo_waiting_list_check=ok|fail|skipped`)
   - `check_demo_tables` still OK after restore: **PASS** — `OK: tenant 1 has T01–T10 with correct seat counts.` exit=0
5. **Overall:** **PASS**
6. **Product owner feedback:** Demo waiting-list regressions will now fail a clear exit-1 seed check instead of hiding behind `demo_tables_check=ok`. Soft preflight SIGNAL is wired without blocking the stack. No UI or product API surface changed.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
WARNING:  WatchFiles detected changes in 'app/seeds/check_demo_waiting_list.py'. Reloading...
INFO:     Waiting for application shutdown.
INFO:     Waiting for application startup.
2026-07-25 19:36:10,781 - app.migrate - INFO -   - 20260712120000_waiting_list_entry.sql (version: 20260712120000, type: timestamp, status: applied)
# check outputs (compose exec):
OK: tenant 1 has 3 waiting, 1 notified waiting-list entries (total=4).  # exit 0
Missing demo waiting-list entries for tenant 1: waiting=0 (need ≥1), notified=0 (need ≥1), total=0.  # exit 1
Tenant 1: seeded 4 waiting-list entries (3 waiting, 1 notified).
OK: tenant 1 has 3 waiting, 1 notified waiting-list entries (total=4).  # exit 0 after restore
OK: tenant 1 has T01–T10 with correct seat counts.
```
