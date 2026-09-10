---
## Closing summary (TOP)

- **What happened:** Issue #333 finished the offline-card / fiscal-offline slice on top of the #319 cash-only offline MVP.
- **What was done:** Deferred card (`payment_intent=card`) queues without PAN/CVV and syncs to unpaid take-away orders; cash path unchanged; fiscal/VeriFactu stays online-only; ADR/docs, pytest, CHANGELOG, and UI updated.
- **What was tested:** Pytest (4 passed), landing smoke, i18n parity, staff deferred-card queue→sync→mark-paid, API idempotency, and out-of-scope checks all **PASS**.
- **Why closed:** All Testing instructions criteria passed; feature fully delivered for #333.
- **Closed at (UTC):** 2026-07-27 08:05
---

# Finish offline card / fiscal offline

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/333
- **333**

## Problem / goal

Offline-capable staff client MVP shipped under **#319** (`docs/0063-offline-capable-client.md`): cash-only offline Take Away sale + idempotent `POST /orders/offline-cash` sync. Closing notes and ADR explicitly left **card/Stripe/Revolut offline** and **fiscal invoice issue while offline** as future work. This issue finishes that remaining offline-card / fiscal-offline slice on top of the existing queue.

## High-level instructions for coder

- Read `docs/0063-offline-capable-client.md`, VeriFactu caveats in `docs/0018-verifactu-fiscal-invoicing.md` / related #203 notes, and closed `agents2/tasks/done/2026/07/26/CLOSED-319-20260726-1325-offline-capable-client.md`.
- Prefer a **safe incremental** slice: do not invent card capture that stores PAN/CVV on device. Prefer deferred online card after reconnect (queue intent metadata only) or document why true offline card is blocked.
- **Fiscal:** keep VeriFactu/live numbering **online-only** unless an explicit deferred-numbering policy is approved and documented; offline queue must not allocate fiscal series while disconnected.
- Extend the existing offline queue/UI patterns (connectivity banner, localStorage cache, idempotency ledger) rather than a second offline pipeline; preserve tenant/auth on sync.
- Update ADR phases in `docs/0063-offline-capable-client.md` with the chosen card/fiscal policy; pytest for any new sync/idempotency paths; `CHANGELOG.md`; append **Testing instructions**.

## Implementation summary (010)

- **Policy (ADR `docs/0063`):** True offline card capture blocked (no PAN/CVV). Deferred card: queue `payment_intent=card` → sync creates **unpaid** take-away order; staff collects card online. Fiscal/VeriFactu numbering stays **online-only after payment** (note in `docs/0018`).
- **Backend:** `OfflineCashOrderCreate.payment_intent` (`cash`|`card`); `create_offline_cash_order` branches; response adds `payment_intent` + `needs_payment`. Same idempotency ledger; no new migration.
- **Frontend:** Offline sale panel payment select; queue stores intent; sync passes intent; list shows “collect card online” when `needs_payment`.
- **Tests:** `tests/test_offline_cash_order.py` — deferred card unpaid + idempotent replay + invalid intent (4 passed).
- **CHANGELOG** Unreleased + i18n parity OK.

## Testing instructions

1. **Pytest:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_offline_cash_order.py -q`  
   Expect **4 passed** (cash create/replay, tenant isolation, TSE cash auto-sign, deferred card unpaid + idempotency + bad intent).

2. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` — landing + staff nav OK (includes `/staff/orders`).

3. **i18n:** `python3 scripts/check-i18n-locale-parity.py` — PASS.

4. **Manual deferred card (staff):**
   - Log in with mark-paid permission; open `/staff/orders`.
   - Offline sale panel: Payment = **Card (pay after sync)**; pick product; DevTools → Network → Offline; queue sale.
   - Go online; pending item syncs to an **unpaid** order (`#id` + “collect card online”). Open that order and mark paid / card via normal UI.
   - Confirm queue item never asked for card number.

5. **API:** `POST /api/orders/offline-cash` with `payment_intent: "card"` twice same `idempotency_key` → second `status: "duplicate"`, same `order_id`, `needs_payment: true`, `paid_at: null`.

6. **Out of scope check:** No fiscal issue / VeriFactu call from offline sync; offline panel does not capture PAN/CVV; cash path still creates paid orders.

## Test report

1. **Date/time (UTC):** 2026-07-27 08:00:04–08:04:48 UTC. Log window: `docker logs --since 15m` on `pos-back` / `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Pytest offline-cash (incl. deferred card); landing smoke (incl. `/staff/orders`); i18n parity; staff deferred-card offline queue → sync → mark paid; API idempotent `payment_intent=card`; out-of-scope (no PAN/CVV, no fiscal from sync, cash still paid).
4. **Results:**
   - Pytest `tests/test_offline_cash_order.py`: **PASS** — `4 passed` in 3.09s.
   - Landing smoke `test:landing-version`: **PASS** — landing OK; login tenant=1; nav includes `/staff/orders`.
   - i18n parity: **PASS** — all locales OK vs `en.json` (2708 leaves).
   - Manual deferred card (staff): **PASS** — offline queue “Karte (nach Sync)” → pending → online sync `#2642` + “Karte online einziehen”; mark-paid via Kartenterminal (`PUT /orders/2642/mark-paid` 200); no PAN/CVV inputs (`panFields: false`).
   - API idempotency: **PASS** — first `created` order_id 2640 `needs_payment: true` `paid_at: null`; second `duplicate` same `order_id`, `needs_payment: true`, `paid_at: null`.
   - Out of scope: **PASS** — cash path order 2641 `payment_method: cash` with `paid_at` set; card order 2640 `amount_paid_cents: 0` until online collect; offline panel has no card-number fields; no VeriFactu/fiscal call from offline sync (`/verifactu`/`/fiscal` 404; sync only creates unpaid order + note `[offline-card-intent]`).
5. **Overall:** **PASS**
6. **Product owner feedback:** Deferred card offline behaves as designed: staff can queue a card *intent* without capturing card data, sync creates an unpaid take-away order, and payment is collected with the normal online mark-paid UI. Cash offline remains paid-on-sync; fiscal stays out of the offline path.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (landing smoke)
   2. `http://127.0.0.1:4202/login?tenant=1`
   3. `http://127.0.0.1:4202/dashboard`
   4. `http://127.0.0.1:4202/staff/orders`
   5. `http://127.0.0.1:4202/my-shift` (smoke nav)
   6. `http://127.0.0.1:4202/tables` / `/kitchen` / `/bar` / `/customers` (smoke inventory nav)
8. **Relevant log excerpts:**
   ```
   pos-back: POST /orders/offline-cash HTTP/1.1 200 OK (×4 in window)
   pos-back: PUT /orders/2642/mark-paid HTTP/1.1 200 OK
   pos-back: GET /orders/2642/payments HTTP/1.1 200 OK
   pos-front: Application bundle generation complete (no TS/NG errors in window)
   ```
