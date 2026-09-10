---
## Closing summary (TOP)

- **What happened:** Guest birthday MVP for reservations (#324) was implemented and handed off as CLOSED after a full PASS test report.
- **What was done:** Optional month/day birthday capture on public book and staff reservations, tenant settings for capture/marketing/consent, migration + docs + pytest; no outbound birthday messaging.
- **What was tested:** Migration, 8/8 pytest, public book + staff create/edit/clear, settings consent/capture toggles, front build, landing smoke — all PASS.
- **Why closed:** All testing criteria passed; feature fully delivered for this issue.
- **Closed at (UTC):** 2026-07-26 16:40
---

# Birthday guest capture

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/324
- **324**

## Problem / goal

Capture **birthdays** for guests generally (not only billing customers), with optional future reminders/campaigns. Billing-customer `birth_date` already exists (Factura CRM / `docs/0017-billing-customers-factura.md`), but reservation and walk-in guests have no birthday field and no automation. From umbrella **#52** (see `docs/0050-github-issue-52-split-plan.md` Phase A). Keep MVP about **data capture + staff visibility**; defer outbound email/SMS until consent/provider exists. Distinct from loyalty birthday rewards (`docs/0066-club-loyalty.md` / **#327**).

## High-level instructions for coder

- Add optional birthday storage for at least one guest path (reservation create/edit and/or public book), preferring month/day-only if full year raises privacy concerns; reuse patterns from billing-customer `birth_date` where sensible.
- Surface the value in staff UI; do **not** send automated outbound messages in this MVP.
- Settings: enable/disable marketing use of birthday data and GDPR consent copy if collecting for campaigns; default to capture-only when unset.
- Do not invent a campaign/discount engine here — birthday promos belong with **#322** (price promos) or loyalty (**#327**), not this issue.
- Tenant-scoped; pytest for create/read and isolation; `CHANGELOG.md` entry; append **Testing instructions**.

## Implementation notes (coder)

- Migration `20260726170000_guest_birthday.sql`: `reservation.guest_birthday_{month,day,marketing_consent}`; tenant `guest_birthday_{capture_enabled,marketing_enabled,consent_text}`.
- Month/day only (no year). Public `/book` shows fields when capture enabled; marketing consent checkbox only when marketing enabled.
- Staff reservations list/create/edit show and edit birthday. Settings under Reservations subsection.
- Docs: `docs/0067-guest-birthday.md`. Pytest: `back/tests/test_guest_birthday.py`.

## Testing instructions

1. **Migrate:** From repo root with stack up:  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate`  
   Expect schema version ≥ `20260726170000` and columns present on `reservation` / `tenant`.

2. **Pytest:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_guest_birthday.py -q`  
   Expect **8 passed** (public settings defaults, staff settings update, staff create/list, public create + consent gating, capture-disabled ignore, invalid day, tenant isolation, clear on update).

3. **Public book UI:** Open `http://127.0.0.1:4202/book/1` (or demo tenant). Confirm optional Birthday month/day selectors. Submit a booking with e.g. March 15; then as staff open Reservations and confirm the card shows the birthday.

4. **Staff create/edit:** On Reservations, create or edit a booked reservation; set month/day; save; confirm list shows birthday. Clear both selects and save; birthday should disappear.

5. **Settings:** Settings → Reservations → Guest birthdays. Toggle **Allow marketing use** on, set consent text, save. Reload `/book/{tenantId}` and confirm consent checkbox appears with that text. Turn marketing off; consent checkbox should hide. Toggle capture off; birthday fields should hide on public book (staff can still set birthday).

6. **Front build:** `docker logs --since 5m pos-front` should show successful bundle generation (no TS errors related to birthday).

7. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` should pass.

**Pass:** Steps 1–2 green; birthday visible to staff after public or staff entry; marketing default off / consent only when enabled; no outbound birthday emails/SMS.

**Fail:** Migration missing, pytest failures, birthday not persisted/shown, marketing consent accepted while marketing disabled, or Angular build errors.

## Test report

1. **Date/time (UTC):** 2026-07-26T16:36:54Z → 2026-07-26T16:39:48Z (log window ~16:36–16:40 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced before start).
3. **What was tested:** Migration ≥ `20260726170000`; pytest `test_guest_birthday.py`; public `/book/1` birthday selectors + submit Mar 15; staff list/create/clear birthday; settings capture/marketing/consent toggles; front build health; landing smoke.
4. **Results:**
   - Migrate / columns: **PASS** — schema version `20260726190000`; reservation `guest_birthday_{month,day,marketing_consent}`; tenant `guest_birthday_{capture_enabled,marketing_enabled,consent_text}`.
   - Pytest: **PASS** — `8 passed` in 3.07s (`tests/test_guest_birthday.py -q`).
   - Public book UI + submit: **PASS** — month/day selectors visible when capture on; booking `#2676` “Birthday Test Guest” confirmed; `GET /reservations/2676` → month=3, day=15, marketing_consent=false.
   - Staff create/edit + list: **PASS** — staff `POST /reservations` with Mar 15 (id 2674); clear via `PUT` → null/null; staff UI card shows `Birthday: March 15` for public guest.
   - Settings / consent / capture off: **PASS** — marketing on shows checkbox “Tester consent text for #324” on `/book/1`; marketing off via API; capture off hides birthday fields on public book; Settings UI has `guest_birthday_capture_enabled` / `guest_birthday_marketing_enabled` inputs. Demo tenant restored (capture on, marketing off, consent cleared).
   - Front build: **PASS** — no TS/NG compile failures in `pos-front` logs (only unrelated NG8107 warnings).
   - Smoke: **PASS** — `npm run test:landing-version` → “Landing version OK; demo login … OK”.
   - No outbound birthday email/SMS: **PASS** — MVP capture-only; no birthday send path exercised or observed.
5. **Overall:** **PASS**
6. **Product owner feedback:** Guest birthday MVP is ready: optional month/day on public book and staff reservations, staff visibility, and marketing consent gated correctly. Safe defaults (marketing off) are solid for GDPR; campaign automation can wait for promos/loyalty follow-ups.
7. **URLs tested:**
   1. http://127.0.0.1:4202/book/1
   2. http://127.0.0.1:4202/login
   3. http://127.0.0.1:4202/reservations
   4. http://127.0.0.1:4202/settings
   5. http://127.0.0.1:4202/ (landing smoke)
8. **Relevant log excerpts (last section):**
```
INFO: Database schema version (max applied): 20260726190000
… 20260726170000_guest_birthday.sql … status: applied
✅ Database schema version: 20260726190000
........ [100%] 8 passed, 1 warning in 3.07s
INFO: … "PUT /tenant/settings HTTP/1.1" 200 OK
INFO: … "POST /reservations HTTP/1.1" 200 OK
INFO: … "PUT /reservations/2674 HTTP/1.1" 200 OK
INFO: … "GET /reservations/2676 HTTP/1.1" 200 OK
>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.
```
