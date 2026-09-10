---
## Closing summary (TOP)

- **What happened:** Audit-only task for WhatsApp reservation reminders (Twilio) was implemented and verified PASS.
- **What was done:** Documented current send path (staff Send reminder + heartbeat), env vars, book-page `wa.me` CTA vs Twilio send, and tightened `docs/0024-whatsapp-reminder-notes.md` with an operator checklist and gaps (no ContentSid / Meta templates).
- **What was tested:** Doc/env/`rg` checks and optional `test:book-whatsapp` PASS; live staff Twilio send skipped (no local `TWILIO_*`). Overall PASS.
- **Why closed:** All audit pass criteria met; tester report PASS.
- **Closed at (UTC):** 2026-07-29 15:26
---

# Audit WhatsApp reservation reminders (Twilio) current state

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/335
- **335**

## Problem / goal

Document what already works for Satisfecho WhatsApp reservation reminders (Twilio). Operators and agents need a short, accurate checklist of configuration, local test steps, and remaining gaps — without building new product features. Primary references: `back/app/whatsapp_service.py`, `POST /reservations/{id}/send-reminder`, tenant WhatsApp on the public book page, and `docs/0024-whatsapp-reminder-notes.md` (already marked shipped). Related: `docs/0019-no-show-implementation-plan.md`, `docs/testing.md` (`test:book-whatsapp`).

## High-level instructions for coder

- **Audit only — do not implement new features** (no new APIs, UI, templates, or Twilio ContentSid wiring unless already present and merely undocumented).
- Inspect and summarize current behaviour from code + docs:
  - `back/app/whatsapp_service.py` (send path, E.164, failure handling)
  - `POST /reservations/{id}/send-reminder` (when WhatsApp is attempted; `email_sent` / `whatsapp_sent`)
  - Staff UI entry point: reservations **Send reminder** (email and/or phone)
  - Public book page tenant WhatsApp CTA (link only — distinct from reminder send)
  - Heartbeat / scheduled 24h–2h reminders if they share the same WhatsApp channel
- Report required env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `DEFAULT_PHONE_COUNTRY` (and any others actually read by the service). Point at `config.env.example`; never paste live secrets.
- Note sandbox vs production limits (plain-text body vs Meta-approved templates / ContentSid).
- Put a short checklist at the end of this task (or in an updated doc section if 0024 needs a one-paragraph “operator checklist”): **Configured?** / **How to test locally** / **Gaps**.
- If `docs/0024-whatsapp-reminder-notes.md` already covers shipped status, only tighten gaps (checklist, UI entry points, book-page CTA vs send-reminder). Prefer minimal doc edits over a rewrite.
- Pass criteria: a reader knows what works today, which env vars to set, how to smoke-test locally, and what is still a gap (e.g. production templates). Append **Testing instructions** (doc/`rg` and optional `test:book-whatsapp` / staff send-reminder smoke).

## Audit findings (2026-07-29)

### What works today

1. **`whatsapp_service.py`**: Twilio REST `Messages.json` with plain-text `Body`; requires all three `TWILIO_*`; normalizes guest phone to E.164 via `DEFAULT_PHONE_COUNTRY`; returns `False` on missing config, bad phone, non-2xx, or exception (logged). Async wrapper via `asyncio.to_thread`.
2. **`POST /reservations/{id}/send-reminder`** (`main.py`): Staff + `RESERVATION_WRITE`; booked only; email if present; WhatsApp if phone present **and** Twilio configured; 400 if no usable channel; 503 if all attempted channels fail; returns `email_sent` / `whatsapp_sent` / `to_email` / `to_phone`; stamps both reminder slots so heartbeat skips.
3. **Staff UI**: Reservations → **Send reminder** → alerts for email / WhatsApp / both (`reservations.component.ts`).
4. **Heartbeat**: `reservation_reminder_heartbeat.py` `_send_one_reminder` — same email/WhatsApp rules when tenant 24h/2h flags are enabled.
5. **Book page**: `tenant.whatsapp` → `wa.me` link only (`getWhatsAppUrl`); **not** Twilio reminder send. Settings field under restaurant contact.

### Env vars (from `settings.py` / `config.env.example`)

| Variable | Used by |
|----------|---------|
| `TWILIO_ACCOUNT_SID` | Required for send |
| `TWILIO_AUTH_TOKEN` | Required for send |
| `TWILIO_WHATSAPP_FROM` | Required; `whatsapp:` prefix added if missing |
| `DEFAULT_PHONE_COUNTRY` | E.164 normalize (default `ES`) |

No other Twilio-related settings. `PUBLIC_APP_BASE_URL` affects **email** reminder links only, not WhatsApp body.

