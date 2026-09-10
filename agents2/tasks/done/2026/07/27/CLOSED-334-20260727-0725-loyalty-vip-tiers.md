---
## Closing summary (TOP)

- **What happened:** Loyalty VIP tiers and referral rewards (#334) were implemented on top of the club loyalty MVP and verified PASS.
- **What was done:** Migration for VIP thresholds + referral fields; lifetime-earn tier rule; referral award-once on join; staff settings and public join/card UI; docs/CHANGELOG updated.
- **What was tested:** Migration applied; pytest `test_club_loyalty.py` 8 passed; staff VIP/referral settings + members list; live referral award-once; public `?ref=` and card VIP; landing smoke OK.
- **Why closed:** All pass/fail criteria met; tester overall PASS; Wallet signing correctly left out of scope.
- **Closed at (UTC):** 2026-07-27 07:49
---

# Finish loyalty VIP tiers + referral

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/334
- **334**

## Problem / goal

Club loyalty MVP shipped under **#327** (`docs/0066-club-loyalty.md`): points/stamps, earn on paid order, staff redeem, public join/card, birthday bonus. Still deferred there: **VIP tiers**, **referral rewards**, and Wallet pass signing (certs). This issue is the remainder — finish VIP tiers + referral on top of the existing loyalty program without inventing a second discount path.

## High-level instructions for coder

- Read `docs/0066-club-loyalty.md` and closed task `agents2/tasks/done/2026/07/26/CLOSED-327-20260726-1352-club-loyalty.md`; extend the existing `loyalty_*` model/service — do not fork a parallel loyalty stack.
- Design **VIP tiers** as tenant-configurable thresholds on membership balance or lifetime earn (document the rule); surface tier on staff membership list and public balance card; keep earn/redeem idempotent and tenant-scoped.
- Add **referral rewards**: member invites (opaque referral code/link), award ledger `earn`/`adjust` once per successful referred join (or first paid order — pick one and document); prevent self-referral and double-claim.
- Keep order-level discounts on `loyalty_discount_cents` / `order_discounts.order_level_discount_cents` (shared with #322); do not invent another discount column.
- Wallet PassKit/Google signing stays out of scope until certs exist (status API already reports unavailable).
- Staff settings UI for tier thresholds and referral bonus; pytest for tier assignment, referral award-once, tenant isolation; update `docs/0066-club-loyalty.md` + `CHANGELOG.md`; append **Testing instructions**.

## Implementation notes (010 feature coder)

- Migration `20260727073523_loyalty_vip_referral.sql`: VIP thresholds + referral bonus on `loyalty_program`; `lifetime_earn_units`, `referral_code`, `referred_by_membership_id`, `referral_reward_granted` on membership.
- **VIP rule:** tier from **lifetime earn** (positive `earn` ledger only), not balance; redeem/adjust do not demote. Thresholds 0 = that tier off; gold must be ≥ silver when both set.
- **Referral:** award on **successful new join** with valid `referral_code` (not returning member); ledger note unique per invitee; self-referral blocked when email/phone matches referrer; cross-tenant codes rejected.
- Settings → Loyalty club: VIP silver/gold + referral referrer/invitee fields; member table shows tier + referral code.
- Public join accepts `?ref=` / `referral_code`; card shows VIP + share link.
- Wallet signing still out of scope.
- Pytest: `tests/test_club_loyalty.py` — **8 passed** (incl. VIP + referral).

## Testing instructions

### What to verify

1. Staff can set VIP silver/gold lifetime thresholds and referral bonus units under Settings → Loyalty club; members list shows VIP tier and referral code.
2. VIP tier follows **lifetime earn** (not balance): manual adjust does not grant VIP; paid-order earns do.
3. Joining with a valid `?ref=` / referral code awards referrer (and optional invitee) once; invalid code → 400; returning member does not double-award; other-tenant code fails.
4. Public card `/loyalty/card/{token}` shows VIP when earned; order-level discount still uses `loyalty_discount_cents` only.
5. Regression: existing earn/redeem/birthday tests still pass; front builds; landing smoke OK.

### How to test

1. **Migrate:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate`  
   Expect schema version includes `20260727073523`.

2. **Pytest:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_club_loyalty.py -q`  
   Expect **8 passed**.

3. **Staff UI:** Log in as admin → Settings → Loyalty club. Set silver=3, gold=5, referral bonus=4 (invitee optional). Save. Confirm join URL still shown.

4. **Referral live API (optional):** Enable program, join member A, copy `referral_code`, join member B with that code → A balance += bonus, B has `referred_by_membership_id`. Re-POST B → balances unchanged.

5. **Public UI:** Open `/loyalty/1?ref={code}` — referral field prefilled. After join, success shows referral share link. Open card — VIP / referral when applicable.

6. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → PASS. Front logs: bundle complete, no TS/NG errors.

### Pass/fail criteria

- **PASS** if migration applied, 8 pytest green, settings expose VIP/referral, VIP uses lifetime earn, referral awards once without cross-tenant leak, front build + landing smoke OK.
- **FAIL** if VIP follows balance, referral double-awards or accepts foreign-tenant codes, or settings/UI/build regressions.

## Test report

1. **Date/time (UTC):** 2026-07-27 07:45:50 start → 2026-07-27 07:48:42 end. Log window ~07:45–07:49 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Migration `20260727073523`; `tests/test_club_loyalty.py` (8); staff Settings → Treueclub VIP/referral fields + members list; live referral join award-once; public `?ref=` prefills; public card VIP + share link; landing smoke; front bundle.
4. **Results:**
   - Migration includes `20260727073523` — **PASS** (`Database is up to date (version 20260727073523)`).
   - Pytest `tests/test_club_loyalty.py` — **PASS** (`8 passed` in 3.14s; VIP lifetime-earn + referral award-once cases reconfirmed).
   - Staff Settings → Loyalty club VIP silver/gold + referral bonuses; members show VIP tier + referral code — **PASS** (UI: silver=3, gold=5, referrer=4, invitee=1; join URL `http://127.0.0.1:4202/loyalty/1`; member RefC334 = Silver / `ZRUtszHTvQ8OiDKh`, Tester331 Bday2 = Gold).
   - VIP from lifetime earn (not balance); adjust does not grant VIP — **PASS** (pytest `test_vip_tier_from_lifetime_earn`; live referral earn → A `lifetime_earn_units=4`, `vip_tier=silver`).
   - Referral award once; invalid code 400; re-join no double-award — **PASS** (A balance 4→4 on B rejoin; `POST .../join` with bad code → `400 Invalid referral code`; pytest covers cross-tenant).
   - Public card shows VIP; discount path remains `loyalty_discount_cents` — **PASS** (card UI `VIP-Stufe: silver`; docs/models still use `loyalty_discount_cents` only).
   - Front build + landing smoke — **PASS** (`Application bundle generation complete` after 07:30 UTC; `npm run test:landing-version` RESULT OK). Earlier `Application bundle generation failed` at 07:29:36 UTC was superseded by successful rebuilds before this run.
5. **Overall:** **PASS**
6. **Product owner feedback:** VIP thresholds and referral bonuses are editable in staff Loyalty club and show correctly on the members table. Public join pre-fills `?ref=` and the card surfaces silver VIP plus a share link after a successful referral earn. Safe to close from a verification standpoint; Wallet signing remains correctly out of scope.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/settings (Treueclub)
   3. http://127.0.0.1:4202/loyalty/1?ref=ZRUtszHTvQ8OiDKh
   4. http://127.0.0.1:4202/loyalty/card/tiZd7Yl6Z2ic2ELpxPkcWb5dCXATAlxA
   5. Landing smoke paths via `test:landing-version` (/, login, dashboard, /my-shift, /staff/orders, inventory sublinks)
8. **Relevant log excerpts:**
   - back: `PUT /loyalty/program` 200; `POST /public/tenants/1/loyalty/join` 200 (award); same join re-POST 200 without balance bump; bad code `400`; `GET /public/loyalty/members/...` 200.
   - front: `Application bundle generation complete` (multiple after 07:30 UTC); no TS/NG hard errors in the verification window. Landing: `RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
