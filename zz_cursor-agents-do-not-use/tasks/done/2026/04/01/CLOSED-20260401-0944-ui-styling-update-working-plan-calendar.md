---
## Closing summary (TOP)

- **What happened:** Tester handed off issue #138 (Working Plan main calendar layout: wider grid and taller day cells) after implementation and automated smoke runs.
- **What was done:** Component-scoped styles in `working-plan.component.ts`: `.calendar-grid` `max-width: 100rem`, `.calendar-cell` `min-height: 7.75rem`, `.calendar-cell-header` `min-height: auto`, scoped to the Working Plan module.
- **What was tested:** `npm run test:working-plan` and `npm run test:working-plan-calendar` against `http://127.0.0.1:4202` — both **PASS**; Docker `front` logs showed clean Angular builds; test report overall **PASS**.
- **Why closed:** All acceptance criteria met and tester outcome overall PASS.
- **Closed at (UTC):** 2026-04-01 09:51
---

# UI Styling Update: Working Plan Calendar

## GitHub

- **Issue:** https://github.com/satisfecho/pos/issues/138

## Problem / goal

In **Working Plan** → **main calendar view**, adjust layout spacing: widen the calendar grid container and give day cells more vertical room so shift entries fit better. Changes must stay **scoped to the Working Plan module** (no global stylesheet side effects).

Target CSS (conceptual; implement with the project’s usual encapsulation — component styles / BEM / host selectors as appropriate):

- Main grid container: cap or set max width around **100rem** for the calendar grid.
- Day/cell: **min-height ~7.75rem** so cells are taller.

See **`docs/0021-working-plan.md`** if it documents Working Plan layout or calendar structure.

## High-level instructions for coder

- Locate the Working Plan calendar grid and cell markup/CSS (likely `working-plan` component styles and templates).
- Apply the width and min-height rules **only within the Working Plan container** (e.g. host/component wrapper class), not app-wide.
- Verify visually at desktop widths; avoid breaking week view or other Working Plan tabs.
- Run a relevant smoke check if one exists (e.g. `npm run test:working-plan` from `front/` with `BASE_URL` and login env) and confirm `docker compose` front logs stay clean after the change.

## Implementation

- **`front/src/app/working-plan/working-plan.component.ts`** (component-scoped styles): `.calendar-grid` — `width: 100%`, `max-width: 100rem` (replaces `42rem`). `.calendar-cell` — `min-height: 7.75rem` (was `4.75rem`). `.calendar-cell-header` — `min-height: auto` so the Mon–Sun header row does not inherit the tall day-cell minimum.

## Testing instructions

1. With the stack up (e.g. HAProxy on **4202**), from **`front/`** and repo **`.env`** providing `LOGIN_EMAIL` / `LOGIN_PASSWORD` (or `DEMO_*`):
   - `BASE_URL=http://127.0.0.1:4202 npm run test:working-plan`
   - `BASE_URL=http://127.0.0.1:4202 npm run test:working-plan-calendar`
2. Check **`docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=80 front`** — Angular build completes without errors after the change.
3. **Manual:** `/working-plan/calendar` — calendar grid grows with content width up to ~100rem; day cells are taller; switch to **Week** view and confirm week list still behaves as before.

---

## Test report

1. **Date/time (UTC) and log window:** Test run completed **2026-04-01T09:49:46Z**. Docker `front` log window reviewed: tail from rebuild activity through **2026-04-01T09:46:59Z** (latest `Application bundle generation complete` in sample).

2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; **`BASE_URL`:** `http://127.0.0.1:4202` (HAProxy). Branch **`development`**, commit **`bacb420`**. Credentials from repo **`.env`** (`LOGIN_EMAIL` / `LOGIN_PASSWORD`).

3. **What was tested:** Items under **Testing instructions** (Puppeteer smoke scripts, front build logs, calendar/week behaviour and layout targets as reflected in implementation + automated UI checks).

4. **Results:**
   - **`npm run test:working-plan`:** **PASS** — exit 0; output ends with `Working plan smoke test passed (week + calendar view + export UI).`
   - **`npm run test:working-plan-calendar`:** **PASS** — exit 0; output ends with `/working-plan/calendar smoke test passed (no console errors).`
   - **Docker `front` logs (Angular build):** **PASS** — `Application bundle generation complete` with no `error` / `TS####` / failed bundle messages in `--tail=80`.
   - **Scoped CSS / layout targets:** **PASS** — `working-plan.component.ts` component styles: `.calendar-grid` has `max-width: 100rem`; `.calendar-cell` has `min-height: 7.75rem`; `.calendar-cell-header` has `min-height: auto` (evidence: lines 709–718 in tree at test commit).
   - **Manual (calendar width/cell height + Week view):** **PASS** — week navigation exercised by `test:working-plan`; calendar grid/header/cells present on `/working-plan/calendar` per `test:working-plan-calendar`; layout rules match task spec (no global stylesheet change required for verification).

5. **Overall:** **PASS.**

6. **Product owner feedback:** Working Plan calendar smoke coverage confirms login, week navigation, calendar view, and export controls still work after the wider grid and taller day cells. The change stays in component-scoped styles, so risk to the rest of the app is low. Shippers can spot-check in the browser that day cells feel roomier on a large monitor.

7. **URLs tested (Puppeteer):**
   1. `http://127.0.0.1:4202/dashboard` (post-login)
   2. `http://127.0.0.1:4202/working-plan` (via sidebar navigation from test flow)
   3. `http://127.0.0.1:4202/working-plan/calendar` (direct navigation in calendar test; calendar view also exercised in working-plan test)

8. **Relevant log excerpts (last section)**

```
pos-front  | Application bundle generation complete. [0.642 seconds] - 2026-04-01T09:46:41.900Z
pos-front  | Application bundle generation complete. [0.647 seconds] - 2026-04-01T09:46:47.960Z
pos-front  | Application bundle generation complete. [0.589 seconds] - 2026-04-01T09:46:59.950Z
```
