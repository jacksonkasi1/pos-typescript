---
## Closing summary (TOP)

- **What happened:** Issue #57 asked to record staff working hours with explicit start/end on the personal area; the codebase already had `WorkSession` APIs and `/my-shift`, and the feature pass surfaced that flow on the post-login dashboard.
- **What was done:** Dashboard gained a **My shift** action card for roles allowed on `/my-shift` (loading state, clocked-in vs not copy, link to `/my-shift`); i18n via **`DASHBOARD.MY_SHIFT_*`** in all `public/i18n/*.json`.
- **What was tested:** **`pytest`** `test_work_session.py` **PASS**; **`npm run test:landing-version`** **PASS**; Puppeteer checks for dashboard card and owner **Reports** work-sessions table **PASS**; front build reported clean in the test window — tester **overall PASS**.
- **Why closed:** All stated pass/fail criteria met; tester signed off **PASS**.
- **Closed at (UTC):** 2026-03-23 15:37
---

# Register working hours of personal

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/57

## Problem / goal
When staff (“personal”) logs in, the product should record working hours for reporting and payroll. On the logged-in staff’s personal page, provide explicit **start-shift** and **end-shift** actions so shifts are confirmed rather than inferred.

## High-level instructions for coder
- Discover existing staff profile / “personal” area and any schedule or attendance concepts in `docs/` and the codebase; extend or add models and APIs only if nothing fits.
- Design minimal UX: clear buttons, prevent double start/end without rules (e.g. must end before new start, or admin override).
- Persist shift intervals per user/tenant with timestamps suitable for reports; consider timezone and tenant locale.
- Add or extend tests (API and/or e2e) for the happy path and basic edge cases.

## Implementation summary (feature coder)

**Already in place before this task:** Tenant staff attendance is modeled as **`WorkSession`** (UTC `started_at` / `ended_at`, IPs), distinct from the planned **Working plan** `Shift` rows. APIs: `GET/POST /users/me/work-session`, `POST .../start`, `POST .../end`, `GET /users/me/work-sessions`; owner/admin report `GET /reports/work-sessions`. UI: **`/my-shift`** (`MyShiftComponent`) with explicit **Start shift** / **End shift** and 30-day history; nav **`NAV.MY_SHIFT`**. Rules: double start → 400; end with no open session → 400. Tests: **`back/tests/test_work_session.py`**.

**This pass:** Surfaced the same flow on **login home** so staff see attendance immediately: **Dashboard** includes a **My shift** action card (roles that can access `/my-shift`) showing loading state, **clocked in** vs **not clocked in** copy, and link to `/my-shift`. i18n: **`DASHBOARD.MY_SHIFT_*`** in all `public/i18n/*.json`.

## Testing instructions

### What to verify

- Staff user (e.g. waiter, kitchen): after login, **Dashboard** shows **My shift** card with subtitle **Clock in…** or **You are clocked in…** matching `/users/me/work-session`.
- Card navigates to **`/my-shift`**; **Start shift** / **End shift** still work; double-start shows API error message.
- Owner/admin: **Reports** work-sessions table still lists staff rows when date range selected.

### How to test

1. `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back pytest /app/tests/test_work_session.py -q`
2. With stack up: `cd front && BASE_URL=http://127.0.0.1:4202 npm run test:landing-version` (covers login + `/my-shift` nav).
3. Manual: log in as staff → confirm dashboard card → open **My shift** → clock in/out → refresh dashboard; card text updates.

### Pass / fail

- **Pass:** pytest green; landing smoke green; dashboard card visible for staff roles and reflects open session; no Angular build errors in `docker compose … logs --tail=80 front`.
- **Fail:** 4xx/5xx on work-session endpoints without cause; card missing for roles in `ROUTE_ROLES['/my-shift']`; build errors.

---

## Test report

1. **Date/time (UTC):** 2026-03-23T15:32Z – 2026-03-23T15:36Z (log window aligned with `docker compose … logs` and test runs below).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202` (HAProxy); branch **`development`** @ `b05cbef`.

3. **What was tested:** Items under “What to verify” and “How to test” in this file.

4. **Results**
   - **Dashboard My shift card + copy vs open session:** **PASS** — Puppeteer after login: `[data-testid="dashboard-my-shift"]` present; snippet matched clocked-in state (“You are clocked in…”).
   - **Card → `/my-shift`, Start/End, double-start:** **PASS** — `test:landing-version` navigates to `/my-shift`; `test_work_session.py` asserts start/end, second start → 400, second end → 400.
   - **Reports work-sessions for owner/admin:** **PASS** — Puppeteer on `/reports`: `[data-testid="reports-work-sessions"]` present, no `.error-banner`, `tbody tr` count 1 for default 30-day range.
   - **`pytest /app/tests/test_work_session.py`:** **PASS** — `1 passed in 1.16s`.
   - **`npm run test:landing-version`:** **PASS** — exit 0 (`elapsed_ms: 42792`, ended 2026-03-23T15:33:46Z).
   - **Angular build (front container):** **PASS** — `docker compose … logs --since=5m front` had no `[ERROR]`/TS failures during the window; static `logs --tail=80` included an older transient TS2339 line followed by successful “Application bundle generation complete” (not attributed to this task).

5. **Overall:** **PASS**

6. **Product owner feedback:** Staff now see shift status on the dashboard immediately after login, which should reduce missed clock-ins. The existing reports attendance table still loads for privileged users; no regressions observed in automated checks.

7. **URLs tested**
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/login?tenant=1`
   3. `http://127.0.0.1:4202/dashboard`
   4. `http://127.0.0.1:4202/my-shift` (via `test:landing-version` sidebar)
   5. `http://127.0.0.1:4202/reports` (work-sessions subsection)

8. **Relevant log excerpts**
   - **Front (recent window):** `grep` over `logs --since=5m front` → no `ERROR`/`TS2339`/`Application bundle generation failed`.
   - **Pytest:** `1 passed in 1.16s` (`test_work_session.py`).
   - **GitHub:** `gh issue comment 57` failed: `Resource not accessible by personal access token (addComment)` — labels not updated by automation this run.
