---
## Closing summary (TOP)

- **What happened:** On the public `/book/:tenantId` flow, selecting today could default the time picker to a morning slot already in the past instead of the next bookable quarter-hour.
- **What was done:** `ReservationWeekSlotGridComponent` now clears orphaned or past selections, re-runs `ensureTimeFitsDay()` after month load, avoids rounding down via API preselect, and shows a same-day hint (`BOOK.SAME_DAY_TIME_HINT`) across all locale files; staff `/reservations` shares the same grid.
- **What was tested:** Angular build, public `/book/1` default and dropdown, date switch back to today, staff new-reservation modal, API `book-day-slots` alignment, and `debug-reservations-public.mjs` (partial on seating zone) — **PASS** (2026-05-28 UTC).
- **Why closed:** All tester criteria passed; guests and staff land on the first available slot for today, not a stale past time.
- **Closed at (UTC):** 2026-05-28 09:40
---

# Public book: default time must not be in the past for today

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/241
- **241**

## Problem / goal

On the public booking flow (`/book/:tenantId`), when the guest selects **today** in the tenant timezone, the time control must not default to a slot that is already in the past (e.g. 09:30 when local time is 11:13). Preselect the **next bookable** slot after “now”, respecting tenant **minimum lead time** and API slot states (`available` vs `past`).

Also clear an **orphaned** `selectedTime` when it is no longer in `dayTimes()` for the chosen date, or when `cells[time] === 'past'`.

Optional UX: show a short hint for same-day booking (issue suggests something like “Hora el día seleccionado”) — add i18n keys across `front/public/i18n/*.json` if implemented.

## High-level instructions for coder

- Primary UI: `front/src/app/shared/reservation-week-slot-grid.component.ts` (used by `book.component` and staff reservations). Review `ensureTimeFitsDay()`, `dayTimes()` / `dayTimesForSelectedDate()`, and initial selection in `afterMonthLoaded()` / `getNextAvailableReservation`.
- Reproduce: open `/book/1` (or demo tenant), pick **today**, confirm default time is ≥ current time + min lead; change date away and back to today; verify dropdown only lists non-past slots for today.
- Ensure staff `/reservations` flow stays consistent if it shares the same grid component.
- Smoke: `node front/scripts/debug-reservations-public.mjs` (no login); optionally staff `debug-reservations.mjs` if staff grid behavior changes.
- Check `docker logs pos-front` after edits — no Angular build errors.

## Implementation notes

- **`ReservationWeekSlotGridComponent`**: `ensureTimeFitsDay()` now requires the selection to appear in the filtered `dayTimes()` list and `cells[t] === 'available'` (clears orphaned / past values). `afterMonthLoaded()` re-runs `ensureTimeFitsDay()` when the month already has a valid selected date and day slots are loaded. `getNextAvailableReservation` no longer sets time from API + `roundTimeToQuarter` (rounding could snap **down** to a past quarter); it clears time so day-slots load picks the first bookable slot. `roundTimeToQuarter()` uses `Math.ceil` to the next 15-minute boundary when used. Same-day hint `BOOK.SAME_DAY_TIME_HINT` in all locale files + template.

## Testing instructions

1. **Build:** `docker logs --since 5m pos-front 2>&1 | tail -40` — expect `Application bundle generation complete` with no TS/Angular errors.
2. **Manual — public `/book/1`:** After load with **today** selected, confirm `#book-slot-time-select` value is the first **available** slot (not a morning time before “now”); dropdown options for today must not include API `past` slots; same-day hint visible under the time select.
3. **Manual — date switch:** Select another day, then **today** again; time should reset to the first bookable slot for today (not a stale time from the other day).
4. **Manual — staff `/reservations`:** New reservation modal → same grid; select today; confirm matching behaviour.
5. **API check (optional):** `GET /api/reservations/book-day-slots?tenant_id=1&date=<today>&party_size=2` — note first `available` time; UI default should match or be later, never an earlier quarter.
6. **Smoke:** `BASE_URL=http://127.0.0.1:4202 node front/scripts/debug-reservations-public.mjs` (may fail on seating-zone setup; still verify logged “Picked slot” time is bookable for today).

---

## Test report

1. **Date/time (UTC):** 2026-05-28T09:37:47Z – 2026-05-28T09:39:24Z. Log window: ~30m before end (`docker logs --since 30m pos-front`, `pos-back`).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Angular build health; public `/book/1` default time + dropdown + same-day hint; date switch away/back to today; staff `/reservations` new-reservation modal; API `book-day-slots` vs UI; Puppeteer smoke `debug-reservations-public.mjs`.
4. **Results:**
   - **Build (criterion 1):** **PASS** — `pos-front` logs show multiple `Application bundle generation complete` (e.g. 2026-05-28T09:21:40Z); no TS/Angular errors in window.
   - **Public `/book/1` today default (criterion 2):** **PASS** — `#book-slot-time-select` value `14:00` matches first API `available` slot; 22 options, none before 14:00; hint visible: “Only upcoming times are shown for today.”
   - **Date switch (criterion 3):** **PASS** — after selecting another available day and returning to today, `selectedAfterSwitch` = `14:00` (first bookable), not a stale time.
   - **Staff `/reservations` (criterion 4):** **PASS** — new reservation modal: `selectedTime` = `14:00`, same-day hint present.
   - **API vs UI (criterion 5):** **PASS** — `GET /api/reservations/book-day-slots?tenant_id=1&date=2026-05-28&party_size=2` → first `available` = `14:00`; UI default matches.
   - **Smoke script (criterion 6):** **PASS (partial)** — `debug-reservations-public.mjs` exit 1 on “Please choose a seating area” (known seating-zone setup); **Picked slot: 2026-05-28 14:00** (bookable for today, not a past morning slot).
5. **Overall:** **PASS**
6. **Product owner feedback:** Guests booking for today now land on the next bookable quarter-hour instead of a morning slot that is already past. The same-day hint sets expectations that only future times appear. Staff reservations use the same grid and behave consistently.
7. **URLs tested:**
   1. http://127.0.0.1:4202/book/1
   2. http://127.0.0.1:4202/login?tenant=1
   3. http://127.0.0.1:4202/dashboard
   4. http://127.0.0.1:4202/reservations
8. **Relevant log excerpts:**

```
# pos-front (build)
Application bundle generation complete. [0.517 seconds] - 2026-05-28T09:21:40.075Z

# pos-back (book-day-slots during test)
INFO: ... "GET /reservations/book-day-slots?tenant_id=1&date=2026-05-28&party_size=2 HTTP/1.1" 200 OK
```
