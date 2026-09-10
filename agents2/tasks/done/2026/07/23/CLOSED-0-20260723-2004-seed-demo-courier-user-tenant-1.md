---
## Closing summary (TOP)

- **What happened:** Demo Satisfecho Delivery orders on tenant 1 only got `courier_user_id` when a courier already existed, so fresh demos left courier **Mine** empty.
- **What was done:** Added idempotent `seed_demo_courier_user` (tenant 1; env `COURIER_EMAIL`/`COURIER_PASSWORD`) and wired it into `reset_demo_data` and `bootstrap_demo` before order seeding; documented defaults.
- **What was tested:** Demo reset kept ≥1 courier, assigned=4 delivery orders with `out_for_delivery=1`, `check_demo_tables` OK, second seed skipped — overall **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 19:18
---

# Seed demo courier user for tenant 1

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Satisfecho Delivery demo orders now seed on tenant 1 reset (**2.1.30**), but they only assign `courier_user_id` when a **courier-role user already exists**. Fresh demos and amvara9 after bootstrap rarely have one, so courier **Mine** stays empty and `out_for_delivery` samples never appear — Delivery tab looks populated while courier demos still look broken.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T20:04Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; NEW backlog≈108 — demo hygiene follow-on after CLOSED seed-demo Delivery orders
- `back/app/seeds/seed_demo_orders.py` `_existing_courier_user_id` / docstring: “do not create users”
- `rg` on `back/app/seeds/*.py`: no seed creates `UserRole.courier`
- No open `agents2/tasks` owns demo courier user (staff/public Delivery smokes and CLOSED-1952 seed are separate)

## High-level instructions for coder

- Add an **idempotent** helper (new module or call from `reset_demo_data` / bootstrap path) that ensures tenant 1 has **one** courier-role user when missing
- Prefer env-driven email/password (e.g. `COURIER_TEST_EMAIL` / `COURIER_TEST_PASSWORD` or documented demo defaults already used in courier smokes) — **never** commit live production secrets; document the local defaults in `docs/0053` or `docs/testing.md` one-liners
- Call the helper **before** `_seed_demo_delivery_orders` so assignment and `out_for_delivery` can run
- Do not create couriers on other tenants; do not change product courier APIs
- Pass/fail: after `python -m app.seeds.reset_demo_data`, tenant 1 has ≥1 `UserRole.courier` and ≥1 delivery order with `courier_user_id` set when seed intends assignment; `check_demo_tables` still OK

## Implementation notes (coder)

- Added `back/app/seeds/seed_demo_courier_user.py` (tenant 1 only; env `COURIER_EMAIL` / `COURIER_PASSWORD`, defaults match `test-courier-actions.mjs`).
- Wired into `reset_demo_data` and `bootstrap_demo` **before** `seed_demo_orders`.
- Documented in `docs/0053-satisfecho-delivery-order-channel.md`, `docs/testing.md`, `AGENTS.md`.
- Sibling NEW for `config.env.example` courier discoverability left untouched.

## Testing instructions

### What to verify

- After demo reset, tenant 1 has ≥1 `UserRole.courier` user.
- Satisfecho Delivery seed assigns at least one order (`courier_user_id` set) and includes `out_for_delivery` when a courier exists.
- `check_demo_tables` still exits 0.
- Idempotent re-run of `seed_demo_courier_user` does not create a second courier.

### How to test

```bash
# From repo root (dev stack up)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.reset_demo_data
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.check_demo_tables
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.seeds.seed_demo_courier_user

# Assert courier + assigned delivery (example)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python - <<'PY'
from sqlmodel import Session, select
from app.db import engine
from app.models import User, UserRole, Order, OrderChannel, OrderStatus
with Session(engine) as s:
    couriers = s.exec(select(User).where(User.tenant_id == 1, User.role == UserRole.courier)).all()
    delivery = s.exec(select(Order).where(Order.tenant_id == 1, Order.order_channel == OrderChannel.satisfecho_delivery)).all()
    assigned = [o for o in delivery if o.courier_user_id]
    out = [o for o in delivery if o.status == OrderStatus.out_for_delivery]
    assert len(couriers) >= 1 and len(assigned) >= 1 and len(out) >= 1
    print("OK", couriers[0].email, f"assigned={len(assigned)} out={len(out)}")
PY
```

Optional UI: log in at `/courier/login` with `COURIER_EMAIL` / `COURIER_PASSWORD` (defaults `courier-test-phase1@amvara.de` / `secret`) and confirm **Mine** is non-empty.

### Pass/fail criteria

- **Pass:** reset creates/keeps ≥1 courier on tenant 1; ≥1 delivery order has `courier_user_id`; ≥1 `out_for_delivery`; `check_demo_tables` exit 0; second `seed_demo_courier_user` prints Skipping.
- **Fail:** no courier after reset, zero assigned delivery orders, or tables check fails.

## Test report

1. **Date/time (UTC):** 2026-07-25T19:17:20Z start → 2026-07-25T19:17:36Z end. Log window: `docker logs --since 10m pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Demo reset creates/keeps courier on tenant 1; delivery seed assigns `courier_user_id` and seeds `out_for_delivery`; `check_demo_tables` OK; idempotent second `seed_demo_courier_user`.
4. **Results:**
   - ≥1 `UserRole.courier` on tenant 1 after reset — **PASS** — reset printed `already has courier id=2634 (courier-test-phase1@amvara.de)`; assert showed 1 courier.
   - ≥1 delivery order with `courier_user_id` — **PASS** — `assigned=4` of 9 Satisfecho Delivery orders.
   - ≥1 `out_for_delivery` — **PASS** — `out_for_delivery=1`.
   - `check_demo_tables` exit 0 — **PASS** — `OK: tenant 1 has T01–T10 with correct seat counts.`
   - Idempotent re-run of `seed_demo_courier_user` — **PASS** — second run: `Tenant 1 already has courier id=2634 (...). Skipping.`
5. **Overall:** **PASS**
6. **Product owner feedback:** Demo courier seeding is wired correctly into reset: tenant 1 keeps a single courier matching the Puppeteer defaults, and Delivery samples now get assigned/`out_for_delivery` as intended. Tables check remains green; no second courier on re-run.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` → 200
   2. `http://127.0.0.1:4202/api/health` → 200
   (Optional `/courier/login` UI Mine check not run; DB criteria sufficient for pass.)
8. **Relevant log excerpts (last section):**
```
Tenant 1 already has courier id=2634 (courier-test-phase1@amvara.de). Skipping.
Tenant 1: created 49 demo orders (table + Satisfecho Delivery paid/active) for Reports, Orders, and Delivery.
OK: tenant 1 has T01–T10 with correct seat counts.
Tenant 1 already has courier id=2634 (courier-test-phase1@amvara.de). Skipping.
OK courier-test-phase1@amvara.de assigned=4 out=1
```
