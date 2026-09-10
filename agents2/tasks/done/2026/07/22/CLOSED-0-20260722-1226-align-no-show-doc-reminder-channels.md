---
## Closing summary (TOP)

- **What happened:** Docs for no-show send-reminder still described an email-only API while production also supports WhatsApp when phone + Twilio are set.
- **What was done:** Updated `docs/0019-no-show-implementation-plan.md` to require email or (phone + WhatsApp), cross-linked 0024; staff UI already gated on email or phone (no code change).
- **What was tested:** Doc wording and 0024 link via `rg`; UI gate in `reservations.component.ts` confirmed; optional live API skipped (demo staff JWT 401). Overall PASS.
- **Why closed:** All pass criteria met; doc-only alignment complete.
- **Closed at (UTC):** 2026-07-26 01:48
---

# Align no-show doc reminder API with WhatsApp channel

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0019-no-show-implementation-plan.md` still says `POST /reservations/{id}/send-reminder` **requires `customer_email`**, and the frontend summary says “Send reminder” only when email is present. That is outdated: reminders also send via WhatsApp when `customer_phone` is set and Twilio is configured. Support and fork implementers following 0019 will mis-test the API.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — `docs/0019-no-show-implementation-plan.md` age_days≈127
- Live API: send-reminder allows email and/or phone+WhatsApp; 400 only when neither channel can send
- Related: NEW for 0024 WhatsApp shipped status (same review); keep this task scoped to **0019** only
- `docs/0023-prioritisation-019-022.md` already marks 0019 **Done** — do not reopen product scope

## High-level instructions for coder

- In **`docs/0019-no-show-implementation-plan.md`**, fix the Implemented summary / API rows so send-reminder requires **at least one** of email or (phone + WhatsApp configured); note optional view/cancel link via `PUBLIC_APP_BASE_URL` if already accurate.
- Update the frontend bullet if UI still gates the button on email only — if the UI is wrong, fix the **UI** in the same small task; if UI already allows phone-only, doc-only.
- Cross-link **`docs/0024-whatsapp-reminder-notes.md`** in one sentence; do not rewrite 0024 here.
- Pass criteria: `rg -n 'send-reminder|customer_email|WhatsApp' docs/0019-no-show-implementation-plan.md` no longer claims email-only; optional quick API/UI check on a booked reservation with phone and no email when Twilio unset still 400 as expected.
- Append **Testing instructions** when done.

## Coder notes (2026-07-26)

- Updated **`docs/0019-no-show-implementation-plan.md`**: API/summary/UI/checklist now require email **or** (phone + WhatsApp); cross-link to **0024**; noted shipped `PUBLIC_APP_BASE_URL` view/cancel link and scheduled reminder heartbeat.
- UI already correct: `reservations.component.ts` shows Send reminder when `customer_email || customer_phone` — **no front/back code change**.
- Doc-only task.

## Testing instructions

### What to verify

- `docs/0019-no-show-implementation-plan.md` no longer claims send-reminder is email-only.
- Related docs table links **0024**.
- Staff UI still shows “Send reminder” for booked reservations with phone and no email.

### How to test

```bash
# From repo root
rg -n 'send-reminder|customer_email|WhatsApp|email only|when email present' docs/0019-no-show-implementation-plan.md
# Expect: “at least one” / “email or phone” / WhatsApp wording; no “requires customer_email” alone.

rg -n '0024-whatsapp' docs/0019-no-show-implementation-plan.md
# Expect: ≥1 hit in Related documentation (or goals).

# Optional API check (stack up; staff JWT; booked reservation with phone, empty email; Twilio unset):
# POST /reservations/{id}/send-reminder → 400 with message about no email and no WhatsApp channel.
```

Optional UI: open `/reservations` as staff; a booked card with phone and no email should still show **Send reminder**.

### Pass/fail criteria

- **Pass:** Doc matches multi-channel API; 0024 linked; UI gate unchanged (email or phone).
- **Fail:** Any remaining claim that send-reminder requires email only, or UI hides the button for phone-only guests.

## Test report

1. **Date/time (UTC):** 2026-07-26 01:48:01 – 01:48:25 UTC. Log window: `docker logs --since 15m` on `pos-back` / `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202` (health 200); branch `development`. Doc-only verification + source gate check; optional live staff API/UI skipped (demo staff JWT 401).
3. **What was tested:** 0019 send-reminder wording (not email-only); Related docs link to 0024; staff UI Send reminder gate (`customer_email || customer_phone`).
4. **Results:**
   - Doc no longer email-only: **PASS** — `rg` shows “at least one” / email and/or WhatsApp; no matches for `requires customer_email` / `email only` / `when email present`.
   - 0024 cross-link: **PASS** — 3 hits for `0024-whatsapp` (goals, steps, Related documentation table).
   - UI gate unchanged: **PASS** — `reservations.component.ts:154` `@if (r.customer_email || r.customer_phone)` before Send reminder button.
   - Optional API phone-only 400: **SKIP** — `POST /api/token` with `pos-staff-demo@amvara.de` returned 401; backend source at `main.py` confirms 400 detail when neither email nor WhatsApp channel can send.
5. **Overall:** **PASS**
6. **Product owner feedback:** 0019 now matches the live multi-channel reminder API and points readers to 0024 for WhatsApp. Staff UI already showed Send reminder for phone-only guests; no product code change was needed. Safe to close as a docs alignment task.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (200)
   2. `http://127.0.0.1:4202/api/health` (200)
   3. `http://127.0.0.1:4202/api/token` (401 with demo staff — blocked optional API)
8. **Relevant log excerpts (last section):**
```
pos-back: POST /token HTTP/1.1" 401 Unauthorized
pos-front: NG8107 optional-chain warnings only (pre-existing); no build failure in window
```
