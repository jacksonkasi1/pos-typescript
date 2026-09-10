# Public book: default time slot must be next available time today, not first slot of day

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/246
- **246**

## Problem / goal

On the public booking flow (`/book/:tenantId`), when the guest selects **today** in the tenant timezone, the time control must default to the **first bookable slot at or after now + minimum lead time**, not the first slot of the calendar day (e.g. 13:00 when local time is 14:38). Align `ensureTimeFitsDay()` with the filtered `dayTimes()` list so orphaned or too-early selections are cleared and replaced.

Related prior work (#241, closed) addressed past slots; this issue reports that the UI can still land on the **first slot of the day** rather than the **next available** slot for same-day booking.

## High-level instructions for coder

- Primary UI: `front/src/app/shared/reservation-week-slot-grid.component.ts` and public `book.component` — review `ensureTimeFitsDay()`, `dayTimes()` / `dayTimesForSelectedDate()`, and post-load selection in `afterMonthLoaded()` / `getNextAvailableReservation`.
- After day slots load for **today**, set `selectedTime` to the first slot in `dayTimes()` whose time is ≥ now + tenant lead minutes (respect API `available` vs `past` cells).
- Reproduce: open `/book/1` (demo tenant) near midday; confirm default time is not the morning/first-of-day slot; switch date away and back to today; verify dropdown options match filtered slots.
- Keep staff `/reservations` behavior consistent if it shares the same grid.
- Smoke: `node front/scripts/debug-reservations-public.mjs`; check `docker logs --since 5m pos-front` for a clean Angular build after edits.

## Implementation notes

- **`ReservationWeekSlotGridComponent`**: For tenant **today**, `dayTimesForSelectedDate()` now omits slots before `earliestBookableTimeToday()` (10‑minute lead, quarter-hour ceiling in tenant/browser TZ) in addition to API `past` cells. `ensureTimeFitsDay()` uses `firstBookableTimeForDay()` — first `available` slot in that filtered list (same as `dayTimes()`). `selectedTimeValidForDay()` requires `res.date` to match the selected date. `roundTimeToQuarter('')` reuses `earliestBookableTimeToday()`. Staff `/reservations` shares this grid.

## Testing instructions

1. **Build:** `docker logs --since 5m pos-front 2>&1 | tail -40` — expect `Application bundle generation complete` with no TS/Angular errors.
2. **Manual — public `/book/1`:** After load with **today** selected, `#book-slot-time-select` must equal the first API `available` slot (not an earlier opening slot); dropdown options for today must not list times before now + 10 min lead.
3. **Manual — date switch:** Select another available day, then **today** again; time resets to the first bookable slot for today.
4. **Manual — staff `/reservations`:** New reservation → today → same grid behaviour as public book.
5. **API (optional):** `GET /api/reservations/book-day-slots?tenant_id=1&date=<today>&party_size=2` — UI default should match first `available` in `cells`.
6. **Smoke:** `BASE_URL=http://127.0.0.1:4202 node front/scripts/debug-reservations-public.mjs` — confirm logged “Picked slot” time is bookable for today (script may still fail on seating-zone setup).

---

## Test report

**Date/time (UTC):** 2026-05-28T12:53:00Z – 2026-05-28T12:57:20Z  
**Log window:** `docker logs --since 15m pos-front`, `pos-back` (same window)

**Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`

**What was tested:** Front build; public `/book/1` default time and dropdown filtering for today; date switch away/back to today; staff `/reservations` new-reservation grid; API `book-day-slots`; `debug-reservations-public.mjs` smoke.

### Results

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Front build — no TS/Angular errors | **PASS** | `Application bundle generation complete` ×3 (12:53:44–12:53:50Z); no `TS*` or build failures in `pos-front` logs |
| 2 | Public `/book/1` — default = first API `available` slot; no early options | **PASS** | `#book-slot-time-select` = `15:15`; API first `available` = `15:15`; options start at `15:15` (14:00–15:00 marked `past`, omitted) |
| 3 | Date switch — away then back to today resets to first bookable | **PASS** | May 29 → `14:00` (first of day, valid); back to May 28 → `15:15` (= API first `available`) |
| 4 | Staff `/reservations` — same grid behaviour | **PASS** | New reservation modal: default `15:15`, options start `15:15`, matches API |
| 5 | API `book-day-slots` — UI aligns with first `available` | **PASS** | `GET …/date=2026-05-28&party_size=2` → first `available` cell `15:15`; UI default matches |
| 6 | Smoke script — “Picked slot” bookable for today | **PASS** | `debug-reservations-public.mjs` logged `Picked slot: 2026-05-28 15:15` (= first `available`); script exit 1 on seating-zone validation only (expected per task note) |

**Overall: PASS**

**Product owner feedback:** Same-day public booking now defaults to the next bookable quarter-hour (15:15 at test time), not the day’s opening slot. Dropdown options correctly hide past/too-early times. Switching dates and returning to today re-applies the rule. Staff reservations share the same grid and behave consistently.

**URLs tested:**
1. http://127.0.0.1:4202/book/1
2. http://127.0.0.1:4202/login
3. http://127.0.0.1:4202/reservations
4. http://127.0.0.1:4202/api/health
5. http://127.0.0.1:4202/api/reservations/book-day-slots?tenant_id=1&date=2026-05-28&party_size=2

### Relevant log excerpts

**pos-front:**
```
Application bundle generation complete. [0.612 seconds] - 2026-05-28T12:53:44.787Z
Application bundle generation complete. [0.564 seconds] - 2026-05-28T12:53:48.770Z
Application bundle generation complete. [0.381 seconds] - 2026-05-28T12:53:50.603Z
```

**pos-back:**
```
GET /reservations/book-day-slots?tenant_id=1&date=2026-05-28&party_size=2 HTTP/1.1" 200 OK
GET /reservations/book-day-slots?tenant_id=1&date=2026-05-29&party_size=2 HTTP/1.1" 200 OK
GET /reservations/book-day-slots?tenant_id=1&date=2026-05-28&party_size=2 HTTP/1.1" 200 OK
```
