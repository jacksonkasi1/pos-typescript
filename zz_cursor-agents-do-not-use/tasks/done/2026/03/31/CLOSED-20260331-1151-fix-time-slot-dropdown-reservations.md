---
## Closing summary (TOP)

- **What happened:** Reservations “Turno” time dropdown listed past slots when today was selected; tester verified the fix end-to-end.
- **What was done:** `ReservationWeekSlotGridComponent` filters out API-marked `past` slots for tenant “today” so the first option is the next bookable slot; `ensureTimeFitsDay()` aligns with the filtered list.
- **What was tested:** Front build logs, public `/book/1` and staff `/reservations` modal dropdowns vs API, and `test:landing-version` — all **PASS** per test report.
- **Why closed:** All acceptance criteria met; overall tester outcome **PASS**.
- **Closed at (UTC):** 2026-03-31 11:56
---

# Fix the Time Slot Dropdown immediately with this logic (Reservations)

## GitHub

- **Issue:** https://github.com/satisfecho/pos/issues/127

## Problem / goal

In the reservations flow, the time slot control (Turno) does not respect “now” when the user has **today** selected: past slots still appear (e.g. around 13:43 local time, **12:00** still shows as the first option). For a real-time booking experience, **today’s** list must only offer slots from the current time onward, aligned with the tenant’s slot step (e.g. next boundary after the current time such as **14:00** or **14:15**). See existing reservation / public book docs under `docs/` if they define slot rules or APIs.

## High-level instructions for coder

- Trace where reservation and public book UIs build the time-slot options for the selected calendar day (staff reservations vs `/book` if both share logic).
- When the selected date is **today** (in the relevant timezone / tenant context already used elsewhere), **filter out** any slot whose end time is before “now” (or strictly before the next valid slot per product rules—match what the issue describes: no options before the first still-bookable slot).
- Ensure the **first visible option** is the next available slot after the current time, not a fixed morning time.
- Add or extend automated coverage if there is an existing pattern (unit or e2e); otherwise document manual checks: pick today at a time after midday and confirm the dropdown starts at the expected next slot only.
- After front changes, confirm `ng serve` / Docker `pos-front` logs show a clean bundle build.

## Implementation notes

- **`ReservationWeekSlotGridComponent`** (`front/src/app/shared/reservation-week-slot-grid.component.ts`): when `selectedDate` equals **`tenantTodayDateStr()`** (tenant TZ or browser fallback), **`dayTimes()`** now omits slots whose API cell state is **`past`**, so the Turno dropdown no longer lists morning times ahead of the first bookable slot. **`ensureTimeFitsDay()`** uses the same filtered list when auto-picking a time.

## Testing instructions

1. **Build:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=80 front` — no TS/Angular errors after save.
2. **Manual — public `/book/{tenantId}`:** With tenant timezone correct, select **today** in the month grid after local midday; open the time dropdown. Confirm the **first** listed times are not before the next bookable slot (API already marks past slots; they must **not** appear in the list).
3. **Manual — staff `/reservations`:** New/edit reservation modal → same grid; select today; confirm the time dropdown matches the same behaviour.
4. **Smoke (optional):** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` with stack up.

---

## Test report

1. **Date/time (UTC):** 2026-03-31T11:54Z – 2026-03-31T11:55Z (verification window). Log window for `pos-front`: same session, tail reviewed through **2026-03-31T11:52:41Z** (last rebuild in sample).

2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202`; branch **`development`**, commit **`18ae622`**.

3. **What was tested:** Items 1–4 from **Testing instructions** above (front build logs, public book Turno list, staff modal Turno list, optional landing smoke).

4. **Results:**
   - **Build (front logs, no TS/Angular errors at end of window):** **PASS** — `pos-front` ends with `Application bundle generation complete` (2026-03-31T11:52:41Z); earlier transient `getNextAvailable` / TS errors appear in the same log history but are superseded by successful rebuilds before verification.
   - **Public `/book/1`, today, time dropdown:** **PASS** — API `GET /api/reservations/book-day-slots?tenant_id=1&date=2026-03-31&party_size=2` returns `14:00` with `"past"`; Puppeteer shows `#book-slot-time-select` first non-empty option **`14:15`** and **no** `14:00` option.
   - **Staff `/reservations` (new reservation modal), today:** **PASS** — Same API response for `2026-03-31`; modal `#book-slot-time-select` first option **`14:15`**, **no** `14:00`; hidden date `2026-03-31`.
   - **Smoke `test:landing-version`:** **PASS** — exit code **0** (`>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.`).

5. **Overall:** **PASS** (all criteria met).

6. **Product owner feedback:** Today’s Turno list now matches the API’s notion of “past”: morning slots that are already over no longer clutter the dropdown, so guests and staff see a list that starts at the next relevant quarter-hour entries (still subject to full/available per slot). Behaviour is consistent on the public book page and in the staff reservation modal because they share the same grid component.

7. **URLs tested:**
   1. `http://127.0.0.1:4202/book/1`
   2. `http://127.0.0.1:4202/login?tenant=1`
   3. `http://127.0.0.1:4202/reservations`
   4. `http://127.0.0.1:4202/api/reservations/book-day-slots?tenant_id=1&date=2026-03-31&party_size=2`

8. **Relevant log excerpts:**

```
pos-front | Application bundle generation complete. [0.450 seconds] - 2026-03-31T11:52:41.308Z
pos-front | Page reload sent to client(s).
```

```
> test:landing-version
>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.
exit_code: 0
```
