---
## Closing summary (TOP)

- **What happened:** Issue #326 completed the VeriFactu production path beyond the #203 stub (ADR, hash chain, ValidarQR, sandbox, immutability, live gate).
- **What was done:** Added Phase 0 ADR (`docs/0065`), fiscal hash-chain migration/service, sandbox submit + anulación API, `FISCAL_LIVE_UNLOCK` live gate, and honest docs/Settings/`/features` copy; official AEAT middleware contract, print-bridge polish, and split-bill numbering remain deferred.
- **What was tested:** Migration columns, 7 fiscal pytest cases, Settings Test save + Live 400, issue/cancel on paid order (ValidarQR + sandbox), immutability 409→anulacion→delete, homepage smoke + clean front logs, docs spot-check — all **PASS**.
- **Why closed:** All testing criteria passed; MVP acceptance verified on `development`.
- **Closed at (UTC):** 2026-07-26 18:03
---

# Complete VeriFactu (production AEAT path)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/326
- **326**

## Problem / goal

[#203](https://github.com/satisfecho/pos/issues/203) shipped a per-tenant fiscal **stub** (`fiscal_mode`, numbering, print QR placeholder) documented in `docs/0018-verifactu-fiscal-invoicing.md` — **no real AEAT submission**. Software-vendor VeriFactu/SIF obligations already apply; end-user dates were postponed, but Satisfecho still needs a certifiable production path before any tenant can safely use `fiscal_mode: live`.

## High-level instructions for coder

- **Phase 0 first:** publish a short build-vs-buy ADR (in-house AEAT wire vs certified middleware such as Fiskaly / Verifacti / Efsta). Prefer not inventing AEAT endpoints or payloads.
- Implement in order only after Phase 0: hash chaining, real AEAT verification QR/link, near-real-time sandbox submission in `test` mode, immutability (edit/delete blocked; credit-note cancel path).
- Do **not** enable or market `fiscal_mode: live` until Phases 1–4 are verified against the official spec; keep disclaimer language consistent with #203 / `docs/0018`.
- Coordinate with printing bridge (receipt must carry real QR + mandatory text) and split-bill (sequential numbering across partial payments).
- Add `docs/00XX-verifactu-production.md` (certification status, what live mode does/does not cover) and update public `/features` to match reality, not aspiration.
- Tests for hash chain + sandbox happy path; `CHANGELOG.md`; append **Testing instructions**. No guessed production AEAT calls without verified spec.

## Implementation notes (feature coder)

- **Phase 0 ADR:** `docs/0065-verifactu-production.md` — prefer certified middleware; POS owns numbering, internal hash chain, ValidarQR URL shape, immutability, sandbox hook.
- **Migration:** `back/migrations/20260726142100_fiscal_invoice_hash_chain.sql`
- **Service:** `back/app/fiscal_invoice_service.py` — `pos.fiscal.hash.v1` chain, AEAT ValidarQR URL, sandbox submit (+ optional `FISCAL_MIDDLEWARE_*`), `POST …/fiscal-invoice/cancel` anulación.
- **Live gate:** `FISCAL_LIVE_UNLOCK` + middleware URL required before `fiscal_mode: live`.
- **Docs/UI:** updated `0018`, `/features` + Settings i18n honesty; `CHANGELOG` Unreleased.
- **Deferred / follow-up:** official AEAT huella/SOAP (middleware vendor selection + contract); printing-bridge layout polish; split-bill sequential numbering across partial payments.

## Testing instructions

1. **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` — expect `20260726142100_fiscal_invoice_hash_chain` applied; columns `record_hash`, `previous_hash`, `record_type` on `fiscal_invoice`.
2. **Pytest:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_fiscal_invoice_api.py -q` — all green (issue + idempotent, hash chain, sandbox fields, immutability 409, anulación then delete, live mode blocked).
3. **Settings UI:** Log in as owner → Settings → Payments → set fiscal mode to **Test**, save. Attempt **Live** without unlock → expect API/settings rejection (400).
4. **Issue path:** Paid order → Print Factura (or `POST /orders/{id}/fiscal-invoice/issue`) → response includes `record_hash`, `verification_qr_content` containing `ValidarQR`, and `sandbox_submitted_at` set.
5. **Immutability:** After issue, `DELETE /orders/{id}` or edit line quantity → **409**. Then `POST /orders/{id}/fiscal-invoice/cancel` → anulación `record_type`; delete should succeed.
6. **Smoke:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → 200; front logs have no new TS/NG build errors.
7. **Docs spot-check:** `docs/0065-verifactu-production.md` and `docs/0018-verifactu-fiscal-invoicing.md` describe middleware preference and live gate.

## Test report

1. **Date/time (UTC):** start 2026-07-26 17:59:49 UTC; end 2026-07-26 18:01:40 UTC. Log window: ~17:59–18:02 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced before start).
3. **What was tested:** Migration hash-chain columns; fiscal invoice pytest; Settings Payments fiscal Test save + Live gate; issue path (ValidarQR + sandbox); immutability/anulación; homepage smoke + front compile; docs 0018/0065.
4. **Results:**
   - Migrate / columns `record_hash`, `previous_hash`, `record_type`: **PASS** — schema already includes `20260726142100_fiscal_invoice_hash_chain` (DB max `20260726190000`); columns present as `character varying`.
   - Pytest `tests/test_fiscal_invoice_api.py`: **PASS** — `7 passed` in 3.87s.
   - Settings UI Test + Live reject: **PASS** — Owner → Settings → Payment Settings; fiscal mode set to Test, “Settings saved successfully!”; `GET /api/tenant/settings` → `fiscal_mode=test`. `PUT … fiscal_mode=live` → **400** with unlock/middleware message. Restored to `off` after checks.
   - Issue path: **PASS** — `POST /api/orders/2488/fiscal-invoice/issue` → 200; `record_hash` set; `verification_qr_content` contains `ValidarQR` (`prewww2.aeat.es/.../ValidarQR`); `sandbox_submitted_at=2026-07-26T18:01:06.115557+00:00`; number `VF-2`.
   - Immutability + anulación: **PASS** — `DELETE /api/orders/2488` → **409** after issue; `POST …/fiscal-invoice/cancel` → 200 `record_type=anulacion`; subsequent DELETE → 200.
   - Smoke + front logs: **PASS** — `GET /` → 200; `pos-front` logs since 15m: no TS/NG/bundle errors (`FRONT_LOG_ERR_COUNT=0`).
   - Docs spot-check: **PASS** — `docs/0065-verifactu-production.md` prefers certified middleware + live gate; `docs/0018-verifactu-fiscal-invoicing.md` documents ValidarQR, sandbox, and `FISCAL_LIVE_UNLOCK`.
5. **Overall:** **PASS**
6. **Product owner feedback:** Test-mode VeriFactu path is usable: hash chain, AEAT ValidarQR shape, and sandbox stamp work on a real paid order, and live stays correctly blocked without middleware unlock. Docs and Settings copy match the gated reality rather than overselling production AEAT filing.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/settings (Payment Settings → Fiscal invoicing)
   3. http://127.0.0.1:4202/api/tenant/settings
   4. http://127.0.0.1:4202/api/orders/2488/fiscal-invoice/issue
   5. http://127.0.0.1:4202/api/orders/2488/fiscal-invoice/cancel
8. **Relevant log excerpts (last section):**
```
POST /orders/2488/fiscal-invoice/issue HTTP/1.1" 200 OK
DELETE /orders/2488 HTTP/1.1" 409 Conflict
POST /orders/2488/fiscal-invoice/cancel HTTP/1.1" 200 OK
DELETE /orders/2488 HTTP/1.1" 200 OK
```
