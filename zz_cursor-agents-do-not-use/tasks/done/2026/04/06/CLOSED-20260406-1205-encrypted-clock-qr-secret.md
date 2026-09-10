---
## Closing summary (TOP)

- **What happened:** The tester verified the encrypted staff clock-in QR secret work end-to-end after implementation (DB, API, Settings UI).
- **What was done:** Encrypted storage for the clock QR token (`tenant.clock_qr_token_encrypted`), Fernet-based crypto, regenerate/token GET endpoints, and Settings → Security behavior for downloadable/persistent token were exercised per the task notes.
- **What was tested:** Migrations, pytest `tests/test_work_session.py` (including legacy 409 and round-trip cases), landing smoke, `test:my-shift-clock-qr`, and a headless Settings → Security reload check — **all PASS** with overall **PASS**.
- **Why closed:** All stated pass/fail criteria were met; tester signed off with overall PASS.
- **Closed at (UTC):** 2026-04-06 15:11
---

# Encrypted clock QR secret + persistent download in Settings

## GitHub Issues
- [github.com/satisfecho/pos/issues](https://github.com/satisfecho/pos/issues)
- `gh issue list --repo satisfecho/pos --state open --limit 40`
- Optional: `--json number,title,labels,updatedAt,url`
- **Issue:** https://github.com/satisfecho/pos/issues/167

## Problem / goal
Implement an encrypted clock QR secret and allow persistent download of this secret in the Settings section.

## High-level instructions for coder
- Investigate how to securely store and manage a QR secret for clocking in.
- Implement functionality to generate and encrypt this secret.
- Add a feature in the Settings UI to allow users to download this secret persistently.
- Ensure security best practices are followed for handling sensitive secrets.

## Implementation notes (coder)
- **DB:** `tenant.clock_qr_token_encrypted` (TEXT), migration `20260406140000_tenant_clock_qr_token_encrypted.sql`.
- **Crypto:** Fernet with key derived from `SECRET_KEY` + domain string (`clock_qr_util.py`); verification unchanged (HMAC hash).
- **API:** `POST /tenant/settings/clock-qr/regenerate` stores hash + ciphertext; `GET /tenant/settings/clock-qr/token` returns plain token (SETTINGS_UPDATE); legacy hash-only → 409 `clock_qr_regenerate_required`; `GET/PUT /tenant/settings` expose `clock_qr_downloadable`.
- **Front:** Settings → Security loads token via GET when `clock_qr_active && clock_qr_downloadable`; legacy tenants see hint to regenerate.

## Testing instructions

### What to verify
- After **Generate new token**, reload Settings → Security: token text, copy, and **Download QR for printing** still work.
- **Legacy** tenant (hash only, no ciphertext): hint appears; **Generate new token** fixes downloadable state.
- API: `GET /tenant/settings/clock-qr/token` returns same token as last regenerate for authorized admin.

### How to test
- **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate`
- **Backend:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_work_session.py -q`
- **Smoke:** `cd front && BASE_URL=http://127.0.0.1:4202 npm run test:landing-version`
- **Manual:** Settings → Security → Staff clock-in QR: regenerate, confirm URL/download, hard-refresh page, confirm token + download still available.

### Pass/fail criteria
- Pass: migrations apply; pytest `test_work_session` green; landing smoke test OK; manual reload still shows token and PNG download when QR was regenerated after this change.
- Fail: 500 on GET token, token missing after reload for new regenerations, or QR download broken.

---

## Test report

1. **Date/time (UTC)**  
   - Started: 2026-04-06 15:05:02 UTC (migrate run).  
   - Finished: 2026-04-06 15:12 UTC (approx.).  
   - Log window for excerpts: ~2026-04-06 15:00–15:12 UTC.

2. **Environment**  
   - Compose: `docker-compose.yml` + `docker-compose.dev.yml`.  
   - `BASE_URL`: `http://127.0.0.1:4202` (HAProxy).  
   - Branch: `development` (synced via `./scripts/git-sync-development.sh` before edits).

3. **What was tested** (from “What to verify”)  
   - Migrations; pytest `tests/test_work_session.py`; landing smoke; `npm run test:my-shift-clock-qr` (with `DEMO_LOGIN_*` mapped to `LOGIN_*`); **Settings → Security** headless check: regenerate clock QR token, read token from `[data-testid="settings-clock-qr-card"]`, full page reload, reopen Security tab, confirm **same** token and **Download QR for printing** control present before and after reload.

4. **Results**  
   - **Migrations apply (incl. `20260406140000_tenant_clock_qr_token_encrypted`):** **PASS** — `python -m app.migrate` reports schema version `20260406140000`, up to date.  
   - **pytest `test_work_session`:** **PASS** — `9 passed in 4.33s` (includes `test_clock_qr_encrypt_roundtrip`, `test_regenerate_clock_qr_persists_encrypted_get_token_matches`, `test_get_clock_qr_token_409_when_legacy_hash_only`).  
   - **Landing smoke (`test:landing-version`):** **PASS** — exit 0; demo login; sidebar nav including `/settings`.  
   - **My Shift clock QR (`test:my-shift-clock-qr`):** **PASS** — regenerate via API, `/users/me/clock-qr-status` 200, `.scan-cta` present (cleanup disables QR at end of script).  
   - **Manual / UI (Settings → Security, reload):** **PASS** — dedicated headless flow: token in clock QR card stable after reload; `[data-testid="settings-download-clock-qr-png"]` present before and after reload.  
   - **Legacy hash-only / GET token 409:** **PASS** — covered by `test_get_clock_qr_token_409_when_legacy_hash_only` in same pytest file.  
   - **GET `/tenant/settings/clock-qr/token` matches last regenerate:** **PASS** — `test_regenerate_clock_qr_persists_encrypted_get_token_matches`; live logs show `GET /tenant/settings/clock-qr/token` 200 after `POST .../regenerate` 200.

5. **Overall:** **PASS**

6. **Product owner feedback**  
   Encrypted storage plus the GET token path behave as intended: automated tests cover crypto round-trip, legacy regenerate-required behavior, and token persistence after regenerate. In the browser, after generating a token, a full reload of Settings → Security still shows the same secret and the printable QR download action, which matches the goal of persistent staff clock-in QR setup without surprises after refresh.

7. **URLs tested**  
   1. `http://127.0.0.1:4202/`  
   2. `http://127.0.0.1:4202/login?tenant=1`  
   3. `http://127.0.0.1:4202/dashboard` (via landing script)  
   4. `http://127.0.0.1:4202/settings` (landing script + Security tab navigation)  
   5. `http://127.0.0.1:4202/my-shift` (my-shift clock QR script)

8. **Relevant log excerpts**  
   - **Front (earlier transient TS error, then clean build):** At `2026-04-06T14:58:29.175Z` bundle reported `TS2339` for `loadPersistedClockQrToken`; subsequent rebuild at `2026-04-06T15:04:15.298Z` — **Application bundle generation complete** (no errors in tail).  
   - **Back (clock QR requests, UTC container time):**  
     `INFO: ... "POST /tenant/settings/clock-qr/regenerate HTTP/1.1" 200 OK`  
     `INFO: ... "GET /tenant/settings/clock-qr/token HTTP/1.1" 200 OK`  
     `INFO: ... "GET /users/me/clock-qr-status HTTP/1.1" 200 OK`

**GitHub:** Comment posted on issue #167 when testing started. Label `agent:testing` is not defined on the repo (`gh issue edit` failed); no label change applied.

---
