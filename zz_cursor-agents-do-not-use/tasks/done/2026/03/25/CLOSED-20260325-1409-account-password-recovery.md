---
## Closing summary (TOP)

- **What happened:** GitHub issue #93 requested self-service password recovery for staff/tenant and provider accounts instead of admin-only workarounds.
- **What was done:** Backend migration and `PasswordResetToken` model, non-enumerating reset request/confirm endpoints, email integration with `PUBLIC_APP_BASE_URL` for links, and Angular routes for forgot/reset (including provider scope) with i18n aligned to existing auth patterns.
- **What was tested:** All four `test_password_reset.py` tests passed; front container reached successful bundle generation; `npm run test:landing-version` exited 0; `/forgot-password`, `/reset-password`, and `/provider/forgot-password` returned HTTP 200; optional manual SMTP inbox E2E was not run in this cycle.
- **Why closed:** Tester **Test report** overall **PASS** met the task pass/fail criteria (pytest, build health, landing smoke).
- **Closed at (UTC):** 2026-03-25 14:25
---

# Create a system to recover the password of the account

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/93

## Problem / goal
Users who forget their password need a **self-service recovery** path (request reset, verify identity via email or similar, set a new password) instead of admin-only workarounds. Scope should cover **staff/tenant** accounts as appropriate for this product; align with existing **auth**, **email/SMTP**, and **security** patterns in the repo (see `README.md`, `AGENTS.md`, and any auth-related notes under `docs/`).

## High-level instructions for coder
- Clarify which user types must be supported first (e.g. tenant owner/staff vs provider portal) and mirror the issue’s intent on GitHub if needed.
- Design **backend** endpoints and persistence (tokens, expiry, one-time use, rate limiting) consistent with FastAPI/SQLModel usage elsewhere; avoid leaking whether an email exists where that matters for security.
- Add **frontend** flows: “Forgot password” entry from login, email with link or code, and **set new password** UI with validation and i18n where login/register already use translations.
- Wire **email delivery** using the same SMTP/config path as other transactional mail; document any new env vars in `config.env.example` if required.
- Add tests (pytest for API; Puppeteer or existing patterns for critical UI path) and smoke the full flow locally (Docker stack).

## Coder notes (implementation summary)
- **Staff + provider:** Request body mirrors login disambiguation: optional `tenant_id`, optional `scope: "provider"`. Response is always `{ status, message }` (no email enumeration).
- **Backend:** Migration `20260325140000_password_reset_token.sql`, model `PasswordResetToken`, `POST /password-reset/request` (async, email via `send_password_reset_email`), `POST /password-reset/confirm`. Raw token emailed; SHA-256 hash stored; `token_version` incremented on success.
- **Frontend:** Routes `forgot-password`, `reset-password`, `provider/forgot-password` (reuse `ForgotPasswordComponent` with route `data.passwordResetScope`).
- **Email links:** `{PUBLIC_APP_BASE_URL}/reset-password?token=…` — **must set `PUBLIC_APP_BASE_URL`** in `config.env` for emails to contain a usable link.

---

## Testing instructions

### What to verify
- API accepts reset requests without revealing whether the email exists; confirm endpoint rejects invalid/expired/reused tokens; successful confirm changes password and invalidates existing sessions (`token_version`).
- UI: forgot-password and reset-password pages load, i18n keys resolve, staff login preserves `tenant` query on forgot link when present.
- SMTP: with global or tenant SMTP + `PUBLIC_APP_BASE_URL`, a real request sends an email with a working link (manual).

### How to test
- **Pytest (Docker):**  
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest /app/tests/test_password_reset.py -v`
- **Apply migration (if needed):**  
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.migrate`
- **Frontend build:**  
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=80 front` — no TS/Angular errors after changes.
- **Smoke:**  
  `cd front && BASE_URL=http://127.0.0.1:4202 npm run test:landing-version`
- **Manual E2E (optional):** Set `PUBLIC_APP_BASE_URL` (e.g. `http://127.0.0.1:4202`), configure SMTP, open `/login` → Forgot password → submit → use link from inbox → set new password → sign in.

