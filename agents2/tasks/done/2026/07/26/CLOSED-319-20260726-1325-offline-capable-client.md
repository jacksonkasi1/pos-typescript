---
## Closing summary (TOP)

- **What happened:** Offline-capable POS client MVP (staff cash order while offline + sync on reconnect) was implemented for GitHub #319 and handed off after tester verification.
- **What was done:** ADR/threat model in `docs/0063-offline-capable-client.md`; backend `POST /orders/offline-cash` with idempotency ledger; staff UI offline banner, product/table cache, offline cash queue and reconnect sync.
- **What was tested:** Migration, pytest (2 passed), landing smoke, manual DevTools offline cash queue→sync (#2361), live API idempotency (duplicate same `order_id`) — overall **PASS**.
- **Why closed:** All tester criteria passed; cash-only MVP delivered; card/fiscal offline remains documented future work.
- **Closed at (UTC):** 2026-07-26 13:45
---

# Offline-capable POS client

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/319
- **319**

## Problem / goal

Critical staff flows (take order, cash payment) fail when WiFi or the cloud backend drops mid-service. Need an **offline-capable client** with sync on reconnect. Large architecture change (service worker, local persistence, idempotent APIs, conflict resolution). From umbrella **#52**; see `docs/0050-github-issue-52-split-plan.md` Issue 4. Fiscal/VeriFactu sequential numbering and Stripe intents are high-risk offline — treat carefully (related caveats around **#203**).

## High-level instructions for coder

- **Phase 0 first:** write a short architecture ADR + threat model (duplicate orders, fraud, fiscal numbering gaps, clock skew). Decide which surface is MVP (staff order-taking vs customer QR) and target offline duration.
- MVP prototype: **one** staff action (e.g. take a **cash** order) works offline and syncs cleanly on reconnect with idempotency keys; clear UI indicator for offline mode.
- Prefer read-only menu/product cache before a full write queue; card/Stripe offline is out of scope for MVP (cash-only).
- Document conflict-resolution and “do not double-submit” rules; avoid inventing parallel order APIs that bypass tenant/auth.
- Tests for sync/idempotency where practical; `CHANGELOG.md` / docs ADR path; append **Testing instructions**.

## Implementation summary (010)

- ADR + threat model: `docs/0063-offline-capable-client.md`
- Backend: `POST /orders/offline-cash` + `offline_order_idempotency` ledger; service in `back/app/offline_order_service.py`
- Frontend: connectivity banner in staff sidebar; Orders page “Offline cash sale” panel; localStorage product/table cache + queue; sync on reconnect
- Tests: `back/tests/test_offline_cash_order.py` (create + idempotent replay + tenant isolation)

## Testing instructions

1. **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` — expect version ≥ `20260726153500`.
2. **Pytest:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_offline_cash_order.py -q` — expect 2 passed.
3. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` — landing + staff nav OK.
4. **Manual offline cash (staff):**
   - Log in as owner/waiter with mark-paid permission; open `/staff/orders`.
   - Confirm “Offline cash sale” panel; wait for product cache (or click Refresh cache). Need a **Take Away** table.
   - DevTools → Network → Offline (or disable Wi‑Fi). Banner should show offline.
   - Queue a cash sale (product + qty). Item stays pending in the list.
   - Go online again; within ~15s (or reload) pending item should sync to a paid order (`#id` shown). Repeat the same sale should not create a second order if the same idempotency key is reused (automatic on flush).
5. **Idempotency API:** POST `/api/orders/offline-cash` twice with the same `idempotency_key` — second response `status: "duplicate"` and same `order_id`.
6. **Out of scope check:** fiscal issue / Stripe not offered in the offline panel (cash only).

## Test report

1. **Date/time (UTC):** start `2026-07-26T13:42:48Z`, end `2026-07-26T13:44:50Z`. Log window: ~13:42–13:45 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `3647f93a`.
3. **What was tested:** Migration ≥ `20260726153500`; pytest `test_offline_cash_order.py`; landing smoke; staff offline cash queue + reconnect sync; live API idempotency; offline panel cash-only (no Stripe/fiscal).
4. **Results:**
   - Migrate ≥ `20260726153500`: **PASS** — schema version `20260726153500` (incl. `offline_order_idempotency`).
   - Pytest offline cash: **PASS** — `2 passed` in 1.99s.
   - Landing / staff nav smoke: **PASS** — `test:landing-version` OK; nav included `/staff/orders`.
   - Manual offline cash UI: **PASS** — panel “Venta en efectivo sin conexión”; DevTools Offline → banner “Modo sin conexión…” + status “Sin conexión”; queued Coffee ×1 pending; online → `Coffee ×1 — synced (#2361)`; order list shows `#2361` Take Away / “Browser offline test 319” / paid cash line.
   - Idempotency API: **PASS** — first `status: created` `order_id=2360`; second same key `status: duplicate` same `order_id=2360`.
   - Out of scope (no Stripe/fiscal in panel): **PASS** — panel text cash-only; no Stripe/card/fiscal/VeriFactu controls.
5. **Overall:** **PASS**
6. **Product owner feedback:** Offline cash MVP works end-to-end: staff can queue a Take Away cash sale while offline, see a clear connectivity banner, and get a paid order after reconnect without duplicates when the same idempotency key is replayed. Suitable to close this slice; full offline POS (card/fiscal) remains future work as documented.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/login
   3. http://127.0.0.1:4202/dashboard
   4. http://127.0.0.1:4202/staff/orders
   5. http://127.0.0.1:4202/my-shift (landing smoke nav)
   6. http://127.0.0.1:4202/api/token (auth for API check)
   7. http://127.0.0.1:4202/api/orders/offline-cash (idempotency)
8. **Relevant log excerpts (last section):**
   - migrate: `Database schema version: 20260726153500`
   - pytest: `2 passed, 1 warning in 1.99s`
   - pos-back: `POST /orders/offline-cash HTTP/1.1" 200 OK` (×3 in window: API create+duplicate + UI sync)
   - pos-front: no TS/NG build failures in window (existing NG8107 optional-chain warnings only)
