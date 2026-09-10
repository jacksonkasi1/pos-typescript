---
## Closing summary (TOP)

- **What happened:** Price promotions MVP (#322) was implemented and verified end-to-end (`percent_off_category`).
- **What was done:** Migration + `promo_service` / order discount helper; staff Settings → Promotions and `/promos` APIs; QR menu live prices; order-line audit snapshot; docs `0068-price-promotions.md`.
- **What was tested:** Migrate, 7 pytest cases, staff UI create/toggle, QR menu discounts, order-line audit/tax, tenant isolation, landing smoke, front compile — overall **PASS**.
- **Why closed:** All acceptance criteria passed.
- **Closed at (UTC):** 2026-07-26 17:52
---

# Price promotions engine

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/322
- **322**

## Problem / goal

Add a real **pricing promotions** engine (happy hour, %-off category, BOGO-lite, or coupon codes with time/channel eligibility). Distinct from the social-media post scheduler (#199–#201), which is marketing *communication* only. No pricing/discount rule engine exists today. Loyalty redemption (`docs/0066-club-loyalty.md` / **#327**) currently uses `order.loyalty_discount_cents` as a stopgap — this issue should become the shared discount/audit path. From umbrella **#52** Phase D (`docs/0050-github-issue-52-split-plan.md`). Tax/Factura breakdown must stay correct (`docs/0017-billing-customers-factura.md`, VeriFactu **#326**).

## High-level instructions for coder

- MVP: at least **one** promo type end-to-end (e.g. % off category **or** fixed discount code) with eligibility (time window and/or channel), stackability policy, and an audit snapshot on order lines for reporting/tax.
- Staff UI to create/enable promos; public QR menu should reflect eligible prices live for that type.
- Clarify tax-inclusive pricing: discounted lines must still produce a correct Factura/tax breakdown; do not break VeriFactu numbering (**#326**).
- Align with loyalty redeem (**#327**) so there is **one** discount mechanism on orders, not a second parallel path.
- Tenant-scoped rules; pytest for apply/eligibility/isolation; `CHANGELOG.md` + short `docs/` note; append **Testing instructions**.

## Implementation notes (coder)

- MVP type: `percent_off_category` only.
- Migration `20260726171000_price_promotions.sql`; service `promo_service.py`; shared order-level helper `order_discounts.order_level_discount_cents` (loyalty).
- Staff: Settings → Promotions; APIs `/promos`.
- Docs: `docs/0068-price-promotions.md`.

## Testing instructions

1. **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` — expect schema version ≥ `20260726171000`.
2. **Pytest:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_price_promotions.py -q` — all pass (tenant isolation, channel/time eligibility, menu live price, order-line audit, best-% wins, loyalty helper).
3. **Staff UI:** Log in as owner/admin → **Settings → Promotions** → create e.g. 20% off category `Beverages`, channel all or `table`. Toggle enabled/disabled.
4. **QR menu:** Open an active table menu; beverage products in that category show discounted `price_cents` and struck-through list price / promo label when eligible.
5. **Order:** Add a promo-eligible item via public menu; order line should have `list_price_cents`, `discount_cents`, `promo_id`, `promo_snapshot`; tax recomputed from discounted inclusive price.
6. **Isolation:** Promo created for tenant A must not appear for tenant B (`GET /promos`).
7. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` (or HAProxy port from `docker compose ps`).
8. **Front build:** `docker logs --since 10m pos-front` — no TS/NG compile errors after Settings/menu changes.

## Test report

1. **Date/time (UTC):** 2026-07-26 17:49:11 – 17:51:24 UTC. Log window: `docker logs --since 30m` for `pos-front` / `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Migration ≥ `20260726171000`; `tests/test_price_promotions.py`; Settings → Promotions create/toggle; QR menu live prices; public menu order-line promo audit + tax; tenant isolation on `GET /promos`; landing smoke; front compile logs.
4. **Results:**
   - **Migrate — PASS:** Schema version `20260726190000` (≥ `20260726171000`); `20260726171000_price_promotions.sql` applied.
   - **Pytest — PASS:** `7 passed` in 2.63s (`tests/test_price_promotions.py -q`).
   - **Staff UI — PASS:** Owner login → Settings → Promotions; listed API-created promo; created **UI Happy Hour 15%** via UI (Success); Disable control present; enable/disable via API verified.
   - **QR menu — PASS:** `/menu/{table_token}` shows list + discounted prices and label (e.g. Coca Cola €3.00 → €2.40, “Tester 20% Beverages”); API `list_price_cents`/`price_cents`/`promo_label` match.
   - **Order audit — PASS:** `POST /menu/{token}/order` (PIN) → order `2512` item `3297`: `list_price_cents=300`, `discount_cents=60`, `price_cents=240`, `promo_id=22`, `promo_snapshot` present, `tax_amount_cents=22`.
   - **Isolation — PASS:** Other-tenant owner `GET /promos` → `[]` while tenant 1 has promos.
   - **Smoke — PASS:** `npm run test:landing-version` → `RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
   - **Front build — PASS:** `docker logs --since 30m pos-front` — no TS/NG compile errors in window.
5. **Overall:** **PASS**
6. **Product owner feedback:** Price promotions MVP works end-to-end: staff can manage rules, QR menu shows live discounts with labels, and order lines keep a solid audit trail for tax. Ready to close #322 as shipped for the percent-off-category slice; further promo types can follow later.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/settings (Promotions tab)
   4. http://127.0.0.1:4202/menu/0a57107e-0927-45bc-bf70-cfc06669caa0
8. **Relevant log excerpts:**
   - Migrate: `Database schema version: 20260726190000`
   - Pytest: `....... [100%] 7 passed, 1 warning in 2.63s`
   - Smoke: `>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
   - Front/back error grep (30m): no compile/traceback hits for this window.
