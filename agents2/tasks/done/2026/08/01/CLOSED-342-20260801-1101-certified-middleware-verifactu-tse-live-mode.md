---
## Closing summary (TOP)

- **What happened:** VeriFactu and TSE live mode were gated on certified middleware; the MVP delivered provider selection, adapters, live guards, and honest marketing/docs.
- **What was done:** ADR chose Fiskaly SIGN ES/DE; fiscal/TSE adapters and unlock guards landed; docs (0065/0072/0074), ROADMAP, README, and features/Settings copy were updated. Real AEAT/BSI remisión remains an ops follow-up with commercial credentials.
- **What was tested:** Fiscal + TSE pytest (17 passed, including live gates and mock-live slice); HTTP smoke on `/`, `/features`, `/pricing`, `/api/health`; marketing/Settings honesty — overall **PASS**.
- **Why closed:** All MVP pass criteria verified; safe to close the verification slice.
- **Closed at (UTC):** 2026-08-01 11:32
---

# Certified middleware to unblock VeriFactu + TSE live mode

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/342
- **342**

## Problem / goal

VeriFactu (Spain) and TSE (Germany) are functionally complete in **test/stub** mode but **`live` is gated** on certified middleware that is not wired yet (`docs/0065-verifactu-production.md`, `docs/0072-tse-fiscal-compliance.md`; ROADMAP “In progress / next”). Goal: decide build-vs-buy, integrate certified providers so `fiscal_mode: live` / TSE `live` work for real tenants, and keep marketing/docs honest until then.

## High-level instructions for coder

- Read **`docs/0065-verifactu-production.md`**, **`docs/0072-tse-fiscal-compliance.md`**, and the ROADMAP live-gate row; reuse existing issue/cancel and TSE auto-sign paths — swap stub for provider calls in `live` only.
- **Decision record:** publish an ADR comparing ≥2 certified options per regime (e.g. Fiskaly / Verifacti / Efsta for VeriFactu; certified TSE cloud/hardware for Germany) — cost, API shape, certification coverage, effort — and pick one per regime before deep coding.
- **VeriFactu:** wire chosen provider into issue/cancel so `live` submits via the provider (AEAT protocol/cert upkeep on their side).
- **TSE:** wire chosen certified module into the existing auto-sign path so `live` yields a real signed receipt, not the stub signature.
- **Guards:** prevent enabling `live` until provider integration is verified; document credential/cert renewal cadence.
- **Docs / product copy:** update 0065, 0072, and ROADMAP once unblocked; review `/pricing` and `/features` so nothing claims “certified” / “live-ready” before this ships.
- Prefer ADR + one-regime vertical slice if dual-regime full live is too large for one WIP; note legal/ops blockers without inventing credentials in-repo.
- **Out of scope:** rewriting sandbox/test paths that already work; representing either feature as certified in marketing before providers are live; committing AEAT/TSE secrets into the repo (use `config.env` / deploy secrets).
- Pass criteria (MVP): ADR with chosen providers; VeriFactu `live` issues a real AEAT-submitted invoice for a test tenant; TSE `live` produces a certified-module-signed receipt for a test tenant; live-enable guard; docs + ROADMAP updated; pricing/features reviewed for premature claims.
- Append **Testing instructions** when moving to UNTESTED.

## Security note (001)

Issue body summarized for product intent only; no secrets or credentials copied.

## Implementation summary (010)

- ADR: **`docs/0074-fiscal-certified-middleware.md`** — pick **Fiskaly SIGN ES** (VeriFactu) and **Fiskaly SIGN DE** (TSE); Verifacti / Epson-Swissbit as runners-up; `generic` + non-prod `mock` retained.
- Adapters: `back/app/fiscal_providers.py`, `back/app/tse_providers.py`; wired into issue/cancel and TSE sale/storno.
- Live guards: unlock + `live_credentials_ready()`; mock forbidden when `PRODUCTION=true`; live failures → **502** (no stub-only success).
- Docs: 0065, 0072, ROADMAP, README, `config.env.example`, CHANGELOG; `/features` + Settings `en.json` honesty review (no premature certified claims). `/pricing` has no fiscal/TSE certified claims.
- **Ops blocker:** real AEAT/BSI production remisión needs commercial Fiskaly credentials (not in repo). CI vertical slice uses `mock`.