### Pass/fail criteria
- **Pass:** All four tests in `test_password_reset.py` green; front log shows successful bundle generation; landing smoke test exits 0.
- **Fail:** Any pytest failure; Angular build errors in front log; broken routes or confirm accepting bad token.

---

## Test report

1. **Date/time (UTC) and log window:** Run **2026-03-25T14:18Z–14:22Z** — `pos-front` / `pos-back` logs reviewed for the same window (compose `logs --tail=80 front` sampled at ~14:22Z).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202` for Puppeteer; branch **`development`**, commit **`6223dca`**.

3. **What was tested:** API reset (enumeration, bad/reused tokens, confirm + `token_version`); migration state; Angular build health from front container logs; landing + logged-in nav smoke; HTTP reachability of password-reset-related routes; **not** full manual SMTP inbox or “Forgot password → email link → set password” E2E.

4. **Results**
   - **DB migration / `password_reset_token` schema:** **PASS** — `python -m app.migrate` reports schema version **20260325140000** and “Database is up to date”.
   - **`test_password_reset.py` (4 tests):** **PASS** — `4 passed in 1.92s` (`test_confirm_bad_token`, `test_confirm_updates_password_and_invalidates_token`, `test_request_creates_token_and_sends_email`, `test_request_unknown_email_still_ok`).
   - **Frontend bundle (pass/fail criteria):** **PASS** — latest lines in sampled `pos-front` log: **`Application bundle generation complete.`** at `2026-03-25T14:18:09.518Z` (earlier lines in the same buffer show transient **TS2322** on `forgot-password.component.ts` during incremental rebuilds, then recovery to a successful build).
   - **Landing smoke (`npm run test:landing-version`):** **PASS** — script ended **`exit_code: 0`**, `RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.` (`elapsed_ms: 42750`).
   - **Password-reset routes HTTP (SPA):** **PASS** — `curl` returned **200** for `/forgot-password`, `/reset-password`, `/provider/forgot-password`.
   - **SMTP + real inbox link (manual):** **N/A** — not executed in this run (optional in Testing instructions).
   - **UI: i18n keys / `tenant` query preserved on forgot link:** **NOT TESTED** — no dedicated browser assertion in this run; recommend one manual check from `/login?tenant=…` → Forgot password.

5. **Overall:** **PASS** (meets task **Pass/fail criteria**: four pytest tests green, successful bundle generation present in front log, landing smoke exit 0).

6. **Product owner feedback:** Automated verification gives strong confidence on the **API contract** and **route wiring**. Please still do a **single manual pass** with real SMTP and **`PUBLIC_APP_BASE_URL`** set so the email link opens the reset page, and confirm **tenant context** on the staff forgot-password flow when arriving from a bookmarked login URL with `tenant`.

7. **URLs tested**
   1. `http://127.0.0.1:4202/` (landing smoke)
   2. `http://127.0.0.1:4202/dashboard` … `http://127.0.0.1:4202/settings` (sidebar nav via smoke script)
   3. `http://127.0.0.1:4202/forgot-password`
   4. `http://127.0.0.1:4202/reset-password`
   5. `http://127.0.0.1:4202/provider/forgot-password`

8. **Relevant log excerpts**

`pos-back` / migrate (stdout):
```text
INFO: Database schema version: 20260325140000
...
✅ Database schema version: 20260325140000
```

Pytest:
```text
tests/test_password_reset.py::TestPasswordReset::test_confirm_bad_token PASSED
tests/test_password_reset.py::TestPasswordReset::test_confirm_updates_password_and_invalidates_token PASSED
tests/test_password_reset.py::TestPasswordReset::test_request_creates_token_and_sends_email PASSED
tests/test_password_reset.py::TestPasswordReset::test_request_unknown_email_still_ok PASSED
============================== 4 passed in 1.92s ===============================
```

`pos-front` (tail sample — final build outcome):
```text
Application bundle generation complete. [0.367 seconds] - 2026-03-25T14:18:09.518Z
Page reload sent to client(s).
```

**GitHub:** Comment posted on **#93** with verification summary; **`agent:testing`** was not present on the issue (`gh issue edit` remove-label reported not found).
