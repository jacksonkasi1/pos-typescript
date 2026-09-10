---
## Closing summary (TOP)

- **What happened:** Club loyalty MVP (points/stamps, earn/redeem, public join/card) was implemented and retested after a SlowAPI-related public 500 on join.
- **What was done:** Models/migration, loyalty service, staff settings + checkout redeem, public `/loyalty` routes; fixed public GET/join SlowAPI decorators and `Response` params; documented in `docs/0066-club-loyalty.md`.
- **What was tested:** Live public program/join/member APIs all 200 under SlowAPI; UI join + card PASS; pytest `test_club_loyalty.py` 5 passed; landing smoke 200.
- **Why closed:** All pass/fail criteria met after product-owner retest PASS.
- **Closed at (UTC):** 2026-07-26 18:23
---

# Club loyalty (points/stamps + wallet)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/327
- **327**

## Problem / goal

No native loyalty/retention module exists. Tenants today need third-party punch-card/points SaaS (e.g. wallet-only tools) with no POS checkout integration. Goal: tenant-scoped loyalty (points or stamps), earn on paid order completion, redeem at checkout, and Apple/Google Wallet passes on join — distinct from pricing promos (**#322**). Builds on `BillingCustomer` / `docs/0017-billing-customers-factura.md` and existing tenant auth patterns.

## High-level instructions for coder

- Start with an **MVP slice**: data model (`LoyaltyProgram`, membership, append-only ledger tied to `order.id`) + auto-earn on order paid + staff redeem at checkout; defer tiered VIP / referral / birthday rewards.
- Keep redemption discounts aligned with whatever discount/audit path **#322** (price promos) introduces — do not invent a second parallel discount mechanism.
- Award **once per completed order**, not per split-payment leg (coordinate with split-bill work when present).
- Wallet: follow official PassKit / Google Wallet specs; document Apple signing cert + Google issuer/service-account as operational deps in a new `docs/00XX-loyalty-program.md`. Do not guess signing formats.
- Staff: settings UI for program rules; order flow shows balance / redeem. Permissions via existing owner/admin checks; decide who may adjust points manually.
- Customer: join via QR/link (menu or dedicated URL); simple balance view. Tenant isolation + pytest for earn/redeem and non-negative balance.
- `CHANGELOG.md` entry; append **Testing instructions**. No secrets or live PII in fixtures.

## Implementation notes (010 feature coder)

- Models + migration `20260726162500_club_loyalty.sql`; service `back/app/loyalty_service.py`.
- Earn hooked after mark-paid / finish / Stripe / Revolut confirm (idempotent ledger).
- Redemption uses `order.loyalty_discount_cents` until #322; documented in `docs/0066-club-loyalty.md`.
- Wallet: status API reports unavailable until Apple/Google env certs are set (no invented PassKit signing).
- Staff: Settings → Loyalty club; payment modal redeem by member token.
- Public: `/loyalty/{tenantId}`, `/loyalty/card/{memberToken}`.
- Pytest: `back/tests/test_club_loyalty.py` (5 passed).

## Fix notes (coder — retest after product-owner FAIL)

- **Root cause:** Public loyalty GETs used `@limiter.limit(public_menu_ip_limit)` (passes the helper *function* into SlowAPI as a rate string → 500). Join lacked `response: Response` → SlowAPI `parameter response must be an instance of starlette.responses.Response`.
- **Change:** `GET` program / member / wallet → `@public_menu_ip_limit()` + `response: Response`; join → add `response: Response` (keep per-hour `@limiter.limit(...)`). Documented in `docs/0066-club-loyalty.md`; CHANGELOG Fixed entry.
- **Live verify (coder):** `GET/POST /api/public/tenants/1/loyalty*` and member balance/wallet all **200**; pytest `5 passed`.

## Previous test report (product owner — FAIL on public join)

See prior Testing / Test report sections archived in git history for this task. Staff earn/redeem/permissions passed; public APIs 500 under live SlowAPI.

## Testing instructions

### What to verify

1. Public loyalty APIs return **200** (not 500) under the **live** stack with SlowAPI/Redis enabled (not only TestClient).
2. Guest can join at `/loyalty/{tenantId}` and view balance at `/loyalty/card/{memberToken}`.
3. Regression: pytest club loyalty still passes; staff earn/redeem paths unchanged.

### How to test

1. **Migrate (optional if already applied):**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate`  
   Expect schema includes `20260726162500`.

2. **Pytest:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_club_loyalty.py -q`  
   Expect **5 passed**.

3. **Live public API (required — caught previous false green):**  
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4202/api/public/tenants/1/loyalty
   # expect 200 when program enabled (404 if disabled — not 500)
   curl -s -X POST http://127.0.0.1:4202/api/public/tenants/1/loyalty/join \
     -H 'Content-Type: application/json' \
     -d '{"display_name":"PO Retest","email":"loyalty-po-retest@amvara.de"}'
   # expect 200 + membership.member_token; then GET /api/public/loyalty/members/{token} → 200
   ```

4. **Public UI:** Open `http://127.0.0.1:4202/loyalty/1` (program enabled). Submit name + email/phone. Expect `data-testid=loyalty-join-success` and card link showing balance. Open `/loyalty/card/{token}` — not “Membership not found.”

5. **Smoke:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → 200. Spot-check `docker logs --since 10m pos-back` for no loyalty 500s after the above curls.

### Pass/fail criteria

- **PASS** if live public program/join/member endpoints are non-500 (200 when program/member exist), UI join + card work, and pytest still 5 passed.
- **FAIL** if any public loyalty route returns 500 under live SlowAPI, or join/card UI cannot load program/membership.

## Test report

1. **Date/time (UTC):** 2026-07-26 18:22:25 – 18:23:30 UTC. Log window: `docker logs --since 15m pos-back` (verification traffic from ~18:22 UTC onward).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; HAProxy `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`). Redis/SlowAPI live (`pos-redis` healthy).
3. **What was tested:** Live public loyalty APIs under SlowAPI; guest join UI + card balance; pytest regression; landing smoke.
4. **Results:**
   - Migration `20260726162500_club_loyalty.sql` present — **PASS** (schema at `20260726190000`, migration listed as applied).
   - Pytest `tests/test_club_loyalty.py` — **PASS** (`5 passed` in 2.17s).
   - Live `GET /api/public/tenants/1/loyalty` — **PASS** (HTTP 200, program `Test Club 327`).
   - Live `POST /api/public/tenants/1/loyalty/join` — **PASS** (HTTP 200, `member_token=-QAvNHaa_Reqc9fXmp0bDerCUgzIL5Ej`).
   - Live `GET /api/public/loyalty/members/{token}` — **PASS** (HTTP 200, membership + program).
   - Public UI join `/loyalty/1` — **PASS** (`data-testid=loyalty-join-success`, welcome + balance 0 + card link).
   - Public UI card `/loyalty/card/{token}` — **PASS** (shows member name + Balance: 0; not “Membership not found”).
   - Smoke `/` — **PASS** (HTTP 200).
   - No loyalty 500s during verification window — **PASS** (access log lines for join/program/member all `200 OK` after 18:22; older 500s in the same 15m window are pre-fix leftovers, not from this retest).
