---
## Closing summary (TOP)

- **What happened:** Overnight completeness pass on today’s shipped features (#311–#330) closed the highest-impact MVP gaps instead of stopping at first slices.
- **What was done:** Split-by-line payments, loyalty birthday bonus units, and offline-cash TSE auto-sign + payment leg shipped (migration, API, UI, docs, i18n); larger deferrals (tiers/referral, offline card, printing later phases, etc.) left tracked separately.
- **What was tested:** Tester PASS — migrate `20260726223000`, 22 pytest, split-by-line UI, birthday bonus, offline-cash TSE, i18n parity, landing smoke.
- **Why closed:** All overnight criteria passed; remaining items explicitly deferred out of scope.
- **Closed at (UTC):** 2026-07-26 20:38
---

# Review today’s tasks (beyond MVP)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/331
- **331**

## Problem / goal

After a full day of product issues (**#311–#330** archived under `agents2/tasks/done/2026/07/26/`), the owner wants an overnight pass: **review today’s work**, list what is still only MVP / incomplete vs the original issue intent, and **finish those gaps** so tomorrow morning the day’s features are as complete as practical — not stop at the first MVP slice.

This is **not** a duplicate of closed meta **#329** (queue empty / issues closed). Scope is **product completeness** of today’s shipped features.

**001 inventory (UTC 2026-07-26 ~20:22):**
- Open GitHub issues: **#331** (this), **#332** (roadmap — separate FEAT).
- Live `agents2/tasks/` queue: empty before this FEAT (plus TEMPLATE).
- Day archives present for **#311–#330**.
- Example documented leftovers from closing summaries (start here; expand by reading each CLOSED file): offline cash-only (card/fiscal offline deferred — **#319**); loyalty tiers / referral / birthday rewards deferred — **#327**; split-by-line vs amount-only — **#318**; TSE stub/live honesty and offline-cash auto-sign note — **#316**; printing Phase-1 agent queue — later phases in `docs/PRINTING.md` / **#317**.
- Docker digest loyalty 500s / mid-day Angular failures are **not standing** (live loyalty + landing 200; front rebuild completed). Do not re-file those as NEW unless they regress.

## High-level instructions for coder

- Inventory **#311–#330** CLOSED archives: for each, note issue title, what shipped, and any explicit “MVP / deferred / future” gaps vs the original GitHub ask.
- Prioritize **real product gaps** that can be finished overnight (API + UI + docs + tests). Skip speculative rewrites and unrelated backlog.
- Implement the highest-impact incompleteness first; open focused follow-up GitHub issues only when a gap is too large for one overnight pass — do not dump everything into #331.
- Coordinate with **#332** / `FEAT-332-*` for roadmap wording; do not rewrite all of `ROADMAP.md` inside this task.
- Preserve tenant scoping, no secrets in commits/tasks, and run relevant pytest / Puppeteer smokes per feature touched; check `pos-front` logs after Angular edits.
- When done: comment on **#331** with what was completed vs deferred, then close **#331** if overnight goals are met (or leave open only with a clear remaining checklist).
- Append **Testing instructions** covering each gap you claim finished.

## Inventory summary (feature coder)

| Issue | Shipped MVP | Overnight action |
|-------|-------------|------------------|
| #316 TSE | Stub sign on mark-paid; live gated | **Done:** auto-sign + payment leg on offline-cash sync |
| #318 Split bill | By amount only | **Done:** split by line (`order_payment_item` + UI) |
| #327 Loyalty | Earn/redeem; deferred birthday/tiers/referral | **Done:** birthday bonus units; tiers/referral still deferred |
| #319 Offline | Cash-only | Deferred (card/fiscal offline too large) |
| #317 Printing | Phase-1 agent queue | Deferred (later phases in PRINTING.md) |
| #321 Import | Products/categories CSV | Deferred (tables/customers/orders) |
| #322 Promos | percent_off_category | Deferred (more promo types) |
| #325 Feedback | Trends + CSV | Deferred (NPS / email-SMS) |
| #326 VeriFactu | Hash chain + sandbox | Deferred (middleware vendor) |
| #311–#315, #320, #323–#324, #328–#330 | Ops / complete enough | No overnight code |

## Implementation notes (010)

- Migration `20260726223000_split_by_line_and_loyalty_birthday.sql`.
- Offline cash: `ensure_full_payment_leg` + `maybe_sign_sale_after_paid` in `offline_order_service.py`.
- Split-by-line: `OrderPaymentItem`, `POST …/payments` with `order_item_ids`, Orders modal checkboxes, docs `0071`.
- Loyalty birthday: `birthday_bonus_units` on program; month/day on membership + public join; award once/year in `award_on_order_paid`; Settings UI; docs `0066`.
- CHANGELOG Unreleased; i18n all locales.

## Testing instructions

1. **Migrate:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate`  
   Expect schema version includes `20260726223000`.

2. **Pytest (required):**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_split_bill.py tests/test_club_loyalty.py tests/test_offline_cash_order.py tests/test_tse_api.py -q`  
   Expect all passed (includes split-by-line, birthday bonus, offline-cash TSE auto-sign).

3. **Split by line (staff UI):** Log in → Orders → unpaid order with ≥2 lines → Mark as paid → select one line checkbox (`data-testid=split-line-{id}`) → Record partial payment → remaining updates; select remaining line(s) or Mark as paid → order paid; `payment_method` may be `split` if methods differ.

4. **Loyalty birthday:** Settings → Loyalty club → set birthday bonus units (e.g. 5) → save. Join at `/loyalty/{tenantId}` with today’s month/day → link membership on an order → mark paid → balance = earn + bonus once; second paid order same day does not double birthday bonus.

5. **Offline cash + TSE:** Tenant `fiscal_country=DE`, `tse_mode=test`. `POST /orders/offline-cash` with valid Take Away payload → `GET /orders/{id}/tse-transaction` returns sale with `tse_serial`; `GET /orders/{id}/payments` has ≥1 leg.

6. **i18n:** `python3 scripts/check-i18n-locale-parity.py` → PASS.

7. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → PASS; `docker logs --since 10m pos-front` shows no TS/NG bundle failures after reload.

### Coder self-check (before handoff)

- Migrate `20260726223000` applied.
- Pytest: 22 passed (`test_split_bill` + `test_club_loyalty` + `test_offline_cash_order` + `test_tse_api`).
- i18n parity PASS; landing smoke PASS; front rebuild complete (no standing TS errors).

## Test report

1. **Date/time (UTC):** start 2026-07-26 20:31:07 UTC — end 2026-07-26 20:37:45 UTC. Log window: `pos-front` / `pos-back` roughly 20:26–20:38 UTC (includes prior coder rebuild).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development`; tenant 1 (Demo Pizzeria); cookie auth via `POST /api/token?tenant_id=1`.
3. **What was tested:** Migration `20260726223000`; pytest suites for split/loyalty/offline/TSE; staff split-by-line UI; loyalty birthday bonus (API + settings field); offline-cash TSE auto-sign + payment leg; i18n parity; landing smoke + front build health.
4. **Results:**
   - Migrate includes `20260726223000`: **PASS** — `Database schema version: 20260726223000`.
   - Pytest (4 files): **PASS** — `22 passed` in 6.27s.
   - Split by line (staff UI): **PASS** — order 2601 (`SplitUI331`) at `/staff/orders`; checked `split-line-3360` → total `Selected lines total: €2.50` → `record-partial-payment` left only `split-line-3361`; second line paid → DB `status=paid`, `payment_method=split`. (Also API split on order 2598: unallocated then full pay.)
   - Loyalty birthday: **PASS** — `PUT /loyalty/program` `birthday_bonus_units=5`; join membership 56 with month/day 7/26; after paid order 2598 balance `6` and `birthday_bonus_year=2026`; second paid order 2599 → balance `7` (no double bonus). Settings UI shows `data-testid=loyalty-birthday-bonus`.
   - Offline cash + TSE: **PASS** — order 2597 `POST /orders/offline-cash` → `GET …/tse-transaction` `process_type=sale`, `tse_serial=STUB-TSE-T1`; payments `n=1`, `amount_paid_cents=200` (tenant already `fiscal_country=DE`, `tse_mode=test`).
   - i18n parity: **PASS** — all 8 locales OK vs en.json (2688 leaves).
   - Smoke / front logs: **PASS** — `npm run test:landing-version` OK (version 2.1.138, login + sidebar). Mid-window TS2339 noise at 20:26–20:27 UTC cleared by `Application bundle generation complete` at 20:27:37 UTC; no new bundle failures during tester window; UI exercised successfully afterward.
5. **Overall:** **PASS**
6. **Product owner feedback:** Overnight gaps for split-by-line, birthday bonus, and offline-cash TSE auto-sign behave as specified in API and staff UI. Remaining deferred items (tiers/referral, offline card, printing later phases) stay out of scope and should stay tracked separately.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/login?tenant=1
   3. http://127.0.0.1:4202/dashboard
   4. http://127.0.0.1:4202/staff/orders
   5. http://127.0.0.1:4202/settings (loyalty birthday field)
   6. http://127.0.0.1:4202/my-shift (landing smoke nav)
   7. http://127.0.0.1:4202/tables (landing smoke nav)
   8. http://127.0.0.1:4202/kitchen (landing smoke nav)
   9. http://127.0.0.1:4202/bar (landing smoke nav)
   10. http://127.0.0.1:4202/customers (landing smoke nav)
8. **Relevant log excerpts:**
   - migrate: `✅ Database schema version: 20260726223000`
   - pytest: `22 passed, 1 warning in 6.27s`
   - landing: `>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
   - front (recovery): `Application bundle generation complete. [0.020 seconds] - 2026-07-26T20:27:37.143Z`
   - back API: offline-cash order 2597 TSE `STUB-TSE-T1`; split UI order 2601 ended `paid` / `split`.
