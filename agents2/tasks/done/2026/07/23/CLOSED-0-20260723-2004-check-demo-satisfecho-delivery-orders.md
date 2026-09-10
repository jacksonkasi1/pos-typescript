---
## Closing summary (TOP)

- **What happened:** Demo seed reset could drop Satisfecho Delivery sample orders while `check_demo_tables` still reported OK, so ops/preflight missed empty Delivery demos.
- **What was done:** Added `back/app/seeds/check_demo_delivery_orders.py` (fail if tenant 1 has no `satisfecho_delivery` orders; soft-warn only when courier unassigned) and documented it in `AGENTS.md` and `docs/testing.md`.
- **What was tested:** After `reset_demo_data` check exits 0 (9 delivery orders); with zero delivery rows exits 1; soft-warn still exits 0; docs `rg` hits; `check_demo_tables` OK after restore — overall PASS.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 19:28
---

# Assert demo Satisfecho Delivery samples in seed check

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Tenant 1 now seeds a Satisfecho Delivery order mix on reset, but **`check_demo_tables`** (and preflight) only verify T01–T10. A regression that drops delivery seeding still reports `demo_tables_check=ok`, so ops and **008** miss empty Delivery/courier demos until a human opens the UI.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T20:04Z: SIGNAL docs/changelog owned; `demo_tables_check=ok` after **2.1.30** Delivery seed — no automated count check
- CLOSED-1952 testing used ad-hoc SQL `count(*) … order_channel='satisfecho_delivery'`; not wired into a seed check module
- `docs/testing.md` documents `seed_demo_orders` Delivery mix but only lists `check_demo_tables` under demo checks
- Sibling **`NEW-0-20260723-2004-seed-demo-courier-user-tenant-1`** owns courier user creation — this task owns the **assertion** only

## High-level instructions for coder

- Extend **`check_demo_tables`** **or** add `python -m app.seeds.check_demo_delivery_orders` (exit 0/1) that asserts tenant 1 has ≥1 (or the documented seed minimum) `order_channel=satisfecho_delivery` rows after a normal demo state
- Document the one-liner next to existing demo checks in **`docs/testing.md`** / **`AGENTS.md`** Demo tables section
- Optional: soft-warn (non-fail) when no courier is assigned if courier-user seed is still open — prefer fail only on missing delivery orders
- Pass/fail: after `reset_demo_data`, the new check exits 0; with delivery rows deleted, exits 1; no product UI changes

## Implementation notes (coder)

- Added **`back/app/seeds/check_demo_delivery_orders.py`** (`MIN_DELIVERY_ORDERS=1`; soft-warn when `courier_user_id` count is 0).
- Documented in **`AGENTS.md`** (Demo orders reset blurb) and **`docs/testing.md`** (Backend / data checks).
- Verified locally: after delete of delivery rows → exit 1; after `reset_demo_data` → exit 0 with 9 delivery orders (courier assigned).

## Testing instructions

### What to verify

- New module `python -m app.seeds.check_demo_delivery_orders` exits **0** when tenant 1 has ≥1 Satisfecho Delivery order, and **1** when none exist.
- Soft-warn only (still exit 0) if delivery orders exist but none have `courier_user_id`.
- Docs mention the check next to other demo checks; no UI/product API changes.

### How to test

```bash
# From repo root, stack up (docker-compose.yml + docker-compose.dev.yml)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.reset_demo_data

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.check_demo_delivery_orders
# expect exit 0 and "OK: tenant 1 has N order_channel=satisfecho_delivery"

# Negative: delete delivery orders only, then re-check (expect exit 1)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python - <<'PY'
from sqlalchemy import text
from sqlmodel import Session
from app.db import engine
with Session(engine) as session:
    ids = [r[0] for r in session.execute(
        text('SELECT id FROM "order" WHERE tenant_id=1 AND order_channel=:ch'),
        {"ch": "satisfecho_delivery"},
    ).fetchall()]
    if ids:
        session.execute(text("DELETE FROM orderitem WHERE order_id = ANY(:ids)"), {"ids": ids})
        session.execute(text('DELETE FROM "order" WHERE id = ANY(:ids)'), {"ids": ids})
        session.commit()
print("deleted", len(ids))
PY

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.check_demo_delivery_orders
# expect exit 1

# Restore demo
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.reset_demo_data

# Docs
rg -n check_demo_delivery_orders AGENTS.md docs/testing.md
```

### Pass/fail criteria

- **Pass:** check exit 0 after reset; exit 1 with zero delivery rows; `rg check_demo_delivery_orders` hits AGENTS.md and docs/testing.md; `check_demo_tables` still OK after restore.
- **Fail:** check always exits 0, wrong channel filter, or docs missing.

## Test report

1. **Date/time (UTC):** 2026-07-25T19:27:01Z – 2026-07-25T19:27:39Z (log window ~5m on `pos-back` / `pos-front`).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; local Docker stack (HAProxy `http://127.0.0.1:4202`); branch `development` (synced via `./scripts/git-sync-development.sh` before start). No browser / no production deploy.
3. **What was tested:** `python -m app.seeds.check_demo_delivery_orders` exit codes after `reset_demo_data` and after deleting Satisfecho Delivery rows; soft-warn when `courier_user_id` cleared; docs hits in `AGENTS.md` / `docs/testing.md`; `check_demo_tables` still OK after restore.
4. **Results:**
   - After `reset_demo_data`, check exits 0 with ≥1 delivery order — **PASS** — stdout: `OK: tenant 1 has 9 order_channel=satisfecho_delivery order(s).` / `(4 with courier_user_id assigned)`; exit 0.
   - Soft-warn (orders present, no courier) still exits 0 — **PASS** — cleared `courier_user_id` on 9 rows; stdout WARN + exit 0.
   - With zero delivery rows, check exits 1 — **PASS** — deleted 9 orders; stdout `Missing … got 0, need ≥1`; compose exit status 1.
   - Docs mention the check — **PASS** — `rg` hits `AGENTS.md:192` and `docs/testing.md:443`.
   - After restore, `check_demo_tables` OK — **PASS** — `OK: tenant 1 has T01–T10 with correct seat counts.`; delivery check again exit 0 with 9 orders.
5. **Overall:** **PASS**
6. **Product owner feedback:** Ops can now fail a seed preflight when Satisfecho Delivery demo orders are missing instead of relying on `demo_tables_check=ok` alone. Soft-warn for missing courier assignment is non-blocking as intended. No UI/API surface was touched; safe to use next to existing demo checks.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** Seed checks run via `docker compose exec` (stdout above). `pos-front` had no error/exception lines in the window. `pos-back` access log during the window showed only unrelated `GET /docs` 200s; no traceback during reset/check/delete/restore.