5. **Overall:** **PASS**
6. **Product owner feedback:** The SlowAPI decorator fix resolved the prior false-green/public-500 failure. Guests can join and open their card under the live stack with Redis rate limiting. Wallet remains correctly unavailable until Apple/Google certs are configured.
7. **URLs tested:**
   1. http://127.0.0.1:4202/api/public/tenants/1/loyalty
   2. http://127.0.0.1:4202/api/public/tenants/1/loyalty/join (POST)
   3. http://127.0.0.1:4202/api/public/loyalty/members/-QAvNHaa_Reqc9fXmp0bDerCUgzIL5Ej
   4. http://127.0.0.1:4202/loyalty/1
   5. http://127.0.0.1:4202/loyalty/card/Ufn0DjPZbjG8uy0y6ULZMlerT7NR-T0V
   6. http://127.0.0.1:4202/
8. **Relevant log excerpts (last section):**
```
INFO:     172.30.0.5:43146 - "GET /public/tenants/1/loyalty HTTP/1.1" 200 OK
INFO:     172.30.0.5:43152 - "POST /public/tenants/1/loyalty/join HTTP/1.1" 200 OK
INFO:     172.30.0.5:43162 - "GET /public/loyalty/members/-QAvNHaa_Reqc9fXmp0bDerCUgzIL5Ej HTTP/1.1" 200 OK
INFO:     172.30.0.5:53774 - "GET /public/tenants/1/loyalty HTTP/1.1" 200 OK
INFO:     172.30.0.5:53774 - "POST /public/tenants/1/loyalty/join HTTP/1.1" 200 OK
INFO:     172.30.0.5:53774 - "GET /public/loyalty/members/Ufn0DjPZbjG8uy0y6ULZMlerT7NR-T0V HTTP/1.1" 200 OK
```
Pytest: `5 passed, 1 warning in 2.17s`.