### Gaps

- No `ContentSid` / Meta template support (docstring only).
- Sandbox: guest must join Twilio sandbox; production templates needed for business-initiated traffic.
- Global Twilio only (not per-tenant provider).
- WhatsApp message has no view/cancel URL (email does).
- Book CTA and reminder send are unrelated channels.

### Doc update

Tightened `docs/0024-whatsapp-reminder-notes.md`: dual-surface table (book CTA vs send), staff UI + heartbeat notes, operator checklist, production/template gap, email-only `view_url`.

## Operator checklist

| Item | Status / notes |
|------|----------------|
| Configured? (`TWILIO_*`, `DEFAULT_PHONE_COUNTRY`) | All three `TWILIO_*` must be non-empty in `config.env` (+ restart back). `DEFAULT_PHONE_COUNTRY` optional (default `ES`). See `config.env.example` lines ~118–123. |
| How to test locally | Book CTA: Settings WhatsApp set → `npm run test:book-whatsapp --prefix front`. Reminder: Twilio sandbox + joined guest phone → staff **Send reminder** on booked reservation with phone → `whatsapp_sent` / Twilio log. Heartbeat: enable tenant 24h/2h flags (same send path). |
| Gaps (sandbox vs prod templates, etc.) | Plain `Body` only; no ContentSid. Sandbox opt-in required. Prod likely needs approved templates. No per-tenant Twilio. No WhatsApp view link. Book `wa.me` ≠ reminder. |

## Testing instructions

1. Confirm doc checklist: `rg -n "Operator checklist|Book page CTA|ContentSid|Send reminder" docs/0024-whatsapp-reminder-notes.md`
2. Confirm env docs: `rg -n "TWILIO_|DEFAULT_PHONE_COUNTRY" config.env.example back/app/settings.py`
3. Confirm send path: `rg -n "send_reservation_reminder_whatsapp|whatsapp_sent|is_whatsapp_configured" back/app/whatsapp_service.py back/app/main.py back/app/reservation_reminder_heartbeat.py`
4. Optional (app up): `BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:book-whatsapp --prefix front` (book CTA only; needs tenant WhatsApp set).
5. Optional (Twilio configured): staff login → Reservations → **Send reminder** on a booked row with phone → success mentions WhatsApp or API returns `whatsapp_sent: true`.

## Test report

- **Date/time (UTC):** 2026-07-29 15:25:19 start → 15:25:49 end. Log window: ~15:25–15:26 UTC.
- **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced). Containers up: pos-front, pos-back, pos-haproxy, etc.
- **What was tested:** Doc operator checklist / dual WhatsApp surfaces; env var docs; send-reminder + heartbeat WhatsApp symbols; optional book-page WhatsApp CTA Puppeteer. Staff Twilio send skipped (no `TWILIO_*` in local `config.env`).

### Results

1. Doc checklist (`Operator checklist`, `Public book page CTA`, `ContentSid`, `Send reminder` in `docs/0024-whatsapp-reminder-notes.md`) — **PASS** — matches at lines 5–38 (checklist §32–38; dual-surface table L11–12).
2. Env docs (`TWILIO_*`, `DEFAULT_PHONE_COUNTRY` in `config.env.example` + `back/app/settings.py`) — **PASS** — example ~119–123; settings fields L114–123.
3. Send path (`send_reservation_reminder_whatsapp`, `whatsapp_sent`, `is_whatsapp_configured` in service / main / heartbeat) — **PASS** — symbols present in all three modules.
4. Optional `test:book-whatsapp` — **PASS** — `PASS: WhatsApp link visible on book page.` (`https://wa.me/34717102603` on `/book/1`).
5. Optional staff Send reminder (Twilio) — **N/A (skipped)** — local `config.env` has no non-empty `TWILIO_*`; not required for audit pass criteria.

- **Overall:** **PASS**
- **Product owner feedback:** The audit is clear: operators can see what is shipped (email + Twilio plain-text WhatsApp on Send reminder / heartbeat), how to configure/test, and that the book-page `wa.me` CTA is a separate surface. Gaps (ContentSid / Meta templates, sandbox opt-in, no WhatsApp view link) are explicit. Local Twilio live send was not exercised; book CTA smoke confirms the public side.
- **URLs tested:**
  1. http://127.0.0.1:4202/ (health smoke, HTTP 200)
  2. http://127.0.0.1:4202/book/1
- **Relevant log excerpts:** Puppeteer stdout: `WhatsApp link found: true https://wa.me/34717102603` / `PASS: WhatsApp link visible on book page.` No front build errors in the test window. No Twilio reminder API calls attempted (creds unset).