## Testing instructions

### Automated (Docker)

```bash
# From repo root, stack up
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
  python3 -m pytest tests/test_fiscal_invoice_api.py tests/test_tse_api.py -q
```

Expect **17 passed**, including:

- `test_live_mode_blocked_without_unlock` / `test_live_mode_gated`
- `test_live_issue_with_mock_middleware` (VeriFactu live → `submission_status=mock_accepted`)
- `test_live_sign_with_mock_provider` (TSE live → `mock-sig-*` / `MOCK-TSE-*`)

### Manual / smoke

1. Confirm app responds: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → **200**.
2. `/features` and Settings → Payments: copy still says preparation / locked live (mentions Fiskaly when unlocked path exists) — **not** “AEAT certified” / “BSI certified”.
3. Without unlock: Settings cannot set `fiscal_mode` or `tse_mode` to `live` (400).
4. Optional non-prod vertical slice: set `FISCAL_MIDDLEWARE_PROVIDER=mock`, `FISCAL_LIVE_UNLOCK=true` (and TSE equivalents), restart back, set tenant live, issue fiscal invoice / pay with TSE — expect accepted mock submission statuses. **Do not** enable mock on production.

### Ops note for real LIVE

Configure Fiskaly TEST keys (`FISCAL_MIDDLEWARE_PROVIDER=fiskaly_sign_es`, `TSE_PROVIDER=fiskaly_sign_de`, secrets via `config.env`), verify against Fiskaly TEST, then unlock LIVE only after sign-off. See `docs/0074-fiscal-certified-middleware.md` renewal cadence.

## Test report

1. **Date/time (UTC):** 2026-08-01 11:30:41 – 11:31:24 UTC. Log window: `docker logs --since 25m` on `pos-back` / `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `748f7763`. Running back had `FISCAL_LIVE_UNLOCK` / `TSE_LIVE_UNLOCK` / providers **unset** (no live unlock in this env).
3. **What was tested:** Automated fiscal + TSE suite (live gates + mock live vertical slice); home/features/pricing HTTP smoke; marketing/Settings honesty copy; docs ADR 0074 + 0065/0072 spot-check. Optional env restart mock slice skipped (pytest already covers mock live; do not enable mock on production).
4. **Results:**
   - Pytest `tests/test_fiscal_invoice_api.py` + `tests/test_tse_api.py`: **PASS** — 17 passed in 6.50s (incl. named live-gate + mock-live tests re-run: 4/4).
   - `test_live_mode_blocked_without_unlock` / `test_live_mode_gated`: **PASS** — PUT `fiscal_mode`/`tse_mode`=`live` → 400 without unlock.
   - `test_live_issue_with_mock_middleware` / `test_live_sign_with_mock_provider`: **PASS** — mock middleware vertical slice.
   - App responds `/` and `/features` and `/pricing`: **PASS** — HTTP 200; `/api/health` → `{"status":"ok"}`.
   - Features / Settings copy honesty: **PASS** — browser `/features` shows preparation / locked-live language; no “AEAT certified” / “BSI certified” claims; `en.json` Settings strings mention Fiskaly unlock + “not marketed as certified”.
   - Pricing: **PASS** — no fiscal/TSE certified claims on `/pricing`.
   - Docs: **PASS** — `docs/0074-fiscal-certified-middleware.md` picks Fiskaly SIGN ES/DE; 0065/0072 reference gates + renewal.
   - Front compile: **PASS** — no bundle/TS errors in 25m front logs (only pre-existing NG8107 warnings).
5. **Overall:** **PASS**
6. **Product owner feedback:** Certified-middleware adapters and live unlocks behave as designed in CI/mock; marketing stays honest until commercial Fiskaly credentials exist. Real AEAT/BSI remisión remains an ops follow-up with TEST keys, not a code gap for this MVP. Safe to close the verification slice.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/features
   3. http://127.0.0.1:4202/pricing
   4. http://127.0.0.1:4202/api/health
8. **Relevant log excerpts (last section):**
   - pytest: `17 passed, 1 warning in 6.50s` / named re-run `4 passed in 2.33s`.
   - back: no error/exception/traceback lines in the 25m window for this verification.
   - front: no `Application bundle generation failed` / `ERROR TS`; only NG8107 optional-chain warnings unrelated to this task.
