---
## Closing summary (TOP)

- **What happened:** Demo tenant 1 had no Satisfecho Delivery fee/zone after seed/reset, so fee display and postal rejection needed manual Settings each time.
- **What was done:** Added idempotent tenant-1 seed (`seed_demo_delivery_settings`) and check helper; wired into `reset_demo_data` / `bootstrap_demo`; documented in delivery/testing/AGENTS docs.
- **What was tested:** Seed, check exit codes, idempotency, overwrite protection, other-tenant isolation, and public delivery-config API — all **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-25 19:07
---

# Seed demo tenant 1 Satisfecho Delivery zone/fee settings

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**2.1.32** added tenant `delivery_fee_cents` / `delivery_radius_meters` / `delivery_postal_codes` and checkout validation, but **demo seeds / `reset_demo_data` never set them** for tenant 1. After daily reset, Settings → Payments and public `/delivery/1` show **fee 0** and **no zone**, so demos of fee display and postal rejection require manual setup each time.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T21:03Z: follow-on from shipped **CLOSED-306** / changelog **2.1.32**; demo_tables_check=ok; Delivery **orders** already seeded (2.1.30)
- `rg delivery_fee|delivery_postal|delivery_radius back/app/seeds` → no matches
- Sibling **`NEW-0-20260723-2004-check-demo-satisfecho-delivery-orders`** / courier seed NEWs own **orders/users** — do **not** merge; this task is **tenant delivery settings** only
- Sibling **`NEW-0-20260723-2027-refresh-0001-daily-demo-reset-scope`** owns **docs/0001** wording — optional one-line mention of fee/zone seed if this lands first

## High-level instructions for coder

- In demo seed / `reset_demo_data` path for **tenant 1 only**, set a small demo fee (e.g. 250 cents) and at least one allowed postal code (and/or a modest radius if lat/lng already exist) so public checkout shows a fee and rejects an out-of-zone code
- Keep idempotent and safe on amvara9 daily reset; do not change other tenants
- Optionally add a tiny check helper (or extend an existing `check_demo_*`) asserting fee/postal are non-empty for tenant 1
- Pass/fail: after `python -m app.seeds.reset_demo_data`, tenant 1 has non-zero fee or configured postal/radius; `/delivery/1` address step shows fee (manual or smoke); other tenants untouched

## Implementation notes (coder)

- Added `back/app/seeds/seed_demo_delivery_settings.py`: tenant 1 only; when fee is 0 and no postal/radius, sets `delivery_fee_cents=250` and postal `28001`/`28013`. Skips if any fee/zone already configured (does not overwrite).
- Added `back/app/seeds/check_demo_delivery_settings.py` (exit 0/1).
- Wired into `reset_demo_data` and `bootstrap_demo`.
- Documented in `docs/0053-satisfecho-delivery-order-channel.md`, `docs/testing.md`, `AGENTS.md`.
- Verified locally: check fails before seed, passes after; second seed skips; other tenants remain fee=0; public config returns fee 250 + postal_codes_required.

## Testing instructions

### What to verify

1. Tenant 1 gets demo delivery fee (250¢) and postal codes when unset.
2. Seed is idempotent (second run skips; does not overwrite customized fee/zone).
3. Other tenants are not modified.
4. Check module exits 0 when configured, 1 when cleared.
5. Public delivery config API exposes the fee / postal requirement.

### How to test

From repo root (dev compose up):

```bash
# Seed (or via reset — reset also clears orders/reservations/waitlist)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.seed_demo_delivery_settings

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.check_demo_delivery_settings
# expect exit 0

# Idempotent second run should print "already has … Skipping"
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python -m app.seeds.seed_demo_delivery_settings

# Public config
curl -sS "http://127.0.0.1:4202/api/public/tenants/1/satisfecho-delivery-config"
# expect delivery_fee_cents=250, postal_codes_required=true, postal_codes includes 28001/28013

# Optional full reset path (destructive to tenant-1 orders/reservations/waitlist):
# docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
#   python -m app.seeds.reset_demo_data
# then re-run check_demo_delivery_settings
```

Optional UI: open `http://127.0.0.1:4202/delivery/1`, proceed to address step — fee should show; an out-of-zone postal (e.g. `99999`) should be rejected.

### Pass/fail criteria

- **Pass:** `check_demo_delivery_settings` exits 0 after seed/reset; public config shows non-zero fee and postal requirement; other tenants unchanged; re-seed skips when already configured.
- **Fail:** check exits 1 after seed; fee still 0 with no zone; other tenants modified; or seed overwrites a non-zero customized fee.

## Test report

1. **Date/time (UTC):** 2026-07-25T19:07:14Z – 2026-07-25T19:07:29Z. Log window: `docker logs --since 2026-07-25T19:07:00Z`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `742a7efe`. No GitHub issue (#0).
3. **What was tested:** Demo delivery fee/postal seed for tenant 1; check exit codes; idempotent re-seed; overwrite protection; other tenants untouched; public satisfecho-delivery-config API.
4. **Results:**
   - Tenant 1 gets fee 250¢ + postal `28001`/`28013` when unset — **PASS** (`Tenant 1: set delivery_fee_cents=250, delivery_postal_codes=["28001", "28013"].`)
   - Seed idempotent (second run skips) — **PASS** (`already has delivery fee/zone configured … Skipping.`)
   - Other tenants not modified — **PASS** (`other_tenants_with_delivery_settings=0` after seed; 177 others still fee=0)
   - Check exits 1 when cleared, 0 when configured — **PASS** (`check_cleared_exit=1`, `check_ok_exit=0`)
   - Public config exposes fee + postal requirement — **PASS** (`delivery_fee_cents=250`, `postal_codes_required=true`, codes `28001`/`28013`, HTTP 200)
   - Does not overwrite customized fee/zone — **PASS** (custom fee=999 / `11111` retained after re-seed)
5. **Overall:** **PASS**
6. **Product owner feedback:** Demo tenant 1 now gets a usable Satisfecho Delivery fee and Madrid postal zone after seed without manual Settings work. Idempotency and tenant isolation look solid for the daily reset path. Optional UI address-step check was not required for pass; API evidence is enough.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/api/public/tenants/1/satisfecho-delivery-config`
8. **Relevant log excerpts:**
```
pos-back: GET /public/tenants/1/satisfecho-delivery-config HTTP/1.1" 200 OK
seed: Tenant 1: set delivery_fee_cents=250, delivery_postal_codes=["28001", "28013"].
check (cleared): Tenant 1 has no delivery fee/zone … exit status 1
check (seeded): OK: tenant 1 delivery settings fee_cents=250, postal_codes=['28001', '28013']…
re-seed: Tenant 1 already has delivery fee/zone configured … Skipping.
```
