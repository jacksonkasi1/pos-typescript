---
## Closing summary (TOP)

- **What happened:** GitHub issue #87 (“My shift” overtime visibility) was implemented and verified end-to-end; the task reached **CLOSED** with a tester **PASS** report.
- **What was done:** Backend serialization now exposes `contract_threshold_minutes`, `open_duration_minutes`, and `over_contract` for open work sessions; the My shift page and dashboard card show user-visible overtime warnings with stable `data-testid` hooks; `tests/test_work_session.py` covers the behaviour.
- **What was tested:** Pytest (3 passed), Angular bundle build clean in Docker front logs, `test:landing-version` smoke, and headless UI check for overtime banners — all **PASS** per the embedded test report.
- **Why closed:** All stated pass/fail criteria met; no outstanding test failures or build errors documented in the task.
- **Closed at (UTC):** 2026-03-25 12:35
---

# My shift

## GitHub

- **Issue:** https://github.com/satisfecho/pos/issues/87

## Problem / goal

Staff use **My shift** / **Start shift** to clock in. The product should **detect when an open shift exceeds a normal contract length (8 hours)** and **alert the worker** so overtime is visible. Contracts are typically 8 hours; behaviour should be investigated and designed (what counts as “exceeded”, timezone, whether only UI vs persisted flags, owner configuration, etc.). See existing **`WorkSession`** / **`/my-shift`** flow and any reports that consume work sessions (`docs/` if present).

## High-level instructions for coder

- Review current **work session** model and UI (`/my-shift`, dashboard card if applicable): how start/end and duration are computed.
- Define product rules for the **8-hour threshold** (fixed default vs tenant setting; use tenant timezone for display; edge cases: overnight, manual corrections).
- Implement **user-visible alert** when an active session passes the threshold (e.g. banner, dialog, or inline on My shift) without breaking clock-in/out APIs.
- Consider whether **owners/admins** need reporting or visibility; keep scope aligned with the issue unless docs say otherwise.
- Add or extend tests (API and/or UI smoke) so the alert path is covered where practical.

## Coder notes (2026-03-25 UTC)

- **Rule:** Open shift “over contract” when elapsed wall time from `started_at` to **now (UTC)** is **≥ 480 minutes** (8 hours). Same for overnight shifts (continuous elapsed time). No DB migration; threshold is a shared constant `WORK_SESSION_CONTRACT_THRESHOLD_MINUTES` in `back/app/work_session_serialization.py` (future: could read from tenant settings).
- **API:** Every serialized `WorkSession` includes `open_duration_minutes` (null when ended), `contract_threshold_minutes`, `over_contract` (open sessions only). Used by `GET /users/me/work-session`, `POST …/start|end`, `GET /users/me/work-sessions`, and `GET /reports/work-sessions`.
- **UI:** My shift shows a warning banner + elapsed row while clocked in; dashboard “My shift” card shows a short overtime line when applicable. Client recomputes threshold crossing from `started_at` + `contract_threshold_minutes` on a timer so the banner appears without manual refresh.
- **Display times** on My shift remain `toLocaleString()` (browser locale); duration threshold is not calendar-day-based.

## Testing instructions

### What to verify

- Open work session responses include `contract_threshold_minutes`, `open_duration_minutes`, and `over_contract` consistent with elapsed time.
- After **≥ 8 hours** clocked in, **My shift** shows the overtime banner (`data-testid="my-shift-overtime-banner"`) and dashboard shows the overtime hint on the My shift card when the user is still past threshold (`data-testid="dashboard-my-shift-overtime"`).
- Clock-in/out still works; closed sessions list/report responses remain valid JSON with the new fields.

### How to test

- **Backend:** With Docker dev stack:  
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_work_session.py -q`
- **Frontend build:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=80 front` — no TS/Angular errors after rebuild.
- **Smoke:** From `front/`: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version` (navigates `/my-shift`).
- **Manual UI:** Log in as staff, open **My shift**, start shift; to simulate overtime without waiting, temporarily move `started_at` in DB to \>8h ago (or rely on API test), reload **My shift** — banner should appear; end shift — banner gone.

### Pass/fail criteria

- **Pass:** All three pytest cases in `test_work_session.py` green; front build clean; landing smoke exits 0; overtime banner visible when open session age ≥ threshold.
- **Fail:** Any pytest failure, Angular build error in front logs, or banner missing when session is clearly over 8 hours open.

---

## Test report

1. **Date/time (UTC) and log window:** 2026-03-25 ~12:31–12:35 UTC (pytest, smoke, UI check); Docker `front`/`back` logs reviewed for the same window.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `44c58f2`.

3. **What was tested:** As in “What to verify” / pass criteria: API serialization + over-contract behaviour, Angular build health, landing smoke including `/my-shift`, and browser presence of overtime `data-testid` elements for a user with an open session older than 8 hours (existing dev DB row `work_session.id=6` for `ralf@roeber.de`).

4. **Results:**
   - Open session API fields (`contract_threshold_minutes`, `open_duration_minutes`, `over_contract`) consistent with elapsed time — **PASS** — `pytest tests/test_work_session.py -q` → `3 passed in 2.22s`.
   - Clock-in/out and list/report JSON — **PASS** — covered by `test_clock_in_out_and_report` in same run.
   - Front build — **PASS** — `docker compose … logs --tail=80 front` shows `Application bundle generation complete` with no TS/Angular errors in the tail.
   - Landing smoke — **PASS** — `BASE_URL=http://127.0.0.1:4202 HEADLESS=1 npm run test:landing-version` (from `front/`) exit code 0.
   - Overtime banner + dashboard hint (`my-shift-overtime-banner`, `dashboard-my-shift-overtime`) with session ≥8h open — **PASS** — headless Puppeteer (one-off script, `NODE_PATH=front/node_modules`) found both selectors after login.

5. **Overall:** **PASS**

6. **Product owner feedback:** Staff on long shifts get a clear on-screen warning on **My shift** and a matching hint on the dashboard card once the open session passes the fixed 8-hour threshold, backed by explicit API fields for tooling and tests. The behaviour matches the stated rule (wall-clock elapsed from `started_at` in UTC).

7. **URLs tested:**
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/login?tenant=1`
   3. `http://127.0.0.1:4202/dashboard`
   4. `http://127.0.0.1:4202/my-shift` (and same route during `test:landing-version` sidebar crawl)
   5. Additional routes from `test:landing-version` sidebar/inventory crawl (staff nav smoke; see script output) — `/staff/orders`, `/reservations`, `/guest-feedback`, `/tables`, `/kitchen`, `/bar`, `/customers`, `/products`, `/catalog`, `/reports`, `/working-plan`, `/users`, `/settings`, `/inventory/items`, `/inventory/suppliers`, `/inventory/purchase-orders`, `/inventory/stock`, `/inventory/reports`

8. **Relevant log excerpts:**
   - **Back (pytest, host-side):** `3 passed in 2.22s`
   - **Back (runtime, HAProxy → API during UI checks):** e.g. `GET /users/me/work-session HTTP/1.1" 200 OK` (compose `back` logs ~12:32Z).
   - **Front:** `Application bundle generation complete. [0.011 seconds] - 2026-03-25T12:28:54.691Z` (no error lines in sampled tail).

**GitHub:** Comment posted on #87 when verification started. `gh issue edit … --add-label agent:testing` failed: label `agent:testing` not defined on the repo (create label or set manually if needed).
