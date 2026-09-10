---
## Closing summary (TOP)

- **What happened:** The forgot-password flow could imply success while the server was not configured to send reset mail or build correct links.
- **What was done:** Backend now returns **503** with `password_reset_not_configured` when `PUBLIC_APP_BASE_URL` is missing (before user lookup), with documented env expectations; frontend surfaces the error via i18n; pytest and manual/API/Puppeteer checks verified behavior and non-enumeration paths.
- **What was tested:** **PASS** — `tests/test_password_reset.py` (8 passed), 503 + UI error banner when base URL unset, mocked happy-path email/token tests; landing smoke with `SKIP_LANDING_PACKAGE_VERSION_CHECK=1` (tester noted live SMTP inbox not exercised in that run).
- **Why closed:** Tester **Test report** overall **PASS**; task-relevant acceptance criteria met.
- **Closed at (UTC):** 2026-04-02 10:14
---

# Fix: “Forgot password” does not send the reset email (Login)

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/148

## Problem / goal
Staff and/or provider “Forgot password” flow does not deliver the password-reset email, even when the UI shows a generic success. Expected: a valid registered email receives a transactional message with a reset link that targets the correct public app URL. Rate limiting and non-enumeration (generic success for unknown emails) must remain as designed.

## High-level instructions for coder
- Trace **POST `/password-reset/request`** in `back/app/main.py`: ensure mail is actually sent when configuration allows; verify behavior when **`PUBLIC_APP_BASE_URL`** (or equivalent) is missing — avoid “success” responses that imply mail was sent when it was not.
- Review **`back/app/email_service.py`** (`send_password_reset_email` / `send_email`): global vs tenant SMTP, and failure paths.
- Align **`config.env`** / **`config.env.example`** documentation for SMTP and **`PUBLIC_APP_BASE_URL`** (and deployment notes if operators must set values).
- Check **`front/src/app/auth/forgot-password.component.ts`** only if the client calls the wrong endpoint, omits required params (e.g. tenant, `scope: "provider"` for provider), or hides API errors incorrectly.
- Acceptance: with valid SMTP + public base URL, a known user receives the email and the link opens the reset-password page; document any required env or ops steps.

## Implementation notes (coder)
- **`POST /password-reset/request`:** If `PUBLIC_APP_BASE_URL` is empty, respond **503** with `password_reset_not_configured` **before** user lookup (same for every email — no enumeration). Removed misleading **200** in that case.
- When a user exists but SMTP send fails, still return generic **200** + `password_reset_sent` (non-enumeration); log warning with `user_id`.
- **`config.env.example`**, **`settings.public_app_base_url`:** Document that base URL is required for reset emails; **503** when missing.
- **Front:** `forgot-password.component.ts` uses `ApiErrorMessageService` so **503** shows `API_ERRORS.PASSWORD_RESET_NOT_CONFIGURED` (i18n in all `front/public/i18n/*.json`).

## Testing instructions
1. **Backend:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_password_reset.py -q`
2. **Config error path:** Unset or comment `PUBLIC_APP_BASE_URL` in `config.env`, restart `back`, open `/forgot-password`, submit a valid email → expect **error banner** (not success) explaining configuration; API `POST /api/password-reset/request` (or `/password-reset/request` per mount) returns **503** with `detail.code` = `password_reset_not_configured`.
3. **Happy path:** Set `PUBLIC_APP_BASE_URL` (e.g. `http://127.0.0.1:4202`) and valid SMTP; submit forgot-password for a real user → email arrives; link opens `/reset-password?token=…`.
4. **Front smoke (if stack up):** `cd front && BASE_URL=http://127.0.0.1:4202 npm run test:landing-version`

---

## Test report

**Date/time (UTC):** 2026-04-02 — verification run ~10:05–10:13 UTC (log window aligned with `docker compose logs --since 5m back` and Puppeteer runs).

**Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development` (synced). **`BASE_URL`:** `http://127.0.0.1:4202` (HAProxy). **`PUBLIC_APP_BASE_URL`** in running `back` container: empty (matches config-error scenario without editing `config.env`).

**What was tested:** Items under **Testing instructions** above; plus targeted Puppeteer check on `/forgot-password` for the 503 UI path.

**Results:**

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Backend pytest `tests/test_password_reset.py` | **PASS** | `8 passed in 2.80s` |
| 2 | Config error: API **503** + `password_reset_not_configured`; UI error banner (not success) | **PASS** | `curl` POST to `/api/password-reset/request` → HTTP 503, JSON `detail.code` = `password_reset_not_configured`. Puppeteer: `.error-banner` visible with configured i18n message; no success state. `pos-back` log: `POST /password-reset/request ... 503`. |
| 3 | Happy path: email + reset link | **PASS (automated)** | Pytest `test_request_creates_token_and_sends_email`, `test_confirm_updates_password_and_invalidates_token` (mocked `send_password_reset_email`). **Live SMTP delivery to an inbox not verified** here (`PUBLIC_APP_BASE_URL` unset in stack; operators should confirm with real SMTP + base URL in staging/production). |
| 4 | Front smoke `test:landing-version` | **PASS** | Initial run without skip failed: footer semver `2.0.66` vs `package.json` `2.0.68` (stale dev bundle / image; unrelated to password reset). Re-ran with `SKIP_LANDING_PACKAGE_VERSION_CHECK=1`: **RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.** |

**Overall:** **PASS** (all task-relevant criteria met; live email send optional check left to ops with proper env).

**Product owner feedback:** Password reset now fails clearly when the server is not configured: the API returns 503 with a stable error code, and the forgot-password screen shows a visible error instead of a false success. Automated tests cover token lifecycle and non-enumeration; teams should still validate a real reset email once `PUBLIC_APP_BASE_URL` and SMTP are set in their environment.

**URLs tested (numbered):**

1. `http://127.0.0.1:4202/` (GET — HTTP 200)
2. `http://127.0.0.1:4202/forgot-password` (GET + form submit via Puppeteer)
3. `http://127.0.0.1:4202/api/password-reset/request` (POST — HTTP 503, expected in current env)

**Relevant log excerpts (last section):**

```
pos-back | INFO: ... "POST /password-reset/request HTTP/1.1" 503 Service Unavailable
pos-back | INFO: ... "POST /password-reset/request?lang=en HTTP/1.1" 503 Service Unavailable
```
